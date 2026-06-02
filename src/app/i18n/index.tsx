import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type Locale = "en" | "zh";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  tState: (state: string) => string;
}

const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Header
    "app.title": "Windows Port Monitor",
    "header.lastUpdate": "Last update:",
    "header.refresh": "REFRESH",

    // Stats
    "stats.totalConnections": "Total Connections",
    "stats.listening": "Listening",
    "stats.established": "Established",
    "stats.tcp": "TCP",
    "stats.udp": "UDP",

    // Search & Filters
    "search.placeholder": "Search by port, process name, or PID...",
    "filter.allProtocols": "All Protocols",
    "filter.allStates": "All States",

    // Port Table
    "table.port": "Port",
    "table.protocol": "Protocol",
    "table.state": "State",
    "table.localAddress": "Local Address",
    "table.remoteAddress": "Remote Address",
    "table.pid": "PID",
    "table.process": "Process",
    "table.noConnections": "No connections found",
    "table.adjustFilters": "Try adjusting your filters",

    // Process Details
    "details.title": "Process Details",
    "details.selectConnection": "Select a connection to view details",
    "details.connectionInfo": "Connection Info",
    "details.processInfo": "Process Info",
    "details.port": "Port",
    "details.localAddress": "Local Address",
    "details.remoteAddress": "Remote Address",
    "details.processName": "Process Name",
    "details.processId": "Process ID",
    "details.processPath": "Process Path",
    "details.suspendProcess": "SUSPEND PROCESS",
    "details.killProcess": "KILL PROCESS",

    // Details Toggle
    "details.expand": "Expand Details",
    "details.collapse": "Collapse Details",
    "details.close": "Close",

    // Theme
    "theme.light": "Switch to Light Mode",
    "theme.dark": "Switch to Dark Mode",

    // Error
    "error.prefix": "Error:",
  },
  zh: {
    // Header
    "app.title": "Windows 端口监控",
    "header.lastUpdate": "最后更新:",
    "header.refresh": "刷新",

    // Stats
    "stats.totalConnections": "总连接数",
    "stats.listening": "监听中",
    "stats.established": "已建立",
    "stats.tcp": "TCP",
    "stats.udp": "UDP",

    // Search & Filters
    "search.placeholder": "按端口、进程名或 PID 搜索...",
    "filter.allProtocols": "所有协议",
    "filter.allStates": "所有状态",

    // Port Table
    "table.port": "端口",
    "table.protocol": "协议",
    "table.state": "状态",
    "table.localAddress": "本地地址",
    "table.remoteAddress": "远程地址",
    "table.pid": "PID",
    "table.process": "进程",
    "table.noConnections": "未找到连接",
    "table.adjustFilters": "请调整筛选条件",

    // Process Details
    "details.title": "进程详情",
    "details.selectConnection": "选择一个连接查看详情",
    "details.connectionInfo": "连接信息",
    "details.processInfo": "进程信息",
    "details.port": "端口",
    "details.localAddress": "本地地址",
    "details.remoteAddress": "远程地址",
    "details.processName": "进程名称",
    "details.processId": "进程 ID",
    "details.processPath": "进程路径",
    "details.suspendProcess": "暂停进程",
    "details.killProcess": "终止进程",

    // Details Toggle
    "details.expand": "展开详情",
    "details.collapse": "收起详情",
    "details.close": "关闭",

    // Theme
    "theme.light": "切换到浅色模式",
    "theme.dark": "切换到深色模式",

    // Error
    "error.prefix": "错误:",
  },
};

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    const saved = localStorage.getItem("locale");
    return saved === "zh" ? "zh" : "en";
  });

  const handleSetLocale = useCallback((newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem("locale", newLocale);
  }, []);

  const t = useCallback(
    (key: string): string => {
      return translations[locale][key] ?? key;
    },
    [locale]
  );

  const tState = useCallback(
    (state: string): string => {
      return state;
    },
    []
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale: handleSetLocale, t, tState }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}