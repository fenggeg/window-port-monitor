import { X, Skull, Pause } from "lucide-react";
import { useI18n } from "../i18n";
import { type PortConnection } from "./PortMonitor";

interface ProcessDetailsProps {
  connection: PortConnection | null;
  onKillProcess: (pid: number) => void;
  onSuspendProcess: (pid: number) => void;
  onClose: () => void;
}

export function ProcessDetails({ connection, onKillProcess, onSuspendProcess, onClose }: ProcessDetailsProps) {
  const { t } = useI18n();

  if (!connection) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        {t("details.selectConnection")}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-medium">{t("details.title")}</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-muted rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Connection Info */}
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {t("details.connectionInfo")}
          </h3>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t("details.port")}</span>
              <span className="text-sm font-mono">{connection.port}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t("details.localAddress")}</span>
              <span className="text-sm font-mono">{connection.localAddress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t("details.remoteAddress")}</span>
              <span className="text-sm font-mono">{connection.remoteAddress}</span>
            </div>
          </div>
        </div>

        {/* Process Info */}
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {t("details.processInfo")}
          </h3>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t("details.processName")}</span>
              <span className="text-sm font-mono">{connection.processName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t("details.processId")}</span>
              <span className="text-sm font-mono">{connection.pid}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-border space-y-2">
        <button
          onClick={() => onSuspendProcess(connection.pid)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:opacity-90 transition-opacity"
        >
          <Pause className="w-4 h-4" />
          <span className="font-mono text-sm">{t("details.suspendProcess")}</span>
        </button>
        <button
          onClick={() => onKillProcess(connection.pid)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:opacity-90 transition-opacity"
        >
          <Skull className="w-4 h-4" />
          <span className="font-mono text-sm">{t("details.killProcess")}</span>
        </button>
      </div>
    </div>
  );
}