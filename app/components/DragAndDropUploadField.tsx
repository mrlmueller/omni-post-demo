"use client";

import { storage } from "@/app/lib/firebaseConfig";
import { Progress } from "@nextui-org/react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import {
  getDownloadURL,
  ref,
  uploadBytesResumable,
  UploadTask,
} from "firebase/storage";
import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useToast } from "@/hooks/use-toast";
import { HiOutlineUpload } from "react-icons/hi";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface DragAndDropUploadFieldTranslations {
  videoInfo: string;
  dropVideo: string;
  or: string;
  browseFiles: string;
  uploadProgress: string;
  cancelUpload: string;
  uploadFailed: string;
  fileSizeTooSmall: string;
  fileSizeTooLarge: string;
  videoDurationError: string;
  aspectRatioError: string;
}

interface DragAndDropUploadFieldProps {
  onUploadComplete: (url: string) => void;
  selectedUrl: string;
  t: DragAndDropUploadFieldTranslations;
}

const DragAndDropUploadField: React.FC<DragAndDropUploadFieldProps> = ({
  onUploadComplete,
  selectedUrl,
  t,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [uploadComplete, setUploadComplete] = useState<boolean>(false);
  const [uploadTask, setUploadTask] = useState<UploadTask | null>(null);
  const { toast } = useToast();

  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const onDrop = (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    setFile(selectedFile);
    setVideoPreviewUrl(URL.createObjectURL(selectedFile));
    checkVideoDurationAndAspectRatio(selectedFile);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [],
    },
    maxFiles: 1,
    disabled: !user,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setVideoPreviewUrl(URL.createObjectURL(selectedFile));
      checkVideoDurationAndAspectRatio(selectedFile);
    }
  };

  const checkVideoDurationAndAspectRatio = (file: File) => {
    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      const durationInSeconds = video.duration;
      const maxDurationInSeconds = 600;

      if (durationInSeconds > maxDurationInSeconds) {
        toast({
          title: "Error",
          description: t.videoDurationError,
          variant: "destructive"
        });
        setFile(null);
        setVideoPreviewUrl(null);
        return;
      }

      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      const aspectRatio = videoWidth / videoHeight;
      const targetAspectRatio = 9 / 16;
      const aspectRatioTolerance = 0.01;

      if (Math.abs(aspectRatio - targetAspectRatio) > aspectRatioTolerance) {
        toast({
          title: "Error",
          description: t.aspectRatioError,
          variant: "destructive"
        });
        setFile(null);
        setVideoPreviewUrl(null);
        return;
      }

      handleUpload(file);
    };
  };

  const handleUpload = async (file: File) => {
    if (file && user) {
      const maxSizeInMB = 999;
      const minSizeInMB = 0.1;

      if (file.size < minSizeInMB * 1024 * 1024) {
        toast({
          title: "Error",
          description: t.fileSizeTooSmall.replace("{minSize}", minSizeInMB.toString()),
          variant: "destructive"
        });
        setFile(null);
        setVideoPreviewUrl(null);
        return;
      }

      if (file.size > maxSizeInMB * 1024 * 1024) {
        toast({
          title: "Error",
          description: t.fileSizeTooLarge.replace("{maxSize}", maxSizeInMB.toString()),
          variant: "destructive"
        });
        setFile(null);
        setVideoPreviewUrl(null);
        return;
      }

      const storageRef = ref(storage, `videos/${user.uid}/${file.name}`);
      const uploadTaskInstance = uploadBytesResumable(storageRef, file);
      setUploadTask(uploadTaskInstance);

      uploadTaskInstance.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(Math.round(progress));
          setUploadComplete(false);
        },
        (error) => {
          if (error.code !== "storage/canceled") {
            toast({
              title: "Error",
              description: t.uploadFailed.replace("{error}", error.message),
              variant: "destructive"
            });
          }
        },
        async () => {
          const downloadURL = await getDownloadURL(
            uploadTaskInstance.snapshot.ref
          );
          setProgress(0);
          setUploadComplete(true);
          onUploadComplete(downloadURL);
          setUploadTask(null);
        }
      );
    }
  };

  const handleCancelUpload = () => {
    if (uploadTask) {
      uploadTask.cancel();
      setProgress(0);
      setFile(null);
      setVideoPreviewUrl(null);
      setUploadTask(null);
    }
  };

  useEffect(() => {
    if (!uploadComplete && !file && !videoPreviewUrl) {
      setVideoPreviewUrl(null);
      setFile(null);
    }
  }, [uploadComplete, file, videoPreviewUrl]);

  useEffect(() => {
    if (!selectedUrl) {
      setFile(null);
      setVideoPreviewUrl(null);
      setUploadComplete(false);
      setProgress(0);
    }
  }, [selectedUrl]);

  return (
    <div className="h-[400px] sm:h-[500px] xl:h-[500px] pb-0 mb-20">
      <p className="mb-1">{t.videoInfo}</p>
      {videoPreviewUrl ? (
        <div className="relative flex justify-center items-center h-[400px] sm:h-[500px] xl:h-[500px]">
          <div className="w-full h-full max-w-full max-h-full flex justify-center items-center">
            <video
              src={videoPreviewUrl}
              className="max-w-full max-h-full object-contain rounded-xl border-2 border-solid border-borderColor aspect-[9/16]"
              controls
            />
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`h-[400px] sm:h-[500px] xl:h-[500px] rounded-xl border-2 border-dashed border-2.5 border-borderColor flex justify-center items-center ${
            isDragActive ? "bg-blue-50" : ""
          } ${user ? "cursor-pointer" : "cursor-default"}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center">
            <HiOutlineUpload size={58} />
            <p className="pt-2">{t.dropVideo}</p>
            <div className="my-4 flex items-center ">
              <div className="w-14 sm:w-20 h-1px bg-borderColor"></div>
              <p className="px-4">{t.or}</p>
              <div className="w-14 sm:w-20 h-1px bg-borderColor"></div>
            </div>
            <Button
              className="border-2 border-blue-500 text-blue-500 bg-white"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation(); // Prevent event from bubbling up to the dropzone
                if (!user) {
                  router.push("/login");
                } else {
                  document.getElementById("fileInput")?.click();
                }
              }}
            >
              {t.browseFiles}
            </Button>
          </div>
        </div>
      )}
      <input
        id="fileInput"
        type="file"
        accept="video/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      {file && (
        <div className="mt-4">
          {!uploadComplete ? (
            <div className="flex items-center justify-between">
              <Progress
                size="sm"
                radius="sm"
                label={t.uploadProgress}
                value={progress}
                showValueLabel={true}
              />
              <Button
                size="sm"
                onClick={handleCancelUpload}
                variant="outline"
                className="ml-4 px-4 border-2 border-teal bg-white text-black"
              >
                {t.cancelUpload}
              </Button>
            </div>
          ) : (
            <p className="text-center text-sm mt-2">{file?.name}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default DragAndDropUploadField;
