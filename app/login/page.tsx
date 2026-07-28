import ClientLogin from "./ClientLogin";
import { Locale, translations } from "@/lib/i18n";
import { cookies } from "next/headers";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("locale")?.value || "en") as Locale;
  const t = translations[locale].LoginPage;

  return (
    <div className="flex items-center justify-center px-4 pb-20 sm:px-6 lg:px-8">
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1"
      />
      <ClientLogin t={t} />
    </div>
  );
}
