import { X, Skull, Pause, Play, Network, Cpu } from "lucide-react";
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
      <div className="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground px-6">
        <Network className="w-10 h-10 opacity-30" />
        <p className="text-sm text-center">{t("details.selectConnection")}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-card/50">
        <h2 className="text-sm font-semibold tracking-tight">{t("details.title")}</h2>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-5 space-y-5">
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Network className="w-3.5 h-3.5 text-primary" />
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
              {t("details.connectionInfo")}
            </h3>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 divide-y divide-border">
            <InfoRow label={t("details.port")} value={String(connection.port)} mono highlight />
            <InfoRow label={t("details.localAddress")} value={connection.localAddress} mono />
            <InfoRow label={t("details.remoteAddress")} value={connection.remoteAddress} mono />
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-primary" />
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
              {t("details.processInfo")}
            </h3>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 divide-y divide-border">
            <InfoRow label={t("details.processName")} value={connection.processName} mono />
            <InfoRow label={t("details.processId")} value={String(connection.pid)} mono />
            {connection.processPath && (
              <InfoRow label={t("details.processPath")} value={connection.processPath} mono />
            )}
          </div>
        </section>
      </div>

      <div className="p-5 border-t border-border space-y-2.5">
        <button
          onClick={() => onSuspendProcess(connection.pid)}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm font-medium"
        >
          <Pause className="w-4 h-4" />
          <span>{t("details.suspendProcess")}</span>
        </button>
        <button
          onClick={() => onKillProcess(connection.pid)}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg hover:bg-destructive/20 transition-colors text-sm font-medium"
        >
          <Skull className="w-4 h-4" />
          <span>{t("details.killProcess")}</span>
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between px-3.5 py-2.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-sm ${mono ? "font-mono" : ""} ${highlight ? "text-primary font-semibold" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  );
}
