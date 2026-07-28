"use client";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { getUserPremiumStatus } from "../lib/userStripeStatus";
import SubscriptionButton from "../components/StripeButton";
import { useSubscription } from "../hooks/useSubscription";

interface PricingClientProps {
  t: {
    error: string;
    loading: string;
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
}

const PricingClient: React.FC<PricingClientProps> = ({
  t,
  tSubscriptionButton,
}) => {
  const [isPremium, setIsPremium] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use our subscription hook here
  const {
    loading: subscriptionLoading,
    upgradeToPremium,
    manageSubscription,
  } = useSubscription();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const premium = await getUserPremiumStatus();
          setIsPremium(premium);
          setUserLoggedIn(true);
        } catch {
          setError("Fehler beim Abrufen des Premium-Status");
        }
      } else {
        setUserLoggedIn(false);
        setIsPremium(false);
      }
      setLoadingUser(false);
    });

    return () => unsubscribe();
  }, []);

  if (error) {
    return (
      <div className="text-red-500">{t.error.replace("{error}", error)}</div>
    );
  }

  // Show a spinner if you want, e.g., when loadingUser is true
  // For now, we just disable the button until user's state is fetched
  return (
    <SubscriptionButton
      t={tSubscriptionButton}
      isPremium={isPremium}
      userLoggedIn={userLoggedIn}
      loading={subscriptionLoading}
      onUpgrade={() => upgradeToPremium(userLoggedIn)}
      onManage={manageSubscription}
      size="md"
      radius="sm"
      className="bg-blue-500 text-white mt-5"
      disabled={loadingUser}
      loadingOverlay={true}
    />
  );
};

export default PricingClient;
