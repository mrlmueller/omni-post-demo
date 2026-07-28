import { Locale } from "../../i18n";
import { termsOfServiceTranslationsEn } from "./terms-of-service-en";
import { termsOfServiceTranslationsDe } from "./terms-of-service-de";

// Combine all translations
export const termsOfServiceTranslations = {
  [Locale.en]: termsOfServiceTranslationsEn[Locale.en],
  [Locale.de]: termsOfServiceTranslationsDe[Locale.de],
};
