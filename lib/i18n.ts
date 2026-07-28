export enum Locale {
  en = "en",
  de = "de",
}

export const DEFAULT_LOCALE = Locale.en;

export const translations = {
  [Locale.en]: {
    Landingpage: {
      title1: "Your short videos. On every platform.",
      title2: "More",
      title3: "reach with",
      title4: "less",
      title5: "effort.",
      subTitle:
        "While others manually upload their videos everywhere, you’re already shooting the next one. Share short videos smarter.",
    },
    UploadVideoTool: {
      videoUpload: "Upload Video",
      title: "Title",
      enterVideoTitle: "Enter your video title",
      selectPlatforms: "Select platforms to share",
      facebookPage: "Video to Facebook page:",
      uploadVideo: "Upload Video",
      notFilled: "Not all filled",
      premiumRequired: "Premium required",
      fillRequiredFields: "Please fill out all required fields.",
      missing: "Missing:",
      upgradePremium: "Please upgrade to Premium to upload videos.",
      videoUploading: "Uploading video",
      uploadTakesTime: "This may take a few minutes.",
      videoTitleLimitError: "Video title cannot exceed 600 characters.",
      selectVideoAndPlatform:
        "Please select a video, user, and at least one platform.",
      errorUploading: "Error uploading video: {error}",
      uploadToast: {
        line1: "Video is being uploaded",
        line2: "This may take a few minutes",
      },
    },
    SocialMediaCard: {
      // Button labels
      deleteButton: "Delete",
      connectButton: "Connect",
      // Toast notifications
      toast: {
        deleteSuccess: "Successfully deleted {socialMedia}",
        deleteError: "There was a problem deleting {socialMedia}",
      },
      // Platform names
      platforms: {
        instagram: "Instagram",
        facebook: "Facebook",
        combined: "Instagram / Facebook", // when both are used
        youtube: "YouTube",
        twitter: "X",
        tiktok: "TikTok",
      },
    },
    TikTokCompliance: {
      videoVisibility: "Who can view the video",
      allowOnVideo: "Allow on your video:",
      discloseContent: "Disclose promotional content in the video",
      discloseContentDescription:
        "Enable to disclose that this video promotes goods or services in exchange for compensation.",
      yourBrand: "Your Brand",
      yourBrandDescription:
        'Your video will be labeled as "Promotional Content".',
      brandedContent: "Branded Content",
      brandedContentDescription:
        'Your video will be labeled as "Paid Partnership".',
      brandedContentPopover:
        "Branded content cannot be private. Change visibility to Public or Friends.",
      agreeToPolicy: "By posting, you agree to",
      brandedContentPolicy: "TikTok's Branded Content Policy",
      musicUsagePolicy: "TikTok's Music Usage Confirmation",
    },

    SubscriptionButton: {
      loadingOverlay: {
        redirectingToStripe: "You will be redirected to Stripe shortly",
        pleaseWait: "This may take a few seconds",
      },
      buttons: {
        manageSubscription: "Manage Subscription",
        upgradeToPremium: "Upgrade to Premium",
      },
    },
    userprofile: {
      profile: {
        image_alt: "Profile picture",
        email_verified: "Email verified",
        email_not_verified: "Email not verified",
        premium_account: "Premium Account",
        basic_account: "Basic Account",
      },
      connected_accounts: {
        title: "Connected Accounts",
      },
      errors: {
        fetch_user_data: "Error fetching user data",
        fetch_premium_status: "Error fetching premium status",
      },
    },
    UploadsList: {
      recentVideos: "Recently Uploaded Videos",
      started: "Started",
      processing: "Processing",
      uploading: "Uploading",
      uploadError: "Upload Error",
      uploadComplete: "Upload Done",
      unknownStatus: "Unknown Status",
      noVideos: "No videos uploaded yet",
      language: "en",
    },
    footer: {
      title: "OmniPost",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      imprint: "Imprint",
      copyright: "© {year} OmniPost. All rights reserved.",
    },
    navbar: {
      logoAlt: "logo",
      title: "OmniPost",
      featureIdeas: "Feature Ideas",
      pricing: "Pricing",
    },
    mobileMenu: {
      guest: "Guest",
      premiumPlan: "Premium Plan",
      basicPlan: "Basic Plan",
      featureIdeas: "Feature Ideas",
      pricing: "Pricing",
      profile: "Profile",
      logout: "Logout",
      login: "Login",
      signUp: "Sign Up",
      closeMenu: "Close Menu",
    },
    ProfileMenu: {
      premiumPlan: "Premium Plan",
      basicPlan: "Basic Plan",
      profile: "Profile",
      logout: "Log out",
      imageAlt: "User",
    },
    authbutton: {
      login: "Login",
      register: "Register",
    },
    FeedbackSystem: {
      // Common
      tabs: {
        active: "Active",
        completed: "Completed",
      },
      filters: {
        recent: "Most Recent",
        popular: "Most Popular",
        working: "In Progress",
      },
      status: {
        requested: "Requested",
        inProgress: "In Progress",
        complete: "Completed",
      },
      types: {
        feature: "Feature Request",
        bug: "Bug Report",
      },
      categories: {
        SocialMedia: "Posting to Social Media",
        AppUsage: "Using the App",
        Connections: "Connecting Accounts & Tools",
        Stats: "Stats & Results",
        Features: "New Features or Ideas",
        Other: "Other",
      },
      // Form
      form: {
        featureHeader: "Request a Feature",
        bugHeader: "Report a Bug",
        titleLabel: "Title",
        categoryLabel: "Category",
        descriptionLabel: "Description",
        descriptionPlaceholder: "Describe in detail...",
        stepsLabel: "Steps to Reproduce",
        stepsPlaceholder: "List the steps to reproduce this bug...",
        deviceLabel: "Device Information",
        devicePlaceholder: "What device/browser are you using?",
        submitFeatureButton: "Submit Feature Request",
        submitBugButton: "Submit Bug Report",
        selectTypeLabel: "What would you like to submit?",
        notLoggedInToast: "You must be logged in to submit feedback.",
        missingFieldsToast: "Please fill out all required fields.",
        successToast: "Your feedback has been submitted!",
        errorToast: "There was a problem saving your feedback.",
        editSuccessToast: "Your feedback has been updated!",
        deleteSuccessToast: "Your feedback has been deleted!",
      },
      // Card
      card: {
        upvote: "Upvote",
        edit: "Edit",
        delete: "Delete",
        deleteConfirm: "Are you sure you want to delete this?",
        deleteCancel: "Cancel",
        deleteConfirm2: "Yes, delete it",
        by: "by",
        on: "on",
        votes: "votes",
        vote: "vote",
        myPost: "My post",
        deleteTitle: "Delete feedback?",
        deleteDescription:
          "This will permanently delete this feedback item. This action cannot be undone.",
      },
      // Admin
      admin: {
        feedback: "Feedback",
        noFeedback: "No feedback items available",
        setStatus: "Set Status",
        loadMore: "Load More Items",
        deleteWarning: "This action cannot be undone!",
        search: "Search feedback...",
        filter: "Filter",
      },
      // Form
      shareForm: {
        title: "Share Your Feedback",
        featureTab: "Feature",
        bugTab: "Bug",
        featureTitle: "Feature Title",
        bugTitle: "Bug Title",
        steps: "Steps to Reproduce",
        environment: "Environment",
        submit: "Submit",
        featureIdea:
          "Have an idea to make our product better? We'd love to hear it!",
        bugFound: "Found something that's not working right? Help us fix it!",
        submitFeature: "Submit Feature Request",
        submitBug: "Submit Bug Report",
      },
      // Placeholders
      placeholders: {
        featureTitle: "A short summary of your idea",
        featureDescription: "Describe your feature idea",
        bugTitle: "What went wrong?",
        bugSteps: "Steps to reproduce this bug",
        bugEnvironment: "Device, browser, app version",
      },
    },
    FeatureRequestsClient: {
      activeTabButton: "Requested & In-Progress",
      completedTabButton: "Completed",
      loadMoreButton: "Load More Features",
      noRequestsMessage: "No feature requests available",
    },
    FeatureRequestCard: {
      inProgressBadge: "In Progress",
      completeBadge: "Completed",
    },
    FeatureRequestForm: {
      header: "Would you like a feature?",
      titleLabel: "Title",
      descriptionLabel: "Description",
      descriptionPlaceholder: "Describe the feature in detail...",
      submitButton: "Submit Feature Request",
      notLoggedInToast: "To share an idea, you must be logged in.",
      missingFieldsToast: "Please enter a title and a description.",
      successToast: "Feature idea shared :)",
      errorToast: "There was a problem saving.",
    },
    timeSavingSection: {
      headline: "One video for all platforms. No stress.",
      description: "Because your time is meant for creativity, not uploading.",
    },
    TimeCalculator: {
      hoursPerMonth: "{value} hours/month",
      wasted: "wasted",
      withThisTime: "With this time, you could...",
      adjustmentButtonShow: "Calculate your time savings",
      adjustmentButtonHide: "Close settings",
      videosPerMonth: "How many videos do you produce per month?",
      platformsTitle: "Which platforms do you upload to?",
      startSaving: "Get started, save time and energy!",
      examplesByTime: {
        short: [
          "Finally find the time to shoot an extra video for your community.",
          "Post additional Instagram stories to connect more closely with your audience.",
          "Find weekly time for the gym and clear your mind.",
          "Analyze and optimize your existing content strategy.",
          "Make small improvements to your existing videos.",
          "Engage more with your followers' comments and build connections.",
          "Invest more time in creative planning for upcoming videos.",
          "Use a few hours for a relaxing walk in the park.",
        ],
        medium: [
          "Create two additional short videos and massively expand your reach.",
          "Go to the gym once a week – stay healthy and productive.",
          "Dive deeper into a new social media trend.",
          "Try out new platforms and test your reception there.",
          "Start more live sessions to interact directly with your community.",
          "Dedicate an afternoon a month to mental recovery or wellness.",
          "Finally write a detailed script for your next content.",
          "Edit your content professionally to make it more high-quality.",
        ],
        long: [
          "Plan and execute a completely new video course or series.",
          "Take a short vacation to find new inspiration for your content.",
          "Spend quality time with family and friends without compromising on work.",
          "Focus on big creative projects you’ve been putting off for a long time.",
          "Conquer a new platform and grow strategically.",
          "Finally have time for self-education – learn new techniques for your content.",
          "Exercise regularly while working more productively.",
          "Give yourself more freedom while simultaneously increasing your output.",
        ],
      },
    },
    impressum: {
      title: "Legal Notice",
      address: {
        name: "[Name entfernt]",
        street: "[Anschrift entfernt]",
        city: "[PLZ Ort entfernt]",
      },
      contact: {
        title: "Contact",
        phone: "Phone",
        email: "Email",
      },
      taxId: {
        title: "VAT ID",
        text: "Value-added tax identification number according to § 27 a of the German Value-Added Tax Act",
        number: "DE329716051",
      },
      euDispute: {
        title: "EU Dispute Resolution",
        text: "The European Commission provides a platform for online dispute resolution (ODR)",
        link: "https://ec.europa.eu/consumers/odr/",
        emailNotice:
          "Our email address can be found above in the legal notice.",
      },
      consumerDispute: {
        title: "Consumer Dispute Resolution/Universal Arbitration Board",
        text: "We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board.",
      },
    },
    ResetPasswordForm: {
      header: "Reset Password",
      subheader1: "Or",
      loginLinkText: "log in with your existing account",
      emailPlaceholder: "Email address",
      buttonText: "Reset Password",
      resetEmailSentMessage: "Password reset email sent!",
    },
    signup: {
      header: "Create New Account",
      subheader1: "Or",
      subheader2: "sign in to an existing account",
      placeholders: {
        name: "Full Name",
        email: "Email Address",
        password: "Password",
        confirm_password: "Confirm Password",
      },
      checkbox: {
        label: "I accept the Terms of Service and Privacy Policy",
      },
      buttons: {
        create_account: "Create Account",
        google: "Google",
        creating: "Creating Account...",
      },
      text: {
        or_sign_in_with: "Or sign in with",
      },
      errors: {
        invalid_name: "Please enter a valid name (1-30 characters).",
        invalid_email: "Please enter a valid email address.",
        weak_password: "Password must be at least 6 characters long.",
        passwords_mismatch: "Passwords do not match.",
        terms_not_accepted:
          "You must accept the Terms of Service and Privacy Policy.",
        email_in_use:
          "This email address is already in use. Please use another.",
        invalid_email_error: "The email address entered is invalid.",
        weak_password_error:
          "The password is too weak. Please choose a stronger one.",
        generic_error: "Something went wrong. Please try again later.",
        unknown_error: "An unknown error occurred.",
      },
      success: {
        email_sent:
          "Verification email has been sent. Please check your inbox.",
      },
    },
    PricingPage: {
      title: "Plans",
      premiumPlan: {
        title: "Premium Plan",
        price: "€9.99 / month",
        benefits: {
          unlimitedUploads: "Unlimited uploads",
          noWatermarks: "No watermarks",
        },
      },
      importantInfo: {
        title: "Important Information",
        paragraph1:
          "Our tool is still in the development phase. Occasionally, there may be bugs or interruptions. I am continuously working on integrating new features such as scheduled posts and the ability to add additional accounts.",
        paragraph2:
          "As one of the first users, you secure fixed prices, even if our prices change later. Your support means a lot to me, and I want you to get more than you pay for. Join me on this journey and help improve the tool with your feedback.",
        feedback:
          "Your feedback is important to me! Please use the {link} to submit suggestions or report issues.",
        feedbackLink: "Feedback Page",
      },
      loading: "Loading...",
      error: "Error: {error}",
    },
    DragAndDropUploadField: {
      videoInfo: "Video 9:16 / max 2 GB",
      dropVideo: "Drag your video here",
      or: "OR",
      browseFiles: "Browse Files",
      uploadProgress: "Upload Progress",
      cancelUpload: "Cancel Upload",
      uploadFailed: "Upload failed: {error}",
      fileSizeTooSmall: "File size must be at least {minSize} MB.",
      fileSizeTooLarge: "File size exceeds {maxSize} MB.",
      videoDurationError: "Video duration exceeds 10 minutes (600 seconds).",
      aspectRatioError: "Video aspect ratio must be 9:16 (vertical).",
    },
    LoginPage: {
      heading: "Log in",
      subheading1: "Or",
      subheading2: "create a new account",
      placeholders: {
        email: "Email address",
        password: "Password",
      },
      forgotPassword: "Forgot password?",
      button: "Sign in",
      orLoginWith: "Or log in with",
      buttons: {
        google: "Google",
      },
      errors: {
        invalidEmail: "Please enter a valid email address.",
        passwordTooShort: "The password must be at least 6 characters long.",
        emailNotVerified: "Please verify your email address before logging in.",
        userNotFound: "No user found with this email address.",
        invalidCredential: "Invalid credentials or account does not exist.",
        wrongPassword: "The password is incorrect. Please try again.",
        invalidEmailEntered: "The entered email address is invalid.",
        userDisabled: "This user has been disabled. Please contact support.",
        genericError: "Something went wrong. Please try again later.",
        unknownError: "An unknown error has occurred.",
      },
    },
    AuthButton: {
      login: "Login",
      register: "Sign Up",
    },
    createAccountGoogle: {
      title: "Create Account",
      subtitle: "Please verify and confirm the information below.",
      nameLabel: "Name",
      emailLabel: "Email Address",
      termsCheckbox: "I accept the",
      termsLink: "Terms of Service",
      privacyLink: "Privacy Policy",
      and: "and the",
      termsError: "You must accept the legal terms to proceed.",
      createAccountButton: "Create Account",
      genericError: "Failed to create user. Please try again.",
    },
  },

  ///
  ///
  ///
  ///
  ///
  ///
  ///
  ///
  ///
  ///
  ///
  ///

  [Locale.de]: {
    Landingpage: {
      title1: "Deine Kurzvideos. Auf alle Plattformen.",
      title2: "Mehr",
      title3: "Reichweite mit",
      title4: "weniger",
      title5: "Arbeit.",
      subTitle:
        "Während andere ihre Videos überall manuell hochladen, drehst du schon das nächste. Teile Kurzvideos smarter.",
    },

    UploadVideoTool: {
      videoUpload: "Video hochladen",
      title: "Titel",
      enterVideoTitle: "Gib deinen Videotitel ein",
      selectPlatforms: "Plattformen zum Teilen auswählen",
      facebookPage: "Video zu Facebook Seite:",
      uploadVideo: "Video hochladen",
      notFilled: "Nicht alles Ausgefüllt",
      premiumRequired: "Premium erforderlich",
      fillRequiredFields: "Bitte füllen Sie alle erforderlichen Felder aus.",
      missing: "Fehlend:",
      upgradePremium: "Bitte upgrade auf Premium, um Videos hochzuladen.",
      videoUploading: "Video wird hochgeladen",
      uploadTakesTime: "Dies kann einige Minuten dauern.",
      videoTitleLimitError:
        "Der Videotitel darf nicht länger als 600 Zeichen sein.",
      selectVideoAndPlatform:
        "Bitte wähle ein Video, einen Benutzer und mindestens eine Plattform aus.",
      errorUploading: "Fehler beim Hochladen des Videos: {error}",
      uploadToast: {
        line1: "Video wird hochgeladen",
        line2: "Dies kann einige Minuten dauern",
      },
    },
    SocialMediaCard: {
      // Button Labels
      deleteButton: "Löschen",
      connectButton: "Verbinden",
      // Toast-Benachrichtigungen
      toast: {
        deleteSuccess: "Erfolgreich gelöscht {socialMedia}",
        deleteError: "Es gab ein Problem beim Löschen {socialMedia}",
      },
      // Plattformnamen
      platforms: {
        instagram: "Instagram",
        facebook: "Facebook",
        combined: "Instagram / Facebook", // wenn beide genutzt werden
        youtube: "YouTube",
        twitter: "X",
        tiktok: "TikTok",
      },
    },

    TikTokCompliance: {
      videoVisibility: "Wer kann das Video anschauen",
      allowOnVideo: "Erlaube bei deinem Video:",
      discloseContent: "Werbliche Inhalte im Video offenlegen",
      discloseContentDescription:
        "Aktivieren, um offenzulegen, dass dieses Video Waren oder Dienstleistungen im Austausch für eine Gegenleistung bewirbt.",
      yourBrand: "Deine Marke",
      yourBrandDescription:
        'Dein Video wird als "Werbeinhalte" gekennzeichnet.',
      brandedContent: "Branded Content",
      brandedContentDescription:
        'Dein Video wird als "Bezahlte Partnerschaft" gekennzeichnet.',
      brandedContentPopover:
        "Branded Content kann nicht privat sein. Ändere die Sichtbarkeit auf Öffentlich oder Freunde.",
      agreeToPolicy: "Durch das Posten stimmst du zu",
      brandedContentPolicy: "TikToks Richtlinie für Werbeinhalte",
      musicUsagePolicy: "TikToks Richtlinie zur Nutzung von Musik",
    },

    SubscriptionButton: {
      loadingOverlay: {
        redirectingToStripe: "Du wirst gleich zu Stripe weitergeleitet",
        pleaseWait: "Dies kann einige Sekunden dauern",
      },
      buttons: {
        manageSubscription: "Abonnement verwalten",
        upgradeToPremium: "Upgrade zu Premium",
      },
    },
    userprofile: {
      profile: {
        image_alt: "Profilbild",
        email_verified: "E-Mail verifiziert",
        email_not_verified: "E-Mail nicht verifiziert",
        premium_account: "Premium Konto",
        basic_account: "Basic Konto",
      },
      connected_accounts: {
        title: "Verbundene Konten",
      },
      errors: {
        fetch_user_data: "Fehler beim Abrufen der Benutzerdaten",
        fetch_premium_status: "Fehler beim Abrufen des Premium-Status",
      },
    },
    UploadsList: {
      recentVideos: "Kürzlich hochgeladene Videos",
      started: "Gestartet",
      processing: "Verarbeitung",
      uploading: "Hochladen",
      uploadError: "Upload Fehler",
      uploadComplete: "Upload Fertig",
      unknownStatus: "Unbekannter Status",
      noVideos: "Noch keine Videos hochgeladen",
      language: "de",
    },
    footer: {
      title: "OmniPost",
      privacy: "Datenschutzerklärung",
      terms: "Nutzungsbedingungen",
      imprint: "Impressum",
      copyright: "© {year} OmniPost. Alle Rechte vorbehalten.",
    },
    navbar: {
      logoAlt: "logo",
      title: "OmniPost",
      featureIdeas: "Feature Ideen",
      pricing: "Preise",
    },
    mobileMenu: {
      guest: "Gast",
      premiumPlan: "Premium Plan",
      basicPlan: "Basic Plan",
      featureIdeas: "Feature Ideen",
      pricing: "Preise",
      profile: "Profil",
      logout: "Ausloggen",
      login: "Einloggen",
      signUp: "Registrieren",
      closeMenu: "Menü schließen",
    },
    ProfileMenu: {
      premiumPlan: "Premium Plan",
      basicPlan: "Basis Plan",
      profile: "Profil",
      logout: "Ausloggen",
      imageAlt: "Benutzer",
    },
    authbutton: {
      login: "Login",
      register: "Registrieren",
    },
    FeedbackSystem: {
      // Common
      tabs: {
        active: "Aktiv",
        completed: "Abgeschlossen",
      },
      filters: {
        recent: "Neueste",
        popular: "Beliebteste",
        working: "In Bearbeitung",
      },
      status: {
        requested: "Angefragt",
        inProgress: "In Bearbeitung",
        complete: "Abgeschlossen",
      },
      types: {
        feature: "Feature-Anfrage",
        bug: "Fehler-Meldung",
      },
      categories: {
        SocialMedia: "Auf Social Media teilen",
        AppUsage: "Nutzung der App",
        Connections: "Verknüpfungen & Tools",
        Stats: "Statistiken & Ergebnisse",
        Features: "Neue Features & Ideen",
        Other: "Andere",
      },
      // Form
      form: {
        featureHeader: "Feature anfragen",
        bugHeader: "Fehler melden",
        titleLabel: "Titel",
        categoryLabel: "Kategorie",
        descriptionLabel: "Beschreibung",
        descriptionPlaceholder: "Ausführlich beschreiben...",
        stepsLabel: "Schritte zur Reproduktion",
        stepsPlaceholder:
          "Liste die Schritte auf, um diesen Fehler zu reproduzieren...",
        deviceLabel: "Geräteinformationen",
        devicePlaceholder: "Welches Gerät/Browser verwendest du?",
        submitFeatureButton: "Feature-Anfrage einreichen",
        submitBugButton: "Fehler-Meldung einreichen",
        selectTypeLabel: "Was möchtest du einreichen?",
        notLoggedInToast: "Du musst angemeldet sein, um Feedback zu geben.",
        missingFieldsToast: "Bitte fülle alle erforderlichen Felder aus.",
        successToast: "Dein Feedback wurde übermittelt!",
        errorToast: "Es gab ein Problem beim Speichern deines Feedbacks.",
        editSuccessToast: "Dein Feedback wurde aktualisiert!",
        deleteSuccessToast: "Dein Feedback wurde gelöscht!",
      },
      // Card
      card: {
        upvote: "Befürworten",
        edit: "Bearbeiten",
        delete: "Löschen",
        deleteConfirm: "Bist du sicher, dass du dies löschen möchtest?",
        deleteCancel: "Abbrechen",
        deleteConfirm2: "Ja, löschen",
        by: "von",
        on: "am",
        votes: "Stimmen",
        vote: "Stimme",
        myPost: "Mein Beitrag",
        deleteTitle: "Feedback löschen?",
        deleteDescription:
          "Dies wird den Feedback-Eintrag dauerhaft löschen. Diese Aktion kann nicht rückgängig gemacht werden.",
      },
      // Admin
      admin: {
        feedback: "Feedback",
        noFeedback: "Keine Feedback-Einträge verfügbar",
        setStatus: "Status ändern",
        loadMore: "Mehr Einträge laden",
        deleteWarning: "Diese Aktion kann nicht rückgängig gemacht werden!",
        search: "Feedback durchsuchen...",
        filter: "Filter",
      },
      // Form
      shareForm: {
        title: "Teile dein Feedback",
        featureTab: "Feature",
        bugTab: "Fehler",
        featureTitle: "Feature-Titel",
        bugTitle: "Fehler-Titel",
        steps: "Schritte zur Reproduktion",
        environment: "Umgebung",
        submit: "Absenden",
        featureIdea:
          "Du hast eine Idee, wie wir unser Produkt verbessern können? Wir freuen uns darauf!",
        bugFound:
          "Hast du etwas entdeckt, das nicht richtig funktioniert? Hilf uns, es zu beheben!",
        submitFeature: "Feature-Anfrage einreichen",
        submitBug: "Fehler-Meldung einreichen",
      },
      // Placeholders
      placeholders: {
        featureTitle: "Eine kurze Zusammenfassung deiner Idee",
        featureDescription: "Beschreibe deine Feature-Idee",
        bugTitle: "Was ist schiefgelaufen?",
        bugSteps: "Schritte zur Reproduktion dieses Fehlers",
        bugEnvironment: "Gerät, Browser, App-Version",
      },
    },
    FeatureRequestsClient: {
      activeTabButton: "Angefragt & In Bearbeitung",
      completedTabButton: "Fertiggestellt",
      loadMoreButton: "Mehr Features laden",
      noRequestsMessage: "Keine Funktionsanfragen verfügbar",
    },
    FeatureRequestCard: {
      inProgressBadge: "Wird Bearbeitet",
      completeBadge: "Fertig",
    },
    FeatureRequestForm: {
      header: "Du hättest gerne ein Feature?",
      titleLabel: "Titel",
      descriptionLabel: "Beschreibung",
      descriptionPlaceholder: "Beschreiben Sie ausführlich die Funktion...",
      submitButton: "Feature nachfragen",
      notLoggedInToast: "Um eine Idee zu teilen musst du angemeldet sein.",
      missingFieldsToast: "Bitte gib einen Titel und eine Beschreibung ein.",
      successToast: "Feature Idee geteilt :)",
      errorToast: "Es gab ein Problem beim Speichern.",
    },
    timeSavingSection: {
      headline: "Ein Video auf alle Plattformen. Kein Stress.",
      description:
        "Weil deine Zeit für Kreativität gedacht ist, nicht fürs Hochladen.",
    },
    TimeCalculator: {
      hoursPerMonth: "{value} Stunden/Monat",
      wasted: "verschwendet",
      withThisTime: "Mit dieser Zeit könntest du...",
      adjustmentButtonShow: "Berechne deine Zeitersparnis",
      adjustmentButtonHide: "Einstellungen schließen",
      videosPerMonth: "Wie viele Videos produzierst du pro Monat?",
      platformsTitle: "Auf welchen Plattformen lädst du hoch?",
      startSaving: "Fang an – spar Zeit und Energie!",
      examplesByTime: {
        short: [
          "Endlich die Zeit finden, ein extra Video für deine Community zu drehen.",
          "zusätzliche Instagram-Stories posten, um näher an deiner Zielgruppe zu sein.",
          "Wöchentlich Zeit fürs Fitnessstudio finden und deinen Kopf freibekommen.",
          "Deine bestehende Content-Strategie analysieren und optimieren.",
          "Kleine Verbesserungen an deinen bestehenden Videos vornehmen.",
          "Dich mehr um die Kommentare deiner Follower kümmern und Bindung aufbauen.",
          "Mehr Zeit in deine kreative Planung für kommende Videos investieren.",
          "Ein paar Stunden für einen entspannten Spaziergang im Park nutzen.",
        ],
        medium: [
          "Zwei zusätzliche Kurzvideos erstellen und deine Reichweite massiv ausbauen.",
          "Einmal die Woche ins Fitnessstudio gehen – bleib gesund und produktiv.",
          "Dich intensiver mit einem neuen Social-Media-Trend auseinandersetzen.",
          "Neue Plattformen ausprobieren und testen, wie du dort ankommst.",
          "Mehr Live-Sessions starten, um direkt mit deiner Community zu interagieren.",
          "Einen Nachmittag im Monat für mentale Erholung oder Wellness nutzen.",
          "Endlich ein ausführliches Skript für deine nächsten Inhalte schreiben.",
          "Deinen Content professionell editieren und dadurch hochwertiger machen.",
        ],
        long: [
          "Einen komplett neuen Video-Kurs oder eine Serie planen und umsetzen.",
          "Einen Kurzurlaub machen, um neue Inspiration für deine Inhalte zu finden.",
          "Zeit für deine Familie und Freunde nehmen, ohne Kompromisse bei der Arbeit.",
          "Dich auf große kreative Projekte konzentrieren, die du schon lange vor dir herschiebst.",
          "Eine neue Plattform erobern und dort gezielt wachsen.",
          "Endlich Zeit für Weiterbildung – lerne neue Techniken für deinen Content.",
          "Regelmäßig Sport treiben und gleichzeitig produktiver arbeiten.",
          "Dir selbst mehr Freiraum gönnen und gleichzeitig deinen Output steigern.",
        ],
      },
    },
    impressum: {
      title: "Impressum",
      address: {
        name: "[Name entfernt]",
        street: "[Anschrift entfernt]",
        city: "[PLZ Ort entfernt]",
      },
      contact: {
        title: "Kontakt",
        phone: "Telefon",
        email: "E-Mail",
      },
      taxId: {
        title: "Umsatzsteuer-ID",
        text: "Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz",
        number: "DE329716051",
      },
      euDispute: {
        title: "EU-Streitschlichtung",
        text: "Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit",
        link: "https://ec.europa.eu/consumers/odr/",
        emailNotice: "Unsere E-Mail-Adresse finden Sie oben im Impressum.",
      },
      consumerDispute: {
        title: "Verbraucher­streit­beilegung/Universal­schlichtungs­stelle",
        text: "Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
      },
    },
    ResetPasswordForm: {
      header: "Passwort zurücksetzen",
      subheader1: "Oder",
      loginLinkText: "in bestehenden Account einloggen",
      emailPlaceholder: "Email adresse",
      buttonText: "Passwort zurücksetzen",
      resetEmailSentMessage: "Passwort-Reset E-Mail gesendet!",
    },
    signup: {
      header: "Neuen Account erstellen",
      subheader1: "Oder",
      subheader2: "in bestehenden Account einloggen",
      placeholders: {
        name: "Ganzer Name",
        email: "Email-Adresse",
        password: "Passwort",
        confirm_password: "Passwort bestätigen",
      },
      checkbox: {
        label:
          "Ich akzeptiere die Nutzungsbedingungen und die Datenschutzerklärung",
      },
      buttons: {
        create_account: "Account erstellen",
        google: "Google",
        creating: "Account wird erstellt...",
      },
      text: {
        or_sign_in_with: "Oder einloggen mit",
      },
      errors: {
        invalid_name:
          "Bitte geben Sie einen gültigen Namen (1-30 Zeichen) ein.",
        invalid_email: "Bitte geben Sie eine gültige Email-Adresse ein.",
        weak_password: "Das Passwort muss mindestens 6 Zeichen lang sein.",
        passwords_mismatch: "Passwörter stimmen nicht überein.",
        terms_not_accepted:
          "Sie müssen die Nutzungsbedingungen und die Datenschutzerklärung akzeptieren.",
        email_in_use:
          "Diese Email-Adresse wird bereits verwendet. Bitte verwenden Sie eine andere.",
        invalid_email_error: "Die eingegebene Email-Adresse ist ungültig.",
        weak_password_error:
          "Das Passwort ist zu schwach. Bitte wählen Sie ein stärkeres.",
        generic_error:
          "Etwas ist schiefgelaufen. Bitte versuchen Sie es später erneut.",
        unknown_error: "Ein unbekannter Fehler ist aufgetreten.",
      },
      success: {
        email_sent:
          "Bestätigungs-E-Mail wurde gesendet. Bitte überprüfen Sie Ihr Postfach.",
      },
    },
    PricingPage: {
      title: "Pläne",
      premiumPlan: {
        title: "Premium Plan",
        price: "€9.99 / Monat",
        benefits: {
          unlimitedUploads: "Unbegrenzte Uploads",
          noWatermarks: "Keine Wasserzeichen",
        },
      },
      importantInfo: {
        title: "Wichtige Informationen",
        paragraph1:
          "Unser Tool befindet sich noch in der Entwicklungsphase. Es können gelegentlich Fehler auftreten oder Unterbrechungen auftreten. Ich arbeite kontinuierlich daran, neue Funktionen wie geplante Beiträge und die Möglichkeit, zusätzliche Konten hinzuzufügen, zu integrieren.",
        paragraph2:
          "Als einer der ersten Nutzer sicherst du dir feste Preise, auch wenn sich unsere Preise später ändern. Deine Unterstützung bedeutet mir viel, und ich möchte, dass du mehr bekommst, als du bezahlst. Begleite mich auf dieser Reise und hilf mit deinem Feedback, das Tool weiter zu verbessern.",
        feedback:
          "Dein Feedback ist mir wichtig! Bitte nutze die {link}, um Vorschläge oder Probleme zu melden.",
        feedbackLink: "Feedback-Seite",
      },
      loading: "Lädt...",
      error: "Fehler: {error}",
    },
    DragAndDropUploadField: {
      videoInfo: "Video 9:16 / max 2 GB",
      dropVideo: "Ziehe dein Video hierher",
      or: "ODER",
      browseFiles: "Dateien durchsuchen",
      uploadProgress: "Upload-Fortschritt",
      cancelUpload: "Upload abbrechen",
      uploadFailed: "Upload fehlgeschlagen: {error}",
      fileSizeTooSmall: "Die Dateigröße muss mindestens {minSize} MB betragen.",
      fileSizeTooLarge: "Die Dateigröße überschreitet {maxSize} MB.",
      videoDurationError:
        "Die Videodauer überschreitet 10 Minuten (600 Sekunden).",
      aspectRatioError:
        "Das Seitenverhältnis des Videos muss 9:16 (vertikal) sein.",
    },
    LoginPage: {
      heading: "Melde dich an",
      subheading1: "Oder",
      subheading2: "erstelle einen neuen Account",
      placeholders: {
        email: "Email-Adresse",
        password: "Passwort",
      },
      forgotPassword: "Passwort vergessen?",
      button: "Einloggen",
      orLoginWith: "Oder einloggen mit",
      buttons: {
        google: "Google",
      },
      errors: {
        invalidEmail: "Bitte geben Sie eine gültige Email-Adresse ein.",
        passwordTooShort: "Das Passwort ist mindestens 6 Zeichen lang.",
        emailNotVerified:
          "Bitte verifizieren Sie Ihre Email-Adresse, bevor Sie sich anmelden.",
        userNotFound: "Es gibt keinen Benutzer mit dieser Email-Adresse.",
        invalidCredential: "Falsche Anmeldedaten oder existiert nicht.",
        wrongPassword:
          "Das Passwort ist falsch. Bitte versuchen Sie es erneut.",
        invalidEmailEntered: "Die eingegebene Email-Adresse ist ungültig.",
        userDisabled:
          "Dieser Benutzer wurde deaktiviert. Bitte kontaktieren Sie den Support.",
        genericError:
          "Etwas ist schiefgelaufen. Bitte versuchen Sie es später erneut.",
        unknownError: "Ein unbekannter Fehler ist aufgetreten.",
      },
    },
    AuthButton: {
      login: "Login",
      register: "Registrieren",
    },
    createAccountGoogle: {
      title: "Konto erstellen",
      subtitle:
        "Bitte überprüfen und bestätigen Sie die unten stehenden Informationen.",
      nameLabel: "Name",
      emailLabel: "Email Adresse",
      termsCheckbox: "Ich akzeptiere die",
      termsLink: "Nutzungsbedingungen",
      privacyLink: "Datenschutzerklärung",
      and: "und die",
      termsError:
        "Sie müssen die rechtlichen Bedingungen akzeptieren, um fortzufahren.",
      createAccountButton: "Konto erstellen",
      genericError:
        "Fehler beim Erstellen des Benutzers. Bitte versuchen Sie es erneut.",
    },
  },
};

export type TranslationKey = keyof (typeof translations)[Locale];
