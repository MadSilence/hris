"use client";

import { FC, useMemo } from "react";
import { useTranslations } from "next-intl";
import { ArrowDown01Icon, Cancel01Icon, LayoutTable01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/desact/dropdown-menu";
import { ChoiceMenuContent } from "@/components/desact/choice-menu";
import { SearchBox } from "@/components/ui/SearchBox";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { FilterPopover } from "@/components/audience/FilterPopover";
import { AppliedFilterChip } from "@/components/audience/AppliedFilterChips";
import type { AudienceField } from "@/components/audience/fieldCatalog";
import type { FieldDTO, FilterDTO } from "@/models/user/fields";
import type { CompanyCalendarGrouping } from "@/models/calendar";
import { groupingLabel } from "@/components/modules/calendar/lib/grouping";
import type { BoardScale } from "@/components/modules/calendar/lib/boardGeometry";

/**
 * The person of `?person=` as a condition (N21): "Person **Rūta Jonaitė**", the name read the way a "Manager" filter
 * reads it — through the people catalogue. Not a filter the server knows: the board shows that one person instead.
 */
export const usePersonField = (): AudienceField => {
  const t = useTranslations("calendar");
  return useMemo<AudienceField>(
    () => ({ key: "person", label: t("toolbar.person"), operators: ["eq"], valueSource: "people", group: "System" }),
    [t],
  );
};

/**
 * How many filter chips the toolbar shows before "+N more" (W3). The toolbar keeps one line at 1440: beside the 260
 * search, Filter, Today and Week / Month there is room for one chip, and a picked Group pill or the person's chip
 * takes it — so the conditions fold into "+N more" earlier here than the three of the shared rule.
 */
export const calendarChipsShown = ({ grouped, person }: { grouped: boolean; person: boolean }): number =>
  Math.max(0, 1 - (grouped ? 1 : 0) - (person ? 1 : 0));

type Props = {
  query: string;
  onQueryChange: (next: string) => void;

  fields: FieldDTO[] | undefined;
  filters: FilterDTO[];
  onFiltersChange: (next: FilterDTO[]) => void;

  /** One person's board (N21, `?person=`): their chip, which clears it. */
  person: string | null;
  onClearPerson: () => void;

  /** Null is a flat board. */
  grouping: CompanyCalendarGrouping | null;
  /** What this reader may group by — a company-wide read on the field. */
  groupingOptions: CompanyCalendarGrouping[];
  onGroupingChange: (next: CompanyCalendarGrouping | null) => void;

  scale: BoardScale;
  onScaleChange: (next: BoardScale) => void;
  onToday: () => void;
};

/**
 * The board's toolbar (N01, N09b–N09d, N21): `SearchBox` 260 × 36 · **Filter** with its applied chips · on the right
 * **Group** · **Today** · **Week / Month**. No period arrows: the board scrolls sideways without end (the owner's R5).
 */
export const CompanyCalendarToolbar: FC<Props> = ({
  query,
  onQueryChange,
  fields,
  filters,
  onFiltersChange,
  person,
  onClearPerson,
  grouping,
  groupingOptions,
  onGroupingChange,
  scale,
  onScaleChange,
  onToday,
}) => {
  const t = useTranslations("calendar");
  const tAccess = useTranslations("access");
  const tCommon = useTranslations("common");
  const personField = usePersonField();

  return (
    <div className="flex flex-none flex-wrap items-center gap-2">
      <SearchBox size="md" fullWidth className="w-[260px]" value={query} onChange={onQueryChange} />

      {/* The product's one filter (`hris/design/screens/filter`): the same builder and DSL as the people table, so
          the calendar inherits the whole operator set — custom attributes included. Field access is enforced under
          the seam: filtering on a field you cannot read is a way of reading it. */}
      <FilterPopover
        fields={fields ?? []}
        value={filters}
        onChange={onFiltersChange}
        chipsShown={calendarChipsShown({ grouped: grouping !== null, person: person !== null })}
      />

      {person ? (
        <>
          <AppliedFilterChip
            filter={{ field: "person", op: "eq", value: person }}
            field={personField}
            dto={null}
            onRemove={onClearPerson}
          />
          {filters.length === 0 ? (
            <Button type="button" variant="ghost" size="sm" onClick={onClearPerson}>
              {tAccess("audience.filter.clearAll")}
            </Button>
          ) : null}
        </>
      ) : null}

      <span className="flex-1" />

      {groupingOptions.length > 0 || grouping !== null ? (
        <GroupControl grouping={grouping} options={groupingOptions} onChange={onGroupingChange} />
      ) : null}

      <Button type="button" variant="secondary" size="sm" onClick={onToday}>
        {tCommon("values.today")}
      </Button>

      <SegmentedControl<BoardScale>
        aria-label={t("toolbar.scale")}
        fill={false}
        value={scale}
        onChange={onScaleChange}
        options={[
          { value: "week", label: t("toolbar.week") },
          { value: "month", label: t("toolbar.month") },
        ]}
      />
    </div>
  );
};

/**
 * Group (N06c, N07). Ungrouped: a ghost **Group ▾**. Grouped: a picked pill — accent-subtle, a 1 px accent ring, 32
 * high — "Group:" and the dimension in accent with ▾ (the menu), a short divider and × (ungroups). The menu opens
 * right under it, right edges aligned, 220 wide: "Group by" over None · Department · Team · Office, the picked one in
 * accent with a tick. One dimension at a time, offered only where the reader could filter by it.
 */
const GroupControl: FC<{
  grouping: CompanyCalendarGrouping | null;
  options: CompanyCalendarGrouping[];
  onChange: (next: CompanyCalendarGrouping | null) => void;
}> = ({ grouping, options, onChange }) => {
  const t = useTranslations("calendar");
  const tCommon = useTranslations("common");
  const menu = (
    <ChoiceMenuContent
      align="end"
      className="w-55"
      label={t("toolbar.groupBy")}
      options={([null, ...options] as (CompanyCalendarGrouping | null)[]).map((option) => ({
        value: option,
        label: option ? groupingLabel(t, option) : tCommon("values.none"),
      }))}
      value={grouping}
      onChange={onChange}
    />
  );

  if (grouping === null) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" className="text-secondary">
            <Icon icon={LayoutTable01Icon} size="sm" />
            {t("toolbar.group")}
            <Icon icon={ArrowDown01Icon} size="sm" />
          </Button>
        </DropdownMenuTrigger>
        {menu}
      </DropdownMenu>
    );
  }

  return (
    <span className="inline-flex h-8 items-center gap-1.5 rounded-pill bg-accent-subtle px-3 ring-1 ring-accent-ring">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="inline-flex items-center gap-1.5 text-label outline-none focus-visible:underline">
            <Icon icon={LayoutTable01Icon} size="sm" className="size-3.5 text-accent-text" />
            <span className="font-normal text-secondary">{t("toolbar.groupPicked")}</span>
            <span className="font-medium text-accent-text">{groupingLabel(t, grouping)}</span>
            <Icon icon={ArrowDown01Icon} size="sm" className="size-3.5 text-accent-text" />
          </button>
        </DropdownMenuTrigger>
        {menu}
      </DropdownMenu>
      <span aria-hidden className="h-3.5 w-px bg-accent-ring" />
      <button
        type="button"
        aria-label={t("toolbar.ungroup")}
        onClick={() => onChange(null)}
        className="flex rounded-pill text-accent-text outline-none focus-visible:shadow-focus"
      >
        <Icon icon={Cancel01Icon} size="sm" className="size-3.5" />
      </button>
    </span>
  );
};
