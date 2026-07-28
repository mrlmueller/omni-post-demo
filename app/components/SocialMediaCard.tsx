"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  FaCheck,
  FaFacebook,
  FaInstagram,
  FaTiktok,
  FaXTwitter,
} from "react-icons/fa6";
import { FiYoutube } from "react-icons/fi";
import useOAuth from "./useOAuth";
import { getAuth } from "firebase/auth";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface SocialData {
  instagram?: { username?: string };
  youtube?: { username?: string };
  tiktok?: { username?: string };
  twitter?: { username?: string };
  facebook?: { username?: string };
}

type PlatformItem = {
  platform: keyof SocialData;
  name: string;
  icon: JSX.Element;
  accountName?: string;
};

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

interface SocialMediaCardProps {
  socialData: SocialData;
  onOAuthComplete: () => void;
  loading: boolean;
  onSelect?: (platform: keyof SocialData) => void;
  allowSelection?: boolean;
  className?: string;
  userLoggedIn?: boolean;
  attributes: Record<keyof SocialData, string> | null;
  t: SocialMediaCardTranslation;
}

const SocialMediaCard: React.FC<SocialMediaCardProps> = ({
  socialData,
  onOAuthComplete,
  loading,
  onSelect,
  userLoggedIn,
  allowSelection = true,
  className = "",
  attributes,
  t,
}) => {
  const [isSelected, setIsSelected] = useState<{
    [key in keyof SocialData]?: boolean;
  }>({});
  const [loadingStates, setLoadingStates] = useState<{
    [key in keyof SocialData]?: boolean;
  }>({});
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 770);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const platforms: PlatformItem[] = [];

  if (socialData.instagram?.username) {
    platforms.push({
      platform: "instagram",
      name: t.platforms.instagram,
      icon: <FaInstagram size={20} />,
      accountName: socialData.instagram.username,
    });
  } else if (socialData.facebook?.username) {
    platforms.push({
      platform: "facebook",
      name: t.platforms.facebook,
      icon: <FaFacebook size={20} />,
      accountName: socialData.facebook.username,
    });
  } else {
    platforms.push({
      platform: "instagram",
      name: t.platforms.combined,
      icon: <FaInstagram size={20} />,
      accountName: undefined,
    });
  }

  platforms.push(
    {
      platform: "youtube",
      name: t.platforms.youtube,
      icon: <FiYoutube size={20} />,
      accountName: socialData.youtube?.username,
    },
    {
      platform: "twitter",
      name: t.platforms.twitter,
      icon: <FaXTwitter size={20} />,
      accountName: socialData.twitter?.username,
    },
    {
      platform: "tiktok",
      name: t.platforms.tiktok,
      icon: <FaTiktok size={20} />,
      accountName: socialData.tiktok?.username,
    }
  );

  const instagramOAuth = useOAuth("facebook", onOAuthComplete);
  const youtubeOAuth = useOAuth("google", onOAuthComplete);
  const tiktokOAuth = useOAuth("tiktok", onOAuthComplete);
  const twitterOAuth = useOAuth("twitter", onOAuthComplete);

  const oauthHandlers: { [key in keyof SocialData]: () => Promise<void> } = {
    instagram: instagramOAuth,
    youtube: youtubeOAuth,
    tiktok: tiktokOAuth,
    twitter: twitterOAuth,
    facebook: instagramOAuth,
  };

  const handlePlatformClick = (platform: keyof SocialData) => {
    if (allowSelection && socialData[platform]?.username) {
      setIsSelected((prevState) => ({
        ...prevState,
        [platform]: !prevState[platform],
      }));
      onSelect && onSelect(platform);
      console.log("Selected", platform);
    }
  };

  useEffect(() => {
    setIsSelected({});
  }, [socialData]);

  useEffect(() => {
    if (!attributes) return;
    const newIsSelected: { [key in keyof SocialData]?: boolean } = {};
    for (const key in attributes) {
      if (attributes.hasOwnProperty(key)) {
        newIsSelected[key as keyof SocialData] =
          attributes[key as keyof SocialData] === "true";
      }
    }
    setIsSelected(newIsSelected);
  }, [attributes]);

  const handleLogout = async (socialMedia: keyof SocialData) => {
    setLoadingStates((prev) => ({ ...prev, [socialMedia]: true }));
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const idToken = await user.getIdToken();
        await axios.post("/api/delete-user-social", {
          token: idToken,
          social: socialMedia,
        });
        const platformName = t.platforms[socialMedia] || socialMedia;
        const successMessage = t.toast.deleteSuccess.replace(
          "{socialMedia}",
          platformName
        );
        toast({
          title: "Success",
          description: successMessage
        });
        onOAuthComplete();
      }
    } catch (error) {
      console.error("Error logging out:", error);
      const platformName = t.platforms[socialMedia] || socialMedia;
      const errorMessage = t.toast.deleteError.replace(
        "{socialMedia}",
        platformName
      );
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, [socialMedia]: false }));
    }
  };

  return (
    <div
      className={`grid !grid-cols-1 sm:!grid-cols-2 md:!grid-cols-1 lg:!grid-cols-2 xl:!grid-cols-1 2xl:!grid-cols-2 !gap-4 sm:!gap-6 md:!gap-5 lg:!gap-7 xl:!gap-5 2xl:!gap-7 ${className}`}
    >
      {platforms.map(({ platform, name, icon, accountName }) => {
        const hoverClass =
          !isMobile && accountName && allowSelection
            ? "hover:shadow-xl hover:border-roseTaupe"
            : "";
        const selected = isSelected[platform] || false;
        const isLoading = loadingStates[platform] || false;
        return (
          <div
            key={platform}
            id={`card-${platform}`}
            className={`p-2 sm:p-3 md:p-4 rounded-xl flex flex-row items-center justify-between transition-all duration-500 ${
              allowSelection ? "select-none" : ""
            } ${
              selected
                ? "bg-blue-500 shadow-md border border-blue-500"
                : "border border-borderColor"
            } ${accountName && allowSelection ? "cursor-pointer" : ""} ${
              !allowSelection || !accountName ? "cursor-default" : ""
            } ${hoverClass}`}
            onClick={() => handlePlatformClick(platform)}
          >
            <div className="flex flex-row items-center">
              <div
                className={`p-3 mr-4 rounded-full ${
                  selected ? "bg-white" : "bg-borderColor"
                }`}
              >
                {icon}
              </div>
              <div className="flex flex-col justify-start">
                <p
                  className={`text-xl ${
                    selected ? "text-white" : "text-black"
                  }`}
                >
                  {name}
                </p>
                <p
                  className={`text-sm font-extrabold ${
                    selected ? "text-white" : "text-roseTaupe"
                  }`}
                >
                  {accountName ? accountName : ``}
                </p>
              </div>
            </div>
            <div>
              {accountName ? (
                !allowSelection ? (
                  <Button
                    disabled={isLoading}
                    className="border-2 border-red-500 text-red-500 bg-white"
                    onClick={() => handleLogout(platform)}
                  >
                    {t.deleteButton}
                  </Button>
                ) : (
                  selected && (
                    <FaCheck className="mr-2" size={20} color="white" />
                  )
                )
              ) : (
                <Button
                  className="border-2 border-blue-500 text-blue-500 bg-white"
                  onClick={() => {
                    if (!userLoggedIn) {
                      router.push("/login");
                    } else {
                      const handler = oauthHandlers[platform];
                      if (handler) {
                        handler();
                      }
                    }
                  }}
                >
                  {t.connectButton}
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SocialMediaCard;
