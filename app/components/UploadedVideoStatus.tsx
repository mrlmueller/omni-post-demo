"use client";

import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { FaInstagram, FaTiktok, FaXTwitter } from "react-icons/fa6";
import { FiYoutube } from "react-icons/fi";
import { IoMdTime } from "react-icons/io";
import { firestore } from "../lib/firebaseConfig";
import { useAuthListener } from "../lib/getUserId";
import React from "react";
import { FaFacebook } from "react-icons/fa";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@nextui-org/react";

interface PlatformData {
  status_code: number;
  timestamp: string;
  read: boolean;
}

interface UploadData {
  title: string;
  upload_id: string;
  [key: string]: any;
}

interface UploadVideoStatusProps {
  t: {
    recentVideos: string;
    started: string;
    processing: string;
    uploading: string;
    uploadError: string;
    uploadComplete: string;
    unknownStatus: string;
    noVideos: string;
    language: string;
  };
}

const UploadVideoStatus = ({ t }: UploadVideoStatusProps) => {
  const [uploads, setUploads] = useState<UploadData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const uploadsPerPage = 6;

  const [user, setUserId] = useState<string | null>(null);
  useAuthListener(setUserId);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const uploadsCollection = collection(firestore, "users", user, "uploads");

    const unsubscribe = onSnapshot(uploadsCollection, (snapshot) => {
      const uploadsData: UploadData[] = snapshot.docs.map(
        (doc) => doc.data() as UploadData
      );
      setUploads(uploadsData.reverse());
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString(t.language, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getStatusChip = (statusCode: number) => {
    switch (statusCode) {
      case 0:
        return (
          <div className="py-1 px-3 rounded-full">
            <span>{t.started}</span>
          </div>
        );
      case 1:
        return (
          <div className="py-1 px-3 border-2 border-blue-500 bg-white rounded-full">
            <span>{t.processing}</span>
          </div>
        );
      case 2:
        return (
          <div className="py-1 px-3 bg-blue-500 rounded-full">
            <span className="text-white">{t.uploading}</span>
          </div>
        );
      case 3:
        return (
          <div className="py-1 px-3 bg-teal rounded-full">
            <span>{t.uploadError}</span>
          </div>
        );
      case 4:
        return (
          <div className="py-1 px-3 bg-roseTaupe rounded-full">
            <span className="text-white">{t.uploadComplete}</span>
          </div>
        );
      default:
        return (
          <div className="py-1 px-3 bg-yellow-500 rounded-full">
            <span>{t.unknownStatus}</span>
          </div>
        );
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "instagram":
        return <FaInstagram size={20} />;
      case "twitter":
        return <FaXTwitter size={20} />;
      case "youtube":
        return <FiYoutube size={20} />;
      case "tiktok":
        return <FaTiktok size={20} />;
      case "facebook":
        return <FaFacebook size={20} />;
      default:
        return null;
    }
  };

  const currentUploads = useMemo(() => {
    const indexOfLastUpload = currentPage * uploadsPerPage;
    const indexOfFirstUpload = indexOfLastUpload - uploadsPerPage;
    return uploads.slice(indexOfFirstUpload, indexOfLastUpload);
  }, [uploads, currentPage, uploadsPerPage]);

  const totalPages = useMemo(
    () => Math.ceil(uploads.length / uploadsPerPage),
    [uploads.length]
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="w-full p-5 md:p-6 lg:p-7 sm:p-9 border rounded-xl border-borderColor shadow-md mb-10">
        <p className="text-4xl mb-9">{t.recentVideos}</p>
        <div>
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="w-full p-4 border rounded-xl border-borderColor mb-7 animate-pulse"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                <Skeleton className="h-10 w-full sm:w-36 mb-3 sm:mb-0 rounded-lg" />
                <div className="flex flex-row items-center mt-2 sm:mt-0">
                  <Skeleton className="w-5 h-5 rounded-full" />
                  <Skeleton className="ml-2 w-full sm:w-52 h-4 rounded-md" />
                </div>
              </div>
              <div className="flex flex-wrap">
                {[...Array(2)].map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-8 w-full sm:w-44 mb-3 sm:mb-0 mr-0 sm:mr-3 rounded-full"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-5 md:p-6 lg:p-7 border rounded-xl border-borderColor shadow-md mb-10">
      <p className="text-4xl mb-9">{t.recentVideos}</p>
      {uploads.length > 0 ? (
        currentUploads.map((upload) => (
          <div
            key={upload.upload_id}
            className="w-full p-4 border rounded-xl border-borderColor mb-7"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
              <p className="text-2xl">{upload.title}</p>
              <div className="flex flex-row items-center mt-2 sm:mt-0">
                <IoMdTime size={18} />
                <p className="ml-2 text-gray-500">
                  {formatDate(upload.upload_id)}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap">
              {Object.keys(upload)
                .filter((key) => key !== "title" && key !== "upload_id")
                .map((platform) => {
                  const platformData = upload[platform] as PlatformData;
                  return (
                    <div
                      key={platform}
                      className="rounded-full flex flex-row justify-center items-center bg-borderColor mr-3 mb-3 py-1 pr-1 pl-3"
                    >
                      {getPlatformIcon(platform)}
                      <div className="ml-1">
                        {getStatusChip(platformData.status_code)}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500">{t.noVideos}</p>
      )}
      {uploads.length > uploadsPerPage && (
        <Pagination
          total={totalPages}
          initialPage={1}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          variant="faded"
        />
      )}
    </div>
  );
};

export default UploadVideoStatus;
