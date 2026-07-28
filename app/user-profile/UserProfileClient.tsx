"use client";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { FaRegCheckCircle } from "react-icons/fa";
import { MdOutlineImageNotSupported } from "react-icons/md";
import SocialCardLoadingSkeleton from "../components/LoadingStates/SocialCardLoadingSkeleton";
import SocialMediaCard from "../components/SocialMediaCard";
import SubscriptionButton from "../components/StripeButton";
import UploadedVideoStatus from "../components/UploadedVideoStatus";
import { useSubscription } from "../hooks/useSubscription";
import { getUserDataClient } from "../lib/getUserDataClient";
import { getUserPremiumStatus } from "../lib/userStripeStatus";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

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

interface UserProfileProps {
  t: {
    profile: {
      image_alt: string;
      email_verified: string;
      email_not_verified: string;
      premium_account: string;
      basic_account: string;
    };
    connected_accounts: {
      title: string;
    };
    errors: {
      fetch_user_data: string;
      fetch_premium_status: string;
    };
  };
  tUploadStatus: {
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
  tSubscriptionButton: {
    loadingOverlay: {
      redirectingToStripe: string;
      pleaseWait: string;
    };
    buttons: {
      manageSubscription: string;
      upgradeToPremium: string;
    };
  };
  tSocialMediaCard: {
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
  };
}

const UserProfileClient = ({
  t,
  tUploadStatus,
  tSubscriptionButton,
  tSocialMediaCard,
}: UserProfileProps) => {
  const [user, setUser] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [socialData, setSocialData] = useState<SocialDataResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const {
    loading: subscriptionLoading,
    upgradeToPremium,
    manageSubscription,
  } = useSubscription();
  const router = useRouter();

  const fetchUserData = useCallback(async () => {
    try {
      const userData = await getUserDataClient();
      const instagramUsername = userData.socials?.instagram?.username;
      const facebookPageName = userData.socials?.instagram?.facebookPageName;

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
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError(t.errors.fetch_user_data);
    }
  }, [t.errors.fetch_user_data]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        const name = firebaseUser.displayName;
        const userEmail = firebaseUser.email;

        const doesUserExistResponse = await fetch("/api/does-user-exist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const { exists } = await doesUserExistResponse.json();

        if (!exists) {
          const redirectUrl = `/create-account-google?token=${encodeURIComponent(
            token
          )}&name=${encodeURIComponent(name!)}&email=${encodeURIComponent(
            userEmail!
          )}`;
          router.push(redirectUrl);
          return;
        }

        setUser(firebaseUser.displayName);
        setIsEmailVerified(firebaseUser.emailVerified);
        setProfileImage(firebaseUser.photoURL);
        setEmail(firebaseUser.email);

        try {
          const premium = await getUserPremiumStatus();
          setIsPremium(premium);
          await fetchUserData();
        } catch (error) {
          console.error("Error fetching premium status or social data:", error);
          setError(t.errors.fetch_premium_status);
        } finally {
          setLoading(false);
        }
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [fetchUserData, router, t.errors.fetch_premium_status]);

  return (
    <div>
      <div className="grid gap-5 sm:gap-10">
        <div className="w-full p-5 md:p-6 lg:p-7 border rounded-xl border-borderColor shadow-md">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start">
            <div className="flex flex-col md:flex-row items-center md:items-start">
              <div>
                {loading ? (
                  <Skeleton className="h-24 sm:h-36 w-24 sm:w-36 rounded-lg" />
                ) : imageError || !profileImage ? (
                  <div className="h-24 sm:h-36 w-24 sm:w-36 flex items-center justify-center bg-gray-200 rounded-lg">
                    <MdOutlineImageNotSupported size={50} />
                  </div>
                ) : (
                  <Image
                    src={profileImage as string}
                    alt={t.profile.image_alt}
                    width={144}
                    height={144}
                    className="rounded-lg w-24 sm:w-36"
                    onError={() => setImageError(true)}
                  />
                )}
              </div>
              <div className="pl-0 md:pl-7 flex flex-col justify-center mt-4 md:mt-0 items-center md:items-start mb-10 md:mb-0">
                {loading ? (
                  <Skeleton className="h-10 w-full sm:w-56 rounded-lg" />
                ) : (
                  <p className="text-3xl sm:text-4xl">{user}</p>
                )}
                <div className="flex flex-row items-center mt-3">
                  {loading ? (
                    <Skeleton className="h-6 w-48 rounded-lg mr-2" />
                  ) : (
                    <p className="text-base sm:text-xl pr-2 pl-1">{email}</p>
                  )}
                  {isEmailVerified ? (
                    <FaRegCheckCircle
                      color="#A7537B"
                      title={t.profile.email_verified}
                    />
                  ) : (
                    <AiOutlineExclamationCircle
                      size={18}
                      color="42C2CE"
                      title={t.profile.email_not_verified}
                    />
                  )}
                </div>
                {isPremium ? (
                  <div
                    style={{ display: "inline-block", maxWidth: "fit-content" }}
                    className="rounded-full bg-black px-2 sm:px-4 py-1 sm:py-2 mt-3"
                  >
                    <p className="text-md font-normal sm:font-semibold text-white">
                      {t.profile.premium_account}
                    </p>
                  </div>
                ) : (
                  <div
                    style={{ display: "inline-block", maxWidth: "fit-content" }}
                    className="rounded-full bg-borderColor px-2 sm:px-4 py-1 sm:py-2 mt-3"
                  >
                    <p className="text-md font-normal sm:font-extrabold">
                      {t.profile.basic_account}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="my-auto">
              <SubscriptionButton
                t={tSubscriptionButton}
                userLoggedIn={user !== null}
                isPremium={isPremium}
                loading={subscriptionLoading}
                onUpgrade={() => upgradeToPremium(!!user)}
                onManage={manageSubscription}
                size="lg"
                radius="sm"
                className="bg-blue-500 text-white"
                disabled={loading}
                loadingOverlay={true}
              />
            </div>
          </div>
        </div>
        <div className="p-5 md:p-6 lg:p-7 border rounded-xl border-borderColor shadow-md">
          <p className="text-4xl mb-9">{t.connected_accounts.title}</p>
          {loading ? (
            <SocialCardLoadingSkeleton />
          ) : (
            socialData && (
              <SocialMediaCard
                socialData={socialData}
                onOAuthComplete={fetchUserData}
                loading={loading}
                onSelect={(platform) => console.log(platform)}
                allowSelection={false}
                userLoggedIn={user !== null}
                className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-7"
                attributes={null}
                t={tSocialMediaCard}
              />
            )
          )}
        </div>
        <UploadedVideoStatus t={tUploadStatus} />
      </div>
    </div>
  );
};

export default UserProfileClient;
