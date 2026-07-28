import Image from "next/image";
import Link from "next/link";
import UserProfile from "./components/navbar/UserProfile";
import { getUser } from "./lib/getUser";
import LocaleDropdown from "./components/language-toggle";
import { Locale, translations } from "@/lib/i18n";
import { cookies } from "next/headers";

const NavBar = async () => {
  // Use a try-catch block to handle potential errors
  try {
    const cookieStore = await cookies();
    const locale = (cookieStore.get("locale")?.value || "en") as Locale;
    const tNavbar = translations[locale].navbar;
    const tProfileMenu = translations[locale].ProfileMenu;
    const tMobile = translations[locale].mobileMenu;
    const tSubscriptionButton = translations[locale].SubscriptionButton;
    const tAuthButton = translations[locale].AuthButton;

    // Fetch user with error handling
    let user = null;
    try {
      user = await getUser();
    } catch (error) {
      console.error("Error fetching user:", error);
    }

    return (
      <nav className="fixed top-0 left-0 right-0 border-b border-borderColor z-50 bg-white backdrop-filter md:backdrop-blur-lg md:bg-opacity-30">
        <div className="max-w-8xl mx-auto flex h-16 items-center justify-between px-5 sm:px-8 md:px-14 2xl:px-24 relative">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src={"/logo.svg"}
              alt={tNavbar.logoAlt}
              width={26}
              height={26}
            />
            <span className="text-lg font-semibold">{tNavbar.title}</span>
          </Link>
          <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:block space-x-7">
            <Link
              href="/feature-request"
              className="text-md font-semibold transition-colors hover:text-blue-500"
            >
              {tNavbar.featureIdeas}
            </Link>
            <Link
              href="/pricing"
              className="text-md font-semibold transition-colors hover:text-blue-500"
            >
              {tNavbar.pricing}
            </Link>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <div className="hidden md:block">
              <LocaleDropdown />
            </div>
            <UserProfile
              initialUser={user}
              t={tProfileMenu}
              tMobile={tMobile}
              tSubscriptionButton={tSubscriptionButton}
              tAuthButton={tAuthButton}
            />
          </div>
        </div>
      </nav>
    );
  } catch (error) {
    console.error("Error in NavBar component:", error);
    // Provide a fallback UI in case of errors
    return (
      <nav className="fixed top-0 left-0 right-0 border-b border-borderColor z-50 bg-white">
        <div className="max-w-8xl mx-auto flex h-16 items-center px-5">
          <Link href="/" className="flex items-center gap-2">
            <Image src={"/logo.svg"} alt="Logo" width={26} height={26} />
            <span className="text-lg font-semibold">OmniPost</span>
          </Link>
        </div>
      </nav>
    );
  }
};

export default NavBar;
