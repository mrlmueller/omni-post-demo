"use client";

import { Button } from "@nextui-org/react";
import { User } from "firebase/auth";
import { collection, doc, runTransaction } from "firebase/firestore";
import React from "react";
import { FaAngleUp } from "react-icons/fa6";
import { IoMdTime } from "react-icons/io";
import { firestore } from "../lib/firebaseConfig";
import { OldFeatureRequest as FeatureRequest, OldVote as Vote } from "../components/interfaces/interfaces";

interface FeatureRequestCardProps {
  title: string;
  description: string;
  likes: number;
  dislikes: number;
  id: string;
  user: User | null;
  featureRequests: FeatureRequest[];
  setFeatureRequests: React.Dispatch<React.SetStateAction<FeatureRequest[]>>;
  loading?: boolean;
  status: "requested" | "in-progress" | "complete";
  t: {
    inProgressBadge: string;
    completeBadge: string;
  };
}

export default function FeatureRequestCard({
  id,
  title,
  description,
  likes,
  dislikes,
  status,
  user,
  featureRequests,
  setFeatureRequests,
  t,
}: FeatureRequestCardProps) {
  const featureRequestsCollection = collection(firestore, "feature_requests");

  const upVote = async (featureRequestId: string, userId: string) => {
    const featureRequestDoc = doc(featureRequestsCollection, featureRequestId);
    await runTransaction(firestore, async (transaction) => {
      const featureRequestSnapshot = await transaction.get(featureRequestDoc);
      if (!featureRequestSnapshot.exists()) {
        throw new Error("Feature request does not exist!");
      }

      const featureRequestData =
        featureRequestSnapshot.data() as FeatureRequest;
      const voteDocRef = doc(collection(featureRequestDoc, "votes"), userId);
      const voteSnapshot = await transaction.get(voteDocRef);

      if (voteSnapshot.exists()) {
        const userVote = voteSnapshot.data() as Vote;
        if (userVote.type === "like") {
          transaction.delete(voteDocRef);
          transaction.update(featureRequestDoc, {
            likes: featureRequestData.likes - 1,
          });
        } else if (userVote.type === "dislike") {
          transaction.update(voteDocRef, { type: "like" });
          transaction.update(featureRequestDoc, {
            likes: featureRequestData.likes + 1,
            dislikes: featureRequestData.dislikes - 1,
          });
        }
      } else {
        transaction.set(voteDocRef, { userId, type: "like" });
        transaction.update(featureRequestDoc, {
          likes: featureRequestData.likes + 1,
        });
      }
    });

    setFeatureRequests((prev) =>
      prev.map((req) => {
        if (req.id !== featureRequestId) return req;

        const alreadyLiked = req.likedBy.includes(userId);
        const alreadyDisliked = req.dislikedBy.includes(userId);
        let newLikes = req.likes;
        let newDislikes = req.dislikes;
        let newLikedBy = [...req.likedBy];
        let newDislikedBy = [...req.dislikedBy];

        if (alreadyLiked) {
          newLikes -= 1;
          newLikedBy = newLikedBy.filter((uid) => uid !== userId);
        } else if (alreadyDisliked) {
          newDislikes -= 1;
          newLikes += 1;
          newDislikedBy = newDislikedBy.filter((uid) => uid !== userId);
          newLikedBy.push(userId);
        } else {
          newLikes += 1;
          newLikedBy.push(userId);
        }

        return {
          ...req,
          likes: newLikes,
          dislikes: newDislikes,
          likedBy: newLikedBy,
          dislikedBy: newDislikedBy,
        };
      })
    );
  };

  const downVote = async (featureRequestId: string, userId: string) => {
    const featureRequestDoc = doc(featureRequestsCollection, featureRequestId);
    await runTransaction(firestore, async (transaction) => {
      const featureRequestSnapshot = await transaction.get(featureRequestDoc);
      if (!featureRequestSnapshot.exists()) {
        throw new Error("Feature request does not exist!");
      }

      const featureRequestData =
        featureRequestSnapshot.data() as FeatureRequest;
      const voteDocRef = doc(collection(featureRequestDoc, "votes"), userId);
      const voteSnapshot = await transaction.get(voteDocRef);

      if (voteSnapshot.exists()) {
        const userVote = voteSnapshot.data() as Vote;
        if (userVote.type === "dislike") {
          transaction.delete(voteDocRef);
          transaction.update(featureRequestDoc, {
            dislikes: featureRequestData.dislikes - 1,
          });
        } else if (userVote.type === "like") {
          transaction.update(voteDocRef, { type: "dislike" });
          transaction.update(featureRequestDoc, {
            dislikes: featureRequestData.dislikes + 1,
            likes: featureRequestData.likes - 1,
          });
        }
      } else {
        transaction.set(voteDocRef, { userId, type: "dislike" });
        transaction.update(featureRequestDoc, {
          dislikes: featureRequestData.dislikes + 1,
        });
      }
    });

    setFeatureRequests((prev) =>
      prev.map((req) => {
        if (req.id !== featureRequestId) return req;

        const alreadyLiked = req.likedBy.includes(userId);
        const alreadyDisliked = req.dislikedBy.includes(userId);
        let newLikes = req.likes;
        let newDislikes = req.dislikes;
        let newLikedBy = [...req.likedBy];
        let newDislikedBy = [...req.dislikedBy];

        if (alreadyDisliked) {
          newDislikes -= 1;
          newDislikedBy = newDislikedBy.filter((uid) => uid !== userId);
        } else if (alreadyLiked) {
          newLikes -= 1;
          newDislikes += 1;
          newLikedBy = newLikedBy.filter((uid) => uid !== userId);
          newDislikedBy.push(userId);
        } else {
          newDislikes += 1;
          newDislikedBy.push(userId);
        }

        return {
          ...req,
          likes: newLikes,
          dislikes: newDislikes,
          likedBy: newLikedBy,
          dislikedBy: newDislikedBy,
        };
      })
    );
  };

  return (
    <div
      className={`border-1 rounded-xl shadow-md ${
        status === "in-progress"
          ? "border-blue-500 border-3 bg-blue-50"
          : status === "complete"
          ? "border-green-600 border-2 bg-green-50"
          : "border-borderColor"
      }`}
    >
      <div className="flex h-full flex-col md:flex-row">
        {/* Votebereich */}
        <div className={`py-4 px-3 md:py-7 border-b md:border-r md:border-b-0 border-borderColor flex flex-row md:flex-col items-center justify-center ${
          status === "in-progress" ? "bg-blue-100" : status === "complete" ? "bg-green-100" : ""
        }`}>
          <Button
            onClick={() => user && upVote(id, user.uid)}
            variant="light"
            className="min-w-0 rounded-md"
            isDisabled={status !== "requested"}
          >
            <FaAngleUp size={25} />
          </Button>
          <p className="text-2xl font-bold my-2">{likes - dislikes}</p>
          <Button
            onClick={() => user && downVote(id, user.uid)}
            variant="light"
            className="min-w-0 rounded-md rotate-180"
            isDisabled={status !== "requested"}
          >
            <FaAngleUp size={25} />
          </Button>
        </div>

        {/* Inhalt */}
        <div className="p-4 sm:p-7">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-3">
            <h2 className="text-3xl pr-1">{title}</h2>
            {status === "in-progress" && (
              <div className="bg-blue-500 flex flex-row items-center py-1 px-3 rounded-full shadow-md">
                <IoMdTime color="white" size={21} />
                <p className="text-white ml-1 whitespace-nowrap font-medium">
                  {t.inProgressBadge}
                </p>
              </div>
            )}
            {status === "complete" && (
              <div className="bg-green-600 text-white py-1 px-3 rounded-full shadow-md font-medium flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t.completeBadge}
              </div>
            )}
          </div>
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
}
