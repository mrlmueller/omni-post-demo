import { Locale } from "../../i18n";

export const imprintTranslations = {
  [Locale.en]: {
    title: "Legal Notice",
    address: {
      name: "[Name entfernt]",
      street: "[Anschrift entfernt]",
      city: "[PLZ Ort entfernt]",
      country: "Germany",
    },
    contact: {
      title: "Contact",
      phone: "Phone: [Telefonnummer entfernt]",
      email: "E-Mail:",
      emailAddress: "kontakt@example.com",
    },
    taxId: {
      title: "VAT ID",
      text: "Value-added tax identification number according to § 27 a of the German Value-Added Tax Act:",
      number: "DE329716051",
    },
    euDispute: {
      title: "EU Dispute Resolution",
      text: "The European Commission provides a platform for online dispute resolution (ODR):",
      link: "https://ec.europa.eu/consumers/odr/",
      emailNotice: "Our email address can be found above in the legal notice.",
    },
    consumerDispute: {
      title: "Consumer Dispute Resolution/Universal Arbitration Board",
      text: "We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board.",
    },
  },

  [Locale.de]: {
    title: "Impressum",
    address: {
      name: "[Name entfernt]",
      street: "[Anschrift entfernt]",
      city: "[PLZ Ort entfernt]",
      country: "Deutschland",
    },
    contact: {
      title: "Kontakt",
      phone: "Telefon: 0176 97413846",
      email: "E-Mail:",
      emailAddress: "kontakt@example.com",
    },
    taxId: {
      title: "Umsatzsteuer-ID",
      text: "Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:",
      number: "DE329716051",
    },
    euDispute: {
      title: "EU-Streitschlichtung",
      text: "Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:",
      link: "https://ec.europa.eu/consumers/odr/",
      emailNotice: "Unsere E-Mail-Adresse finden Sie oben im Impressum.",
    },
    consumerDispute: {
      title: "Verbraucher­streit­beilegung/Universal­schlichtungs­stelle",
      text: "Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
    },
  },
};
