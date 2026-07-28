import Image from "next/image";
import Link from "next/link";
import { Locale, translations } from "@/lib/i18n";
import { cookies } from "next/headers";

export default async function Footer() {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("locale")?.value || "en") as Locale;
  const t = translations[locale].footer;

  return (
    <footer className="bg-gray-100 text-gray-600 py-8">
      <div className="max-w-8xl container mx-auto px-5 sm:px-8 md:px-14 2xl:px-24">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <Link href="/" className="flex items-center mb-4 md:mb-0">
            <Image src="/logo.svg" alt="logo" width={26} height={26} />
            <span className="text-xl font-bold text-gray-800 ml-2">
              {t.title}
            </span>
          </Link>
          <nav className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
            <Link
              href="/datenschutzerklaerung"
              className="hover:text-blue-600 transition-colors"
            >
              {t.privacy}
            </Link>
            <Link
              href="/nutzungsbedingungen"
              className="hover:text-blue-600 transition-colors"
            >
              {t.terms}
            </Link>
            <Link
              href="/impressum"
              className="hover:text-blue-600 transition-colors"
            >
              {t.imprint}
            </Link>
          </nav>
        </div>
        <div className="mt-8 text-center text-sm">
          {t.copyright.replace("{year}", new Date().getFullYear().toString())}
        </div>
      </div>
    </footer>
  );
}
