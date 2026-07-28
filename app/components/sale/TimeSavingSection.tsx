import TimeCalculator from "./TimeCalculator";
import { Locale, translations } from "@/lib/i18n";
import { cookies } from "next/headers";

export default async function TimeSavingSection() {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("locale")?.value || "en") as Locale;
  const tCalculator = translations[locale].TimeCalculator;
  const tSection = translations[locale].timeSavingSection;

  return (
    <div className="container mx-auto px-4 md:px-6 max-w-3xl my-36 flex flex-col items-center">
      <div className="flex flex-col items-center text-center">
        <h2 className="text-3xl mb-3 font-bold tracking-tighter sm:text-4xl md:text-5xl">
          {tSection.headline}
        </h2>
        <p className="max-w-xl mb-5 text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
          {tSection.description}
        </p>
      </div>
      <TimeCalculator t={tCalculator} />
    </div>
  );
}
