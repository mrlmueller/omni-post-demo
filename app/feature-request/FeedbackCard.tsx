"use client";

import { useState } from "react";
import { format } from "date-fns";
import { de, enUS } from "date-fns/locale"; 
// format function in v4 takes options as second argument
import {
  Trash2,
  Activity,
  CheckCircle,
  Bug,
  Lightbulb,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMediaQuery } from "../hooks/use-mobile";
import { User } from "firebase/auth";
import { BugReport, FeatureRequest } from "../components/interfaces/interfaces";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { firestore } from "../lib/firebaseConfig";
import { useToast } from "@/hooks/use-toast";

interface FeedbackCardProps {
  item: FeatureRequest | BugReport;
  user: User | null;
  setFeedbackItems: React.Dispatch<
    React.SetStateAction<(FeatureRequest | BugReport)[]>
  >;
  t: any;
  locale: string;
}

export default function FeedbackCard({
  item,
  user,
  setFeedbackItems,
  t,
  locale,
}: FeedbackCardProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { toast } = useToast();

  const isOwner = user?.uid === item.userId;
  const hasUpvoted = item.upvotedBy.includes(user?.uid || "");
  const isVotingDisabled = isVoting || item.status !== "requested" || !user;
  const isDeleteDisabled = !isOwner || item.upvotes > 5 || isDeleting || item.status !== "requested";

  const dateObj = item.createdAt?.toDate?.();

  const formattedDate = dateObj
    ? dateObj.toLocaleDateString(locale === "de" ? "de-DE" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      }) 
    : "";

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "requested":
        return {
          icon: null,
          label: t.status.requested,
          borderColor: "",
          bgColor: "",
        };
      case "in-progress":
        return {
          icon: <Activity className="h-5 w-5 text-blue-500" />,
          label: t.status.inProgress,
          borderColor: "border-blue-200",
          bgColor: "bg-blue-50",
        };
      case "complete":
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          label: t.status.complete,
          borderColor: "border-green-200",
          bgColor: "bg-green-50",
        };
    }
  };

  const getTypeInfo = (type: string) => {
    return type === "feature"
      ? {
          icon: <Lightbulb className="h-5 w-5" />,
          label: t.types.feature,
          bgColor: "",
          textColor: "",
        }
      : {
          icon: <Bug className="h-5 w-5" />,
          label: t.types.bug,
          bgColor: "",
          textColor: "",
        };
  };

  const handleUpvote = async () => {
    if (!user || isVotingDisabled) return;

    setIsVoting(true);
    try {
      const feedbackRef = doc(firestore, "feedback", item.id);
      const feedbackDoc = await getDoc(feedbackRef);

      if (!feedbackDoc.exists()) {
        throw new Error("Feedback item not found");
      }

      // Check if already upvoted
      const upvotedBy = feedbackDoc.data().upvotedBy || [];
      const userHasUpvoted = upvotedBy.includes(user.uid);

      // Update local state first to make UI feel responsive
      setFeedbackItems((prev) =>
        prev.map((prevItem) =>
          prevItem.id === item.id
            ? {
                ...prevItem,
                upvotes: userHasUpvoted ? prevItem.upvotes - 1 : prevItem.upvotes + 1,
                upvotedBy: userHasUpvoted 
                  ? prevItem.upvotedBy.filter((id) => id !== user.uid)
                  : [...prevItem.upvotedBy, user.uid],
              }
            : prevItem
        )
      );

      if (userHasUpvoted) {
        // Remove upvote
        await updateDoc(feedbackRef, {
          upvotes: increment(-1),
          upvotedBy: upvotedBy.filter((id: string) => id !== user.uid),
        });
      } else {
        // Add upvote
        await updateDoc(feedbackRef, {
          upvotes: increment(1),
          upvotedBy: [...upvotedBy, user.uid],
        });

        // Save vote separately for audit/history
        try {
          const voteRef = doc(
            collection(firestore, "votes"),
            `${item.id}_${user.uid}`
          );
          await setDoc(voteRef, {
            userId: user.uid,
            postId: item.id,
            createdAt: serverTimestamp(),
          });
        } catch (voteError) {
          console.error("Error saving vote record:", voteError);
          // Non-critical error, continue
        }
      }
    } catch (error) {
      console.error("Error upvoting:", error);
      // Revert local state if server update failed
      setFeedbackItems((prev) =>
        prev.map((prevItem) =>
          prevItem.id === item.id
            ? {
                ...prevItem,
                upvotes: hasUpvoted ? prevItem.upvotes + 1 : prevItem.upvotes - 1,
                upvotedBy: hasUpvoted
                  ? [...prevItem.upvotedBy, user.uid]
                  : prevItem.upvotedBy.filter((id) => id !== user.uid),
              }
            : prevItem
        )
      );
      toast({
        title: "Error",
        description: "Failed to update vote",
        variant: "destructive"
      });
    } finally {
      setIsVoting(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleteDisabled) return;

    setIsDeleting(true);
    
    // Immediately update local state for better responsiveness
    setFeedbackItems((prev) =>
      prev.filter((prevItem) => prevItem.id !== item.id)
    );
    
    try {
      // Delete the feedback item
      await deleteDoc(doc(firestore, "feedback", item.id));

      // Try to delete associated votes, but don't block on success
      try {
        const votesQuery = query(
          collection(firestore, "votes"),
          where("postId", "==", item.id)
        );
        const votesSnapshot = await getDocs(votesQuery);

        // Delete each vote document one by one rather than with Promise.all
        // This helps prevent transaction issues
        for (const voteDoc of votesSnapshot.docs) {
          try {
            await deleteDoc(doc(firestore, "votes", voteDoc.id));
          } catch (voteError) {
            console.error("Error deleting individual vote:", voteError);
            // Continue with other votes even if one fails
          }
        }
      } catch (votesError) {
        console.error("Error querying votes:", votesError);
        // Continue even if votes deletion has errors
        // The main post is already deleted
      }

      toast({
        title: "Success",
        description: t.form.deleteSuccessToast
      });
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive"
      });
      
      // But the local state is already updated, and the user will see
      // the item disappear even if there was an error with the server update
      // This matches the behavior you described where it appears deleted after refresh
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const statusInfo = getStatusInfo(item.status);
  const typeInfo = getTypeInfo(item.type);

  // Mobile version
  if (isMobile) {
    return (
      <Card
        className={`mb-3 overflow-hidden border shadow-sm ${
          isOwner ? "border-primary border-opacity-40" : "border-gray-200"
        } ${statusInfo?.borderColor} hover:shadow-md transition-shadow`}
      >
        <div className="p-3 border-b flex items-center justify-between">
          <div className="flex items-center">
            {typeInfo.icon}
            <span
              className={`ml-1.5 text-sm font-medium ${typeInfo.textColor}`}
            >
              {typeInfo.label}
            </span>
          </div>

          {statusInfo?.icon && (
            <div className="flex items-center">
              {statusInfo?.icon}
              <span className="ml-1 text-sm font-medium">
                {statusInfo?.label}
              </span>
            </div>
          )}

          {isOwner && (
            <Badge className="bg-primary hover:bg-primary text-xs">
              {t.card.myPost}
            </Badge>
          )}
        </div>

        <CardContent className="p-3">
          <h3 className="font-medium text-base mb-1">{item.title}</h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {item.description}
          </p>

          <div className="flex items-center text-xs text-gray-500 mb-3">
            <Badge variant="outline" className="text-xs">
              {t.categories[item.category as keyof typeof t.categories]}
            </Badge>
            <span className="ml-2">{formattedDate}</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className={`rounded-full p-0 h-6 w-6 ${
                  hasUpvoted
                    ? "bg-blue-100 border-blue-300 text-blue-600"
                    : "hover:bg-blue-50"
                }`}
                onClick={handleUpvote}
                disabled={isVotingDisabled}
              >
                <Star
                  className={`h-3 w-3 ${hasUpvoted ? "fill-blue-500" : ""}`}
                />
              </Button>
              <span className="text-xs font-medium ml-1">{item.upvotes}</span>
            </div>

            {isOwner && item.status === "requested" && (
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-red-500 h-7 w-7 p-0"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleteDisabled}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardContent>

        <AlertDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
        >
          <AlertDialogContent className="max-w-[90vw]">
            <AlertDialogHeader>
              <AlertDialogTitle>{t.card.deleteTitle}</AlertDialogTitle>
              <AlertDialogDescription>
                {t.card.deleteDescription}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t.card.deleteCancel}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600"
              >
                {t.card.delete}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>
    );
  }

  // Desktop version
  return (
    <Card
      className={`overflow-hidden border shadow-sm ${
        isOwner ? "border-blue-500 border-opacity-40" : "border-gray-200"
      } ${statusInfo?.borderColor || ''} hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center p-4 border-b">
        <div className="flex items-center">
          {typeInfo.icon}
          <span className={`ml-2 font-medium ${typeInfo.textColor}`}>
            {typeInfo.label}
          </span>
        </div>

        {statusInfo?.icon && (
          <div className="flex items-center ml-4 px-3 py-1 rounded-full bg-blue-50">
            {statusInfo.icon}
            <span className="ml-1 font-medium text-blue-700">
              {statusInfo.label}
            </span>
          </div>
        )}

        {isOwner && (
          <Badge className="ml-auto bg-primary hover:bg-primary">{t.card.myPost}</Badge>
        )}
      </div>

      <CardContent className="pt-4">
        <h3 className="font-medium text-lg mb-1">{item.title}</h3>
        <p className="text-gray-600 mb-3 line-clamp-2">{item.description}</p>

        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <Badge variant="outline">{t.categories[item.category as keyof typeof t.categories]}</Badge>
          <span className="ml-3">{formattedDate}</span>
        </div>

        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className={`rounded-full p-0 h-8 w-8 ${
                hasUpvoted ? "bg-blue-100 border-blue-300 text-blue-600" : "hover:bg-blue-50"
              }`}
              onClick={handleUpvote}
              disabled={isVotingDisabled}
            >
              <Star
                className={`h-4 w-4 ${hasUpvoted ? "fill-blue-500" : ""}`}
              />
            </Button>
            <span className="text-sm font-medium ml-1">{item.upvotes}</span>
          </div>

          {isOwner && item.status === "requested" && (
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-red-500"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleteDisabled}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.card.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.card.deleteDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.card.deleteCancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              {t.card.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
