"use client";

import { FC, useMemo } from "react";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { useReferenceOptions } from "@/components/hooks/useReferenceOptions";
import { isReferenceField, type FieldDTO, type FilterDTO } from "@/models/user/fields";
import { describeFilter } from "./describeFilters";

/**
 * One filter of the export preview. A reference filter reads its catalogue — the same cached list the
 * filter picker offered — so it says "Office is Berlin, Munich" rather than "2 selected".
 */
export const FilterBadge: FC<{ filter: FilterDTO; fields: FieldDTO[] }> = ({ filter, fields }) => {
  const field = fields.find((f) => f.id === filter.field);
  const source = field && isReferenceField(field) ? field.valueSource ?? undefined : undefined;
  const { options } = useReferenceOptions(source);
  const names = useMemo(() => new Map(options.map((o) => [o.id, o.label])), [options]);

  return (
    <Badge variant="secondary" className="font-normal">
      {describeFilter(filter, fields, source ? names : undefined)}
    </Badge>
  );
};
