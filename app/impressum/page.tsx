import React from "react";
import { cookies } from "next/headers";
import { Locale } from "@/lib/i18n";
import { imprintTranslations } from "@/lib/translations/legal/imprint";

export default async function Impressum() {
  // Get user language preference from cookies
  const cookieStore = await cookies();
  const locale = (cookieStore.get("locale")?.value as Locale) || Locale.de;

  // Get translations for the current locale (defaulting to German if not available)
  const translations = imprintTranslations[locale] || imprintTranslations[Locale.de];

  return (
    <div className="mx-auto pb-20">
      <div className="">
        <h1 className="text-3xl font-bold mb-4">{translations.title}</h1>

        <p className="mb-4">
          {translations.address.name}
          <br />
          {translations.address.street}<br />
          {translations.address.city}
        </p>

        <h2 className="text-2xl font-semibold mb-2">{translations.contact.title}</h2>
        <p className="mb-4">
          {translations.contact.phone}
          <br />
          {translations.contact.email}{" "}
          <a
            href={`mailto:${translations.contact.emailAddress}`}
            className="text-blue-600"
          >
            {translations.contact.emailAddress}
          </a>
        </p>

        <h2 className="text-2xl font-semibold mb-2">{translations.taxId.title}</h2>
        <p className="mb-4">
          {translations.taxId.text}
          <br />
          {translations.taxId.number}
        </p>

        <h2 className="text-2xl font-semibold mb-2">{translations.euDispute.title}</h2>
        <p className="mb-4">
          {translations.euDispute.text}{" "}
          <a
            href={translations.euDispute.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600"
          >
            {translations.euDispute.link}
          </a>
          .<br />
          {translations.euDispute.emailNotice}
        </p>

        <h2 className="text-2xl font-semibold mb-2">
          {translations.consumerDispute.title}
        </h2>
        <p className="mb-4">
          {translations.consumerDispute.text}
        </p>
      </div>
    </div>
  );
}
