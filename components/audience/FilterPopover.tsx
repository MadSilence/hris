"use client";

import React, { useEffect, useState } from "react";
import { Filter as FilterIcon } from "lucide-react";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { Button } from "@/public/desact/src/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/public/desact/src/components/ui/popover";
import { AudienceBuilder } from "@/components/audience/AudienceBuilder";
import type { FieldDTO, FilterDTO } from "@/models/user/fields";

type Props = {
  fields: FieldDTO[];
  isLoadingFields?: boolean;
  value: FilterDTO[];
  onChange: (next: FilterDTO[]) => void;
};

/**
 * The Filter button of a list of people: the People table's builder and DSL in a popover, applied on
 * Apply, with the number of rows in force on the button.
 *
 * The People table and the calendar board each draw this by hand, identically; this is the shared
 * form, and the Attendance overview is its first user. The other two move to it when they are next
 * touched (`technical_documentation/ui/README.md`: one answer per question, in a shared component).
 * Field access is enforced under the seam — filtering on a field you cannot read is a way of reading it.
 */
export const FilterPopover: React.FC<Props> = ({ fields, isLoadingFields, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FilterDTO[]>(value);
  const [seed, setSeed] = useState(0);

  // Re-seeding the builder on open discards a half-typed row from the previous visit.
  useEffect(() => {
    if (open) {
      setDraft(value);
      setSeed((s) => s + 1);
    }
  }, [open, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="h-9 gap-1.5">
          <FilterIcon className="h-4 w-4"/>
          Filter
          {value.length > 0 ? (
            <Badge variant="secondary" className="ml-1 px-1.5">{value.length}</Badge>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[660px] max-w-[92vw] p-3">
        <AudienceBuilder key={seed} fields={fields} isLoadingFields={isLoadingFields} value={draft} onChange={setDraft}/>
        <div className="mt-3 flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => setDraft([])}>Reset</Button>
          <Button type="button"
            size="sm"
            onClick={() => {
              onChange(draft);
              setOpen(false);
            }}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
