import { Search } from "lucide-react";
import { useI18n } from "../i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

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
    <div className="flex items-center gap-3 px-6 py-3 border-b border-border bg-background">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("search.placeholder")}
          className="w-full h-9 pl-9 pr-4 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
        />
      </div>
      <Select value={filterProtocol} onValueChange={setFilterProtocol}>
        <SelectTrigger className="w-[150px] h-9 bg-muted border-border text-sm">
          <SelectValue placeholder={t("filter.allProtocols")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filter.allProtocols")}</SelectItem>
          <SelectItem value="TCP">TCP</SelectItem>
          <SelectItem value="UDP">UDP</SelectItem>
          <SelectItem value="TCP6">TCP6</SelectItem>
          <SelectItem value="UDP6">UDP6</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filterState} onValueChange={setFilterState}>
        <SelectTrigger className="w-[160px] h-9 bg-muted border-border text-sm">
          <SelectValue placeholder={t("filter.allStates")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filter.allStates")}</SelectItem>
          <SelectItem value="LISTENING">LISTENING</SelectItem>
          <SelectItem value="ESTABLISHED">ESTABLISHED</SelectItem>
          <SelectItem value="TIME_WAIT">TIME_WAIT</SelectItem>
          <SelectItem value="CLOSE_WAIT">CLOSE_WAIT</SelectItem>
          <SelectItem value="SYN_SENT">SYN_SENT</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
