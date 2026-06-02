import { Search } from "lucide-react";
import { useI18n } from "../i18n";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterProtocol: string;
  setFilterProtocol: (protocol: string) => void;
  filterState: string;
  setFilterState: (state: string) => void;
}

export function SearchBar({
  searchQuery,
  setSearchQuery,
  filterProtocol,
  setFilterProtocol,
  filterState,
  setFilterState,
}: SearchBarProps) {
  const { t } = useI18n();

  return (
    <div className="flex items-center gap-4 px-6 py-3 border-b border-border bg-background">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("search.placeholder")}
          className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <select
        value={filterProtocol}
        onChange={(e) => setFilterProtocol(e.target.value)}
        className="px-3 py-2 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="all">{t("filter.allProtocols")}</option>
        <option value="TCP">TCP</option>
        <option value="UDP">UDP</option>
        <option value="TCP6">TCP6</option>
        <option value="UDP6">UDP6</option>
      </select>
      <select
        value={filterState}
        onChange={(e) => setFilterState(e.target.value)}
        className="px-3 py-2 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="all">{t("filter.allStates")}</option>
        <option value="LISTENING">LISTENING</option>
        <option value="ESTABLISHED">ESTABLISHED</option>
        <option value="TIME_WAIT">TIME_WAIT</option>
        <option value="CLOSE_WAIT">CLOSE_WAIT</option>
        <option value="SYN_SENT">SYN_SENT</option>
      </select>
    </div>
  );
}