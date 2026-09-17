"use client";

import * as React from "react";
import { Download } from "lucide-react";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { Button } from "@/public/desact/src/components/ui/button";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LogsFilters } from "@/components/modules/settings/modules/logs/components/LogsFilters/LogsFilters";
import { LogsTable } from "@/components/modules/settings/modules/logs/components/LogsTable/LogsTable";
import { useActivityCatalog } from "@/components/modules/settings/modules/logs/hooks/useActivityCatalog";
import { useActivityLogs } from "@/components/modules/settings/modules/logs/hooks/useActivityLogs";
import type { ActivityLogFilters } from "@/models/activityLog";

/**
 * The Logs page.
 *
 * <p><b>Read-only, and it stays that way.</b> Nothing here writes: no row actions, no kebab, no edit.
 * A journal somebody can change from the screen that displays it is not a journal, which is also why
 * the whole page sits behind its own right rather than under general settings.
 *
 * <p>The one thing it can do besides read is export what is on screen — and that export writes its
 * own row, so the page that answers "what left the building" has no hole where it stands.
 */
export const LogsContainer: React.FC = () => {
  const [filters, setFilters] = React.useState<ActivityLogFilters>({});
  const [search, setSearch] = React.useState("");

  // The search is part of the query key, so typing would refetch per keystroke without this.
  React.useEffect(() => {
    const timer = setTimeout(() => setFilters((current) => ({ ...current, search: search || undefined })), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const catalog = useActivityCatalog();
  const logs = useActivityLogs(filters);

  if (logs.isError) {
    return <ErrorState error={logs.error} onRetry={() => void logs.refetch()}/>;
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 px-8">
      <ListToolbar
        search={{ value: search, onChange: setSearch }}
        filter={
          <LogsFilters
            catalog={catalog.data}
            value={filters}
            onChange={(next) => setFilters({ ...next, search: search || undefined })}
          />
        }
        secondary={
          <Button variant="outline" size="sm" asChild>
            <a href={`/api/activity-logs/export${exportQuery(filters)}`}>
              <Download className="mr-1.5 h-4 w-4"/>
              Export
            </a>
          </Button>
        }
      />

      <LogsTable
        items={logs.items}
        isLoading={logs.isLoading}
        isLoadingMore={logs.isFetchingNextPage}
        hasMore={Boolean(logs.hasNextPage)}
        onLoadMore={() => void logs.fetchNextPage()}
        query={search}
      />
    </div>
  );
};

/** The file is the filter the person is looking at, so the same parameters go with it. */
const exportQuery = (filters: ActivityLogFilters): string => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const query = params.toString();
  return query ? `?${query}` : "";
};
