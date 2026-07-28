import Link from "next/link";
import ResetPasswordForm from "./ResetPasswordForm";
import { Locale, translations } from "@/lib/i18n";
import { cookies } from "next/headers";

export default async function ResetPasswordPage() {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("locale")?.value || "en") as Locale;
  const t = translations[locale].ResetPasswordForm;

  return (
    <div className="flex items-center justify-center px-4 pb-20 sm:px-6 lg:px-8">
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1"
      />
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
            {t.header}
          </h2>
          <p className="mt-2 text-center text-sm">
            {t.subheader1}{" "}
            <Link
              href="/login"
              className="font-medium text-blue-500 hover:text-blue-400"
              prefetch={false}
            >
              {t.loginLinkText}
            </Link>
          </p>
        </div>
        <ResetPasswordForm t={t} />
      </div>
    </div>
  );
}
