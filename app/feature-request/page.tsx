import { Locale, translations } from "@/lib/i18n";
import { cookies } from "next/headers";
import FeedbackClient from "./FeedbackClient";

export default async function FeedbackPage() {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("locale")?.value || "en") as Locale;
  const t = translations[locale].FeedbackSystem;

  return (
    <div className="mx-auto w-full pb-20">
      <FeedbackClient t={t} locale={locale} />
    </div>
  );
}
