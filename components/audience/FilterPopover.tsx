"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { FilterHorizontalIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Badge } from "@/components/desact/badge";
import { Button } from "@/components/desact/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/desact/popover";
import { AudienceBuilder } from "@/components/audience/AudienceBuilder";
import { AppliedFilterChips } from "@/components/audience/AppliedFilterChips";
import type { FieldDTO, FilterDTO } from "@/models/user/fields";

type Props = {
  fields: FieldDTO[];
  isLoadingFields?: boolean;
  value: FilterDTO[];
  onChange: (next: FilterDTO[]) => void;
  /** The button's height: `sm` in a dense toolbar (the People table), `md` otherwise. */
  size?: "sm" | "md";
  /** The applied conditions as chips beside the button, with "+N more" and Clear all (N09c). On by default. */
  showChips?: boolean;
  /** How many chips before "+N more" — three unless a crowded toolbar asks for fewer (the calendar's, W3). */
  chipsShown?: number;
};

/**
 * The Filter button of a list of people, in the product's one filter design (`hris/design/screens/filter`): the button
 * with the number of conditions in force, the popover 620 wide (N09b) whose conditions scroll inside it while Reset and
 * Apply stay under a hairline (N09d), and the applied chips beside it (N09c). Applied on Apply.
 *
 * The People table, the calendar board and the Attendance overview all draw it from here. Field access is enforced
 * under the seam — filtering on a field you cannot read is a way of reading it.
 */
export const FilterPopover: React.FC<Props> = ({ fields, isLoadingFields, value, onChange, size = "md", showChips = true, chipsShown }) => {
  const t = useTranslations("access");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FilterDTO[]>(value);
  // Re-seeding the builder on open discards a half-typed row from the previous visit; Reset re-seeds it empty.
  const [seed, setSeed] = useState(0);

  const openWith = (next: boolean) => {
    if (next) {
      setDraft(value);
      setSeed((s) => s + 1);
    }
    setOpen(next);
  };

  const reset = () => {
    setDraft([]);
    setSeed((s) => s + 1);
  };

  return (
    <>
      <Popover open={open} onOpenChange={openWith}>
        <PopoverTrigger asChild>
          <Button type="button" variant="secondary" size={size === "sm" ? "sm" : undefined} className="gap-1.5">
            <Icon icon={FilterHorizontalIcon} size="sm" />
            {t("audience.filter.button")}
            {value.length > 0 ? (
              <Badge variant="neutral" className="ml-1 px-1.5">{value.length}</Badge>
            ) : null}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="flex max-h-[min(760px,var(--radix-popover-content-available-height))] w-[620px] max-w-[92vw] flex-col p-0"
        >
          <AudienceBuilder
            key={seed}
            fields={fields}
            isLoadingFields={isLoadingFields}
            value={draft}
            onChange={setDraft}
            actions={
              <>
                <Button type="button" variant="ghost" size="sm" onClick={reset}>{tCommon("actions.reset")}</Button>
                <Button
                  type="button"
                  size="sm"
                  className="ml-auto"
                  onClick={() => {
                    onChange(draft);
                    setOpen(false);
                  }}
                >
                  {tCommon("actions.apply")}
                </Button>
              </>
            }
          />
        </PopoverContent>
      </Popover>
      {showChips && (
        <AppliedFilterChips fields={fields} value={value} onChange={onChange} onShowAll={() => openWith(true)} showingAll={open} shown={chipsShown} />
      )}
    </>
  );
};
