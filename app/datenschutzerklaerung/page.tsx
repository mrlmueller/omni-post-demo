import { Locale } from "@/lib/i18n";
import { cookies } from "next/headers";
import React from "react";
import { privacyPolicyTranslations } from "@/lib/translations/legal/privacy-policy";

export default async function PrivacyPolicy() {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("locale")?.value || Locale.de) as Locale;

  // Get translations for the current locale (defaulting to German if not available)
  const t = privacyPolicyTranslations[locale] || privacyPolicyTranslations[Locale.de];

  return (
    <div className="mx-auto pb-20">
      <div className="">
        <h1 className="text-3xl font-bold mb-4">{t.title}</h1>

        <p className="mb-4">{t.intro}</p>

        <h2 className="text-2xl font-semibold mb-2">
          {t.responsibleParty.title}
        </h2>
        <p className="mb-4">
          {t.responsibleParty.content}
          <br />
          {t.responsibleParty.name}
          <br />
          {t.responsibleParty.address}
          <br />
          {t.responsibleParty.city}
          <br />
          {t.responsibleParty.country}
          <br />
          {t.responsibleParty.phone}
          <br />
          {t.responsibleParty.email}{" "}
          <a
            href="mailto:kontakt@example.com"
            className="text-blue-600"
          >
            {t.responsibleParty.emailAddress}
          </a>
        </p>
        <p className="mb-4">{t.responsibleParty.dataProtectionOfficer}</p>

        <h2 className="text-2xl font-semibold mb-2">{t.generalInfo.title}</h2>
        <p className="mb-4">{t.generalInfo.content}</p>

        <h2 className="text-2xl font-semibold mb-2">{t.websiteUsage.title}</h2>
        <p className="mb-4">{t.websiteUsage.content}</p>
        <ul className="list-disc list-inside mb-4">
          {t.websiteUsage.dataCollected.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <p className="mb-4">{t.websiteUsage.purposeExplanation}</p>

        <h2 className="text-2xl font-semibold mb-2">{t.serverLogs.title}</h2>
        <p className="mb-4">{t.serverLogs.content}</p>
        <ul className="list-disc list-inside mb-4">
          {t.serverLogs.dataCollected.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <p className="mb-4">{t.serverLogs.purposeExplanation}</p>

        <h2 className="text-2xl font-semibold mb-2">{t.cookies.title}</h2>
        <p className="mb-4">{t.cookies.content}</p>
        <ul className="list-disc list-inside mb-4">
          {t.cookies.types.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <p className="mb-4">{t.cookies.legalBasis}</p>

        <h2 className="text-2xl font-semibold mb-2">
          {t.socialMediaAPIs.title}
        </h2>
        <p className="mb-4">{t.socialMediaAPIs.content}</p>
        <ul className="list-disc list-inside mb-4">
          {t.socialMediaAPIs.dataProcessed.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <p className="mb-4">{t.socialMediaAPIs.processingExplanation}</p>

        <h2 className="text-2xl font-semibold mb-2">
          {t.thirdCountryTransfer.title}
        </h2>
        <p className="mb-4">{t.thirdCountryTransfer.content}</p>
        <p className="mb-4">
          {t.thirdCountryTransfer.safeguards}{" "}
          <a
            href={t.thirdCountryTransfer.standardContractualClausesLink}
            className="text-blue-600"
          >
            {t.thirdCountryTransfer.standardContractualClausesLink}
          </a>
          .
        </p>
        <p className="mb-4">
          {t.thirdCountryTransfer.vercelDPA}{" "}
          <a
            href={t.thirdCountryTransfer.vercelDPALink}
            className="text-blue-600"
          >
            {t.thirdCountryTransfer.vercelDPALink}
          </a>
          .
        </p>
        <p className="mb-4">
          {t.thirdCountryTransfer.vercelPrivacyPolicy}{" "}
          <a
            href={t.thirdCountryTransfer.vercelPrivacyPolicyLink}
            className="text-blue-600"
          >
            {t.thirdCountryTransfer.vercelPrivacyPolicyLink}
          </a>
        </p>

        <h2 className="text-2xl font-semibold mb-2">
          {t.googleCloudFunctions.title}
        </h2>
        <p className="mb-4">{t.googleCloudFunctions.content}</p>
        <p className="mb-4">{t.googleCloudFunctions.apiIntegration}</p>

        <h2 className="text-2xl font-semibold mb-2">{t.sslEncryption.title}</h2>
        <p className="mb-4">{t.sslEncryption.content}</p>

        <h2 className="text-2xl font-semibold mb-2">
          {t.automatedDecisionMaking.title}
        </h2>
        <p className="mb-4">{t.automatedDecisionMaking.content}</p>

        <h2 className="text-2xl font-semibold mb-2">
          {t.subcontractors.title}
        </h2>
        <p className="mb-4">{t.subcontractors.content}</p>

        <h2 className="text-2xl font-semibold mb-2">{t.collectedData.title}</h2>
        <p className="mb-4">{t.collectedData.content}</p>
        <ul className="list-disc list-inside mb-4">
          {t.collectedData.dataCollected.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <p className="mb-4">{t.collectedData.dataCollection}</p>

        <h2 className="text-2xl font-semibold mb-2">
          {t.purposeAndLegalBasis.title}
        </h2>
        <p className="mb-4">{t.purposeAndLegalBasis.content}</p>
        <ul className="list-disc list-inside mb-4">
          {t.purposeAndLegalBasis.purposes.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>

        <h2 className="text-2xl font-semibold mb-2">
          {t.legitimateInterests.title}
        </h2>
        <p className="mb-4">{t.legitimateInterests.content}</p>

        <h2 className="text-2xl font-semibold mb-2">{t.dataRetention.title}</h2>
        <p className="mb-4">{t.dataRetention.content}</p>

        <h2 className="text-2xl font-semibold mb-2">{t.contact.title}</h2>
        <p className="mb-4">{t.contact.content}</p>

        <h2 className="text-2xl font-semibold mb-2">
          {t.externalPrivacyPolicies.title}
        </h2>
        <p className="mb-4">{t.externalPrivacyPolicies.content}</p>
        <ul className="list-disc list-inside mb-4">
          {t.externalPrivacyPolicies.platforms.map((platform, index) => (
            <li key={index}>
              <a href={platform.link} className="text-blue-600">
                {platform.name}
              </a>
            </li>
          ))}
        </ul>

        <h2 className="text-2xl font-semibold mb-2">
          {t.privacyPolicyChanges.title}
        </h2>
        <p className="mb-4">{t.privacyPolicyChanges.content}</p>
      </div>
    </div>
  );
}
