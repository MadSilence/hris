import { useTranslations } from "next-intl";
import * as React from "react";
import { Skeleton } from "@/components/desact/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/desact/table";

/**
 * The legal entities table, waiting.
 *
 * **Same six columns, same widths, same header, same row height.** It used to be five bars at
 * `1.2fr 0.8fr 2fr 1.2fr 1fr` rendered *instead of* the table, so the header appeared out of
 * nowhere and every column moved when the rows landed — the exact defect
 * `technical_documentation/ui/TABLES_AND_LISTS.md` § 2 names.
 *
 * A skeleton is a promise about what is coming; this one keeps it.
 */
export const LegalEntitySettingsSkeleton: React.FC<{ rows?: number }> = ({ rows = 6 }) => {
  const t = useTranslations("structure.legalEntities");
  const tPlaces = useTranslations("structure.places");
  const tCommon = useTranslations("common");
  return (
  <Table className="table-fixed">
    <TableHeader className="[&_tr]:border-divider [&_tr]:border-t-0">
      <TableRow>
        <TableHead className="w-[22%]">{tCommon("fields.name")}</TableHead>
        <TableHead className="w-[13%]">{tPlaces("country")}</TableHead>
        <TableHead className="w-[13%]">{tPlaces("assignedUsers")}</TableHead>
        <TableHead className="w-[27%]">{tPlaces("address")}</TableHead>
        <TableHead className="w-[12.5%]">{t("registrationNumber")}</TableHead>
        <TableHead className="w-[12.5%]">{t("taxId")}</TableHead>
      </TableRow>
    </TableHeader>

    <TableBody>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i} className="border-divider hover:bg-transparent [&_td]:py-2">
          <TableCell className="py-3"><Skeleton className="h-4 w-3/4"/></TableCell>
          <TableCell className="py-3"><Skeleton className="h-4 w-2/3"/></TableCell>
          <TableCell className="py-3"><Skeleton className="h-4 w-1/3"/></TableCell>
          <TableCell className="py-3"><Skeleton className="h-4 w-5/6"/></TableCell>
          <TableCell className="py-3"><Skeleton className="h-4 w-2/3"/></TableCell>
          <TableCell className="py-3"><Skeleton className="h-4 w-1/2"/></TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
  );
};
