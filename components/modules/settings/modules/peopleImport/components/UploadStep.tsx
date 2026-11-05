"use client";

import React, { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Upload01Icon, Xls01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Skeleton } from "@/components/desact/skeleton";
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
  const t = useTranslations("peopleImport");
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
      setError(t("upload.tooLarge", { maxMb: MAX_MB }));
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
      <div className="space-y-2 text-body text-secondary">
        <p>{t.rich("upload.intro", { b: (chunks) => <strong>{chunks}</strong> })}</p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-body font-medium text-primary">{t("upload.whatTitle")}</p>
        <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label={t("upload.whatAria")}>
          {offered.map((k) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={kind === k}
              onClick={() => setChosen(k)}
              className={cn(
                "rounded-card border p-4 text-left text-body transition-colors",
                kind === k ? "border-accent bg-subtle" : "border-divider hover:bg-subtle",
              )}
            >
              <span className="block font-medium text-primary">{t(IMPORT_KINDS[k].titleKey)}</span>
              <span className="mt-1 block text-tertiary">{t(IMPORT_KINDS[k].descriptionKey)}</span>
            </button>
          ))}
        </div>
        {offered.length === 0 && (
          <p className="text-body text-tertiary">{t("upload.noPermission")}</p>
        )}
      </div>

      {kind && (
        <>
          <div className="rounded-card border border-divider p-5">
            <p className="text-body font-medium text-primary">{t("upload.templateTitle")}</p>
            <p className="mt-1 text-body text-tertiary">
              {t("upload.templateHint")}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" variant="secondary" size="sm" className="gap-1.5" onClick={() => template("xlsx")}>
                <Icon icon={Xls01Icon} size="sm" />
                {t("upload.downloadXlsx")}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => template("csv")}>
                {t("upload.csvTemplate")}
              </Button>
            </div>
          </div>

          <div className="rounded-card border border-dashed border-field p-5">
            <p className="text-body font-medium text-primary">{t("upload.uploadTitle")}</p>
            <p className="mt-1 text-body text-tertiary">
              {t("upload.uploadHint", { maxMb: MAX_MB })}
            </p>
            <FormError message={error} />
            <input
              ref={input}
              type="file"
              accept=".csv,.xlsx"
              className="hidden"
              aria-label={t("upload.fileAria")}
              onChange={(e) => {
                onFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <Button type="button" className="mt-3 gap-1.5" disabled={upload.isPending} onClick={() => input.current?.click()}>
              <Icon icon={Upload01Icon} size="sm" />
              {upload.isPending ? t("upload.reading") : t("upload.chooseFile")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
