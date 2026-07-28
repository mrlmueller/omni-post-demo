"use client";

import { app } from "@/app/lib/firebaseConfig";
import { useAuthState } from "@/app/lib/useAuthState";
import LoginButton from "@/app/LoginButton";
import { getPremiumStatus } from "@/stripe/getPremiumStatus";
import { User } from "firebase/auth";
import React, { useCallback, useEffect, useState } from "react";
import SubscriptionButton from "../StripeButton";
import MobileMenu from "./MobileMenu";
import ProfileMenu from "./ProfileMenu";
import { useSubscription } from "@/app/hooks/useSubscription";

interface ProfileMenuTranslation {
  premiumPlan: string;
  basicPlan: string;
  profile: string;
  logout: string;
  imageAlt: string;
}

interface MobileMenuTranslation {
  guest: string;
  premiumPlan: string;
  basicPlan: string;
  featureIdeas: string;
  pricing: string;
  profile: string;
  logout: string;
  login: string;
  signUp: string;
  closeMenu: string;
}

interface SubscriptionButton {
  loadingOverlay: {
    redirectingToStripe: string;
    pleaseWait: string;
  };
  buttons: {
    manageSubscription: string;
    upgradeToPremium: string;
  };
}

interface AuthButton {
  login: string;
  register: string;
}

interface UserProfileProps {
  initialUser: User | null;
  t: ProfileMenuTranslation;
  tMobile: MobileMenuTranslation;
  tSubscriptionButton: SubscriptionButton;
  tAuthButton: AuthButton;
}

const UserProfile: React.FC<UserProfileProps> = ({
  initialUser,
  t,
  tMobile,
  tSubscriptionButton,
  tAuthButton,
}) => {
  const { user, isLoading } = useAuthState(initialUser);
  const [currentUser, setCurrentUser] = useState<User | null>(initialUser);
  const [isPremium, setIsPremium] = useState<boolean>(true);
  const [premiumFetched, setPremiumFetched] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Our custom subscription hook
  const {
    loading: subscriptionLoading,
    upgradeToPremium,
    manageSubscription,
  } = useSubscription();

  const fetchPremiumStatus = useCallback(async (user: User) => {
    if (!user) {
      console.log("User not found, setting premium to false");
      setIsPremium(false);
      setPremiumFetched(true);
      return;
    }
    try {
      const premiumStatus = await getPremiumStatus(app);
      setIsPremium(premiumStatus);
      setPremiumFetched(true);
    } catch (error) {
      console.error("Error fetching premium status:", error);
      setIsPremium(false);
      setPremiumFetched(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && user && !premiumFetched) {
      setCurrentUser(user);
      fetchPremiumStatus(user);
      setPremiumFetched(true);
    }
  }, [user, isLoading, premiumFetched, fetchPremiumStatus]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {currentUser ? (
        <div className="w-2 h-2 rounded-full bg-green-500 block md:hidden"></div>
      ) : null}
      <MobileMenu
        tSubscriptionButton={tSubscriptionButton}
        user={currentUser}
        isMobileMenuOpen={isMobileMenuOpen}
        toggleMobileMenu={toggleMobileMenu}
        closeMobileMenu={closeMobileMenu}
        isPremium={isPremium}
        setUser={setCurrentUser}
        t={tMobile}
      />

      {/* Only show the button if the user is known not to be premium */}
      {!isPremium && premiumFetched && (
        <div className="hidden md:block">
          <SubscriptionButton
            t={tSubscriptionButton} // NEU: Übersetzung übergeben
            userLoggedIn={user !== null}
            isPremium={isPremium}
            loading={subscriptionLoading}
            onUpgrade={() => upgradeToPremium(!!user)}
            onManage={manageSubscription}
            size="md"
            radius="sm"
            className="bg-blue-500 text-white"
            loadingOverlay={true}
          />
        </div>
      )}

      {currentUser ? (
        <div className="hidden md:block">
          <ProfileMenu initialUser={currentUser} isPremium={isPremium} t={t} />
        </div>
      ) : (
        <div className="hidden md:block">
          <LoginButton initialUser={currentUser} t={tAuthButton} />
        </div>
      )}
    </>
  );
};

export default UserProfile;
