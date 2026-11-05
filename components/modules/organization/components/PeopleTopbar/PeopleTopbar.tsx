"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Add01Icon, FilterHorizontalIcon, LayoutThreeColumnIcon, PencilEdit02Icon, Upload01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { Button } from "@/components/desact/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/desact/popover";

import { PermissionGate } from "@/components/auth/PermissionGate";
import { AudienceBuilder } from "@/components/audience/AudienceBuilder";
import { ColumnsManager } from "@/components/modules/organization/components/PeopleTopbar/components/ColumnsManager";
import type { ColumnItem } from "@/models/userTable";
import type { FieldDTO, FilterDTO } from "@/models/user/fields";
import { SearchBox } from "@/components/ui/SearchBox";
import { DraftsToggle } from "@/components/ui/DraftsToggle";
import {
  PeopleExport,
  type PeopleExportSort,
} from "@/components/modules/organization/components/PeopleTopbar/components/PeopleExport";

export type FieldMeta = Pick<FieldDTO, "id" | "key" | "label" | "type" | "isSystem" | "options" | "sortable">;

const PINNED_COLUMN_ID = "sys:first_name";

type PeopleTopbarProps = {
  query: string;
  onQueryChangeAction: (v: string) => void;
  columns: ColumnItem[];
  onColumnsChangeAction: (next: ColumnItem[]) => void;
  filters: FilterDTO[];
  onFiltersChangeAction: (next: FilterDTO[]) => void;
  fields: FieldDTO[];
  selectedCount?: number;
  onEditSelectedAction?: () => void;
  onAddPersonAction?: () => void;
  /**
   * The Drafts segment. Omitted entirely for a reader who cannot reach drafts — the count comes back
   * as zero for them, and a zero count draws nothing.
   */
  drafts?: { count: number; showing: boolean; onChange: (showDrafts: boolean) => void };
  /**
   * The table's sort, for the export: the file is in the order the table is. Optional so the topbar
   * does not own it; without it the export uses the table's default order.
   */
  sort?: PeopleExportSort;
};

export default function PeopleTopbar({
  query,
  onQueryChangeAction,
  columns,
  onColumnsChangeAction,
  filters,
  onFiltersChangeAction,
  fields,
  selectedCount = 0,
  onEditSelectedAction,
  onAddPersonAction,
  drafts,
  sort,
}: PeopleTopbarProps) {
  const t = useTranslations("organization");
  const tCommon = useTranslations("common");
  const [filterOpen, setFilterOpen] = useState(false);
  const [draft, setDraft] = useState<FilterDTO[]>(filters);
  const [seed, setSeed] = useState(0);

  useEffect(() => {
    if (filterOpen) {
      setDraft(filters);
      setSeed((s) => s + 1);
    }
  }, [filterOpen, filters]);

  const applyFilters = () => {
    onFiltersChangeAction(draft);
    setFilterOpen(false);
  };
  const resetFilters = () => setDraft([]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-page py-2">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="secondary" size="sm" className="gap-1.5">
              <Icon icon={LayoutThreeColumnIcon} size="sm" />
              {t("topbar.columns")}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-2">
            <ColumnsManager
              columns={columns}
              onChange={onColumnsChangeAction}
              pinnedId={PINNED_COLUMN_ID}
            />
          </PopoverContent>
        </Popover>

        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="secondary" size="sm" className="gap-1.5">
              <Icon icon={FilterHorizontalIcon} size="sm" />
              {t("topbar.filter")}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[660px] max-w-[92vw] p-3">
            <AudienceBuilder key={seed} fields={fields} value={draft} onChange={setDraft} />
            <div className="mt-3 flex items-center justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={resetFilters}>
                {tCommon("actions.reset")}
              </Button>
              <Button type="button" size="sm" onClick={applyFilters}>
                {tCommon("actions.apply")}
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {drafts && (
          <DraftsToggle
            count={drafts.count}
            showingDrafts={drafts.showing}
            onChange={drafts.onChange}
          />
        )}

        {/*
          * Only here while something is selected: its appearance is the signal that a selection
          * exists, which is what the "n selected" chip and the separate action bar used to say in
          * three places at once. Clearing goes through the header checkbox.
          */}
        {selectedCount > 0 ? (
          <PermissionGate resource="PEOPLE.PROFILE" action="EDIT">
            <Button type="button" size="sm" className="gap-1.5" onClick={() => onEditSelectedAction?.()}>
              <Icon icon={PencilEdit02Icon} size="sm" />
              {tCommon("actions.edit")}
            </Button>
          </PermissionGate>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SearchBox value={query} onChange={onQueryChangeAction}/>

        {/* The current view as a file — the same search, filters, segment, columns and order. */}
        <PeopleExport
          columns={columns}
          filters={filters}
          query={query}
          showingDrafts={drafts?.showing ?? false}
          sort={sort}
        />

        {/*
          * One action, and it works. The menu that stood here offered "Add manually", "Import CSV" and
          * "Invite by email" and none of the three was wired to anything. A person is added as a
          * draft; inviting them is an action on their profile.
          */}
        {/*
          * Many people at once, from a spreadsheet — a secondary action beside the primary one
          * (ACTIONS_AND_MENUS.md § 4), rather than a menu under Add Person: the menu that stood here
          * offered three actions and none of them worked, and one working button is what replaced it.
          */}
        {onAddPersonAction ? (
          <PermissionGate resource="PEOPLE.PROFILE" action="EDIT">
            <Button asChild variant="secondary" className="gap-1.5">
              <Link href="/settings/general/import">
                <Icon icon={Upload01Icon} size="sm" />
                {tCommon("actions.import")}
              </Link>
            </Button>
          </PermissionGate>
        ) : null}

        {onAddPersonAction ? (
          <PermissionGate resource="PEOPLE.PROFILE" action="EDIT">
            <Button type="button" className="gap-1.5" onClick={onAddPersonAction}>
              <Icon icon={Add01Icon} size="sm" />
              {t("addPerson.title")}
            </Button>
          </PermissionGate>
        ) : null}
      </div>
    </div>
  );
}
