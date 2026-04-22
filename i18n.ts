import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import si from "./locales/si.json";
import { getItem } from "./utils/storage";

export const LANGUAGE_KEY = "app_language";

const resources = {
  en: { translation: en },
  si: { translation: si },
};

const initI18n = async () => {
  let savedLanguage = "en";
  try {
    const lang = await getItem(LANGUAGE_KEY);
    if (lang) savedLanguage = lang;
  } catch (error) {
    console.error("Error loading language", error);
  }

  i18n.use(initReactI18next).init({
    compatibilityJSON: "v4",
    resources,
    lng: savedLanguage,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });
};

initI18n();

export default i18n;
