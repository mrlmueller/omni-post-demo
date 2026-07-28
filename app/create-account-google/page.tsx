import { Locale, translations } from "@/lib/i18n";
import { cookies } from "next/headers";
import CreateAccountGoogleClient from "./CreateAccountGoogleClient";

export default async function CreateAccountGoogle() {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("locale")?.value || "en") as Locale;
  const t = translations[locale].createAccountGoogle;

  return (
    <div className="flex items-center justify-center px-4 pb-20 sm:px-6 lg:px-8">
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1"
      />
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
            {t.title}
          </h2>
          <p className="mt-2 text-center text-sm">
            {t.subtitle}
          </p>
        </div>
        <CreateAccountGoogleClient t={t} />
      </div>
    </div>
  );
}
