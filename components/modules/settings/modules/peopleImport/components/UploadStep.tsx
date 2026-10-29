"use client";

import React, { useRef, useState } from "react";
import { FileSpreadsheet, Upload } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { FormError } from "@/components/feedback/FormError";
import { messageForError } from "@/lib/errors/errorMessages";
import { cn } from "@/lib/cn";
import type { PeopleImportKind } from "@/api/modules/peopleImport/dto";
import { triggerExportDownload } from "@/components/modules/settings/shared/ExportDataModal/triggerExportDownload";
import { useImportKinds, useUploadPeopleImport } from "@/components/modules/settings/modules/peopleImport/hooks";
import { IMPORT_KINDS, KIND_ORDER } from "./importKinds";

const MAX_MB = 5;

/**
 * Step 1 (PEOPLE_IMPORT.md § 3; IMPORT_NEXT_DESIGN.md § 3.5): what is being imported, its template, the
 * upload. Only the kinds this caller may run are offered — in move-in order, because the people file
 * finds its departments only once the structure is in, and a balance needs its person.
 */
export const UploadStep: React.FC = () => {
  const input = useRef<HTMLInputElement>(null);
  const kinds = useImportKinds();
  const upload = useUploadPeopleImport();
  const [chosen, setChosen] = useState<PeopleImportKind | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (kinds.isLoading) {
    return (
      <div className="flex max-w-3xl flex-col gap-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }
  if (kinds.error) return <ErrorState error={kinds.error} onRetry={() => void kinds.refetch()} />;

  const offered = KIND_ORDER.filter((k) => (kinds.data ?? []).includes(k));
  // One kind needs no choosing.
  const kind = chosen ?? (offered.length === 1 ? offered[0] : null);

  const onFile = (file: File | undefined) => {
    if (!file || !kind) return;
    setError(null);
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`The file is larger than ${MAX_MB} MB.`);
      return;
    }
    upload.mutate({ file, kind }, { onError: (e) => setError(messageForError(e)) });
  };

  const template = (format: "xlsx" | "csv") => {
    if (!kind) return;
    void triggerExportDownload("/api/people-imports/template", format, { kind }).catch(() => undefined);
  };

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="space-y-2 text-sm text-brown-700">
        <p>
          Bring a company in from spreadsheets: its structure first, then its people, then their leave balances.
          Nothing is written until a file has no errors — the check lists every problem in every row, and you can
          fix a row right there or download the file back with an <strong>Errors</strong> column.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-brown-800">What are you importing?</p>
        <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="What are you importing">
          {offered.map((k) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={kind === k}
              onClick={() => setChosen(k)}
              className={cn(
                "rounded-lg border p-4 text-left text-sm transition-colors",
                kind === k ? "border-brown-600 bg-brown-50" : "border-brown-200 hover:bg-brown-50",
              )}
            >
              <span className="block font-medium text-brown-800">{IMPORT_KINDS[k].title}</span>
              <span className="mt-1 block text-muted-foreground">{IMPORT_KINDS[k].description}</span>
            </button>
          ))}
        </div>
        {offered.length === 0 && (
          <p className="text-sm text-muted-foreground">You do not have permission to import anything.</p>
        )}
      </div>

      {kind && (
        <>
          <div className="rounded-lg border border-brown-200 p-5">
            <p className="text-sm font-medium text-brown-800">1. Start from the template</p>
            <p className="mt-1 text-sm text-muted-foreground">
              One column per field you may fill, with lists to pick from and an Instructions sheet.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => template("xlsx")}>
                <FileSpreadsheet className="h-4 w-4" />
                Download XLSX Template
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => template("csv")}>
                CSV Template
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-dashed border-brown-300 p-5">
            <p className="text-sm font-medium text-brown-800">2. Upload the file</p>
            <p className="mt-1 text-sm text-muted-foreground">
              CSV (UTF-8) or XLSX, up to {MAX_MB} MB and 2,000 rows. Only the first sheet is read.
            </p>
            <FormError message={error} />
            <input
              ref={input}
              type="file"
              accept=".csv,.xlsx"
              className="hidden"
              aria-label="Import file"
              onChange={(e) => {
                onFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <Button type="button" className="mt-3 gap-1.5" disabled={upload.isPending} onClick={() => input.current?.click()}>
              <Upload className="h-4 w-4" />
              {upload.isPending ? "Reading the file…" : "Choose File"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
