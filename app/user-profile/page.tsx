import UserProfileClient from "./UserProfileClient";
import { Locale, translations } from "@/lib/i18n";
import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("locale")?.value || "en") as Locale;
  const tUserProfile = translations[locale].userprofile;
  const tUploadStatus = translations[locale].UploadsList;
  const tSubscriptionButton = translations[locale].SubscriptionButton; // NEU: SubscriptionButton-Übersetzung
  const tSocialMediaCard = translations[locale].SocialMediaCard; // NEU: SocialMediaCard-Übersetzung

  return (
    <UserProfileClient
      t={tUserProfile}
      tUploadStatus={tUploadStatus}
      tSubscriptionButton={tSubscriptionButton}
      tSocialMediaCard={tSocialMediaCard}
    />
  );
}
