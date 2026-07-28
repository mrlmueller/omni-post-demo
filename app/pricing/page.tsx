import PricingClient from "./PricingClient";
import { Locale, translations } from "@/lib/i18n";
import { cookies } from "next/headers";

const PricingPage = async () => {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("locale")?.value || "en") as Locale;
  const t = translations[locale].PricingPage;
  const tSubscriptionButton = translations[locale].SubscriptionButton;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">{t.title}</h1>
      <div className="max-w-full p-5 xl:p-9 border-1 rounded-xl border-borderColor shadow-lg text-center">
        <h2 className="text-2xl font-semibold">{t.premiumPlan.title}</h2>
        <p className="text-xl font-bold text-blue-600 mt-2">
          {t.premiumPlan.price}
        </p>
        <ul className="mt-4 space-y-2">
          <li className="flex justify-center mr-3">
            ✅ {t.premiumPlan.benefits.unlimitedUploads}
          </li>
          <li className="flex justify-center mr-3">
            ✅ {t.premiumPlan.benefits.noWatermarks}
          </li>
        </ul>

        {/* We pass the translations to the client component */}
        <PricingClient
          t={{ error: t.error, loading: t.loading }}
          tSubscriptionButton={tSubscriptionButton}
        />
      </div>

      <div className="mt-8 bg-gray-100 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">{t.importantInfo.title}</h3>
        <p className="mb-4">{t.importantInfo.paragraph1}</p>
        <p className="mb-4">{t.importantInfo.paragraph2}</p>
        <p className="mb-4">
          <>
            {t.importantInfo.feedback.split("{link}")[0]}
            <a href="/feature-request" className="text-blue-500 underline">
              {t.importantInfo.feedbackLink}
            </a>
            {t.importantInfo.feedback.split("{link}")[1]}
          </>
        </p>
      </div>
    </div>
  );
};

export default PricingPage;
