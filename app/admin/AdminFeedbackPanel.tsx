"use client";

import React, { useEffect, useState } from "react";
import {
  BugReport,
  FeatureRequest,
  PostStatus,
  PostType,
} from "../components/interfaces/interfaces";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { firestore } from "../lib/firebaseConfig";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { BiSearchAlt } from "react-icons/bi";
import { RiArrowDropDownLine } from "react-icons/ri";

const PAGE_SIZE = 20;

interface AdminFeedbackPanelProps {
  token: string;
}

export default function AdminFeedbackPanel({ token }: AdminFeedbackPanelProps) {
  // -----------------------------
  // State
  // -----------------------------
  const [feedbackItems, setFeedbackItems] = useState<
    (FeatureRequest | BugReport)[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PostStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<PostType | "all">("all");
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const { toast } = useToast();

  // -----------------------------
  // 1. Fetch initial feedback
  // -----------------------------
  useEffect(() => {
    fetchFeedbackItems(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, typeFilter]);

  // -----------------------------
  // 2. Fetch feedback items
  // -----------------------------
  const fetchFeedbackItems = async (loadMore: boolean) => {
    if (loadMore && !hasMore) return;

    if (!loadMore) {
      setLoading(true);
      setFeedbackItems([]);
      setLastVisible(null);
    } else {
      setLoadingMore(true);
    }

    try {
      // Build query conditions
      const conditions: any[] = [];
      if (statusFilter !== "all") {
        conditions.push(where("status", "==", statusFilter));
      }
      if (typeFilter !== "all") {
        conditions.push(where("type", "==", typeFilter));
      }

      let fbQuery = query(
        collection(firestore, "feedback"),
        ...conditions,
        orderBy("createdAt", "desc")
      );

      // Add pagination
      if (loadMore && lastVisible) {
        fbQuery = query(fbQuery, startAfter(lastVisible), limit(PAGE_SIZE));
      } else {
        fbQuery = query(fbQuery, limit(PAGE_SIZE));
      }

      const snapshot = await getDocs(fbQuery);
      const newItems: (FeatureRequest | BugReport)[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        newItems.push({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        } as FeatureRequest | BugReport);
      });

      // If there's a search query, filter client-side
      let filteredItems = newItems;
      if (searchQuery.trim()) {
        const lowerQuery = searchQuery.toLowerCase();
        filteredItems = newItems.filter(
          (item) =>
            item.title.toLowerCase().includes(lowerQuery) ||
            item.description.toLowerCase().includes(lowerQuery)
        );
      }

      if (loadMore) {
        setFeedbackItems((prev) => [...prev, ...filteredItems]);
      } else {
        setFeedbackItems(filteredItems);
      }

      // Update pagination
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      setLastVisible(lastDoc ?? null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // -----------------------------
  // 3. Update item status via API
  // -----------------------------
  const updateItemStatus = async (itemId: string, newStatus: PostStatus) => {
    setIsUpdating(itemId);
    try {
      console.log(`Updating feedback item ${itemId} to status: ${newStatus}`);
      
      const response = await fetch("/api/admin/update-feedback-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          feedbackId: itemId,
          status: newStatus,
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error("API Error Response:", responseData);
        throw new Error(responseData.message || `Failed to update status (${response.status})`);
      }

      console.log("Status update successful:", responseData);

      // Update local state
      setFeedbackItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, status: newStatus } : item
        )
      );

      toast({
        title: "Success",
        description: `Status updated to ${newStatus}`
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: `Failed to update status: ${(error as Error).message}`,
        variant: "destructive"
      });
    } finally {
      setIsUpdating(null);
    }
  };

  // -----------------------------
  // 4. Delete item via API
  // -----------------------------
  const handleDeleteItem = async () => {
    if (!deleteItemId) return;
    
    setIsDeleting(deleteItemId);
    try {
      console.log(`Deleting feedback item: ${deleteItemId}`);
      
      const response = await fetch("/api/admin/delete-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          feedbackId: deleteItemId,
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error("API Error Response:", responseData);
        throw new Error(responseData.message || `Failed to delete item (${response.status})`);
      }

      console.log("Delete successful:", responseData);

      // Update local state
      setFeedbackItems((prev) =>
        prev.filter((item) => item.id !== deleteItemId)
      );

      toast({
        title: "Success",
        description: "Item deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: `Failed to delete item: ${(error as Error).message}`,
        variant: "destructive"
      });
    } finally {
      setDeleteItemId(null);
      setIsDeleting(null);
    }
  };

  // -----------------------------
  // 5. Helpers
  // -----------------------------
  const getStatusBadge = (status: PostStatus) => {
    switch (status) {
      case "requested":
        return <Badge className="bg-gray-200 text-gray-900">Requested</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-200 text-blue-900">In Progress</Badge>;
      case "complete":
        return <Badge className="bg-green-200 text-green-900">Completed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getTypeBadge = (type: PostType) => {
    return type === "feature" ? (
      <Badge className="bg-purple-200 text-purple-900">Feature</Badge>
    ) : (
      <Badge className="bg-red-200 text-red-900">Bug</Badge>
    );
  };

  const formatDate = (ts: any) => {
    if (!ts?.seconds) return "—";
    return format(new Date(ts.seconds * 1000), "MMM d, yyyy");
  };

  // -----------------------------
  // 6. Render
  // -----------------------------
  return (
    <div className="mt-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-semibold">Feedback Management</h2>

        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="relative">
            <Input
              placeholder="Search feedback..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            <BiSearchAlt className="absolute right-2 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          {/* Type Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex gap-1">
                {typeFilter === "all"
                  ? "All Types"
                  : typeFilter === "feature"
                  ? "Features"
                  : "Bugs"}
                <RiArrowDropDownLine size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setTypeFilter("all")}>
                All Types
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter("feature")}>
                Features
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter("bug")}>
                Bugs
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Status Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex gap-1">
                {statusFilter === "all"
                  ? "All Status"
                  : statusFilter === "requested"
                  ? "Requested"
                  : statusFilter === "in-progress"
                  ? "In Progress"
                  : "Completed"}
                <RiArrowDropDownLine size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                All Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("requested")}>
                Requested
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("in-progress")}>
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("complete")}>
                Completed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* "Go" button for search */}
          <Button
            onClick={() => fetchFeedbackItems(false)}
            variant="default"
            disabled={loading}
          >
            Search
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Upvotes</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && feedbackItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center p-4">
                  Loading feedback items...
                </TableCell>
              </TableRow>
            ) : feedbackItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center p-4">
                  No feedback found.
                </TableCell>
              </TableRow>
            ) : (
              feedbackItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="max-w-xs truncate" title={item.title}>
                    {item.title}
                  </TableCell>
                  <TableCell>{getTypeBadge(item.type)}</TableCell>
                  <TableCell>
                    {item.category || <span className="text-gray-400">—</span>}
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>{item.upvotes ?? 0}</TableCell>
                  <TableCell>{formatDate(item.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {/* Status Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={isUpdating === item.id}
                          >
                            {isUpdating === item.id ? "Updating..." : "Set Status"}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              updateItemStatus(item.id, "requested")
                            }
                          >
                            Mark as Requested
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              updateItemStatus(item.id, "in-progress")
                            }
                          >
                            Mark as In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              updateItemStatus(item.id, "complete")
                            }
                          >
                            Mark as Completed
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Delete button */}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteItemId(item.id)}
                        disabled={isDeleting === item.id}
                      >
                        {isDeleting === item.id ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Load More */}
      {feedbackItems.length > 0 && hasMore && (
        <div className="mt-6 text-center">
          <Button
            onClick={() => fetchFeedbackItems(true)}
            disabled={loadingMore}
            variant="outline"
          >
            {loadingMore ? "Loading..." : "Load More Items"}
          </Button>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!deleteItemId}
        onOpenChange={() => setDeleteItemId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this item?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              feedback item and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteItem}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}