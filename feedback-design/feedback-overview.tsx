"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Trash2,
  Activity,
  CheckCircle,
  Bug,
  Lightbulb,
  Loader2,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useMediaQuery } from "@/app/hooks/use-mobile";

// Types for our feedback items
type FeedbackType = "feature" | "bug";
type FeedbackStatus = "requested" | "in-progress" | "completed";
type SortOption = "recent" | "likes";
type FilterOption = "all" | "feature" | "bug";

interface FeedbackItem {
  id: string;
  type: FeedbackType;
  title: string;
  description: string;
  area: string;
  status: FeedbackStatus;
  createdAt: Date;
  votes: number;
  isLikedByMe: boolean;
  isPostedByMe: boolean;
}

// Sample data
const initialFeedback: FeedbackItem[] = [
  {
    id: "1",
    type: "feature",
    title: "Dark mode support",
    description:
      "Add dark mode support to reduce eye strain when using the app at night.",
    area: "user-profile",
    status: "in-progress",
    createdAt: new Date(2023, 5, 15),
    votes: 42,
    isLikedByMe: true,
    isPostedByMe: true,
  },
  {
    id: "2",
    type: "bug",
    title: "Dashboard charts not loading",
    description:
      "The analytics charts on the dashboard fail to load when using Firefox.",
    area: "dashboard",
    status: "requested",
    createdAt: new Date(2023, 6, 2),
    votes: 12,
    isLikedByMe: false,
    isPostedByMe: false,
  },
  {
    id: "3",
    type: "feature",
    title: "Export data to CSV",
    description:
      "Allow users to export their data to CSV format for offline analysis.",
    area: "analytics",
    status: "requested",
    createdAt: new Date(2023, 5, 28),
    votes: 31,
    isLikedByMe: false,
    isPostedByMe: false,
  },
  {
    id: "4",
    type: "bug",
    title: "Login fails on mobile",
    description:
      "Users cannot log in when using the mobile app on Android devices.",
    area: "user-profile",
    status: "completed",
    createdAt: new Date(2023, 4, 10),
    votes: 8,
    isLikedByMe: true,
    isPostedByMe: false,
  },
  {
    id: "5",
    type: "feature",
    title: "Calendar integration",
    description: "Add the ability to sync with Google Calendar and Outlook.",
    area: "integrations",
    status: "completed",
    createdAt: new Date(2023, 3, 22),
    votes: 56,
    isLikedByMe: false,
    isPostedByMe: true,
  },
];

export default function FeedbackOverview() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [filterType, setFilterType] = useState<FilterOption>("all");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setFeedback(initialFeedback);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const openFeedback = feedback.filter((item) => item.status !== "completed");
  const resolvedFeedback = feedback.filter(
    (item) => item.status === "completed"
  );

  const deleteFeedback = (id: string) => {
    setFeedback(feedback.filter((item) => item.id !== id));
  };

  const toggleLike = (id: string) => {
    setFeedback(
      feedback.map((item) => {
        if (item.id === id) {
          const newLikedState = !item.isLikedByMe;
          return {
            ...item,
            isLikedByMe: newLikedState,
            votes: newLikedState ? item.votes + 1 : item.votes - 1,
          };
        }
        return item;
      })
    );
  };

  const getFilteredFeedback = (items: FeedbackItem[]) => {
    if (filterType === "all") return items;
    return items.filter((item) => item.type === filterType);
  };

  const getSortedFeedback = (items: FeedbackItem[]) => {
    // First prioritize in-progress items if sort is by recent
    if (sortBy === "recent") {
      const inProgress = items.filter((item) => item.status === "in-progress");
      const others = items.filter((item) => item.status !== "in-progress");

      const sortedInProgress = [...inProgress].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
      const sortedOthers = [...others].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );

      return [...sortedInProgress, ...sortedOthers];
    } else {
      // If sorting by likes, just sort by votes
      return [...items].sort((a, b) => b.votes - a.votes);
    }
  };

  const getProcessedFeedback = (items: FeedbackItem[]) => {
    return getSortedFeedback(getFilteredFeedback(items));
  };

  const getStatusInfo = (status: FeedbackStatus) => {
    switch (status) {
      case "requested":
        return {
          icon: null,
          label: null,
          borderColor: "",
        };
      case "in-progress":
        return {
          icon: <Activity className="h-5 w-5 text-blue-500" />,
          label: "In Progress",
          borderColor: "border-blue-200",
        };
      case "completed":
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          label: "Resolved",
          borderColor: "border-green-200",
        };
    }
  };

  const getTypeInfo = (type: FeedbackType) => {
    return type === "feature"
      ? {
          icon: <Lightbulb className="h-5 w-5 text-purple-500" />,
          label: "Feature",
          bgColor: "bg-purple-50",
          textColor: "text-purple-700",
        }
      : {
          icon: <Bug className="h-5 w-5 text-red-500" />,
          label: "Bug",
          bgColor: "bg-red-50",
          textColor: "text-red-700",
        };
  };

  const FeedbackItemSkeleton = () => (
    <Card className="mb-4 overflow-hidden">
      <div className="flex items-center p-4 border-b">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-4 w-20 ml-2" />
        <Skeleton className="h-6 w-24 ml-4 rounded-full" />
      </div>

      <CardContent className="pt-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3 mb-3" />

        <div className="flex items-center">
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-4 w-24 ml-3" />
        </div>

        <div className="flex justify-between items-center mt-4">
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );

  // Like Button: Star emoji reaction
  const LikeButton = ({
    item,
    toggleLike,
  }: {
    item: FeedbackItem;
    toggleLike: (id: string) => void;
  }) => (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="sm"
        className={`rounded-full p-0 ${isMobile ? "h-6 w-6" : "h-8 w-8"} ${
          item.isLikedByMe ? "bg-amber-100 border-amber-300 text-amber-600" : ""
        }`}
        onClick={() => toggleLike(item.id)}
      >
        <Star
          className={`${isMobile ? "h-3 w-3" : "h-4 w-4"} ${
            item.isLikedByMe ? "fill-amber-500" : ""
          }`}
        />
      </Button>
      <span className={`${isMobile ? "text-xs" : "text-sm"} font-medium ml-1`}>
        {item.votes}
      </span>
    </div>
  );

  // Mobile version of feedback item
  const renderMobileFeedbackItem = (item: FeedbackItem) => {
    const statusInfo = getStatusInfo(item.status);
    const typeInfo = getTypeInfo(item.type);

    return (
      <Card
        key={item.id}
        className={`mb-3 overflow-hidden ${
          item.isPostedByMe ? "border-primary border-2" : ""
        } ${statusInfo.borderColor}`}
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

          {statusInfo.icon && (
            <div className="flex items-center">
              {statusInfo.icon}
              <span className="ml-1 text-sm font-medium">
                {statusInfo.label}
              </span>
            </div>
          )}

          {item.isPostedByMe && (
            <Badge className="bg-primary hover:bg-primary text-xs">
              My post
            </Badge>
          )}
        </div>

        <CardContent className="p-3">
          <h3 className="font-medium text-base mb-1">{item.title}</h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {item.description}
          </p>

          <div className="flex items-center text-xs text-muted-foreground mb-3">
            <Badge variant="outline" className="text-xs">
              {item.area.charAt(0).toUpperCase() +
                item.area.slice(1).replace("-", " ")}
            </Badge>
            <span className="ml-2">
              {format(item.createdAt, "MMM d, yyyy")}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <LikeButton item={item} toggleLike={toggleLike} />

            {item.isPostedByMe && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-red-500 h-7 w-7 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-[90vw]">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete feedback?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this feedback item.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteFeedback(item.id)}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Desktop version of feedback item
  const renderDesktopFeedbackItem = (item: FeedbackItem) => {
    const statusInfo = getStatusInfo(item.status);
    const typeInfo = getTypeInfo(item.type);

    return (
      <Card
        key={item.id}
        className={`mb-4 overflow-hidden ${
          item.isPostedByMe ? "border-primary border-2" : ""
        } ${statusInfo.borderColor}`}
      >
        <div className="flex items-center p-4 border-b">
          <div className="flex items-center">
            {typeInfo.icon}
            <span className={`ml-2 font-medium ${typeInfo.textColor}`}>
              {typeInfo.label}
            </span>
          </div>

          {statusInfo.icon && (
            <div className="flex items-center ml-4 px-3 py-1 rounded-full bg-blue-50">
              {statusInfo.icon}
              <span className="ml-1 font-medium text-blue-700">
                {statusInfo.label}
              </span>
            </div>
          )}

          {item.isPostedByMe && (
            <Badge className="ml-auto bg-primary hover:bg-primary">
              My post
            </Badge>
          )}
        </div>

        <CardContent className="pt-4">
          <h3 className="font-medium text-lg mb-1">{item.title}</h3>
          <p className="text-gray-600 mb-3 line-clamp-2">{item.description}</p>

          <div className="flex items-center text-sm text-muted-foreground mb-3">
            <Badge variant="outline">
              {item.area.charAt(0).toUpperCase() +
                item.area.slice(1).replace("-", " ")}
            </Badge>
            <span className="ml-3">
              {format(item.createdAt, "MMM d, yyyy")}
            </span>
          </div>

          <div className="flex justify-between items-center mt-2">
            <LikeButton item={item} toggleLike={toggleLike} />

            {item.isPostedByMe && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete feedback?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this feedback item.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteFeedback(item.id)}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Mobile version
  if (isMobile) {
    return (
      <div className="w-full">
        <div className="border-b p-4 bg-white">
          <h2 className="text-lg font-medium text-primary">
            Feedback Overview
          </h2>
        </div>

        <div className="p-3 bg-white">
          <div className="flex justify-between items-center mb-3">
            <Select
              value={filterType}
              onValueChange={(value: FilterOption) => setFilterType(value)}
            >
              <SelectTrigger className="w-[110px] h-8 text-xs">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="feature">Features</SelectItem>
                <SelectItem value="bug">Bugs</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortBy}
              onValueChange={(value: SortOption) => setSortBy(value)}
            >
              <SelectTrigger className="w-[110px] h-8 text-xs">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="likes">Most Likes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="open" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-3">
              <TabsTrigger value="open">
                Open Issues ({getFilteredFeedback(openFeedback).length})
              </TabsTrigger>
              <TabsTrigger value="resolved">
                Resolved ({getFilteredFeedback(resolvedFeedback).length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="open">
              {loading ? (
                <>
                  <FeedbackItemSkeleton />
                  <FeedbackItemSkeleton />
                </>
              ) : getProcessedFeedback(openFeedback).length > 0 ? (
                getProcessedFeedback(openFeedback).map(renderMobileFeedbackItem)
              ) : (
                <p className="text-center py-6 text-gray-500 text-sm">
                  No open feedback items
                </p>
              )}
            </TabsContent>

            <TabsContent value="resolved">
              {loading ? (
                <>
                  <FeedbackItemSkeleton />
                  <FeedbackItemSkeleton />
                </>
              ) : getProcessedFeedback(resolvedFeedback).length > 0 ? (
                getProcessedFeedback(resolvedFeedback).map(
                  renderMobileFeedbackItem
                )
              ) : (
                <p className="text-center py-6 text-gray-500 text-sm">
                  No resolved feedback items
                </p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  // Desktop version
  return (
    <Card className="w-full max-w-[1440px] mx-auto shadow-sm">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Feedback Overview</CardTitle>

        <div className="flex items-center gap-2">
          <Select
            value={filterType}
            onValueChange={(value: FilterOption) => setFilterType(value)}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="feature">Features</SelectItem>
              <SelectItem value="bug">Bugs</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={(value: SortOption) => setSortBy(value)}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="likes">Most Likes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="open" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 max-w-md mx-auto">
            <TabsTrigger value="open">
              Open Issues ({getFilteredFeedback(openFeedback).length})
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved ({getFilteredFeedback(resolvedFeedback).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="open">
            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <FeedbackItemSkeleton />
                <FeedbackItemSkeleton />
                <FeedbackItemSkeleton />
                <FeedbackItemSkeleton />
              </div>
            ) : getProcessedFeedback(openFeedback).length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {getProcessedFeedback(openFeedback).map(
                  renderDesktopFeedbackItem
                )}
              </div>
            ) : (
              <p className="text-center py-6 text-gray-500">
                No open feedback items
              </p>
            )}
          </TabsContent>

          <TabsContent value="resolved">
            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <FeedbackItemSkeleton />
                <FeedbackItemSkeleton />
              </div>
            ) : getProcessedFeedback(resolvedFeedback).length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {getProcessedFeedback(resolvedFeedback).map(
                  renderDesktopFeedbackItem
                )}
              </div>
            ) : (
              <p className="text-center py-6 text-gray-500">
                No resolved feedback items
              </p>
            )}
          </TabsContent>
        </Tabs>

        {loading && (
          <div className="flex justify-center items-center mt-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading feedback...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
