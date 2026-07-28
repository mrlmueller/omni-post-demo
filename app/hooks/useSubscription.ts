// app/hooks/useSubscription.ts

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { app } from "../lib/firebaseConfig";
import {
  getCheckoutUrl,
  getSubscriptionPortalUrl,
} from "@/stripe/stripePayment";

/**
 * useSubscription - A custom hook handling Stripe subscription actions
 */
export function useSubscription() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Upgrade to Premium
  const upgradeToPremium = useCallback(
    async (
      userLoggedIn: boolean,
      priceId: string = "price_1QRz6s2MjSfMyWwFCqevn9Zx"
    ) => {
      if (!userLoggedIn) {
        // Not logged in? Send user to login
        router.push("/login?redirectCheckout=true");
        return;
      }
      setLoading(true);
      try {
        const checkoutUrl = await getCheckoutUrl(app, priceId);
        if (checkoutUrl) {
          router.push(checkoutUrl);
        } else {
          console.error("No checkout URL returned from Stripe.");
        }
      } catch (error) {
        console.error("Failed to upgrade to premium", error);
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  // Manage existing subscription
  const manageSubscription = useCallback(async () => {
    setLoading(true);
    try {
      const portalUrl = await getSubscriptionPortalUrl(app);
      if (portalUrl) {
        router.push(portalUrl);
      } else {
        console.error("No portal URL returned from Stripe.");
      }
    } catch (error) {
      console.error("Failed to manage subscription", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  return {
    loading, // boolean indicating Stripe action in progress
    upgradeToPremium, // call this to initiate checkout
    manageSubscription, // call this to open portal
  };
}
