"use client";

import { Button } from "@/components/ui/button";
import useOAuth from "./useOAuth";

interface OAuthLoginButtonProps {
  isDisabled: boolean;
  socialMedia: string;
  buttonText: string;
  icon: React.ReactNode;
  onOAuthComplete: () => void;
}

const OAuthLoginButton: React.FC<OAuthLoginButtonProps> = ({
  isDisabled,
  socialMedia,
  buttonText,
  icon,
  onOAuthComplete,
}) => {
  const handleLogin = useOAuth(socialMedia, onOAuthComplete);

  return (
    <>
      <Button
        disabled={isDisabled}
        variant={isDisabled ? "outline" : "ghost"}
        onClick={handleLogin}
        className={isDisabled ? "opacity-70" : ""}
      >
        {isDisabled ? "Connected to" : buttonText}
        <span className="ml-2">{icon}</span>
      </Button>
    </>
  );
};

export default OAuthLoginButton;
