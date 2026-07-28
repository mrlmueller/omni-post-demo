"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMediaQuery } from "../hooks/use-mobile";
import { BugReport, FeatureRequest } from "../components/interfaces/interfaces";
import { firestore } from "../lib/firebaseConfig";
import { Locale } from "@/lib/i18n";
import FeedbackForm from "./FeedbackForm";
import FeedbackCard from "./FeedbackCard";
import FeedbackLoadingSkeleton from "./FeedbackLoadingSkeleton";

// Page size for pagination
const PAGE_SIZE = 10;

interface FeedbackClientProps {
  t: any;
  locale: Locale;
}

type SortOption = "recent" | "popular" | "working";
type FilterOption = "all" | "feature" | "bug";

export default function FeedbackClient({ t, locale }: FeedbackClientProps) {
  // User and data state
  const [user, setUser] = useState<User | null>(null);
  const [feedbackItems, setFeedbackItems] = useState<
    (FeatureRequest | BugReport)[]
  >([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Pagination state
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [filterType, setFilterType] = useState<FilterOption>("all");

  // Detect user authentication status
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Load feedback items based on current filters
  useEffect(() => {
    fetchFeedbackItems();
  }, [activeTab, sortBy, filterType]);
  
  // Set default sort order to 'working' for active tab
  useEffect(() => {
    if (activeTab === 'active' && sortBy !== 'working') {
      setSortBy('working');
    }
  }, [activeTab]);

  const fetchFeedbackItems = async (loadMore = false) => {
    if (loadMore && !hasMore) return;

    if (!loadMore) {
      setLoading(true);
      setFeedbackItems([]);
    } else {
      setLoadingMore(true);
    }

    try {
      // Base query conditions
      const conditions: any[] = [];

      // Status filter based on active tab
      if (activeTab === "active") {
        conditions.push(where("status", "in", ["requested", "in-progress"]));
      } else {
        conditions.push(where("status", "==", "complete"));
      }

      // Type filter
      if (filterType !== "all") {
        conditions.push(where("type", "==", filterType));
      }

      // Sort order
      let orderByField: string;
      let orderDirection: "asc" | "desc" = "desc";

      switch (sortBy) {
        case "popular":
          orderByField = "upvotes";
          break;
        case "working":
          orderByField = "status";
          orderDirection = "asc"; // in-progress comes before requested
          break;
        case "recent":
        default:
          orderByField = "createdAt";
          break;
      }

      // Build query
      let fbQuery = query(
        collection(firestore, "feedback"),
        ...conditions,
        orderBy(orderByField, orderDirection)
      );

      // Add pagination
      if (loadMore && lastVisible) {
        fbQuery = query(fbQuery, startAfter(lastVisible), limit(PAGE_SIZE));
      } else {
        fbQuery = query(fbQuery, limit(PAGE_SIZE));
      }

      // Execute query
      const snapshot = await getDocs(fbQuery);

      // Process results
      const items: (FeatureRequest | BugReport)[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        const item = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        } as FeatureRequest | BugReport;

        items.push(item);
      });

      // Update state
      if (loadMore) {
        setFeedbackItems((prev) => [...prev, ...items]);
      } else {
        setFeedbackItems(items);
      }

      // Update pagination state
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      setLastVisible(lastDoc);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    fetchFeedbackItems(true);
  };

  // Mobile version
  if (isMobile) {
    return (
      <div className="space-y-6">
        <FeedbackForm user={user} t={t} setFeedbackItems={setFeedbackItems} />

        <div className="w-full rounded-lg bg-card overflow-hidden">
          <div className="border-b p-5">
            <h2 className="text-lg font-semibold text-card-foreground">
              {t.admin.feedback}
            </h2>
          </div>

          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <Select
                value={filterType}
                onValueChange={(value: FilterOption) => setFilterType(value)}
              >
                <SelectTrigger className="w-[110px] h-9 text-xs">
                  <SelectValue placeholder={t.admin.filter} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="feature">{t.types.feature}</SelectItem>
                  <SelectItem value="bug">{t.types.bug}</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={sortBy}
                onValueChange={(value: SortOption) => setSortBy(value)}
              >
                <SelectTrigger className="w-[110px] h-9 text-xs">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">{t.filters.recent}</SelectItem>
                  <SelectItem value="popular">{t.filters.popular}</SelectItem>
                  <SelectItem value="working">{t.filters.working}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Tabs
              defaultValue="active"
              value={activeTab}
              onValueChange={(value) =>
                setActiveTab(value as "active" | "completed")
              }
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="active">{t.tabs.active}</TabsTrigger>
                <TabsTrigger value="completed">{t.tabs.completed}</TabsTrigger>
              </TabsList>

              <TabsContent value="active">
                {loading ? (
                  <>
                    <FeedbackLoadingSkeleton />
                    <FeedbackLoadingSkeleton />
                  </>
                ) : feedbackItems.length > 0 ? (
                  <>
                    {feedbackItems.map((item) => (
                      <FeedbackCard
                        key={item.id}
                        item={item}
                        user={user}
                        setFeedbackItems={setFeedbackItems}
                        t={t}
                        locale={locale}
                      />
                    ))}

                    {hasMore && (
                      <div className="text-center py-3">
                        <Button
                          onClick={handleLoadMore}
                          disabled={loadingMore}
                          variant="outline"
                          size="sm"
                          className="w-full hover:bg-blue-50"
                        >
                          {loadingMore ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            t.admin.loadMore
                          )}
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-center py-6 text-gray-500 text-sm">
                    {t.admin.noFeedback}
                  </p>
                )}
              </TabsContent>

              <TabsContent value="completed">
                {loading ? (
                  <>
                    <FeedbackLoadingSkeleton />
                    <FeedbackLoadingSkeleton />
                  </>
                ) : feedbackItems.length > 0 ? (
                  <>
                    {feedbackItems.map((item) => (
                      <FeedbackCard
                        key={item.id}
                        item={item}
                        user={user}
                        setFeedbackItems={setFeedbackItems}
                        t={t}
                        locale={locale}
                      />
                    ))}

                    {hasMore && (
                      <div className="text-center py-3">
                        <Button
                          onClick={handleLoadMore}
                          disabled={loadingMore}
                          variant="outline"
                          size="sm"
                          className="w-full hover:bg-blue-50"
                        >
                          {loadingMore ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            t.admin.loadMore
                          )}
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-center py-6 text-gray-500 text-sm">
                    {t.admin.noFeedback}
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    );
  }

  // Desktop version
  return (
    <div className="space-y-10 w-full mx-auto">
      <FeedbackForm user={user} t={t} setFeedbackItems={setFeedbackItems} />

      <div>
        <div className="mb-5 flex flex-row items-center justify-between">
          <h2 className="text-2xl font-semibold text-card-foreground mt-10">
            {t.admin.feedback}
          </h2>

          <div className="flex items-center gap-3">
            <Select
              value={filterType}
              onValueChange={(value: FilterOption) => setFilterType(value)}
            >
              <SelectTrigger className="w-[140px] h-11">
                <SelectValue placeholder={t.admin.filter} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="feature">{t.types.feature}</SelectItem>
                <SelectItem value="bug">{t.types.bug}</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortBy}
              onValueChange={(value: SortOption) => setSortBy(value)}
            >
              <SelectTrigger className="w-[140px] h-11">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">{t.filters.recent}</SelectItem>
                <SelectItem value="popular">{t.filters.popular}</SelectItem>
                <SelectItem value="working">{t.filters.working}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Tabs
            defaultValue="active"
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "active" | "completed")
            }
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6 max-w-md mx-auto">
              <TabsTrigger value="active">{t.tabs.active}</TabsTrigger>
              <TabsTrigger value="completed">{t.tabs.completed}</TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <FeedbackLoadingSkeleton />
                  <FeedbackLoadingSkeleton />
                  <FeedbackLoadingSkeleton />
                  <FeedbackLoadingSkeleton />
                </div>
              ) : feedbackItems.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {feedbackItems.map((item) => (
                      <FeedbackCard
                        key={item.id}
                        item={item}
                        user={user}
                        setFeedbackItems={setFeedbackItems}
                        t={t}
                        locale={locale}
                      />
                    ))}
                  </div>

                  {hasMore && (
                    <div className="text-center mt-8">
                      <Button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        variant="outline"
                        className="px-8 hover:bg-blue-50"
                      >
                        {loadingMore ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          t.admin.loadMore
                        )}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-center py-10 text-gray-500">
                  {t.admin.noFeedback}
                </p>
              )}
            </TabsContent>

            <TabsContent value="completed">
              {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <FeedbackLoadingSkeleton />
                  <FeedbackLoadingSkeleton />
                </div>
              ) : feedbackItems.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {feedbackItems.map((item) => (
                      <FeedbackCard
                        key={item.id}
                        item={item}
                        user={user}
                        setFeedbackItems={setFeedbackItems}
                        t={t}
                        locale={locale}
                      />
                    ))}
                  </div>

                  {hasMore && (
                    <div className="text-center mt-8">
                      <Button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        variant="outline"
                        className="px-8 hover:bg-blue-50"
                      >
                        {loadingMore ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          t.admin.loadMore
                        )}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-center py-10 text-gray-500">
                  {t.admin.noFeedback}
                </p>
              )}
            </TabsContent>
          </Tabs>

          {loading && (
            <div className="flex justify-center items-center mt-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Loading feedback...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
