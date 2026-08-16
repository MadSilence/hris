"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import PeopleTable from "@/components/modules/organization/components/PeopleTable/PeopleTable";
import PeopleTopbar from "@/components/modules/organization/components/PeopleTopbar/PeopleTopbar";
import PeopleViewsPanel from "@/components/modules/organization/components/PeopleViews/PeopleViewsPanel";
import BulkActionBar from "@/components/modules/organization/components/BulkEdit/BulkActionBar";
import BulkEditModal, { type BulkEditTarget } from "@/components/modules/organization/components/BulkEdit/BulkEditModal";

import { useDebouncedValue } from "@/components/modules/organization/modules/profile/hooks/useDebouncedValue";
import type { FieldDTO, FilterDTO } from "@/models/user/fields";
import type { ColumnItem } from "@/models/userTable";
import type { PeopleView, ViewPayload } from "@/models/peopleView";
import { usePeopleSearchInfinite } from "@/components/modules/organization/hooks/usePeopleSearch/usePeopleSearchInfinite";
import { useUserFields } from "@/components/modules/organization/hooks/useUserFields";
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

const isColumnVisible = (f: FieldDTO): boolean =>
  f.isSystem || (f.viewScopes ?? []).includes("COMPANY");

const PeopleTableContainer: React.FC = () => {
  const [sort, setSort] = useState<SortState>({ fieldId: "last_name", dir: "asc" });
  const [filters, setFilters] = useState<FilterDTO[]>([]);
  const [query, setQuery] = useState("");

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
  }, [debouncedQ, filters, sort?.fieldId, sort?.dir]);

  const { data: fieldsData, isLoading: fieldsLoading, error: fieldsError } = useUserFields();
  if (fieldsError) throw fieldsError;

  const [columns, setColumns] = useState<ColumnItem[]>([]);

  useEffect(() => {
    if (!fieldsData) return;

    const visible = fieldsData.filter(isColumnVisible);
    const toColumn = (f: FieldDTO): ColumnItem => ({
      id: f.id,
      label: f.label ?? f.key ?? f.id,
      checked: DEFAULT_ON.has(f.id) || f.id === "sys:first_name",
      group: f.isSystem ? "system" : "other",
    });

    setColumns((prev) => {
      if (!prev.length) return visible.map(toColumn);

      const visibleById = new Map(visible.map((f) => [f.id, f]));
      const kept = prev
        .filter((c) => visibleById.has(c.id))
        .map((c) => ({ ...c, label: visibleById.get(c.id)!.label ?? c.label }));
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

  const params = useMemo(
    () => ({
      limit: PAGE_SIZE,
      q: qForApi ?? null,
      sortField: sort?.fieldId ?? null,
      sortDir: sort?.dir ?? null,
      selectedFields: selectedAttrFields.length ? selectedAttrFields : null,
      filters: filters.length ? filters : null,
    }),
    [qForApi, sort?.fieldId, sort?.dir, selectedAttrFields, filters]
  );

  const {
    items,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePeopleSearchInfinite(params as any);
  if (error && !(error instanceof ForbiddenError)) throw error;

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
      const visible = (fieldsData ?? []).filter(isColumnVisible);
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
    const visible = (fieldsData ?? []).filter(isColumnVisible);
    applyConfig({
      columns: visible
        .filter((f) => DEFAULT_ON.has(f.id) || f.id === "sys:first_name")
        .map((f) => f.id),
      filters: [],
      sort: { fieldId: "last_name", dir: "asc" },
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
  const [selectAllMatching, setSelectAllMatching] = useState(false);
  const filterActive = filters.length > 0;
  const barActive = selectedIds.size > 0 || selectAllMatching;

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setSelectAllMatching(false);
  }, []);

  const bulkTarget: BulkEditTarget = selectAllMatching
    ? { kind: "segment", filters }
    : { kind: "ids", userIds: Array.from(selectedIds) };

  const onBulkApplied = useCallback(() => {
    setSelectedIds(new Set());
    setSelectAllMatching(false);
  }, []);

  // Below every hook on purpose: an early return here would render fewer hooks than the previous
  // pass and break their order. A refusal is still an answer, so it gets a screen, not a crash.
  if (error instanceof ForbiddenError) return <AccessDenied/>;

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
          selectedCount={selectedIds.size}
          query={query}
          onQueryChangeAction={onQueryChange}
          columns={columns}
          onColumnsChangeAction={onColumnsChange}
          filters={filters}
          onFiltersChangeAction={onFiltersChange}
          fields={fieldsData ?? []}
        />

        {barActive ? (
          <BulkActionBar
            selectedCount={selectedIds.size}
            allMatching={selectAllMatching}
            filterActive={filterActive}
            onEdit={() => setBulkOpen(true)}
            onClear={clearSelection}
            onSelectAllMatching={() => setSelectAllMatching(true)}
          />
        ) : null}

        <PeopleTable
          data={items as any}
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
        count={selectAllMatching ? null : selectedIds.size}
        fields={fieldsData ?? []}
        onApplied={onBulkApplied}
      />
    </div>
  );
};

export default PeopleTableContainer;
