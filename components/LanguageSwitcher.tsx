"use client";

import { useLanguage } from "./LanguageContext";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ne" : "en");
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-2 px-3 py-2 bg-white/80 hover:bg-white/90 border border-gray-200 rounded-lg transition-all duration-200 hover:shadow-md"
      title={t("language.switch")}
    >
      <Globe className="w-4 h-4 text-gray-600" />
      <span className="text-sm font-medium text-gray-700">
        {language === "en" ? "नेपाली" : "English"}
      </span>
    </button>
  );
}
