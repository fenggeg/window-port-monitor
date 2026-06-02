import { useI18n } from "../i18n";
import { type PortConnection } from "./PortMonitor";

interface PortTableProps {
  connections: PortConnection[];
  selectedConnection: PortConnection | null;
  onSelectConnection: (conn: PortConnection) => void;
}

export function PortTable({ connections, selectedConnection, onSelectConnection }: PortTableProps) {
  const { t } = useI18n();

  const getStateColor = (state: string) => {
    switch (state) {
      case "LISTENING":
        return "text-chart-2";
      case "ESTABLISHED":
        return "text-chart-3";
      case "TIME_WAIT":
      case "CLOSE_WAIT":
        return "text-muted-foreground";
      default:
        return "text-muted-foreground";
    }
  };

  const getProtocolColor = (protocol: string) => {
    switch (protocol) {
      case "TCP":
      case "TCP6":
        return "text-primary";
      case "UDP":
      case "UDP6":
        return "text-chart-4";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="h-full">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
              {t("table.port")}
            </th>
            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
              {t("table.protocol")}
            </th>
            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
              {t("table.state")}
            </th>
            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
              {t("table.localAddress")}
            </th>
            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
              {t("table.remoteAddress")}
            </th>
            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
              {t("table.pid")}
            </th>
            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
              {t("table.process")}
            </th>
          </tr>
        </thead>
        <tbody>
          {connections.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-8 text-muted-foreground">
                {t("table.noConnections")}
              </td>
            </tr>
          ) : (
            connections.map((conn) => (
              <tr
                key={conn.id}
                onClick={() => onSelectConnection(conn)}
                className={`border-b border-border cursor-pointer transition-colors hover:bg-muted/50 ${
                  selectedConnection?.id === conn.id ? "bg-muted/50" : ""
                }`}
              >
                <td className="px-4 py-3 text-sm font-mono">{conn.port}</td>
                <td className={`px-4 py-3 text-sm font-mono ${getProtocolColor(conn.protocol)}`}>
                  {conn.protocol}
                </td>
                <td className={`px-4 py-3 text-sm font-mono ${getStateColor(conn.state)}`}>
                  {conn.state}
                </td>
                <td className="px-4 py-3 text-sm font-mono">{conn.localAddress}</td>
                <td className="px-4 py-3 text-sm font-mono">{conn.remoteAddress}</td>
                <td className="px-4 py-3 text-sm font-mono">{conn.pid}</td>
                <td className="px-4 py-3 text-sm font-mono">{conn.processName}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}