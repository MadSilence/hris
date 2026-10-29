"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/public/desact/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/public/desact/src/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/public/desact/src/components/ui/table";
import { FormError } from "@/components/feedback/FormError";
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
import { CheckErrors } from "./CheckErrors";

/** Radix refuses an empty value, so "not imported" has a name of its own. */
const SKIP = "__skip__";

const DECIMALS: { value: PeopleImportDecimalSeparator; label: string }[] = [
  { value: "DOT", label: "1,234.5" },
  { value: "COMMA", label: "1.234,5" },
];

type Props = { anImport: PeopleImportDTO };

/**
 * Step 2 and the Check (design § 3). Each column of the file is matched to a field — guessed already,
 * and our own template maps itself — then the whole file is checked. A check with errors lands back
 * here with the list under the mapping, because the fix is either here (a column mapped wrong, a date
 * format) or in the file.
 */
export const MapStep: React.FC<Props> = ({ anImport }) => {
  const [mapping, setMapping] = useState<Record<string, string>>(anImport.mapping);
  const [dateFormat, setDateFormat] = useState<PeopleImportDateFormat>(anImport.dateFormat);
  const [decimal, setDecimal] = useState<PeopleImportDecimalSeparator>(anImport.decimalSeparator);
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
    try {
      await update.mutateAsync({ id: anImport.id, body: { mapping, dateFormat, decimalSeparator: decimal } });
      await check.mutateAsync(anImport.id);
    } catch (e) {
      setError(messageForError(e));
    }
  };

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-brown-800">{anImport.fileName}</p>
          <p className="text-sm text-muted-foreground">
            {anImport.rowCount} {anImport.rowCount === 1 ? "row" : "rows"} · Match each column to a field, or leave it out.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-brown-200">
        <Table className="text-sm">
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/2">Column in the file</TableHead>
              <TableHead>Imported as</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {anImport.headers.map((header, column) => {
              const current = mapping[String(column)] ?? SKIP;
              return (
                <TableRow key={column} className="hover:bg-transparent">
                  <TableCell className="font-medium text-brown-800">{header}</TableCell>
                  <TableCell>
                    <Select value={current} onValueChange={(value) => choose(column, value)} disabled={busy}>
                      <SelectTrigger className="h-8 w-full max-w-xs" aria-label={`Field for ${header}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={SKIP}>Not imported</SelectItem>
                        {anImport.fields.map((field) => (
                          <SelectItem key={field.id} value={field.id}>
                            {field.header}{field.required ? " *" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {current !== SKIP && !fieldsById.has(current) && (
                      <p className="mt-1 text-xs text-danger-700">You may not import this field.</p>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-brown-700">Dates written as text</span>
          <Select value={dateFormat} onValueChange={(v) => setDateFormat(v as PeopleImportDateFormat)} disabled={busy}>
            <SelectTrigger className="h-8 w-48" aria-label="Date format">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {anImport.dateFormats.map((format) => (
                <SelectItem key={format.value} value={format.value}>{format.example}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">2026-03-04 is always read. Real date cells in XLSX need no answer.</span>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-brown-700">Numbers written as</span>
          <Select value={decimal} onValueChange={(v) => setDecimal(v as PeopleImportDecimalSeparator)} disabled={busy}>
            <SelectTrigger className="h-8 w-48" aria-label="Decimal separator">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DECIMALS.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </label>
      </div>

      <FormError message={error} />
      {missingRequired.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Still to match: {missingRequired.map((f) => f.header).join(", ")}.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => void onCheck()} disabled={busy || missingRequired.length > 0}>
          {check.isPending ? "Checking every row…" : checkedWithErrors ? "Check Again" : "Check File"}
        </Button>
        <Button type="button"
          variant="ghost"
          disabled={busy}
          onClick={() => discard.mutate(anImport.id, { onError: (e) => setError(messageForError(e)) })}
        >
          Discard Import
        </Button>
      </div>

      {checkedWithErrors && <CheckErrors anImport={anImport} mode="check" />}
    </div>
  );
};
