// shared code of runtime and editor
import i18n from "i18next";
import { useTranslation, initReactI18next } from "react-i18next";
import en from "./locales/en-US";
import cn from "./locales/zh-CN";

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    // the translations
    // (tip move them in a JSON file and import them,
    // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
    resources: {
      'en-US': {
        translation: en,
      },
      'zh-CN': {
        translation: cn,
      },
    },
    
    lng: "zh-CN", // if you're using a language detector, do not define the lng option
    fallbackLng: ["en-US", "zh-CN"],

    interpolation: {
      prefix: '{',
      suffix: '}',
    },
  });

export default {};
