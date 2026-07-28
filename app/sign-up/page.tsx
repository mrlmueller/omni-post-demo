import Head from "next/head";
import SignUpForm from "./SignUpForm";
import { Locale, translations } from "@/lib/i18n";
import { cookies } from "next/headers";

const SignUpPage = async () => {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("locale")?.value || "en") as Locale;
  // Get only the signup translations for the current locale
  const t = translations[locale].signup;

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </Head>
      <div className="min-h-screen">
        <SignUpForm t={t} />
      </div>
    </>
  );
};

export default SignUpPage;
