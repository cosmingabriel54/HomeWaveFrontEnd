
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import ro from "./locales/ro.json";
import hu from "./locales/hu.json";
import fr from "./locales/fr.json"
i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            ro: { translation: ro },
            hu: { translation: hu },
            fr: { translation: fr },
        },
        lng: localStorage.getItem("i18nextLng") || "en",
        fallbackLng: "en",
        interpolation: {
            escapeValue: false,
        },
        react: {
            useSuspense: false,
        },
    });

export default i18n;
