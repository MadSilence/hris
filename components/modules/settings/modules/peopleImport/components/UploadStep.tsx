"use client";

import React, { useRef, useState } from "react";
import { FileSpreadsheet, Upload } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
import { FormError } from "@/components/feedback/FormError";
import { messageForError } from "@/lib/errors/errorMessages";
import { triggerExportDownload } from "@/components/modules/settings/shared/ExportDataModal/triggerExportDownload";
import { useUploadPeopleImport } from "@/components/modules/settings/modules/peopleImport/hooks";

const MAX_MB = 5;

/**
 * Step 1 (design § 3). The template first, because a file that starts from it maps itself; any other
 * CSV or XLSX is mapped by hand on the next step.
 */
export const UploadStep: React.FC = () => {
  const input = useRef<HTMLInputElement>(null);
  const upload = useUploadPeopleImport();
  const [error, setError] = useState<string | null>(null);

  const onFile = (file: File | undefined) => {
    if (!file) return;
    setError(null);
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`The file is larger than ${MAX_MB} MB.`);
      return;
    }
    upload.mutate(file, { onError: (e) => setError(messageForError(e)) });
  };

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="space-y-2 text-sm text-brown-700">
        <p>
          Bring people in from a spreadsheet — when a company moves in, or a whole team arrives at once.
          Every row becomes a new person. Nobody already here is changed: an email that already belongs to
          somebody is an error, not an update.
        </p>
        <p>
          Nothing is created until the file has no errors. The check lists every problem in every row, and
          you can download the file back with an <strong>Errors</strong> column to fix it.
        </p>
      </div>

      <div className="rounded-lg border border-brown-200 p-5">
        <p className="text-sm font-medium text-brown-800">1. Start from the template</p>
        <p className="mt-1 text-sm text-muted-foreground">
          One column per field you may fill, with lists to pick departments, offices, jobs and options from.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => void triggerExportDownload("/api/people-imports/template", "xlsx").catch(() => undefined)}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Download XLSX Template
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void triggerExportDownload("/api/people-imports/template", "csv").catch(() => undefined)}
          >
            CSV Template
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-brown-300 p-5">
        <p className="text-sm font-medium text-brown-800">2. Upload the file</p>
        <p className="mt-1 text-sm text-muted-foreground">
          CSV (UTF-8) or XLSX, up to {MAX_MB} MB and 2,000 people. Only the first sheet is read.
        </p>
        <FormError message={error} />
        <input
          ref={input}
          type="file"
          accept=".csv,.xlsx"
          className="hidden"
          aria-label="People file"
          onChange={(e) => {
            onFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <Button className="mt-3 gap-1.5" disabled={upload.isPending} onClick={() => input.current?.click()}>
          <Upload className="h-4 w-4" />
          {upload.isPending ? "Reading the file…" : "Choose File"}
        </Button>
      </div>
    </div>
  );
};
