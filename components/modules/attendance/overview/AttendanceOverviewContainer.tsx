"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Users } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { ForbiddenError } from "@/components/clients/exceptions";
import { EmptyState, NoResults } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { FilterPopover } from "@/components/audience/FilterPopover";
import { ListToolbar } from "@/components/ui/ListToolbar/ListToolbar";
import { useUserFields } from "@/components/modules/organization/hooks/useUserFields/useUserFields";
import { useAttendanceReport } from "@/components/modules/attendance/hooks";
import { AttendanceTable } from "./AttendanceTable";
import { AttendanceExportDialog } from "./AttendanceExportDialog";
import { PeriodControl } from "./PeriodControl";
import { useAttendanceView } from "./useAttendanceView";

const SEARCH_DEBOUNCE_MS = 300;

/**
 * The Attendance overview (ATTENDANCE_REBUILD_PLAN batch 3): people — searched and filtered as on the
 * People table — over a month or a picked range, one row each. A row opens the person's log for the
 * same period, and the view survives the round trip because it lives in the URL.
 *
 * For those who manage attendance; the page is gated on `PEOPLE.ATTENDANCE MANAGE` and the rows are its
 * scope. Every number comes from the backend's one calculation, the same one the person page and the
 * file read.
 */
export const AttendanceOverviewContainer: React.FC = () => {
  const router = useRouter();
  const { view, setMonth, setRange, setQuery, setFilters } = useAttendanceView();
  const fields = useUserFields();
  const [search, setSearch] = useState(view.query);
  const [exporting, setExporting] = useState(false);

  // The box answers at once; the URL, and with it the query, follows once typing pauses.
  useEffect(() => {
    if (search === view.query) return;
    const timer = setTimeout(() => setQuery(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search, view.query, setQuery]);

  const report = useAttendanceReport({ ...view.period, q: view.query, filters: view.filters });
  const rows = useMemo(() => (report.data?.pages ?? []).flatMap((page) => page.items), [report.data]);
  const total = report.data?.pages[0]?.total ?? null;
  const narrowed = view.query.trim().length >= 2 || view.filters.length > 0;

  if (report.error instanceof ForbiddenError) return <AccessDenied/>;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <ListToolbar
        search={{ value: search, onChange: setSearch }}
        filter={
          <FilterPopover
            fields={fields.data ?? []}
            isLoadingFields={fields.isLoading}
            value={view.filters}
            onChange={setFilters}
          />
        }
        secondary={
          <>
            <PeriodControl month={view.month} range={view.range} onMonthChange={setMonth} onRangeChange={setRange}/>
            <Button size="icon" variant="outline" aria-label="Export attendance" onClick={() => setExporting(true)}>
              <Download className="h-4 w-4"/>
            </Button>
          </>
        }
      />

      {report.error ? (
        <ErrorState error={report.error} onRetry={() => void report.refetch()}/>
      ) : (
        <AttendanceTable
          rows={rows}
          isLoading={report.isLoading}
          hasNextPage={Boolean(report.hasNextPage)}
          isFetchingNextPage={report.isFetchingNextPage}
          onLoadMore={() => void report.fetchNextPage()}
          onOpen={(row) => router.push(`/attendance/${row.person.id}${view.search ? `?${view.search}` : ""}`)}
          empty={narrowed
            ? <NoResults hint="Try a different search or filter."/>
            : (
              <EmptyState
                icon={<Users className="h-6 w-6"/>}
                title="Nobody in this period"
                description="Nobody within your reach was employed in this period."
              />
            )}
        />
      )}

      <AttendanceExportDialog
        open={exporting}
        onClose={() => setExporting(false)}
        view={view}
        fields={fields.data ?? []}
        total={total}
        rows={rows}
      />
    </div>
  );
};
