import { Globe } from "lucide-react";
import { useI18n } from "../i18n";
import { Switch } from "./ui/switch";

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const isZh = locale === "zh";

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-muted-foreground" />
      <span className="text-xs text-muted-foreground font-mono">EN</span>
      <Switch
        checked={isZh}
        onCheckedChange={(checked) => setLocale(checked ? "zh" : "en")}
      />
      <span className="text-xs text-muted-foreground font-mono">中</span>
    </div>
  );
}
