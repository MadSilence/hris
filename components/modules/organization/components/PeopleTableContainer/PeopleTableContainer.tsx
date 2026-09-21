"use client";

import { ErrorState } from "@/components/feedback/ErrorState";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import PeopleTable from "@/components/modules/organization/components/PeopleTable/PeopleTable";
import PeopleTopbar from "@/components/modules/organization/components/PeopleTopbar/PeopleTopbar";
import PeopleViewsPanel from "@/components/modules/organization/components/PeopleViews/PeopleViewsPanel";
import BulkEditModal, { type BulkEditTarget } from "@/components/modules/organization/components/BulkEdit/BulkEditModal";
import { AddPersonModal } from "@/components/modules/organization/components/AddPerson";

import { useDebouncedValue } from "@/components/modules/organization/modules/profile/hooks/useDebouncedValue";
import type { FieldDTO, FilterDTO, UsersSearchRequest } from "@/models/user/fields";
import type { ColumnItem } from "@/models/userTable";
import type { PeopleView, ViewPayload } from "@/models/peopleView";
import { usePeopleSearchInfinite } from "@/components/modules/organization/hooks/usePeopleSearch/usePeopleSearchInfinite";
import { useUserFields } from "@/components/modules/organization/hooks/useUserFields";
import { useDraftCount } from "@/components/modules/organization/hooks/useDraftCount";
import {
  usePeopleViews,
  usePeopleViewMutations,
  useResolveSharedView,
} from "@/components/modules/organization/components/PeopleViews/hooks/usePeopleViews";
import {
  applyPayload,
  extractPayload,
  payloadsEqual,
} from "@/components/modules/organization/components/PeopleViews/utils/viewPayload";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { ForbiddenError } from "@/components/clients/exceptions";

const PAGE_SIZE = 100;

type SortDir = "asc" | "desc";
type SortState = { fieldId: string; dir: SortDir } | null;

const DEFAULT_ON = new Set(["sys:first_name", "sys:status", "sys:email", "sys:created_at", "sys:updated_at"]);

/**
 * The name column carries both names — the cell renders "First Last" as one chip — so the table
 * offers a single **Name** column and drops the separate Last name one. Only the *column* list is
 * trimmed: filters, bulk edit and the profile still address the two fields separately, which is what
 * their labels in the field registry are for.
 */
const NAME_COLUMN_ID = "sys:first_name";
const LAST_NAME_FIELD_ID = "sys:last_name";

const isColumnOffered = (f: FieldDTO): boolean => f.id !== LAST_NAME_FIELD_ID;

const columnLabel = (f: FieldDTO): string =>
  f.id === NAME_COLUMN_ID ? "Name" : f.label ?? f.key ?? f.id;

// A column shows the value for everyone in the list, so it needs COMPANY-scope visibility.
// Non-configurable system fields (identity) bypass field access entirely — see FieldRegistry.
const isColumnVisible = (f: FieldDTO): boolean =>
  (f.isSystem && f.configurable === false) || (f.viewScopes ?? []).includes("COMPANY");

const PeopleTableContainer: React.FC = () => {
  const [addPersonOpen, setAddPersonOpen] = useState(false);
  // First name, not last: the table shows one Name column and it sorts by first name, so a default
  // of last_name left the list in an order no header could explain or undo.
  const [sort, setSort] = useState<SortState>({ fieldId: "first_name", dir: "asc" });
  const [filters, setFilters] = useState<FilterDTO[]>([]);
  const [query, setQuery] = useState("");
  /**
   * A view, not a filter: the drafts are a separate segment of the directory, so the employee list
   * and its total never quietly grow by people nobody has started. Everything else — the search box,
   * the columns, the filters, the sort — applies to whichever segment is open.
   */
  const [showDrafts, setShowDrafts] = useState(false);
  const { data: draftCount } = useDraftCount();

  const debouncedQ = useDebouncedValue(query.trim(), 300);
  const qForApi = debouncedQ.length >= 2 ? debouncedQ : undefined;

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleOne = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const toggleAllOnPage = useCallback((ids: string[], checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (checked ? next.add(id) : next.delete(id)));
      return next;
    });
  }, []);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [debouncedQ, filters, sort?.fieldId, sort?.dir, showDrafts]);

  const { data: fieldsData, isLoading: fieldsLoading, error: fieldsError } = useUserFields();

  const [columns, setColumns] = useState<ColumnItem[]>([]);

  useEffect(() => {
    if (!fieldsData) return;

    const visible = fieldsData.filter(isColumnVisible).filter(isColumnOffered);
    const toColumn = (f: FieldDTO): ColumnItem => ({
      id: f.id,
      label: columnLabel(f),
      checked: DEFAULT_ON.has(f.id) || f.id === NAME_COLUMN_ID,
      group: f.isSystem ? "system" : "other",
    });

    setColumns((prev) => {
      if (!prev.length) return visible.map(toColumn);

      const visibleById = new Map(visible.map((f) => [f.id, f]));
      const kept = prev
        .filter((c) => visibleById.has(c.id))
        .map((c) => ({ ...c, label: columnLabel(visibleById.get(c.id)!) }));
      const known = new Set(kept.map((c) => c.id));
      const added = visible.filter((f) => !known.has(f.id)).map(toColumn);
      return [...kept, ...added];
    });
  }, [fieldsData]);

  const onColumnsChange = useCallback((next: ColumnItem[]) => {
    setColumns(next);
  }, []);

  const selectedAttrFields = useMemo(
    () => columns.filter((c) => c.checked && c.id.startsWith("attr:")).map((c) => c.id),
    [columns]
  );

  const params = useMemo<Omit<UsersSearchRequest, "cursor">>(
    () => ({
      limit: PAGE_SIZE,
      q: qForApi ?? null,
      sortField: sort?.fieldId ?? null,
      sortDir: sort?.dir ?? null,
      selectedFields: selectedAttrFields.length ? selectedAttrFields : null,
      filters: filters.length ? filters : null,
      drafts: showDrafts ? "ONLY" : null,
    }),
    [qForApi, sort?.fieldId, sort?.dir, selectedAttrFields, filters, showDrafts]
  );

  const {
    items,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePeopleSearchInfinite(params);

  const onSortChange = useCallback((next: SortState) => {
    setSort(next);
  }, []);

  const onQueryChange = useCallback((v: string) => {
    setQuery(v);
  }, []);

  const onFiltersChange = useCallback((next: FilterDTO[]) => {
    setFilters(next);
  }, []);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const visibleColumns = useMemo(() => columns.filter((c) => c.checked), [columns]);

  const searchParams = useSearchParams();
  const sharedToken = searchParams.get("shared");

  const { data: views = [], isLoading: viewsLoading } = usePeopleViews();
  const viewMutations = usePeopleViewMutations();
  const { data: sharedData } = useResolveSharedView(sharedToken);

  const [panelCollapsed, setPanelCollapsed] = useState(true);
  const [activeView, setActiveView] = useState<{ id: string; name: string; payload: ViewPayload } | null>(null);
  const [isShared, setIsShared] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const currentPayload = useMemo(
    () => extractPayload(visibleColumns, filters, sort),
    [visibleColumns, filters, sort],
  );
  const dirty = activeView ? !payloadsEqual(currentPayload, activeView.payload) : false;

  const applyConfig = useCallback(
    (payload: ViewPayload): ViewPayload => {
      const visible = (fieldsData ?? []).filter(isColumnVisible).filter(isColumnOffered);
      const applied = applyPayload(payload, visible);
      setColumns(applied.columns);
      setFilters(applied.filters);
      setSort(applied.sort);
      setNotice(
        applied.dropped > 0
          ? "Some fields in this view aren't available to you and were hidden."
          : null,
      );
      return {
        columns: applied.columns.filter((c) => c.checked).map((c) => c.id),
        filters: applied.filters,
        sort: applied.sort,
      };
    },
    [fieldsData],
  );

  const onApplyView = useCallback(
    (view: PeopleView) => {
      const effective = applyConfig(view.payload);
      setActiveView({ id: view.id, name: view.name, payload: effective });
      setIsShared(false);
    },
    [applyConfig],
  );

  const onApplyDefault = useCallback(() => {
    const visible = (fieldsData ?? []).filter(isColumnVisible).filter(isColumnOffered);
    applyConfig({
      columns: visible
        .filter((f) => DEFAULT_ON.has(f.id) || f.id === NAME_COLUMN_ID)
        .map((f) => f.id),
      filters: [],
      sort: { fieldId: "first_name", dir: "asc" },
    });
    setActiveView(null);
    setIsShared(false);
  }, [applyConfig, fieldsData]);

  const onSaveAs = useCallback(
    (name: string) => {
      const payload = currentPayload;
      viewMutations.create.mutate(
        { name, payload },
        {
          onSuccess: (created) => {
            setActiveView({ id: created.id, name: created.name, payload });
            setIsShared(false);
          },
        },
      );
    },
    [currentPayload, viewMutations.create],
  );

  const onUpdateActive = useCallback(() => {
    if (!activeView) return;
    const payload = currentPayload;
    viewMutations.update.mutate(
      { id: activeView.id, name: activeView.name, payload },
      { onSuccess: () => setActiveView((prev) => (prev ? { ...prev, payload } : prev)) },
    );
  }, [activeView, currentPayload, viewMutations.update]);

  const onRename = useCallback(
    (view: PeopleView, name: string) => {
      viewMutations.update.mutate(
        { id: view.id, name, payload: view.payload },
        {
          onSuccess: () =>
            setActiveView((prev) => (prev && prev.id === view.id ? { ...prev, name } : prev)),
        },
      );
    },
    [viewMutations.update],
  );

  const onDuplicate = useCallback(
    (view: PeopleView) => viewMutations.duplicate.mutate(view.id),
    [viewMutations.duplicate],
  );

  const onDelete = useCallback(
    (view: PeopleView) => {
      viewMutations.remove.mutate(view.id, {
        onSuccess: () => setActiveView((prev) => (prev?.id === view.id ? null : prev)),
      });
    },
    [viewMutations.remove],
  );

  const onShare = useCallback(() => {
    viewMutations.share.mutate(currentPayload, {
      onSuccess: ({ token }) => {
        const url = `${window.location.origin}/organization/people?shared=${token}`;
        void navigator.clipboard?.writeText(url).catch(() => {});
        setNotice("Share link copied to clipboard.");
      },
    });
  }, [currentPayload, viewMutations.share]);

  const appliedShareRef = useRef<string | null>(null);
  useEffect(() => {
    if (!sharedToken || !sharedData || !fieldsData) return;
    if (appliedShareRef.current === sharedToken) return;
    appliedShareRef.current = sharedToken;
    applyConfig(sharedData.payload);
    setActiveView(null);
    setIsShared(true);
  }, [sharedToken, sharedData, fieldsData, applyConfig]);

  const viewsBusy = viewMutations.create.isPending || viewMutations.update.isPending;

  const [bulkOpen, setBulkOpen] = useState(false);

  // Selection lives in one place now: the header checkbox picks everyone up or puts everyone down,
  // and the Edit button in the topbar appears while anyone is held. The old action bar said the same
  // thing a third time and cost a row of screen.
  const bulkTarget: BulkEditTarget = { kind: "ids", userIds: Array.from(selectedIds) };

  const onBulkApplied = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Below every hook on purpose: an early return here would render fewer hooks than the previous
  // pass and break their order. A refusal is still an answer, so it gets a screen, not a crash.
  //
  // `fieldsError` used to `throw` from the middle of this function instead \u2014 which reaches
  // `app/(app)/error.tsx`, a boundary that ignores the message on purpose, so a coded refusal about
  // the column set arrived as "Something went wrong" and took the whole page with it.
  const failure = error ?? fieldsError;
  if (failure instanceof ForbiddenError) return <AccessDenied/>;
  if (failure) return <ErrorState error={failure} />;

  return (
    <div className="flex min-h-0 flex-1 gap-4">
      <div className="flex min-h-0 flex-1 flex-col gap-2">
        {notice ? (
          <div className="flex items-center justify-between gap-3 rounded-md border border-brown-200 bg-brown-50 px-3 py-1.5 text-xs text-muted-foreground">
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice(null)}
              aria-label="Dismiss"
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          </div>
        ) : null}

        <PeopleTopbar
          sort={sort}
          selectedCount={selectedIds.size}
          onEditSelectedAction={() => setBulkOpen(true)}
          onAddPersonAction={() => setAddPersonOpen(true)}
          query={query}
          onQueryChangeAction={onQueryChange}
          columns={columns}
          onColumnsChangeAction={onColumnsChange}
          filters={filters}
          onFiltersChangeAction={onFiltersChange}
          fields={fieldsData ?? []}
          drafts={{
            count: draftCount?.count ?? 0,
            showing: showDrafts,
            onChange: setShowDrafts,
          }}
        />

        <PeopleTable
          data={items}
          isLoading={isLoading || fieldsLoading}
          hasMore={Boolean(hasNextPage)}
          isLoadingMore={isFetchingNextPage}
          onLoadMore={loadMore}
          sort={sort}
          onSortChange={onSortChange}
          selectedIds={selectedIds}
          onToggleOne={toggleOne}
          onToggleAllOnPage={toggleAllOnPage}
          fieldsMeta={fieldsData ?? []}
          visibleColumns={visibleColumns}
        />
      </div>

      <PeopleViewsPanel
        collapsed={panelCollapsed}
        onToggleCollapsed={() => setPanelCollapsed((c) => !c)}
        views={views}
        isLoading={viewsLoading}
        activeViewId={activeView?.id ?? null}
        isShared={isShared}
        dirty={dirty}
        busy={viewsBusy}
        onApplyDefault={onApplyDefault}
        onApplyView={onApplyView}
        onSaveAs={onSaveAs}
        onUpdateActive={onUpdateActive}
        onRename={onRename}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onShare={onShare}
      />

      <BulkEditModal
        isOpen={bulkOpen}
        onClose={() => setBulkOpen(false)}
        target={bulkTarget}
        count={selectedIds.size}
        fields={fieldsData ?? []}
        onApplied={onBulkApplied}
      />

      <AddPersonModal open={addPersonOpen} onCloseAction={() => setAddPersonOpen(false)} />
    </div>
  );
};

export default PeopleTableContainer;
