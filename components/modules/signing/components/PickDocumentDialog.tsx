"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Search01Icon, SignatureIcon, Tick02Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/desact/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/desact/dialog";
import { Icon } from "@/components/desact/icon";
import { Input } from "@/components/desact/input";
import { FieldError } from "@/components/desact/field-error";
import { NodRing } from "@/components/desact/nod";
import { ErrorState } from "@/components/feedback/ErrorState";
import { cn } from "@/lib/cn";
import type { SectionDocumentRow } from "@/api/modules/signing/dto";
import { useDebouncedValue } from "@/components/modules/organization/modules/profile/hooks/useDebouncedValue/useDebouncedValue";
import { useSectionDocuments } from "../hooks/useDocumentsSection";
import { FileTypeTile } from "./DocumentPieces";

/** The typed part of a name in 600, the rest 400 (D14b). */
function Highlighted({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  const at = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <span className="font-semibold">{text.slice(at, at + q.length)}</span>
      {text.slice(at + q.length)}
    </>
  );
}

/**
 * Send for signature from the Documents page, first step (documents-section D14, D14b, D14c — DS19): pick one PDF.
 * 560 wide like the Send dialog; the field is the search (the toolbar's words); a list of 48-high rows that scrolls
 * after six — checkbox, the file's tile, its name cut with …, "Person · Category" on the right; the picked row
 * accent-subtle. Only PDFs are listed (the backend's `pdfOnly`). Next is never greyed: pressed with nothing picked, the
 * list turns red and says "Pick a document." under it. Next hands the file to the Send dialog (S02).
 */
export function PickDocumentDialog({
  onCloseAction,
  onNextAction,
}: {
  onCloseAction: () => void;
  onNextAction: (row: SectionDocumentRow) => void;
}) {
  const t = useTranslations("signing");
  const tCommon = useTranslations("common");
  const [q, setQ] = React.useState("");
  const query = useDebouncedValue(q, 200);
  const [picked, setPicked] = React.useState<SectionDocumentRow | null>(null);
  const [missing, setMissing] = React.useState(false);
  const list = useSectionDocuments({ q: query, personIds: [], categoryIds: [] }, "NAME", true, { pdfOnly: true });
  // A signed copy is final and a file already out is being signed: neither can be sent again from here.
  const rows = (list.data?.pages.flatMap((p) => p.rows) ?? []).filter((r) => !r.document.signedAt);

  const next = () => {
    if (!picked) {
      setMissing(true);
      return;
    }
    onNextAction(picked);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onCloseAction()}>
      <DialogContent size="md">
        <DialogHeader className="flex-row items-center gap-3">
          <span className="grid size-10 flex-none place-items-center rounded-control bg-accent-subtle text-accent-text">
            <Icon icon={SignatureIcon} />
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <DialogTitle>{t("pick.title")}</DialogTitle>
            <DialogDescription>{t("pick.subtitle")}</DialogDescription>
          </div>
        </DialogHeader>

        <div className="relative">
          <Icon icon={Search01Icon} size="sm" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-tertiary" />
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={tCommon("actions.search")}
            aria-label={t("section.search")}
            className="h-9 w-full pl-9"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div
            role="radiogroup"
            aria-label={t("pick.subtitle")}
            aria-invalid={missing || undefined}
            className={cn(
              "max-h-[290px] min-h-12 overflow-y-auto rounded-card border",
              missing ? "border-status-declined-icon" : "border-divider",
            )}
          >
            {list.isLoading ? (
              <div className="flex h-24 items-center justify-center"><NodRing size="sm" /></div>
            ) : list.isError ? (
              <ErrorState error={list.error} compact onRetry={() => void list.refetch()} />
            ) : rows.length === 0 ? (
              <p className="px-3.5 py-4 text-body text-tertiary">{t("pick.none")}</p>
            ) : (
              rows.map((row) => {
                const on = picked?.document.id === row.document.id;
                const meta = [row.personName, row.document.categoryName].filter(Boolean).join(" · ");
                return (
                  <button
                    key={row.document.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => {
                      setPicked(row);
                      setMissing(false);
                    }}
                    className={cn(
                      "flex h-12 w-full items-center gap-3 border-b border-divider px-3.5 text-left last:border-b-0",
                      on ? "bg-accent-subtle" : "hover:bg-subtle",
                    )}
                  >
                    {/* A drawn box, not the Checkbox: that one is a <button>, and a button inside this row's button is
                        invalid HTML — React reported it as a hydration error on every open (walk of 2026-11-23). */}
                    <span
                      aria-hidden
                      data-state={on ? "checked" : "unchecked"}
                      className={cn(
                        "inline-flex size-4 shrink-0 items-center justify-center rounded-glyph border-[1.5px] border-strong bg-card text-on-accent",
                        on && "border-accent bg-accent",
                      )}
                    >
                      {on && <Icon icon={Tick02Icon} size="sm" className="size-3" strokeWidth={2.5} />}
                    </span>
                    <FileTypeTile mimeType={row.document.mimeType} name={row.document.name} />
                    <span className={cn("min-w-0 flex-1 truncate text-body font-normal", on ? "text-accent-text" : "text-primary")} title={row.document.name}>
                      <Highlighted text={row.document.name} query={query} />
                    </span>
                    <span className="flex-none text-hint whitespace-nowrap text-tertiary">{meta}</span>
                  </button>
                );
              })
            )}
            {list.hasNextPage && (
              <div className="flex justify-center py-2">
                <Button type="button" variant="ghost" size="sm" loading={list.isFetchingNextPage} onClick={() => void list.fetchNextPage()}>
                  {t("section.loadMore")}
                </Button>
              </div>
            )}
          </div>
          <FieldError>{missing ? t("pick.needOne") : null}</FieldError>
        </div>

        <DialogFooter className="items-center sm:justify-between">
          <p className="text-hint text-tertiary">{t("pick.onlyPdf")}</p>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onCloseAction}>
              {t("requests.cancel")}
            </Button>
            <Button type="button" onClick={next}>
              {t("pick.next")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
