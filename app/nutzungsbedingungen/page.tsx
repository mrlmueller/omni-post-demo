import React from "react";
import { cookies } from "next/headers";
import { Locale } from "@/lib/i18n";
import { termsOfServiceTranslations } from "@/lib/translations/legal/terms-of-service";

export default async function Nutzungsbedingungen() {
  // Get user language preference from cookies
  const cookieStore = await cookies();
  const locale = (cookieStore.get("locale")?.value as Locale) || Locale.de;

  // Get translations for the current locale (defaulting to German if not available)
  const t =
    termsOfServiceTranslations[locale] || termsOfServiceTranslations[Locale.de];

  return (
    <div className="mx-auto pb-20">
      <div>
        {/* Title / Last Updated / Intro */}
        <h1 className="text-3xl font-bold mb-4">{t.title}</h1>
        <p className="mb-4">{t.lastUpdated}</p>
        <p className="mb-4">{t.intro}</p>

        {/* 1. Legal Agreement */}
        <h2 className="text-2xl font-semibold mb-2">
          {t.legalAgreement.title}
        </h2>
        <p className="mb-4">{t.legalAgreement.company}</p>
        <p className="mb-4">{t.legalAgreement.website}</p>
        <p className="mb-4">{t.legalAgreement.platformDescription}</p>
        <p className="mb-4">{t.legalAgreement.contact}</p>
        <p className="mb-4">{t.legalAgreement.legalAgreement}</p>
        <p className="mb-4">{t.legalAgreement.changesNotice}</p>
        <p className="mb-4">{t.legalAgreement.ageRestriction}</p>
        <p className="mb-4">{t.legalAgreement.printRecommendation}</p>

        {/* 2. Our Services */}
        <h2 className="text-2xl font-semibold mb-2">{t.ourServices.title}</h2>
        <p className="mb-4">{t.ourServices.jurisdictions}</p>
        <p className="mb-4">{t.ourServices.regulations}</p>

        {/* 3. Intellectual Property */}
        <h2 className="text-2xl font-semibold mb-2">
          {t.intellectualProperty.title}
        </h2>

        {/* Our Property */}
        <p className="mb-4">
          <strong>{t.intellectualProperty.ourProperty.title}</strong>
        </p>
        <p className="mb-4">{t.intellectualProperty.ourProperty.content}</p>
        <p className="mb-4">{t.intellectualProperty.ourProperty.protection}</p>
        <p className="mb-4">{t.intellectualProperty.ourProperty.provision}</p>

        {/* Your Use */}
        <p className="mb-4">
          <strong>{t.intellectualProperty.yourUse.title}</strong>
        </p>
        <p className="mb-4">{t.intellectualProperty.yourUse.license}</p>
        <ul className="list-disc list-inside mb-4">
          {t.intellectualProperty.yourUse.accessUse.map(
            (item: string, index: number) => (
              <li key={index}>{item}</li>
            )
          )}
        </ul>
        <p className="mb-4">{t.intellectualProperty.yourUse.restrictions}</p>
        <p className="mb-4">{t.intellectualProperty.yourUse.otherUses}</p>
        <p className="mb-4">{t.intellectualProperty.yourUse.reservedRights}</p>
        <p className="mb-4">{t.intellectualProperty.yourUse.violation}</p>

        {/* Submissions */}
        <p className="mb-4">
          <strong>{t.intellectualProperty.submissions.title}</strong>
        </p>
        <p className="mb-4">
          {t.intellectualProperty.submissions.readCarefully}
        </p>
        <p className="mb-4">{t.intellectualProperty.submissions.submissions}</p>
        <p className="mb-4">
          {t.intellectualProperty.submissions.contributions}
        </p>
        <p className="mb-4">{t.intellectualProperty.submissions.visibility}</p>
        <p className="mb-4">
          {t.intellectualProperty.submissions.licenseGrant}
        </p>
        <p className="mb-4">
          {t.intellectualProperty.submissions.nameTrademarks}
        </p>
        <p className="mb-4">
          {t.intellectualProperty.submissions.responsibility}
        </p>
        <ul className="list-disc list-inside mb-4">
          {t.intellectualProperty.submissions.confirmations.map(
            (item: string, index: number) => (
              <li key={index}>{item}</li>
            )
          )}
        </ul>
        <p className="mb-4">{t.intellectualProperty.submissions.liability}</p>
        <p className="mb-4">
          {t.intellectualProperty.submissions.removingContent}
        </p>

        {/* Copyright Infringement (simple one-liner, separate from #14) */}
        <h2 className="text-2xl font-semibold mb-2">
          {t.copyrightInfringement.title}
        </h2>
        <p className="mb-4">{t.copyrightInfringement.content}</p>

        {/* 4. User Representations */}
        <h2 className="text-2xl font-semibold mb-2">
          {t.userRepresentations.title}
        </h2>
        <p className="mb-4">{t.userRepresentations.content}</p>
        <p className="mb-4">{t.userRepresentations.inaccurateInfo}</p>

        {/* 5. User Registration */}
        <h2 className="text-2xl font-semibold mb-2">
          {t.userRegistration.title}
        </h2>
        <p className="mb-4">{t.userRegistration.content}</p>

        {/* 6. Purchases and Payment */}
        <h2 className="text-2xl font-semibold mb-2">
          {t.purchasesPayment.title}
        </h2>
        <p className="mb-4">{t.purchasesPayment.paymentMethods}</p>
        <ul className="mb-4 list-disc list-inside">
          {t.purchasesPayment.cards.map((card: string, index: number) => (
            <li key={index}>{card}</li>
          ))}
        </ul>
        <p className="mb-4">{t.purchasesPayment.accountInfo}</p>
        <p className="mb-4">{t.purchasesPayment.paymentAuthorization}</p>
        <p className="mb-4">{t.purchasesPayment.orderRejection}</p>

        {/* 7. Subscriptions */}
        <h2 className="text-2xl font-semibold mb-2">{t.subscriptions.title}</h2>

        <h3 className="text-xl font-semibold mb-2">
          {t.subscriptions.billing.title}
        </h3>
        <p className="mb-4">{t.subscriptions.billing.content}</p>

        <h3 className="text-xl font-semibold mb-2">
          {t.subscriptions.cancellation.title}
        </h3>
        <p className="mb-4">{t.subscriptions.cancellation.content}</p>

        <h3 className="text-xl font-semibold mb-2">
          {t.subscriptions.feeChanges.title}
        </h3>
        <p className="mb-4">{t.subscriptions.feeChanges.content}</p>

        {/* 8. Prohibited Activities */}
        <h2 className="text-2xl font-semibold mb-2">
          {t.prohibitedActivities.title}
        </h2>
        <p className="mb-4">{t.prohibitedActivities.content}</p>
        <p className="mb-4">{t.prohibitedActivities.userAgreement}</p>
        <ul className="list-disc list-inside mb-4">
          {t.prohibitedActivities.activities.map(
            (activity: string, index: number) => (
              <li key={index} className="mb-1">
                {activity}
              </li>
            )
          )}
        </ul>

        {/* 9. User-Generated Contributions */}
        <h2 className="text-2xl font-semibold mb-2">
          {t.userGeneratedContributions.title}
        </h2>
        <p className="mb-4">{t.userGeneratedContributions.content}</p>
        <ul className="list-disc list-inside mb-4">
          {t.userGeneratedContributions.warranties.map(
            (item: string, index: number) => (
              <li key={index} className="mb-1">
                {item}
              </li>
            )
          )}
        </ul>
        <p className="mb-4">{t.userGeneratedContributions.liability}</p>

        {/* 10. Contribution License */}
        <h2 className="text-2xl font-semibold mb-2">
          {t.contributionLicense.title}
        </h2>
        <p className="mb-4">{t.contributionLicense.content}</p>
        <p className="mb-4">{t.contributionLicense.license}</p>
        <p className="mb-4">{t.contributionLicense.ownership}</p>
        <p className="mb-4">{t.contributionLicense.review}</p>

        {/* 11. Social Media */}
        <h2 className="text-2xl font-semibold mb-2">{t.socialMedia.title}</h2>
        <p className="mb-4">{t.socialMedia.content}</p>
        <p className="mb-4">{t.socialMedia.disclaimer}</p>

        {/* 12. Third-Party Websites and Content */}
        <h2 className="text-2xl font-semibold mb-2">
          {t.thirdPartyWebsites.title}
        </h2>
        <p className="mb-4">{t.thirdPartyWebsites.content}</p>

        {/* 13. Service Management */}
        <h2 className="text-2xl font-semibold mb-2">
          {t.serviceManagement.title}
        </h2>
        <p className="mb-4">{t.serviceManagement.content}</p>

        {/* 14. Privacy Policy */}
        <h2 className="text-2xl font-semibold mb-2">{t.privacyPolicy.title}</h2>
        <p className="mb-4">{t.privacyPolicy.content}</p>

        {/* 15. Copyright Infringements */}
        <h2 className="text-2xl font-semibold mb-2">
          {t.copyrightInfringements.title}
        </h2>
        <p className="mb-4">{t.copyrightInfringements.content}</p>

        {/* 16. Term and Termination */}
        <h2 className="text-2xl font-semibold mb-2">
          {t.termAndTermination.title}
        </h2>
        <p className="mb-4">{t.termAndTermination.content}</p>
        <p className="mb-4">{t.termAndTermination.accountTermination}</p>

        {/* 17. Modifications and Interruptions */}
        <h2 className="text-2xl font-semibold mb-2">
          {t.modificationsAndInterruptions.title}
        </h2>
        <p className="mb-4">{t.modificationsAndInterruptions.content}</p>
        <p className="mb-4">{t.modificationsAndInterruptions.availability}</p>

        {/* 18. Governing Law */}
        <h2 className="text-2xl font-semibold mb-2">{t.governingLaw.title}</h2>
        <p className="mb-4">{t.governingLaw.content}</p>

        {/* 19. Dispute Resolution */}
        <h2 className="text-2xl font-semibold mb-2">
          {t.disputeResolution.title}
        </h2>

        {/* Informal Negotiations */}
        <h3 className="text-xl font-semibold mb-2">
          {t.disputeResolution.informalNegotiations.title}
        </h3>
        <p className="mb-4">
          {t.disputeResolution.informalNegotiations.content}
        </p>

        {/* Binding Arbitration */}
        <h3 className="text-xl font-semibold mb-2">
          {t.disputeResolution.bindingArbitration.title}
        </h3>
        <p className="mb-4">{t.disputeResolution.bindingArbitration.content}</p>

        {/* Restrictions */}
        <h3 className="text-xl font-semibold mb-2">
          {t.disputeResolution.restrictions.title}
        </h3>
        <p className="mb-4">{t.disputeResolution.restrictions.content}</p>

        {/* Exceptions */}
        <h3 className="text-xl font-semibold mb-2">
          {t.disputeResolution.exceptionsToArbitration.title}
        </h3>
        <p className="mb-4">
          {t.disputeResolution.exceptionsToArbitration.content}
        </p>

        {/* 20. Corrections */}
        <h2 className="text-2xl font-semibold mb-2">{t.corrections.title}</h2>
        <p className="mb-4">{t.corrections.content}</p>

        {/* 21. Disclaimer */}
        <h2 className="text-2xl font-semibold mb-2">{t.disclaimer.title}</h2>
        <p className="mb-4">{t.disclaimer.content}</p>

        {/* 22. Limitations of Liability */}
        <h2 className="text-2xl font-semibold mb-2">
          {t.limitationsOfLiability.title}
        </h2>
        <p className="mb-4">{t.limitationsOfLiability.content}</p>

        {/* 23. Indemnification */}
        <h2 className="text-2xl font-semibold mb-2">
          {t.indemnification.title}
        </h2>
        <p className="mb-4">{t.indemnification.content}</p>

        {/* 24. User Data */}
        <h2 className="text-2xl font-semibold mb-2">{t.userData.title}</h2>
        <p className="mb-4">{t.userData.content}</p>

        {/* 25. Electronic Communications */}
        <h2 className="text-2xl font-semibold mb-2">
          {t.electronicCommunications.title}
        </h2>
        <p className="mb-4">{t.electronicCommunications.content}</p>

        {/* 26. California Users */}
        <h2 className="text-2xl font-semibold mb-2">
          {t.californiaUsers.title}
        </h2>
        <p className="mb-4">{t.californiaUsers.content}</p>

        {/* 27. Miscellaneous */}
        <h2 className="text-2xl font-semibold mb-2">{t.miscellaneous.title}</h2>
        <p className="mb-4">{t.miscellaneous.content}</p>

        {/* 28. Contact Us */}
        <h2 className="text-2xl font-semibold mb-2">{t.contactUs.title}</h2>
        <p className="mb-4">{t.contactUs.content}</p>
        <p className="mb-4">{t.contactUs.contactInfo}</p>
      </div>
    </div>
  );
}
