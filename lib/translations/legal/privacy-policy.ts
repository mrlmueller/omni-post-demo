import { Locale } from "../../i18n";

export const privacyPolicyTranslations = {
  [Locale.en]: {
    title: "OmniPost Privacy Policy",
    intro:
      "The protection of your personal data is our highest priority. We collect, process, and store your personal data in accordance with applicable data protection laws, particularly the EU General Data Protection Regulation (GDPR) and the Federal Data Protection Act (BDSG). Personal data includes all information that relates to an identifiable natural person. Below, we provide comprehensive information about the nature, scope, and purpose of data processing by the operator of this website.",

    responsibleParty: {
      title: "1. Controller for Data Processing and Contact",
      content:
        "The controller responsible for data processing on this website is:",
      name: "[Name entfernt]",
      address: "[Anschrift entfernt]",
      city: "[PLZ Ort entfernt]",
      country: "Germany",
      phone: "Phone: [Telefonnummer entfernt]",
      email: "E-Mail:",
      emailAddress: "kontakt@example.com",
      dataProtectionOfficer:
        "For confidential inquiries, you can also contact our data protection officer, who can be reached at the same contact details. The data protection officer is available to answer any questions regarding the protection of your data.",
    },

    generalInfo: {
      title: "2. General Information on Data Processing",
      content:
        "We collect and process your personal data only when legally permitted or when you have consented to data processing. Personal data is deleted or blocked as soon as the purpose of storage no longer applies or statutory retention periods expire. Below, we provide detailed information about how we collect, process, and use data on our website.",
    },

    websiteUsage: {
      title: "3. Website Usage and Registration",
      content:
        "The use of our website is generally possible without registration. However, if you create a user account, we collect the following personal data:",
      dataCollected: [
        "Name",
        "Email address",
        "Password",
        "Time of registration",
      ],
      purposeExplanation:
        "This data is needed to provide you with access to your account and to ensure the secure operation of our services. The processing of this data takes place on the basis of Art. 6(1)(b) GDPR, as it is necessary for the performance of the contract that you have concluded with us.",
    },

    serverLogs: {
      title: "4. Server Logfiles",
      content:
        "When visiting our website, certain information is automatically collected and stored in server logfiles. This data includes:",
      dataCollected: [
        "Truncated IP address",
        "Browser type and version",
        "Operating system used",
        "Referrer URL",
        "Date and time of access",
        "Amount of data transferred",
        "Requesting provider",
      ],
      purposeExplanation:
        "This data is used exclusively for statistical purposes to ensure the operation of the website and to improve it. This data is not linked to other data sources. The legal basis for this data processing is Art. 6(1)(f) GDPR, as we have a legitimate interest in ensuring the smooth operation of our website.",
    },

    cookies: {
      title: "5. Use of Cookies",
      content:
        "Our website uses cookies to make the use of our platform more comfortable and to improve functionality. A cookie is a small text file that is stored on your device when you visit our website. The cookies we use can be categorized as follows:",
      types: [
        "Session cookies: These cookies are temporary and are deleted when you close your browser.",
        "Persistent cookies: These cookies remain stored on your device even after closing the browser and help us recognize you on your next visit.",
      ],
      legalBasis:
        "The legal basis for the use of cookies is Art. 6(1)(f) GDPR, as they are necessary to safeguard our legitimate interests, in particular to ensure the functionality of our website. You can prevent the storage of cookies in your browser settings at any time. However, this may limit the functionality of our website.",
    },

    socialMediaAPIs: {
      title: "6. Use of APIs for Social Media Platforms",
      content:
        "We offer you the possibility to upload content such as videos directly from our platform to your social media channels like YouTube, X (Twitter), Instagram, and TikTok. For this purpose, we use the APIs of the respective platforms. The use of these APIs takes place in your name and with your explicit consent. The processed data includes:",
      dataProcessed: [
        "Uploaded videos",
        "Metadata such as title, description, and tags",
      ],
      processingExplanation:
        "We act exclusively as a processor and transmit the content you provide in your name to the respective platforms. No additional data apart from the uploaded videos and associated metadata is processed. The legal basis for this data processing is Art. 6(1)(a) GDPR (consent) and Art. 6(1)(b) GDPR (contract performance).",
    },

    thirdCountryTransfer: {
      title: "7. Data Transfer to a Third Country",
      content:
        "Our website is hosted on servers by Vercel, a provider based in the USA. This means that personal data may be transferred to the USA. The USA is considered, according to the jurisprudence of the European Court of Justice, as a country without a data protection level corresponding to European standards. This could lead to various risks for the security and lawful processing of your data.",
      safeguards:
        "To ensure the protection of your data, we use so-called standard contractual clauses in accordance with Art. 46(2) and (3) GDPR. These clauses, approved by the EU Commission, ensure that your data is processed according to European data protection standards even when transferred to third countries. Vercel commits, through these clauses, to treat your data in accordance with European data protection law, even if it is stored or processed in the USA. Further information on the standard contractual clauses can be found at the following link:",
      standardContractualClausesLink:
        "https://eur-lex.europa.eu/eli/dec_impl/2021/914/oj?locale=en",
      vercelDPA:
        "The detailed conditions for data processing, which are based on these standard contractual clauses, can be found at the following link:",
      vercelDPALink:
        "https://vercel.com/legal/Vercel_Inc_-_Data_Processing_Addendum.pdf",
      vercelPrivacyPolicy:
        "For more information about how Vercel processes your data, you can view Vercel's privacy policy here:",
      vercelPrivacyPolicyLink: "https://vercel.com/legal/privacy-policy",
    },

    googleCloudFunctions: {
      title: "8. Google Cloud Functions and Social Media Platform APIs",
      content:
        "On our website, we use Google Cloud Functions, which are operated in Google's German data centers, to implement server-side functions and make the platform powerful. These cloud services process data generated by your interactions on our platform, such as uploading videos. The processing of this data takes place on the basis of your consent (Art. 6(1)(a) GDPR) and for the performance of the contract (Art. 6(1)(b) GDPR).",
      apiIntegration:
        "Additionally, we integrate APIs from social media platforms such as YouTube, X (formerly Twitter), Instagram, and TikTok to enable you to upload content directly from our platform to your social media accounts. These APIs allow us to transfer videos and associated metadata (such as title, description, and tags) to the respective platforms on your behalf.",
    },

    sslEncryption: {
      title: "9. SSL Encryption",
      content:
        "To protect your data and to secure confidential transmissions, we use SSL encryption on our website. An encrypted connection can be recognized by the URL in the browser's address bar changing from 'http://' to 'https://' and by a lock symbol being displayed. Thanks to SSL encryption, the data you transmit cannot be viewed by third parties. The use of SSL encryption is necessary to protect your data from unauthorized access and to ensure the security of our website.",
    },

    automatedDecisionMaking: {
      title: "10. Automated Decision-Making",
      content:
        "We do not use automated decision-making processes according to Art. 22 GDPR that would have legal effects on you or significantly affect your rights in a similar way. All decisions based on your interaction with our platform are made by humans and not by algorithms or automated systems.",
    },

    subcontractors: {
      title: "11. Subcontractors and Data Processing by Third Parties",
      content:
        "To provide our services, we use subcontractors, including Google and Vercel. These providers process data exclusively on our behalf and according to our instructions. Data processing is carried out in compliance with data protection requirements and is based on the standard contractual clauses according to Art. 46 GDPR. Our subcontractors are contractually obligated to treat your data confidentially and to process it exclusively for the purposes we have defined.",
    },

    collectedData: {
      title: "12. Collected Data and its Origin",
      content:
        "As part of our services, we collect personal data directly from you, especially when you register on our website or use our services. The data we collect includes, among others:",
      dataCollected: [
        "For registration via Google: Full name, email address, URL of Google profile picture, date of last login.",
        "For registration via email and password: Name, email address, date of last login.",
      ],
      dataCollection:
        "This data is collected during the registration process and when using our website. It serves to provide you with access to our services and to improve the functionality of our platform.",
    },

    purposeAndLegalBasis: {
      title: "13. Purpose and Legal Basis of Data Processing",
      content:
        "The processing of your personal data takes place for the following purposes:",
      purposes: [
        "Provision of our services: To enable you to use our platform and the services offered on it. Processing takes place on the basis of Art. 6(1)(b) GDPR, as it is necessary for the performance of the contract that you have concluded with us.",
        "Improvement of user experience: We use your data to improve the user experience on our platform and to optimize the functionality of our services. This processing takes place on the basis of your consent (Art. 6(1)(a) GDPR) and to safeguard legitimate interests (Art. 6(1)(f) GDPR).",
        "Analysis and optimization: The data of the last login is used for analytical purposes to further optimize our services. This processing takes place on the basis of Art. 6(1)(f) GDPR, as we have a legitimate interest in continuously improving our services.",
      ],
    },

    legitimateInterests: {
      title: "14. Legitimate Interests",
      content:
        "Our legitimate interests lie in providing a user-friendly and secure online offering and in the analysis and optimization of our services. We employ technical and organizational measures to ensure that your data is protected at all times and that processing takes place in accordance with applicable data protection regulations.",
    },

    dataRetention: {
      title: "15. Duration of Data Storage",
      content:
        "We store personal data only as long as necessary for the respective processing purpose. As soon as the purpose no longer applies or statutory retention periods expire, the data is routinely deleted or blocked. The exact duration of storage depends on the type of data processed and the respective legal requirements.",
    },

    contact: {
      title: "16. Contact",
      content:
        "For contacting us, the email address provided in the legal notice is available. Personal data transmitted in this context (e.g., name, email address) is only stored and used for the purpose of processing your request. The processing of this data takes place on the basis of your consent (Art. 6(1)(a) GDPR) and for the performance of pre-contractual measures (Art. 6(1)(b) GDPR).",
    },

    externalPrivacyPolicies: {
      title: "17. Links to External Privacy Policies",
      content:
        "For the processing of your data in connection with the social media platforms we use, the respective privacy policies of the providers apply. Further information on data processing by these platforms can be found in their privacy policies:",
      platforms: [
        {
          name: "TikTok Privacy Policy",
          link: "https://www.tiktok.com/legal/page/eea/privacy-policy/en",
        },
        {
          name: "Instagram Privacy Policy",
          link: "https://help.instagram.com/155833707900388",
        },
        {
          name: "X (formerly Twitter) Privacy Policy",
          link: "https://x.com/en/privacy",
        },
        {
          name: "YouTube Privacy Policy",
          link: "https://www.youtube.com/intl/ALL_en/howyoutubeworks/user-settings/privacy/",
        },
        {
          name: "Google Privacy Policy",
          link: "https://policies.google.com/privacy?hl=en",
        },
      ],
    },

    privacyPolicyChanges: {
      title: "18. Changes to the Privacy Policy",
      content:
        "We reserve the right to change this privacy policy at any time to adapt it to legal or technical developments. In the case of significant changes, we will inform you by a notice on our website or, if possible, by email. Please visit this page regularly to stay informed about the current state of our privacy practices. The current version of this privacy policy is always available on our website.",
    },
  },
  
  [Locale.de]: {
    title: "Datenschutzerklärung von OmniPost",
    intro: "Der Schutz Ihrer persönlichen Daten hat für uns höchste Priorität. Wir erheben, verarbeiten und speichern Ihre personenbezogenen Daten in Übereinstimmung mit den geltenden Datenschutzgesetzen, insbesondere der EU-Datenschutz-Grundverordnung (DSGVO) und dem Bundesdatenschutzgesetz (BDSG). Personenbezogene Daten umfassen alle Informationen, die sich auf eine identifizierbare natürliche Person beziehen. Nachfolgend informieren wir Sie umfassend über die Art, den Umfang und den Zweck der Datenverarbeitung durch den Betreiber dieser Webseite.",
    
    responsibleParty: {
      title: "1. Verantwortlicher für die Datenverarbeitung und Kontakt",
      content: "Verantwortlich für die Datenverarbeitung auf dieser Webseite ist:",
      name: "[Name entfernt]",
      address: "[Anschrift entfernt]",
      city: "[PLZ Ort entfernt]",
      country: "Deutschland",
      phone: "Telefon: [Telefonnummer entfernt]",
      email: "E-Mail:",
      emailAddress: "kontakt@example.com",
      dataProtectionOfficer: "Für vertrauliche Anfragen können Sie sich ebenfalls an unseren Datenschutzbeauftragten wenden, der unter den gleichen Kontaktdaten erreichbar ist. Der Datenschutzbeauftragte steht Ihnen für alle Fragen rund um den Schutz Ihrer Daten zur Verfügung."
    },

    generalInfo: {
      title: "2. Allgemeine Informationen zur Datenverarbeitung",
      content: "Wir erheben und verarbeiten Ihre personenbezogenen Daten nur, wenn dies gesetzlich erlaubt ist oder wenn Sie in die Datenverarbeitung eingewilligt haben. Personenbezogene Daten werden gelöscht oder gesperrt, sobald der Zweck der Speicherung entfällt oder gesetzliche Aufbewahrungsfristen ablaufen. Nachfolgend informieren wir Sie detailliert über die Art und Weise, wie wir Daten auf unserer Webseite erheben, verarbeiten und nutzen."
    },

    websiteUsage: {
      title: "3. Nutzung der Webseite und Registrierung",
      content: "Die Nutzung unserer Webseite ist grundsätzlich ohne Registrierung möglich. Wenn Sie jedoch ein Benutzerkonto erstellen, erfassen wir die folgenden personenbezogenen Daten:",
      dataCollected: [
        "Name",
        "E-Mail-Adresse",
        "Passwort",
        "Zeitpunkt der Registrierung"
      ],
      purposeExplanation: "Diese Daten werden benötigt, um Ihnen den Zugang zu Ihrem Konto zu ermöglichen und den sicheren Betrieb unserer Dienste zu gewährleisten. Die Verarbeitung dieser Daten erfolgt auf der Grundlage von Art. 6 Abs. 1 lit. b) DSGVO, da sie zur Erfüllung des Vertrags erforderlich ist, den Sie mit uns abgeschlossen haben."
    },

    serverLogs: {
      title: "4. Server-Logfiles",
      content: "Beim Besuch unserer Webseite werden bestimmte Informationen automatisch erfasst und in sogenannten Server-Logfiles gespeichert. Diese Daten umfassen:",
      dataCollected: [
        "Gekürzte IP-Adresse",
        "Browsertyp und -version",
        "Verwendetes Betriebssystem",
        "Referrer-URL",
        "Datum und Uhrzeit des Zugriffs",
        "Übertragene Datenmenge",
        "Anfragender Provider"
      ],
      purposeExplanation: "Diese Daten werden ausschließlich zu statistischen Zwecken verwendet, um den Betrieb der Webseite sicherzustellen und zu verbessern. Eine Verknüpfung dieser Daten mit anderen Datenquellen erfolgt nicht. Die Rechtsgrundlage für diese Datenverarbeitung ist Art. 6 Abs. 1 lit. f) DSGVO, da wir ein berechtigtes Interesse daran haben, den reibungslosen Betrieb unserer Webseite zu gewährleisten."
    },

    cookies: {
      title: "5. Verwendung von Cookies",
      content: "Unsere Webseite verwendet Cookies, um die Nutzung unserer Plattform komfortabler zu gestalten und die Funktionalität zu verbessern. Ein Cookie ist eine kleine Textdatei, die auf Ihrem Endgerät gespeichert wird, wenn Sie unsere Webseite besuchen. Die von uns verwendeten Cookies können in die folgenden Kategorien eingeteilt werden:",
      types: [
        "Session-Cookies: Diese Cookies sind temporär und werden gelöscht, sobald Sie Ihren Browser schließen.",
        "Persistente Cookies: Diese Cookies bleiben auch nach dem Schließen des Browsers auf Ihrem Endgerät gespeichert und helfen uns, Sie bei Ihrem nächsten Besuch wiederzuerkennen."
      ],
      legalBasis: "Die Rechtsgrundlage für die Verwendung von Cookies ist Art. 6 Abs. 1 lit. f) DSGVO, da sie zur Wahrung unserer berechtigten Interessen erforderlich sind, insbesondere zur Sicherstellung der Funktionalität unserer Webseite. Sie können die Speicherung von Cookies in den Einstellungen Ihres Browsers jederzeit verhindern. Dies kann jedoch die Funktionalität unserer Webseite einschränken."
    },

    socialMediaAPIs: {
      title: "6. Nutzung von APIs für Social-Media-Plattformen",
      content: "Wir bieten Ihnen die Möglichkeit, Inhalte wie Videos direkt von unserer Plattform auf Ihre Social-Media-Kanäle wie YouTube, X (Twitter), Instagram und TikTok hochzuladen. Hierfür nutzen wir die APIs der jeweiligen Plattformen. Die Nutzung dieser APIs erfolgt in Ihrem Namen und mit Ihrer ausdrücklichen Einwilligung. Die verarbeiteten Daten umfassen:",
      dataProcessed: [
        "Hochgeladene Videos",
        "Metadaten wie Titel, Beschreibung und Tags"
      ],
      processingExplanation: "Wir handeln ausschließlich als Auftragsverarbeiter und übermitteln die von Ihnen bereitgestellten Inhalte in Ihrem Namen an die jeweiligen Plattformen. Es werden keine zusätzlichen Daten außer den hochgeladenen Videos und den dazugehörigen Metadaten verarbeitet. Die Rechtsgrundlage für diese Datenverarbeitung ist Art. 6 Abs. 1 lit. a) DSGVO (Einwilligung) und Art. 6 Abs. 1 lit. b) DSGVO (Vertragserfüllung)."
    },

    thirdCountryTransfer: {
      title: "7. Datenübertragung in ein Drittland",
      content: "Unsere Webseite wird auf Servern von Vercel gehostet, einem Anbieter mit Sitz in den USA. Das bedeutet, dass personenbezogene Daten in die USA übermittelt werden können. Die USA gelten nach der Rechtsprechung des Europäischen Gerichtshofs als ein Land ohne ein dem europäischen Standard entsprechendes Datenschutzniveau. Dies könnte zu unterschiedlichen Risiken für die Sicherheit und rechtmäßige Verarbeitung Ihrer Daten führen.",
      safeguards: "Um den Schutz Ihrer Daten zu gewährleisten, verwenden wir sogenannte Standardvertragsklauseln gemäß Art. 46 Abs. 2 und 3 DSGVO. Diese von der EU-Kommission genehmigten Klauseln stellen sicher, dass Ihre Daten auch bei einer Übermittlung in Drittländer nach europäischen Datenschutzstandards verarbeitet werden. Vercel verpflichtet sich durch diese Klauseln, Ihre Daten in Übereinstimmung mit dem europäischen Datenschutzrecht zu behandeln, selbst wenn sie in den USA gespeichert oder verarbeitet werden. Weitere Informationen zu den Standardvertragsklauseln finden Sie unter folgendem Link:",
      standardContractualClausesLink: "https://eur-lex.europa.eu/eli/dec_impl/2021/914/oj?locale=de",
      vercelDPA: "Die detaillierten Bedingungen zur Datenverarbeitung, die sich an diesen Standardvertragsklauseln orientieren, finden Sie unter folgendem Link:",
      vercelDPALink: "https://vercel.com/legal/Vercel_Inc_-_Data_Processing_Addendum.pdf",
      vercelPrivacyPolicy: "Für weitere Informationen darüber, wie Vercel Ihre Daten verarbeitet, können Sie die Datenschutzerklärung von Vercel hier einsehen:",
      vercelPrivacyPolicyLink: "https://vercel.com/legal/privacy-policy"
    },

    googleCloudFunctions: {
      title: "8. Google Cloud Functions und APIs von Social Media Plattformen",
      content: "Auf unserer Website nutzen wir Google Cloud Functions, die in deutschen Rechenzentren von Google betrieben werden, um serverseitige Funktionen zu implementieren und die Plattform leistungsfähig zu gestalten. Diese Cloud-Dienste verarbeiten Daten, die durch Ihre Interaktionen auf unserer Plattform entstehen, wie z.B. das Hochladen von Videos. Die Verarbeitung dieser Daten erfolgt auf Grundlage Ihrer Einwilligung (Art. 6 Abs. 1 lit. a) DSGVO) sowie zur Erfüllung des Vertrags (Art. 6 Abs. 1 lit. b) DSGVO).",
      apiIntegration: "Zusätzlich integrieren wir APIs von Social Media Plattformen wie YouTube, X (ehemals Twitter), Instagram und TikTok, um es Ihnen zu ermöglichen, Inhalte direkt von unserer Plattform auf Ihre Social Media Accounts hochzuladen und zu veröffentlichen. Diese APIs ermöglichen es uns, Videos und die dazugehörigen Metadaten (wie Titel, Beschreibung und Tags) in Ihrem Namen an die jeweiligen Plattformen zu übertragen."
    },

    sslEncryption: {
      title: "9. SSL-Verschlüsselung",
      content: "Zum Schutz Ihrer Daten und zur Sicherung vertraulicher Übertragungen verwenden wir SSL-Verschlüsselung auf unserer Website. Eine verschlüsselte Verbindung erkennen Sie daran, dass die URL in der Adresszeile des Browsers von 'http://' auf 'https://' wechselt und ein Schloss-Symbol angezeigt wird. Dank der SSL-Verschlüsselung können die von Ihnen übermittelten Daten nicht von Dritten eingesehen werden. Die Verwendung der SSL-Verschlüsselung ist notwendig, um Ihre Daten vor unbefugtem Zugriff zu schützen und die Sicherheit unserer Website zu gewährleisten."
    },

    automatedDecisionMaking: {
      title: "10. Automatisierte Entscheidungsfindung",
      content: "Wir verwenden keine automatisierten Entscheidungsprozesse gemäß Art. 22 DSGVO, die rechtliche Auswirkungen auf Sie haben oder Ihre Rechte in ähnlicher Weise erheblich beeinträchtigen könnten. Alle Entscheidungen, die auf Ihrer Interaktion mit unserer Plattform beruhen, werden von Menschen getroffen und nicht von Algorithmen oder automatisierten Systemen."
    },

    subcontractors: {
      title: "11. Subunternehmer und Datenverarbeitung durch Dritte",
      content: "Zur Bereitstellung unserer Dienste setzen wir Subunternehmer ein, darunter Google und Vercel. Diese Anbieter verarbeiten Daten ausschließlich in unserem Auftrag und nach unseren Weisungen. Die Datenverarbeitung erfolgt unter Einhaltung der Datenschutzvorgaben und basiert auf den Standardvertragsklauseln gemäß Art. 46 DSGVO. Unsere Subunternehmer sind vertraglich verpflichtet, Ihre Daten vertraulich zu behandeln und ausschließlich zu den von uns festgelegten Zwecken zu verarbeiten."
    },

    collectedData: {
      title: "12. Erhobene Daten und ihre Herkunft",
      content: "Im Rahmen unserer Dienstleistungen erheben wir personenbezogene Daten direkt von Ihnen, insbesondere wenn Sie sich auf unserer Webseite registrieren oder unsere Dienste nutzen. Die von uns erfassten Daten umfassen unter anderem:",
      dataCollected: [
        "Bei Registrierung über Google: Vollständiger Name, E-Mail-Adresse, URL des Google-Profilbildes, Datum des letzten Logins.",
        "Bei Registrierung über E-Mail und Passwort: Name, E-Mail-Adresse, Datum des letzten Logins."
      ],
      dataCollection: "Diese Daten werden während des Registrierungsprozesses und bei der Nutzung unserer Webseite erhoben. Sie dienen dazu, Ihnen den Zugang zu unseren Diensten zu ermöglichen und die Funktionalität unserer Plattform zu verbessern."
    },

    purposeAndLegalBasis: {
      title: "13. Zweck und Rechtsgrundlage der Datenverarbeitung",
      content: "Die Verarbeitung Ihrer personenbezogenen Daten erfolgt zu den folgenden Zwecken:",
      purposes: [
        "Bereitstellung unserer Dienste: Um Ihnen die Nutzung unserer Plattform und der darauf angebotenen Dienste zu ermöglichen. Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b) DSGVO, da sie zur Erfüllung des Vertrags erforderlich ist, den Sie mit uns abgeschlossen haben.",
        "Verbesserung des Nutzererlebnisses: Wir verwenden Ihre Daten, um das Nutzererlebnis auf unserer Plattform zu verbessern und die Funktionalität unserer Dienste zu optimieren. Diese Verarbeitung erfolgt auf Grundlage Ihrer Einwilligung (Art. 6 Abs. 1 lit. a) DSGVO) sowie zur Wahrung berechtigter Interessen (Art. 6 Abs. 1 lit. f) DSGVO).",
        "Analyse und Optimierung: Die Daten des letzten Logins werden zu Analysezwecken verwendet, um unsere Services weiter zu optimieren. Diese Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f) DSGVO, da wir ein berechtigtes Interesse daran haben, unsere Dienste kontinuierlich zu verbessern."
      ]
    },

    legitimateInterests: {
      title: "14. Berechtigte Interessen",
      content: "Unsere berechtigten Interessen liegen in der Bereitstellung eines nutzerfreundlichen und sicheren Online-Angebots sowie in der Analyse und Optimierung unserer Dienstleistungen. Wir setzen technische und organisatorische Maßnahmen ein, um sicherzustellen, dass Ihre Daten jederzeit geschützt sind und die Verarbeitung in Übereinstimmung mit den geltenden Datenschutzbestimmungen erfolgt."
    },

    dataRetention: {
      title: "15. Dauer der Datenspeicherung",
      content: "Wir speichern personenbezogene Daten nur solange, wie es für den jeweiligen Verarbeitungszweck erforderlich ist. Sobald der Zweck entfällt oder gesetzliche Aufbewahrungsfristen ablaufen, werden die Daten routinemäßig gelöscht oder gesperrt. Die genaue Dauer der Speicherung hängt von der Art der verarbeiteten Daten und den jeweiligen gesetzlichen Anforderungen ab."
    },

    contact: {
      title: "16. Kontaktaufnahme",
      content: "Für die Kontaktaufnahme steht Ihnen die im Impressum angegebene E-Mail-Adresse zur Verfügung. Die in diesem Zusammenhang übermittelten personenbezogenen Daten (z.B. Name, E-Mail-Adresse) werden nur zum Zweck der Bearbeitung Ihrer Anfrage gespeichert und genutzt. Die Verarbeitung dieser Daten erfolgt auf Grundlage Ihrer Einwilligung (Art. 6 Abs. 1 lit. a) DSGVO) sowie zur Erfüllung vorvertraglicher Maßnahmen (Art. 6 Abs. 1 lit. b) DSGVO)."
    },

    externalPrivacyPolicies: {
      title: "17. Verlinkungen zu externen Datenschutzerklärungen",
      content: "Für die Verarbeitung Ihrer Daten im Zusammenhang mit den von uns genutzten Social-Media-Plattformen gelten die jeweiligen Datenschutzrichtlinien der Anbieter. Weitere Informationen zur Datenverarbeitung durch diese Plattformen finden Sie in deren Datenschutzerklärungen:",
      platforms: [
        {
          name: "TikTok Datenschutzerklärung",
          link: "https://www.tiktok.com/legal/page/eea/privacy-policy/de"
        },
        {
          name: "Instagram Datenschutzerklärung",
          link: "https://help.instagram.com/155833707900388"
        },
        {
          name: "X (ehemals Twitter) Datenschutzerklärung",
          link: "https://x.com/de/privacy"
        },
        {
          name: "YouTube Datenschutzerklärung",
          link: "https://www.youtube.com/intl/ALL_de/howyoutubeworks/user-settings/privacy/"
        },
        {
          name: "Google Datenschutzerklärung",
          link: "https://policies.google.com/privacy?hl=de"
        }
      ]
    },

    privacyPolicyChanges: {
      title: "18. Änderung der Datenschutzerklärung",
      content: "Wir behalten uns das Recht vor, diese Datenschutzerklärung jederzeit zu ändern, um sie an rechtliche oder technische Entwicklungen anzupassen. Bei wesentlichen Änderungen werden wir Sie durch einen Hinweis auf unserer Webseite oder, falls möglich, per E-Mail informieren. Bitte besuchen Sie diese Seite regelmäßig, um sich über den aktuellen Stand unserer Datenschutzpraktiken zu informieren. Die jeweils aktuelle Version dieser Datenschutzerklärung ist stets auf unserer Webseite verfügbar."
    }
  }
};