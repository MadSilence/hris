"use client";

import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/desact/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/desact/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/desact/table";
import { FormError } from "@/components/feedback/FormError";
import { FieldError } from "@/components/desact/field-error";
import { messageForError } from "@/lib/errors/errorMessages";
import type {
  PeopleImportDateFormat,
  PeopleImportDecimalSeparator,
  PeopleImportDTO,
} from "@/api/modules/peopleImport/dto";
import {
  useCheckPeopleImport,
  useDiscardPeopleImport,
  useUpdatePeopleImport,
} from "@/components/modules/settings/modules/peopleImport/hooks";
import { PreviewEditor } from "./PreviewEditor";
import { IMPORT_KINDS } from "./importKinds";
import { fieldLabel } from "./fieldLabel";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

/** Radix refuses an empty value, so "not imported" has a name of its own. */
const SKIP = "__skip__";

/** Each separator shown by an example number — a format, not a word. */
const DECIMALS: { value: PeopleImportDecimalSeparator; example: string }[] = [
  { value: "DOT", example: "1,234.5" },
  { value: "COMMA", example: "1.234,5" },
];

type Props = { anImport: PeopleImportDTO };

/**
 * Step 2 and the Check (design § 3). Each column of the file is matched to a field — guessed already,
 * and our own template maps itself — then the whole file is checked. A check with errors lands back
 * here with the list under the mapping, because the fix is either here (a column mapped wrong, a date
 * format) or in the file.
 */
export const MapStep: React.FC<Props> = ({ anImport }) => {
  const t = useTranslations("peopleImport");
  const [mapping, setMapping] = useState<Record<string, string>>(anImport.mapping);
  const [dateFormat, setDateFormat] = useState<PeopleImportDateFormat>(anImport.dateFormat);
  const [decimal, setDecimal] = useState<PeopleImportDecimalSeparator>(anImport.decimalSeparator);
  const [error, setError] = useState<string | null>(null);
  const [tried, setTried] = useState(false);

  const update = useUpdatePeopleImport();
  const check = useCheckPeopleImport();
  const discard = useDiscardPeopleImport();
  const busy = update.isPending || check.isPending || discard.isPending;

  const fieldsById = useMemo(() => new Map(anImport.fields.map((f) => [f.id, f])), [anImport.fields]);
  const used = new Set(Object.values(mapping));
  const missingRequired = anImport.fields.filter((f) => f.required && !used.has(f.id));
  const checkedWithErrors = anImport.checkedAt !== null && anImport.errorRowCount > 0;

  const choose = (column: number, fieldId: string) => {
    setMapping((current) => {
      const next = { ...current };
      // A field fills one column: choosing it here takes it from wherever it was.
      for (const [key, value] of Object.entries(next)) {
        if (value === fieldId) delete next[key];
      }
      if (fieldId === SKIP) delete next[String(column)];
      else next[String(column)] = fieldId;
      return next;
    });
  };

  const onCheck = async () => {
    setTried(true);
    // What is still to match is named above the button.
    if (missingRequired.length > 0) return;
    setError(null);
    try {
      await update.mutateAsync({ id: anImport.id, body: { version: anImport.version, mapping, dateFormat, decimalSeparator: decimal } });
      await check.mutateAsync(anImport.id);
    } catch (e) {
      setError(messageForError(e));
    }
  };

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-body font-medium text-primary">{anImport.fileName}</p>
          <p className="text-hint text-tertiary">{t(IMPORT_KINDS[anImport.kind].titleKey)}</p>
          <p className="text-body text-tertiary">
            {t("map.rowsHint", { count: anImport.rowCount })}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-control border border-divider">
        <Table className="text-body">
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/2">{t("map.columnInFile")}</TableHead>
              <TableHead>{t("map.importedAs")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {anImport.headers.map((header, column) => {
              const current = mapping[String(column)] ?? SKIP;
              return (
                <TableRow key={column} className="hover:bg-transparent">
                  <TableCell className="font-medium text-primary">{header}</TableCell>
                  <TableCell>
                    <SearchableSelect
                      className="h-8 max-w-xs"
                      aria-label={t("map.fieldFor", { header })}
                      options={[
                        { value: SKIP, label: t("map.notImported") },
                        ...anImport.fields.map((field) => ({
                          value: field.id,
                          label: field.required ? t("map.requiredMark", { label: fieldLabel(t, field) }) : fieldLabel(t, field),
                        })),
                      ]}
                      value={current}
                      onChange={(value) => choose(column, value ?? SKIP)}
                      disabled={busy}
                      clearable={false}
                    />
                    {current !== SKIP && !fieldsById.has(current) && (
                      <p className="mt-1 text-hint text-status-declined-text">{t("map.notAllowed")}</p>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* A structure file has no dates and no numbers to read. */}
      {anImport.kind !== "ORG_STRUCTURE" && (
      <div className="flex flex-wrap gap-6">
        <label className="flex flex-col gap-1 text-body">
          <span className="text-secondary">{t("map.datesLabel")}</span>
          <Select value={dateFormat} onValueChange={(v) => setDateFormat(v as PeopleImportDateFormat)} disabled={busy}>
            <SelectTrigger className="h-8 w-48" aria-label={t("map.dateFormatAria")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {anImport.dateFormats.map((format) => (
                <SelectItem key={format.value} value={format.value}>{format.example}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-hint text-tertiary">{t("map.datesHint")}</span>
        </label>
        <label className="flex flex-col gap-1 text-body">
          <span className="text-secondary">{t("map.numbersLabel")}</span>
          <Select value={decimal} onValueChange={(v) => setDecimal(v as PeopleImportDecimalSeparator)} disabled={busy}>
            <SelectTrigger className="h-8 w-48" aria-label={t("map.decimalAria")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DECIMALS.map((d) => <SelectItem key={d.value} value={d.value}>{d.example}</SelectItem>)}
            </SelectContent>
          </Select>
        </label>
      </div>
      )}

      <FormError message={error} />
      {missingRequired.length > 0 && (tried ? (
        <FieldError>{t("map.stillToMatch", { fields: missingRequired.map((f) => fieldLabel(t, f)).join(", ") })}</FieldError>
      ) : (
        <p className="text-body text-tertiary">
          {t("map.stillToMatch", { fields: missingRequired.map((f) => fieldLabel(t, f)).join(", ") })}
        </p>
      ))}

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => void onCheck()} disabled={busy}>
          {check.isPending ? t("map.checking") : checkedWithErrors ? t("map.checkAgain") : t("map.checkFile")}
        </Button>
        <Button type="button"
          variant="ghost"
          disabled={busy}
          onClick={() => discard.mutate(anImport.id, { onError: (e) => setError(messageForError(e)) })}
        >
          {t("map.discard")}
        </Button>
      </div>

      {checkedWithErrors && <PreviewEditor anImport={anImport} />}
    </div>
  );
};
