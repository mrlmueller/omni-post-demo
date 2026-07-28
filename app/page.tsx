import { Locale, translations } from "@/lib/i18n";
import { cookies } from "next/headers";
import TimeSavingSection from "./components/sale/TimeSavingSection";
import UploadVideoTool from "./components/UploadVideoTool";

const Page = async () => {
  try {
    const cookieStore = await cookies();
    const locale = (cookieStore.get("locale")?.value || "en") as Locale;

    // Make sure locale is valid, use default if not
    const validLocale = Object.values(Locale).includes(locale as Locale)
      ? locale
      : "en";

    const t = translations[validLocale].UploadVideoTool;
    const tTikTok = translations[validLocale].TikTokCompliance;
    const tDragAndDrop = translations[validLocale].DragAndDropUploadField;
    const tSocialMediaCard = translations[validLocale].SocialMediaCard;

    return (
      <div>
        <h1 className="font-medium text-4xl sm:text-6xl xl:text-7xl text-center h1x-5 xl:px-40 2xl:px-52 mb-4">
          {translations[validLocale].Landingpage.title1}{" "}
          <span className="text-blue-500 font-bold">
            {translations[validLocale].Landingpage.title2}
          </span>{" "}
          {translations[validLocale].Landingpage.title3}{" "}
          <span className="text-roseTaupe font-semibold">
            {translations[validLocale].Landingpage.title4}
          </span>{" "}
          {translations[validLocale].Landingpage.title5}
        </h1>
        <h2 className="text-lg sm:text-xl xl:text-2xl text-center text-gray-600 mb-10 max-w-3xl mx-auto">
          {translations[validLocale].Landingpage.subTitle}
        </h2>
        <UploadVideoTool
          t={t}
          tTikTok={tTikTok}
          tDragAndDrop={tDragAndDrop}
          tSocialMediaCard={tSocialMediaCard}
        />
        <TimeSavingSection />
      </div>
    );
  } catch (error) {
    console.error("Error in Page component:", error);
    // Fallback UI in case of errors
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-4">OmniPost</h1>
        <p>Something went wrong. Please try refreshing the page.</p>
      </div>
    );
  }
};

export default Page;
