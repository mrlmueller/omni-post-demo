"use client";
import { Input, Switch } from "@nextui-org/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import axios from "axios";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { getUserDataClient } from "../lib/getUserDataClient";
import { getUserPremiumStatus } from "../lib/userStripeStatus";
import DragAndDropUploadField from "./DragAndDropUploadField";
import SocialCardLoadingSkeleton from "./LoadingStates/SocialCardLoadingSkeleton";
import SocialMediaCard from "./SocialMediaCard";
import TikTokCompliance from "./TikTokCompliance";
import { Button } from "@/components/ui/button";

interface UploadVideoToolTranslation {
  videoUpload: string;
  title: string;
  enterVideoTitle: string;
  selectPlatforms: string;
  facebookPage: string;
  uploadVideo: string;
  notFilled: string;
  premiumRequired: string;
  fillRequiredFields: string;
  missing: string;
  upgradePremium: string;
  videoUploading: string;
  uploadTakesTime: string;
  videoTitleLimitError: string;
  selectVideoAndPlatform: string;
  errorUploading: string;
  uploadToast: {
    line1: string;
    line2: string;
  };
}

interface TikTokComplianceTranslation {
  videoVisibility: string;
  allowOnVideo: string;
  discloseContent: string;
  discloseContentDescription: string;
  yourBrand: string;
  yourBrandDescription: string;
  brandedContent: string;
  brandedContentDescription: string;
  brandedContentPopover: string;
  agreeToPolicy: string;
  brandedContentPolicy: string;
  musicUsagePolicy: string;
}

interface DragAndDropTranslation {
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

interface SocialMediaCardTranslation {
  deleteButton: string;
  connectButton: string;
  toast: {
    deleteSuccess: string;
    deleteError: string;
  };
  platforms: {
    instagram: string;
    facebook: string;
    combined: string;
    youtube: string;
    twitter: string;
    tiktok: string;
  };
}

interface UploadVideoToolProps {
  t: UploadVideoToolTranslation;
  tTikTok: TikTokComplianceTranslation;
  tDragAndDrop: DragAndDropTranslation;
  tSocialMediaCard: SocialMediaCardTranslation;
}

interface SocialAccountStatus {
  username?: string;
}

interface SocialDataResponse {
  twitter: SocialAccountStatus;
  youtube: SocialAccountStatus;
  instagram?: SocialAccountStatus;
  facebook?: SocialAccountStatus;
  tiktok: SocialAccountStatus;
}

type SocialPlatform =
  | "instagram"
  | "tiktok"
  | "twitter"
  | "youtube"
  | "facebook";

const UploadVideoTool = ({
  t,
  tTikTok,
  tDragAndDrop,
  tSocialMediaCard,
}: UploadVideoToolProps) => {
  const [socialData, setSocialData] = useState<SocialDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedUrl, setSelectedUrl] = useState<string>("");
  const [videoTitle, setVideoTitle] = useState<string>("");
  const [attributes, setAttributes] = useState<Record<SocialPlatform, string>>({
    instagram: "false",
    tiktok: "false",
    twitter: "false",
    youtube: "false",
    facebook: "false",
  });
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  const defaultTikTokComplianceData = {
    privacyLevelOption: "",
    commentDisabled: true,
    duetDisabled: true,
    stitchDisabled: true,
    discloseVideoContent: false,
    isYourBrandChecked: false,
    isBrandedContentChecked: false,
    isFormComplete: false,
    missingFields: {
      privacyLevel: false,
      disclosure: false,
    },
  };

  const [tiktokComplianceData, setTikTokComplianceData] = useState(
    defaultTikTokComplianceData
  );
  const [facebookPageName, setFacebookPageName] = useState<string | null>(null);
  const [maxVideoDurationSec, setMaxVideoDurationSec] = useState<number>(0);

  const fetchPremiumStatus = useCallback(async () => {
    try {
      const premiumStatus = await getUserPremiumStatus();
      setIsPremium(premiumStatus);
    } catch (error) {
      console.error("Error checking premium status", error);
    }
  }, []);

  const setCookie = async () => {
    try {
      await fetch("/api/setCookie", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user }),
      });
      console.log("Cookies set");
    } catch (error) {
      console.error("Error setting cookies: ", error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    await setCookie();
    if (
      !selectedUrl ||
      !videoTitle ||
      !Object.values(attributes).includes("true") ||
      (attributes.tiktok === "true" && !tiktokComplianceData.isFormComplete)
    ) {
      return;
    }

    const payload = {
      videoUrl: selectedUrl,
      videoTitle,
      attributes,
      tiktokComplianceData,
    };

    console.log("Payload", payload);

    if (videoTitle.length > 600) {
      toast({
        title: "Error",
        description: t.videoTitleLimitError,
        variant: "destructive",
      });
      return;
    }

    if (!selectedUrl || !userId) {
      toast({
        title: "Error",
        description: t.selectVideoAndPlatform,
        variant: "destructive",
      });
      return;
    }

    try {
      setButtonLoading(true);
      const response = await axios.post("/api/videoPosting", payload);
      const data = response.data;

      if (data.status === "error") {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      } else if (data.status === "success") {
        toast({
          title: "Success",
          description: `${t.uploadToast.line1} ${t.uploadToast.line2}`,
        });
        setTikTokComplianceData(defaultTikTokComplianceData);
        setSelectedUrl("");
        setVideoTitle("");
        setAttributes({
          instagram: "false",
          tiktok: "false",
          twitter: "false",
          youtube: "false",
          facebook: "false",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: t.errorUploading.replace(
          "{error}",
          error.response?.data?.message || error.message
        ),
        variant: "destructive",
      });
    } finally {
      setButtonLoading(false);
    }
  };

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      try {
        const token = await user.getIdToken();
        const name = user.displayName;
        const email = user.email;

        const doesUserExistResponse = await fetch("/api/does-user-exist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const { exists } = await doesUserExistResponse.json();

        if (exists) {
          setUserId(user.uid);
          setUser(user);

          const userData = await getUserDataClient();

          const instagramUsername = userData.socials?.instagram?.username;
          const facebookPageName =
            userData.socials?.instagram?.facebookPageName;

          const newSocialData: SocialDataResponse = {
            twitter: { username: userData.socials?.twitter?.username },
            youtube: { username: userData.socials?.youtube?.username },
            tiktok: { username: userData.socials?.tiktok?.username },
            instagram: {},
            facebook: {},
          };

          if (instagramUsername) {
            newSocialData.instagram!.username = instagramUsername;
          }
          if (facebookPageName) {
            newSocialData.facebook!.username = facebookPageName;
          }

          setSocialData(newSocialData);
          setFacebookPageName(facebookPageName);

          setAttributes({
            twitter: newSocialData.twitter.username ? "true" : "false",
            youtube: newSocialData.youtube.username ? "true" : "false",
            tiktok: newSocialData.tiktok.username ? "true" : "false",
            instagram: newSocialData.instagram?.username ? "true" : "false",
            facebook: "false", // Start with Facebook deselected by default
          });
        } else {
          const redirectUrl = `/create-account-google?token=${encodeURIComponent(
            token
          )}&name=${encodeURIComponent(name!)}&email=${encodeURIComponent(
            email!
          )}`;
          window.location.href = redirectUrl;
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to fetch social media status");
      } finally {
        setLoading(false);
      }
    } else {
      setSocialData(null);
      setUserId(null);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsUserLoggedIn(true);
        fetchUserData();
        fetchPremiumStatus();
      } else {
        setIsUserLoggedIn(false);
        setSocialData({
          twitter: {},
          youtube: {},
          instagram: {},
          facebook: {},
          tiktok: {},
        });
        setUserId(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchUserData, fetchPremiumStatus]);

  // When Instagram is selected, enable the Facebook option but don't automatically select it
  // This allows the user to choose whether to post to Facebook separately
  useEffect(() => {
    // No automatic selection - this was causing the bug
    // Let user explicitly control Facebook selection
  }, [attributes.instagram]);

  const isFormIncomplete =
    !selectedUrl ||
    !videoTitle ||
    !Object.values(attributes).includes("true") ||
    (attributes.tiktok === "true" && !tiktokComplianceData.isFormComplete);

  const getMissingDataMessage = () => {
    const missingData = [];
    if (!selectedUrl) missingData.push("Video");
    if (!videoTitle) missingData.push("Video Title");
    if (!Object.values(attributes).includes("true"))
      missingData.push("Platform selection");
    if (attributes.tiktok === "true" && !tiktokComplianceData.isFormComplete)
      missingData.push("TikTok compliance form");

    return missingData.length > 0
      ? `${t.missing} ${missingData.join(", ")}`
      : null;
  };

  const missingDataMessage = getMissingDataMessage();

  useEffect(() => {
    if (attributes.tiktok === "false") {
      setTikTokComplianceData(defaultTikTokComplianceData);
    }
  }, [attributes.tiktok]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 770);
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="max-w-full p-5 xl:p-9 border-1 rounded-xl border-borderColor shadow-lg">
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1"
      />
      <p className="text-3xl font-semibold">{t.videoUpload}</p>
      <div className="h-1px bg-borderColor my-7"></div>

      <div className="xl:w-full flex flex-col xl:flex-row gap-x-9 ">
        <div className="w-full xl:w-1/2">
          <DragAndDropUploadField
            onUploadComplete={(url) => setSelectedUrl(url)}
            selectedUrl={selectedUrl}
            t={tDragAndDrop}
          />
        </div>

        <div className="w-full xl:w-1/2 mt-8 xl:mt-0">
          <p className="mb-1">{t.title}</p>
          <Input
            type="text"
            label={t.enterVideoTitle}
            variant="bordered"
            onChange={(e) => setVideoTitle(e.target.value)}
            value={videoTitle}
          />
          <p className="mb-1 mt-10">{t.selectPlatforms}</p>
          <div className="">
            {loading ? (
              <SocialCardLoadingSkeleton />
            ) : (
              socialData && (
                <SocialMediaCard
                  socialData={socialData}
                  onOAuthComplete={fetchUserData}
                  loading={loading}
                  onSelect={(platform) =>
                    setAttributes((prev) => ({
                      ...prev,
                      [platform]: prev[platform] === "true" ? "false" : "true",
                    }))
                  }
                  allowSelection={true}
                  userLoggedIn={isUserLoggedIn}
                  className="grid-cols-2 gap-7"
                  attributes={attributes}
                  t={tSocialMediaCard}
                />
              )
            )}
          </div>
          {attributes.tiktok === "true" && (
            <TikTokCompliance
              user={user}
              onChange={(data) => {
                setTikTokComplianceData(data);
              }}
              onMaxVideoDurationChange={(duration) =>
                setMaxVideoDurationSec(duration)
              }
              t={tTikTok}
            />
          )}
        </div>
      </div>

      <div className="h-1px bg-borderColor my-7"></div>

      <div>
        {facebookPageName && socialData?.instagram?.username && (
          <div className="mb-4 flex items-center">
            <Switch
              isSelected={attributes.facebook === "true"}
              onChange={(e) => {
                // Immediately update state with the new value on first click
                const newValue = e.target.checked ? "true" : "false";
                setAttributes((prev) => ({
                  ...prev,
                  facebook: newValue
                }));
              }}
              isDisabled={attributes.instagram !== "true"}
              // Adding explicit color to ensure active state is visible
              color="primary"
            />
            <span className="ml-2 cursor-pointer" onClick={() => {
              // Only toggle if Instagram is enabled
              if (attributes.instagram === "true") {
                setAttributes((prev) => ({
                  ...prev,
                  facebook: attributes.facebook === "true" ? "false" : "true"
                }));
              }
            }}>
              {t.facebookPage} <strong>{facebookPageName}</strong>
              {attributes.instagram !== "true" && (
                <span className="text-xs text-gray-500 ml-2">
                  (Enable Instagram to post to Facebook)
                </span>
              )}
            </span>
          </div>
        )}

        <Popover
          open={!isMobile ? isPopoverOpen : undefined}
          onOpenChange={!isMobile ? setIsPopoverOpen : undefined}
        >
          <PopoverTrigger asChild>
            <div
              onMouseEnter={() => {
                if (!isMobile) setIsPopoverOpen(true);
              }}
              onMouseLeave={() => {
                if (!isMobile) setIsPopoverOpen(false);
              }}
              onClick={() => {
                if (isMobile) setIsPopoverOpen((prev) => !prev);
              }}
            >
              <Button
                disabled={buttonLoading}
                className={
                  "w-full rounded-md text-white flex justify-center items-center " +
                  (isFormIncomplete ||
                  !isPremium ||
                  (attributes.tiktok === "true" &&
                    !tiktokComplianceData.isFormComplete)
                    ? "opacity-50 cursor-pointer"
                    : "bg-blue-500")
                }
                onClick={() => {
                  if (
                    !isFormIncomplete &&
                    isPremium &&
                    (attributes.tiktok === "true"
                      ? tiktokComplianceData.isFormComplete
                      : true)
                  ) {
                    setButtonLoading(true);
                    handleSubmit().finally(() => setButtonLoading(false));
                  }
                }}
              >
                {buttonLoading ? (
                  <div className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray="40 80"
                      ></circle>
                    </svg>
                    <span>{t.videoUploading}</span>
                  </div>
                ) : (
                  t.uploadVideo
                )}
              </Button>
            </div>
          </PopoverTrigger>

          {(isFormIncomplete ||
            !isPremium ||
            (attributes.tiktok === "true" &&
              !tiktokComplianceData.isFormComplete)) && (
            <PopoverContent
              side="top"
              align="center"
              className="w-auto"
              onMouseEnter={() => {
                if (!isMobile) setIsPopoverOpen(true);
              }}
              onMouseLeave={() => {
                if (!isMobile) setIsPopoverOpen(false);
              }}
            >
              <div className="p-2">
                <div className="font-semibold">
                  {isPremium ? t.notFilled : t.premiumRequired}
                </div>
                <div className="text-sm mt-1">
                  {isPremium
                    ? missingDataMessage ||
                      (attributes.tiktok === "true" &&
                      !tiktokComplianceData.isFormComplete
                        ? `TikTok compliance: ${t.fillRequiredFields}`
                        : isFormIncomplete
                        ? t.fillRequiredFields
                        : "")
                    : t.upgradePremium}
                </div>
              </div>
            </PopoverContent>
          )}
        </Popover>
      </div>
    </div>
  );
};

export default UploadVideoTool;
