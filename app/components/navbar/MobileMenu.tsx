import { auth } from "@/app/lib/firebaseConfig";
import { Button } from "@nextui-org/react";
import { signOut } from "firebase/auth";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { GiHamburgerMenu } from "react-icons/gi";
import UserChip from "../UserChip";
import SubscriptionButton from "../StripeButton";
import LocaleDropdown from "../language-toggle";
import { useSubscription } from "@/app/hooks/useSubscription";

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

interface MobileMenuProps {
  user: any;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  isPremium: boolean;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  t: MobileMenuTranslation;
  tSubscriptionButton: SubscriptionButtonTranslation;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  user,
  isMobileMenuOpen,
  toggleMobileMenu,
  closeMobileMenu,
  isPremium,
  setUser,
  t,
  tSubscriptionButton,
}) => {
  const {
    loading: subscriptionLoading,
    upgradeToPremium,
    manageSubscription,
  } = useSubscription();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      fetch("/api/deleteCookie");
      setUser(null);
      closeMobileMenu();
      router.push("/");
    } catch (error) {
      console.error("Error during logout", error);
      closeMobileMenu();
    }
  };

  return (
    <>
      <button
        onClick={toggleMobileMenu}
        className="border border-gray-300 px-3 py-2 rounded block md:hidden"
      >
        <GiHamburgerMenu />
      </button>
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-4/5 bg-white shadow-lg z-50"
            >
              <div className="flex flex-col space-y-4 mt-4 p-4">
                <div className="flex justify-between items-center mb-3">
                  <button onClick={closeMobileMenu} className="text-2xl">
                    {t.closeMenu}
                  </button>
                </div>
                {user ? (
                  <div className="flex flex-row justify-between">
                    <UserChip initialUserName={user?.displayName} />
                    {isPremium ? <p>{t.premiumPlan}</p> : <p>{t.basicPlan}</p>}
                  </div>
                ) : (
                  <p>{t.guest}</p>
                )}
                <LocaleDropdown />
                <Button
                  onPress={() => {
                    router.push("/feature-request");
                    closeMobileMenu();
                  }}
                >
                  {t.featureIdeas}
                </Button>
                <Button
                  onPress={() => {
                    router.push("/pricing");
                    closeMobileMenu();
                  }}
                >
                  {t.pricing}
                </Button>
                {user ? (
                  <>
                    {!isPremium && (
                      <SubscriptionButton
                        t={tSubscriptionButton} // NEU: Übersetzung übergeben
                        userLoggedIn={user !== null}
                        isPremium={isPremium}
                        loading={subscriptionLoading}
                        onUpgrade={() => upgradeToPremium(!!user)}
                        onManage={manageSubscription}
                        size="lg"
                        radius="sm"
                        className="bg-blue-500 text-white"
                        loadingOverlay={true}
                      />
                    )}
                    <Button
                      onPress={() => {
                        router.push("/user-profile");
                        closeMobileMenu();
                      }}
                      className="w-full text-left py-2 bg-white"
                    >
                      {t.profile}
                    </Button>
                    <Button
                      onPress={handleLogout}
                      className="w-full text-left py-2 bg-white"
                    >
                      {t.logout}
                    </Button>
                  </>
                ) : (
                  <div className="w-full flex justify-between gap-3">
                    <Button
                      onPress={() => {
                        router.push("/login");
                        closeMobileMenu();
                      }}
                      className="bg-white text-black border-3 border-blue-500 w-full"
                    >
                      {t.login}
                    </Button>
                    <Button
                      onPress={() => {
                        router.push("/sign-up");
                        closeMobileMenu();
                      }}
                      className="bg-blue-500 text-white border-3 border-blue-500 w-full"
                    >
                      {t.signUp}
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black opacity-50 z-40"
              onClick={closeMobileMenu}
            />
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileMenu;
