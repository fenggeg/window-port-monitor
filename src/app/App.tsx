import { I18nProvider } from "./i18n";
import { ThemeProvider } from "./theme";
import { PortMonitor } from "./components/PortMonitor";

export function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <I18nProvider>
        <PortMonitor />
      </I18nProvider>
    </ThemeProvider>
  );
}