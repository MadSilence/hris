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
import { usePeopleSearchCount } from "@/components/modules/organization/hooks/usePeopleSearch/usePeopleSearchCount";
import { bulkTargetFor, heldCountFor, offersAllMatching } from "./selection";
import { useUserFields } from "@/components/modules/organization/hooks/useUserFields";
import { useDraftCount } from "@/components/modules/organization/hooks/useDraftCount";
import {
  usePeopleViews,
  usePeopleViewMutations,
} from "@/components/modules/organization/components/PeopleViews/hooks/usePeopleViews";
import {
  applyPayload,
  extractPayload,
  payloadsEqual,
} from "@/components/modules/organization/components/PeopleViews/utils/viewPayload";
import {
  decodeTableState,
  encodeTableState,
  hasTableState,
  urlStateToPayload,
  type TableStateDefaults,
} from "@/components/modules/organization/components/PeopleViews/utils/tableUrlState";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import { messageForError } from "@/lib/errors/errorMessages";
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
  // "Select All N Matching": the operation then targets the table's whole set, not the ids held.
  const [allMatching, setAllMatching] = useState(false);

  const toggleOne = useCallback((id: string, checked: boolean) => {
    setAllMatching(false);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const toggleAllOnPage = useCallback((ids: string[], checked: boolean) => {
    if (!checked) setAllMatching(false);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (checked ? next.add(id) : next.delete(id)));
      return next;
    });
  }, []);

  useEffect(() => {
    setSelectedIds(new Set());
    setAllMatching(false);
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

  // Every loaded row is held and the table has more: offer the whole set, the way a mail client does.
  // The count is asked only then, and it is the backend's TABLE count — the set the edit will write.
  const loadedIds = useMemo(() => items.map((u) => u.id), [items]);
  const allLoadedSelected = loadedIds.length > 0 && loadedIds.every((id) => selectedIds.has(id));
  const { data: matching } = usePeopleSearchCount(params, allLoadedSelected && (Boolean(hasNextPage) || allMatching));
  const matchingCount = matching?.count ?? null;
  const offerAllMatching = offersAllMatching(loadedIds, selectedIds, matchingCount, allMatching);

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

  const { data: views = [], isLoading: viewsLoading } = usePeopleViews();
  const viewMutations = usePeopleViewMutations();

  const [panelCollapsed, setPanelCollapsed] = useState(true);
  const [activeView, setActiveView] = useState<{ id: string; name: string; payload: ViewPayload } | null>(null);
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

  /**
   * `hiddenByServer` is how many fields the backend took out of a saved view before sending it — it
   * never sends their ids. `applyPayload` drops whatever else this reader cannot use, and either one
   * is worth the same short note.
   */
  const applyConfig = useCallback(
    (payload: ViewPayload, hiddenByServer = 0): ViewPayload => {
      const visible = (fieldsData ?? []).filter(isColumnVisible).filter(isColumnOffered);
      const applied = applyPayload(payload, visible);
      setColumns(applied.columns);
      setFilters(applied.filters);
      setSort(applied.sort);
      setNotice(
        applied.dropped + hiddenByServer > 0
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
      const effective = applyConfig(view.payload, view.hiddenFieldCount ?? 0);
      setActiveView({ id: view.id, name: view.name, payload: effective });
    },
    [applyConfig],
  );

  const tableDefaults = useMemo<TableStateDefaults>(() => {
    const visible = (fieldsData ?? []).filter(isColumnVisible).filter(isColumnOffered);
    return {
      columns: visible.filter((f) => DEFAULT_ON.has(f.id) || f.id === NAME_COLUMN_ID).map((f) => f.id),
      sort: { fieldId: "first_name", dir: "asc" },
    };
  }, [fieldsData]);

  const onApplyDefault = useCallback(() => {
    applyConfig({ columns: tableDefaults.columns, filters: [], sort: tableDefaults.sort });
    setActiveView(null);
  }, [applyConfig, tableDefaults]);

  const onSaveAs = useCallback(
    (name: string) => {
      const payload = currentPayload;
      viewMutations.create.mutate(
        { name, payload },
        { onSuccess: (created) => setActiveView({ id: created.id, name: created.name, payload }) },
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

  /** "Duplicate" on one's own view; "Save a Copy" on a shared one, which then becomes the open view. */
  const onDuplicate = useCallback(
    (view: PeopleView) =>
      viewMutations.duplicate.mutate(view.id, {
        onSuccess: (created) => {
          if ((view.access ?? "OWNER") === "OWNER") return;
          setActiveView((prev) =>
            prev?.id === view.id ? { id: created.id, name: created.name, payload: prev.payload } : prev,
          );
          setNotice(`Saved “${created.name}” to My Views.`);
        },
      }),
    [viewMutations.duplicate],
  );

  /**
   * Save a Copy of the open view when it is shared to view only. With changes on screen the copy is
   * what is on screen — copying the stored definition would throw them away.
   */
  const onSaveActiveCopy = useCallback(() => {
    if (!activeView) return;
    const source = views.find((v) => v.id === activeView.id);
    if (source && !dirty) {
      onDuplicate(source);
      return;
    }
    const payload = currentPayload;
    viewMutations.create.mutate(
      { name: activeView.name, payload },
      {
        onSuccess: (created) => {
          setActiveView({ id: created.id, name: created.name, payload });
          setNotice(`Saved “${created.name}” to My Views.`);
        },
      },
    );
  }, [activeView, currentPayload, dirty, onDuplicate, viewMutations.create, views]);

  // Delete always confirms (ACTIONS_AND_MENUS.md) — a view can be shared, and its people lose it too.
  const [deletingView, setDeletingView] = useState<PeopleView | null>(null);
  const onDelete = useCallback((view: PeopleView) => setDeletingView(view), []);
  const confirmDelete = useCallback(() => {
    if (!deletingView) return;
    const id = deletingView.id;
    viewMutations.remove.mutate(id, {
      onSuccess: () => {
        setActiveView((prev) => (prev?.id === id ? null : prev));
        setDeletingView(null);
      },
    });
  }, [deletingView, viewMutations.remove]);

  const onCopyLink = useCallback(() => {
    void navigator.clipboard?.writeText(window.location.href).catch(() => {});
    setNotice("Link copied. Whoever opens it sees this table under their own access.");
  }, []);

  // The table's state lives in the address (`tableUrlState.ts`): read once when the field catalogue
  // has arrived — through `applyConfig`, so a column the reader may not see is dropped like any view's —
  // and written back as the table changes. `replaceState`, not a navigation: a history entry per
  // keystroke would make Back useless, and Next keeps `useSearchParams` in step with it.
  // `urlReady` is state, not only the ref, so the first write waits for the render that holds what was read.
  const urlReadRef = useRef(false);
  const [urlReady, setUrlReady] = useState(false);
  useEffect(() => {
    if (urlReadRef.current || !fieldsData) return;
    urlReadRef.current = true;
    setUrlReady(true);
    if (!hasTableState(searchParams)) return;
    const state = decodeTableState(searchParams);
    applyConfig(urlStateToPayload(state, tableDefaults));
    setQuery(state.q);
    setShowDrafts(state.drafts);
  }, [fieldsData, searchParams, applyConfig, tableDefaults]);

  useEffect(() => {
    if (!urlReady || !fieldsData) return;
    const next = encodeTableState(
      { columns: currentPayload.columns, filters, sort, q: debouncedQ, drafts: showDrafts },
      tableDefaults,
      new URLSearchParams(window.location.search),
    );
    const current = window.location.search.replace(/^\?/, "");
    if (next === current) return;
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${next ? `?${next}` : ""}`);
  }, [urlReady, fieldsData, currentPayload.columns, filters, sort, debouncedQ, showDrafts, tableDefaults]);

  const viewsBusy = viewMutations.create.isPending || viewMutations.update.isPending;

  const [bulkOpen, setBulkOpen] = useState(false);

  // Selection lives in one place now: the header checkbox picks everyone up or puts everyone down,
  // and the Edit button in the topbar appears while anyone is held. The old action bar said the same
  // thing a third time and cost a row of screen.
  const bulkTarget: BulkEditTarget = bulkTargetFor(allMatching, selectedIds, { filters, q: params.q, drafts: params.drafts });
  const heldCount = heldCountFor(allMatching, selectedIds, matchingCount);

  const onBulkApplied = useCallback(() => {
    setSelectedIds(new Set());
    setAllMatching(false);
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
          selectedCount={heldCount}
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

        {offerAllMatching ? (
          <div className="flex items-center gap-2 rounded-md border border-brown-200 bg-brown-50 px-3 py-1.5 text-xs text-muted-foreground">
            {allMatching ? (
              <>
                <span>All {matchingCount} {matchingCount === 1 ? "person" : "people"} matching are selected.</span>
                <button
                  type="button"
                  onClick={() => {
                    setAllMatching(false);
                    setSelectedIds(new Set());
                  }}
                  className="font-medium text-foreground underline-offset-2 hover:underline"
                >
                  Clear Selection
                </button>
              </>
            ) : (
              <>
                <span>All {selectedIds.size} loaded {selectedIds.size === 1 ? "person is" : "people are"} selected.</span>
                <button
                  type="button"
                  onClick={() => setAllMatching(true)}
                  className="font-medium text-foreground underline-offset-2 hover:underline"
                >
                  Select All {matchingCount} Matching
                </button>
              </>
            )}
          </div>
        ) : null}

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
        dirty={dirty}
        busy={viewsBusy}
        onApplyDefault={onApplyDefault}
        onApplyView={onApplyView}
        onSaveAs={onSaveAs}
        onUpdateActive={onUpdateActive}
        onRename={onRename}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onCopyLink={onCopyLink}
        onSaveActiveCopy={onSaveActiveCopy}
      />

      <BulkEditModal
        isOpen={bulkOpen}
        onClose={() => setBulkOpen(false)}
        target={bulkTarget}
        count={heldCount}
        fields={fieldsData ?? []}
        onApplied={onBulkApplied}
      />

      <AddPersonModal open={addPersonOpen} onCloseAction={() => setAddPersonOpen(false)} />

      <ConfirmActionModal
        isOpen={deletingView !== null}
        title="Delete View"
        description={deletingView
          ? `“${deletingView.name}” will be deleted. Anyone it is shared with loses it too.`
          : ""}
        confirmLabel="Delete"
        destructive
        isLoading={viewMutations.remove.isPending}
        errorMessage={viewMutations.remove.error ? messageForError(viewMutations.remove.error) : null}
        onCancelAction={() => setDeletingView(null)}
        onConfirmAction={confirmDelete}
      />
    </div>
  );
};

export default PeopleTableContainer;
