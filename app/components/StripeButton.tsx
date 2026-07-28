import { FC } from "react";
import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function getSizeClass(size: "sm" | "md" | "lg"): string {
  switch (size) {
    case "sm":
      return "px-2 py-1 text-sm";
    case "lg":
      return "px-6 py-3 text-lg";
    case "md":
    default:
      return "px-4 py-2";
  }
}

function getRadiusClass(radius: "sm" | "md" | "lg"): string {
  switch (radius) {
    case "sm":
      return "rounded-sm";
    case "lg":
      return "rounded-lg";
    case "md":
    default:
      return "rounded-md";
  }
}

interface SubscriptionButtonTranslation {
  loadingOverlay: {
    redirectingToStripe: string;
    pleaseWait: string;
  };
  buttons: {
    manageSubscription: string;
    upgradeToPremium: string;
  };
}

interface SubscriptionButtonProps {
  isPremium: boolean;
  userLoggedIn: boolean;
  loading: boolean;
  onUpgrade: () => void;
  onManage: () => void;
  size: "sm" | "md" | "lg";
  radius?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  loadingOverlay?: boolean;
  t: SubscriptionButtonTranslation;
}

const LoadingOverlay: FC<{
  t: SubscriptionButtonTranslation["loadingOverlay"];
}> = ({ t }) => {
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-5 flex flex-col border border-borderColor bg-white p-7 rounded-xl">
        <p className="text-center text-2xl">{t.redirectingToStripe}</p>
        <p className="mb-5 text-center text-base">{t.pleaseWait}</p>
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-600" />
      </div>
    </div>,
    document.body // Mount the overlay directly in the body
  );
};

const SubscriptionButton: FC<SubscriptionButtonProps> = ({
  isPremium,
  userLoggedIn,
  loading,
  onUpgrade,
  onManage,
  size,
  radius = "md",
  className = "",
  disabled = false,
  loadingOverlay = true,
  t,
}) => {
  return (
    <>
      {/* Show overlay if loading and enabled */}
      {loading && loadingOverlay && <LoadingOverlay t={t.loadingOverlay} />}

      <Button
        onClick={isPremium ? onManage : onUpgrade}
        size="lg"
        disabled={disabled || loading}
        className={`
          ${getSizeClass(size)} 
          ${getRadiusClass(radius)} 
          ${className}
          ${
            isPremium
              ? "border-3 bg-white border-roseTaupe text-black"
              : "bg-blue-500 text-white"
          }
        `}
      >
        {isPremium ? t.buttons.manageSubscription : t.buttons.upgradeToPremium}
      </Button>
    </>
  );
};

export default SubscriptionButton;
