"use client";

import { FC, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/desact/badge";
import { useReferenceOptions } from "@/components/hooks/useReferenceOptions";
import { isReferenceField, type FieldDTO, type FilterDTO } from "@/models/user/fields";
import { describeFilter } from "./describeFilters";

/**
 * One filter of the export preview. A reference filter reads its catalogue — the same cached list the
 * filter picker offered — so it says "Office is Berlin, Munich" rather than "2 selected".
 */
export const FilterBadge: FC<{ filter: FilterDTO; fields: FieldDTO[] }> = ({ filter, fields }) => {
  const t = useTranslations("attendance");
  const tAccess = useTranslations("access");
  const field = fields.find((f) => f.id === filter.field);
  const source = field && isReferenceField(field) ? field.valueSource ?? undefined : undefined;
  const { options } = useReferenceOptions(source);
  const names = useMemo(() => new Map(options.map((o) => [o.id, o.label])), [options]);

  return (
    <Badge variant="neutral" className="font-normal">
      {describeFilter(filter, fields, t, tAccess, source ? names : undefined)}
    </Badge>
  );
};
