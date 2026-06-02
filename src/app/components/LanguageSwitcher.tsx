import { Globe } from "lucide-react";
import { useI18n } from "../i18n";

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <button
      onClick={() => setLocale(locale === "en" ? "zh" : "en")}
      className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-md hover:opacity-90 transition-opacity"
    >
      <Globe className="w-4 h-4" />
      <span className="font-mono text-sm">{locale === "en" ? "中文" : "EN"}</span>
    </button>
  );
}