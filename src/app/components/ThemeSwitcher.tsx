import { Sun, Moon } from "lucide-react";
import { useTheme } from "../theme";
import { Switch } from "./ui/switch";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="flex items-center gap-2">
      <Sun className={`w-4 h-4 ${isDark ? "text-muted-foreground" : "text-primary"}`} />
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
      />
      <Moon className={`w-4 h-4 ${isDark ? "text-primary" : "text-muted-foreground"}`} />
    </div>
  );
}
