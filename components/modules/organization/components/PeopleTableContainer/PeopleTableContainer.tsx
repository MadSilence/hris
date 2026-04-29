"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

import PeopleTable from "@/components/modules/organization/components/PeopleTable/PeopleTable";
import PeopleTopbar from "@/components/modules/organization/components/PeopleTopbar/PeopleTopbar";

import { useDebouncedValue } from "@/components/modules/organization/modules/profile/hooks/useDebouncedValue";
import { Filter } from "@/components/models/filters";
import { usePeopleSearch } from "@/components/modules/organization/hooks/usePeopleSearch";
import { useUserFields } from "@/components/modules/organization/hooks/useUserFields";

const PAGE_SIZE = 100;

type SortDir = "asc" | "desc";
type SortState = { fieldId: string; dir: SortDir } | null;

type ColumnItem = {
  id: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  group?: "system" | "other";
  icon?: React.ReactNode;
};

const DEFAULT_ON = new Set(["sys:first_name", "sys:status", "sys:email", "sys:created_at", "sys:updated_at"]);

const PeopleTableContainer: React.FC = () => {
  const [cursor, setCursor] = useState<string | null>(null);
  const [prevStack, setPrevStack] = useState<string[]>([]);
  const [sort, setSort] = useState<SortState>({ fieldId: "last_name", dir: "asc" });
  const [filters, setFilters] = useState<Filter[]>([]);
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
  }, [cursor, debouncedQ, filters, sort?.fieldId, sort?.dir]);

  const { data: fieldsData, isLoading: fieldsLoading, error: fieldsError } = useUserFields();
  if (fieldsError) throw fieldsError;

  const [columns, setColumns] = useState<ColumnItem[]>([]);

  useEffect(() => {
    if (!fieldsData) return;

    const cols: ColumnItem[] = fieldsData.map((f) => ({
      id: f.id,
      label: f.label ?? f.key ?? f.id,
      checked: DEFAULT_ON.has(f.id),
      group: f.isSystem ? "system" : "other",
    }));

    const idx = cols.findIndex((c) => c.id === "sys:first_name");
    if (idx >= 0) cols[idx] = { ...cols[idx], checked: true };

    setColumns(cols);
  }, [fieldsData]);

  const onColumnsChange = useCallback((next: ColumnItem[]) => {
    setColumns(next);
    setPrevStack([]);
    setCursor(null);
  }, []);

  const selectedAttrFields = useMemo(
    () => columns.filter((c) => c.checked && c.id.startsWith("attr:")).map((c) => c.id),
    [columns]
  );

  const searchReq = useMemo(
    () => ({
      limit: PAGE_SIZE,
      cursor,
      q: qForApi ?? null,
      sortField: sort?.fieldId ?? null,
      sortDir: sort?.dir ?? null,
      selectedFields: selectedAttrFields.length ? selectedAttrFields : null,
      filters: (filters?.length ? filters : null) as any,
    }),
    [cursor, qForApi, sort?.fieldId, sort?.dir, selectedAttrFields, filters]
  );

  const { data, isLoading, error } = usePeopleSearch(searchReq as any);
  if (error) throw error;

  const items = data?.items ?? [];
  const hasNext = Boolean(data?.nextCursor);
  const hasPrev = prevStack.length > 0;

  const goNext = useCallback(() => {
    if (!data?.nextCursor) return;
    setPrevStack((s) => [...s, cursor ?? ""]);
    setCursor(data.nextCursor ?? null);
  }, [data?.nextCursor, cursor]);

  const goPrev = useCallback(() => {
    setPrevStack((s) => {
      const copy = [...s];
      const prev = copy.pop();
      setCursor(prev && prev.length ? prev : null);
      return copy;
    });
  }, []);

  const onSortChange = useCallback((next: SortState) => {
    setSort(next);
    setPrevStack([]);
    setCursor(null);
  }, []);

  const onQueryChange = useCallback((v: string) => {
    setQuery(v);
    setPrevStack([]);
    setCursor(null);
  }, []);

  const onFiltersChange = useCallback((next: Filter[]) => {
    setFilters(next);
    setPrevStack([]);
    setCursor(null);
  }, []);

  const pageInfo = useMemo(() => ({ pageSize: PAGE_SIZE, hasNext, hasPrev }), [hasNext, hasPrev]);
  const visibleColumns = useMemo(() => columns.filter((c) => c.checked), [columns]);

  return (
    <div className="py-8">
      <PeopleTopbar
        totalCount={items.length}
        selectedCount={selectedIds.size}
        query={query}
        onQueryChange={onQueryChange}
        columns={columns}
        onColumnsChange={onColumnsChange}
        filters={filters}
        onFiltersChange={onFiltersChange}
        fieldsMeta={fieldsData ?? []}
        onExport={() => {
        }}
      />

      <PeopleTable
        data={items as any}
        isLoading={isLoading || fieldsLoading}
        pageInfo={pageInfo}
        onNextPage={goNext}
        onPrevPage={goPrev}
        sort={sort}
        onSortChange={onSortChange}
        selectedIds={selectedIds}
        onToggleOne={toggleOne}
        onToggleAllOnPage={toggleAllOnPage}
        fieldsMeta={fieldsData ?? []}
        visibleColumns={visibleColumns}
      />
    </div>
  );
};

export default PeopleTableContainer;
