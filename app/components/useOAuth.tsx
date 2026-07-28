"use client";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuthListener } from "../lib/getUserId";

const useOAuth = (endpoint: string, onOAuthComplete: () => void) => {
  const [userId, setUserId] = useState<string | null>(null);
  const popupIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useAuthListener(setUserId);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "oauth-status" && event.newValue === "success") {
        toast({
          title: "Success",
          description: `${endpoint} erfolgreich verbunden`
        });
        onOAuthComplete();
      }
    };

    const handleBeforeUnload = () => {
      if (popupIntervalRef.current) {
        clearInterval(popupIntervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [onOAuthComplete, endpoint]);

  const isMobile = (userAgent: string): boolean => {
    return /android.+mobile|ip(hone|[oa]d)/i.test(userAgent);
  };

  const handleLogin = async () => {
    try {
      const response = await axios.get(
        `/api/social/${endpoint}/login?state=${encodeURIComponent(
          userId as string
        )}`
      );
      const redirectUrl = response.data.redirectUrl;

      // Use isMobile method to check if the device is mobile
      if (isMobile(navigator.userAgent)) {
        // For mobile devices, redirect the user
        window.location.href = redirectUrl;
      } else {
        // For non-mobile devices, open the OAuth popup
        const oauthPopup = window.open(
          redirectUrl,
          "oauthPopup",
          "width=600,height=700"
        );

        if (oauthPopup) {
          // Start checking every 500ms if the popup is closed
          popupIntervalRef.current = setInterval(() => {
            if (oauthPopup.closed) {
              clearInterval(popupIntervalRef.current!);
              onOAuthSuccess();
            }
          }, 500);

          // Stop checking after 5 minutes (300000ms)
          timeoutRef.current = setTimeout(() => {
            if (popupIntervalRef.current) {
              clearInterval(popupIntervalRef.current);
            }
            toast({
              title: "Error",
              description: `Failed to log in with ${endpoint}. Please try again.`,
              variant: "destructive"
            });
          }, 300000); // 5 minutes
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error logging in. Please try again.",
        variant: "destructive"
      });
      console.error("Error logging in:", error);
    }
  };

  const onOAuthSuccess = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    toast({
      title: "Success",
      description: `${endpoint} erfolgreich verbunden`
    });
    onOAuthComplete();
  };

  return handleLogin;
};

export default useOAuth;
