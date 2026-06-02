import { Moon, Sun } from "lucide-react";
import { useTheme } from "../theme";
import { useI18n } from "../i18n";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-md hover:opacity-90 transition-opacity"
      title={theme === "dark" ? t("theme.light") : t("theme.dark")}
    >
      {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}