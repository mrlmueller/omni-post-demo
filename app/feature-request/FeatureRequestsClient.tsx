"use client";

import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  DocumentData,
  getDocs,
  orderBy,
  query,
  QuerySnapshot,
} from "firebase/firestore";
import { useEffect, useState } from "react";

import { firestore } from "../lib/firebaseConfig";
import { OldFeatureRequest as FeatureRequest } from "../components/interfaces/interfaces";
import FeatureRequestForm from "./FeatureRequestForm";
import FeatureRequestLoadingSkeleton from "./FeatureRequestLoadingSkeleton";
import FeatureRequestCard from "./FeatureRequestCard";

// Import the Button from shadcn/ui rather than @nextui-org/button
import { Button } from "@/components/ui/button";

interface FeatureRequestsClientProps {
  t: {
    activeTabButton: string;
    completedTabButton: string;
    loadMoreButton: string;
    noRequestsMessage: string;
    featureRequestCard: {
      inProgressBadge: string;
      completeBadge: string;
    };
    featureRequestForm: {
      header: string;
      titleLabel: string;
      descriptionLabel: string;
      descriptionPlaceholder: string;
      submitButton: string;
      notLoggedInToast: string;
      missingFieldsToast: string;
      successToast: string;
      errorToast: string;
    };
  };
}

export default function FeatureRequestsClient({
  t,
}: FeatureRequestsClientProps) {
  const [user, setUser] = useState<User | null>(null);
  const [featureRequests, setFeatureRequests] = useState<FeatureRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [visibleCount, setVisibleCount] = useState<number>(4);
  const [activeTab, setActiveTab] = useState<string>("active");

  // Determine auth status
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currUser) => {
      setUser(currUser || null);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Firestore data
  useEffect(() => {
    const fetchFeatureRequests = async () => {
      try {
        const q = query(
          collection(firestore, "feature_requests"),
          orderBy("createdAt", "desc")
        );
        const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
        const requests: FeatureRequest[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          requests.push({
            id: doc.id,
            title: data.title,
            description: data.description,
            userId: data.userId,
            createdAt: data.createdAt,
            likes: data.likes || 0,
            dislikes: data.dislikes || 0,
            likedBy: Array.isArray(data.likedBy) ? data.likedBy : [],
            dislikedBy: Array.isArray(data.dislikedBy) ? data.dislikedBy : [],
            status: data.status || "requested",
          });
        });
        // First sort by status (in-progress first), then by net likes
        requests.sort((a, b) => {
          // First prioritize status
          if (a.status === "in-progress" && b.status !== "in-progress") return -1;
          if (a.status !== "in-progress" && b.status === "in-progress") return 1;
          
          // Then sort by net likes within same status
          return (b.likes - b.dislikes) - (a.likes - a.dislikes);
        });
        setFeatureRequests(requests);
      } catch (error) {
        console.error("Error fetching documents: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatureRequests();
  }, []);

  const loadMore = () => {
    setVisibleCount((prevCount) => prevCount + 4);
  };

  const filteredRequests =
    activeTab === "completed"
      ? featureRequests.filter((r) => r.status === "complete")
      : featureRequests.filter(
          (r) => r.status === "requested" || r.status === "in-progress"
        );

  return (
    <>
      <FeatureRequestForm
        setFeatureRequests={setFeatureRequests}
        user={user}
        loading={loading}
        t={t.featureRequestForm}
      />

      {/* Tabs */}
      <div className="text-center my-6 flex justify-center space-x-4">
        <Button
          onClick={() => setActiveTab("active")}
          className={`${
            activeTab === "active" 
              ? "bg-blue-600 shadow-md" 
              : "bg-gray-300 hover:bg-gray-400"
          } text-white py-2 px-6 rounded-md font-medium transition-all`}
        >
          {t.activeTabButton}
        </Button>
        <Button
          onClick={() => setActiveTab("completed")}
          className={`${
            activeTab === "completed" 
              ? "bg-green-600 shadow-md" 
              : "bg-gray-300 hover:bg-gray-400"
          } text-white py-2 px-6 rounded-md font-medium transition-all`}
        >
          {t.completedTabButton}
        </Button>
      </div>

      {/* Feature Request Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 my-10">
        {loading
          ? Array.from({ length: visibleCount }).map((_, i) => (
              <FeatureRequestLoadingSkeleton key={i} />
            ))
          : filteredRequests.length > 0
          ? filteredRequests
              // Sort with in-progress first, then by net likes
              .sort((a, b) => {
                if (a.status === "in-progress" && b.status !== "in-progress") return -1;
                if (a.status !== "in-progress" && b.status === "in-progress") return 1;
                return (b.likes - b.dislikes) - (a.likes - a.dislikes);
              })
              .slice(0, visibleCount)
              .map((request) => (
                <FeatureRequestCard
                  key={request.id}
                  id={request.id}
                  title={request.title}
                  description={request.description}
                  likes={request.likes}
                  dislikes={request.dislikes}
                  status={request.status}
                  user={user}
                  featureRequests={featureRequests}
                  setFeatureRequests={setFeatureRequests}
                  loading={loading}
                  t={t.featureRequestCard}
                />
              ))
          : !loading && <p>{t.noRequestsMessage}</p>}
      </div>

      {/* Load More */}
      {visibleCount < filteredRequests.length && (
        <div className="text-center">
          <Button
            onClick={loadMore}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md mb-20 font-medium shadow-sm transition-all"
          >
            {t.loadMoreButton}
          </Button>
        </div>
      )}
    </>
  );
}
