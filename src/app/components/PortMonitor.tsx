import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Activity, RefreshCw } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { useI18n } from "../i18n";
import { PortTable } from "./PortTable";
import { ProcessDetails } from "./ProcessDetails";
import { StatsCard } from "./StatsCard";
import { SearchBar } from "./SearchBar";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeSwitcher } from "./ThemeSwitcher";

export interface PortConnection {
  id: string;
  port: number;
  protocol: "TCP" | "UDP" | "TCP6" | "UDP6";
  localAddress: string;
  remoteAddress: string;
  state: "LISTENING" | "ESTABLISHED" | "TIME_WAIT" | "CLOSE_WAIT" | "SYN_SENT";
  pid: number;
  processName: string;
  processPath: string;
}

export function PortMonitor() {
  const { t } = useI18n();
  const [connections, setConnections] = useState<PortConnection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<PortConnection | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProtocol, setFilterProtocol] = useState<string>("all");
  const [filterState, setFilterState] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [error, setError] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const fetchConnectionsRef = useRef<() => Promise<void>>();

  const fetchConnections = useCallback(async () => {
    try {
      const result = await invoke<PortConnection[]>("get_port_connections");
      setConnections(result);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(String(err));
      console.error("Failed to fetch connections:", err);
    }
  }, []);

  fetchConnectionsRef.current = fetchConnections;

  useEffect(() => {
    fetchConnectionsRef.current?.();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchConnectionsRef.current?.();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchConnections();
    setIsRefreshing(false);
  }, [fetchConnections]);

  const handleKillProcess = useCallback(async (pid: number) => {
    try {
      await invoke("kill_process", { pid });
      await fetchConnections();
      setSelectedConnection(null);
    } catch (err) {
      setError(String(err));
    }
  }, [fetchConnections]);

  const handleSuspendProcess = useCallback(async (pid: number) => {
    try {
      await invoke("suspend_process", { pid });
      await fetchConnections();
    } catch (err) {
      setError(String(err));
    }
  }, [fetchConnections]);

  const handleSelectConnection = useCallback((conn: PortConnection) => {
    setSelectedConnection((prev) => {
      if (prev?.id === conn.id) {
        setIsDetailsOpen((open) => !open);
        return prev;
      }
      setIsDetailsOpen(true);
      return conn;
    });
  }, []);

  const handleCloseDetails = useCallback(() => {
    setIsDetailsOpen(false);
  }, []);

  const filteredConnections = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    return connections.filter((conn) => {
      const matchesSearch =
        searchQuery === "" ||
        conn.port.toString().includes(searchQuery) ||
        conn.processName.toLowerCase().includes(lowerQuery) ||
        conn.pid.toString().includes(searchQuery);

      const matchesProtocol = filterProtocol === "all" || conn.protocol === filterProtocol;
      const matchesState = filterState === "all" || conn.state === filterState;

      return matchesSearch && matchesProtocol && matchesState;
    });
  }, [connections, searchQuery, filterProtocol, filterState]);

  const stats = useMemo(() => {
    let listening = 0;
    let established = 0;
    let tcp = 0;
    let udp = 0;

    for (const c of connections) {
      if (c.state === "LISTENING") listening++;
      if (c.state === "ESTABLISHED") established++;
      if (c.protocol.startsWith("TCP")) tcp++;
      if (c.protocol.startsWith("UDP")) udp++;
    }

    return {
      total: connections.length,
      listening,
      established,
      tcp,
      udp,
    };
  }, [connections]);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-semibold">{t("app.title")}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground font-mono">
              {t("header.lastUpdate")} {lastUpdate.toLocaleTimeString()}
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="font-mono text-sm">{t("header.refresh")}</span>
            </button>
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 text-destructive px-6 py-2 text-sm font-mono">
          {t("error.prefix")} {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-border bg-background">
        <StatsCard label={t("stats.totalConnections")} value={stats.total} color="text-foreground" />
        <StatsCard label={t("stats.listening")} value={stats.listening} color="text-chart-2" />
        <StatsCard label={t("stats.established")} value={stats.established} color="text-chart-3" />
        <StatsCard label={t("stats.tcp")} value={stats.tcp} color="text-primary" />
        <StatsCard label={t("stats.udp")} value={stats.udp} color="text-chart-4" />
      </div>

      {/* Search and Filters */}
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterProtocol={filterProtocol}
        setFilterProtocol={setFilterProtocol}
        filterState={filterState}
        setFilterState={setFilterState}
      />

      {/* Main Content */}
      <div className="flex-1 min-h-0 overflow-hidden flex">
        {/* Port Table */}
        <div className="flex-1 overflow-auto h-full">
          <PortTable
            connections={filteredConnections}
            selectedConnection={selectedConnection}
            onSelectConnection={handleSelectConnection}
          />
        </div>

        {/* Process Details Drawer */}
        <div
          className="bg-card border-l border-border h-full overflow-hidden transition-[width] duration-300 ease-in-out will-change-[width]"
          style={{ width: isDetailsOpen ? 400 : 0 }}
        >
          <div className="w-[400px] h-full overflow-auto">
            <ProcessDetails
              connection={selectedConnection}
              onKillProcess={handleKillProcess}
              onSuspendProcess={handleSuspendProcess}
              onClose={handleCloseDetails}
            />
          </div>
        </div>
      </div>
    </div>
  );
}