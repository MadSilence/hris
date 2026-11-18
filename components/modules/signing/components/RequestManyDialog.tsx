"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/desact/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/desact/dialog";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { Textarea } from "@/components/desact/textarea";
import { FieldError } from "@/components/desact/field-error";
import { FormError } from "@/components/feedback/FormError";
import { DatePicker } from "@/components/ui/DatePicker";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useDateFormatter } from "@/lib/date";
import { useDocumentCategories } from "@/components/modules/organization/modules/profile/modules/personalDocuments/hooks/useDocumentCategories";
import type { DocumentRequestPayload, DocumentRequestResult } from "@/api/modules/signing/dto";
import { requestDocumentsAction } from "../actions";

/** Whom to ask: picked rows, or everyone the People table holds for its filters ("Select all N matching"). */
export type RequestManyTarget =
  | { kind: "ids"; userIds: string[] }
  | { kind: "segment"; filters: unknown[]; q?: string | null; drafts?: string | null };

/**
 * Request documents from many people (documents-requests R10), from the People table's selection: what to upload — a
 * category, or words — a due date and a note; then the result window — "Asked 35 people.", and who was not asked, with
 * why. Each person gets their own task, as with one.
 */
export function RequestManyDialog({
  target,
  count,
  onCloseAction,
}: {
  target: RequestManyTarget;
  /** How many the selection holds, for the title; null while the table is still counting. */
  count: number | null;
  onCloseAction: () => void;
}) {
  const t = useTranslations("signing");
  const formatDate = useDateFormatter();
  const { data: categories } = useDocumentCategories();
  const [categoryId, setCategoryId] = React.useState<string | null>(null);
  const [what, setWhat] = React.useState("");
  const [due, setDue] = React.useState("");
  const [note, setNote] = React.useState("");
  const [whatError, setWhatError] = React.useState<string | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [result, setResult] = React.useState<DocumentRequestResult | null>(null);

  const category = (categories ?? []).find((c) => c.id === categoryId) ?? null;
  const title = what.trim() || category?.name || "";

  const submit = async () => {
    if (!title) {
      setWhatError(t("requests.needWhat"));
      return;
    }
    const payload: DocumentRequestPayload = {
      ...(target.kind === "ids"
        ? { userIds: target.userIds }
        : { segment: { filters: target.filters, q: target.q ?? null, drafts: target.drafts ?? null, excludeUserIds: [], includeInactive: false } }),
      categoryId,
      title,
      note: note.trim() || null,
      dueDate: due || null,
    };
    setBusy(true);
    setFormError(null);
    const r = await requestDocumentsAction([payload]);
    setBusy(false);
    if (r.status !== ActionStatus.SUCCESS || !r.data) {
      setFormError(r.errorMessage ?? null);
      return;
    }
    setResult(r.data);
  };

  if (result) {
    const reasons = new Map<string, number>();
    result.skipped.forEach((s) => reasons.set(s.reason, (reasons.get(s.reason) ?? 0) + 1));
    return (
      <Dialog open onOpenChange={(next) => !next && onCloseAction()}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>{t("requests.many.title")}</DialogTitle>
            <DialogDescription>
              {due
                ? t("requests.many.uploadLineDue", { what: title, date: formatDate(due, { style: "medium" }) })
                : t("requests.many.uploadLine", { what: title })}
            </DialogDescription>
          </DialogHeader>
          <p className="text-body text-primary">{t("requests.many.asked", { count: result.taskIds.length })}</p>
          {result.skipped.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-body font-medium text-primary">{t("requests.many.skipped", { count: result.skipped.length })}</p>
              <ul className="flex flex-col gap-0.5">
                {[...reasons.entries()].map(([reason, n]) => (
                  <li key={reason} className="text-hint text-secondary">
                    {t("requests.many.reasonCount", {
                      reason: reason === "DRAFT" || reason === "NO_ACCESS" || reason === "NOT_FOUND" ? t(`requests.many.${reason}`) : reason,
                      count: n,
                    })}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <DialogFooter>
            <Button type="button" onClick={onCloseAction}>
              {t("requests.many.done")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={(next) => !next && onCloseAction()}>
      <DialogContent size="md">
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <DialogHeader>
            <DialogTitle>{t("requests.documents")}</DialogTitle>
            <DialogDescription>
              {count === null ? t("requests.many.fromSelected") : t("requests.many.from", { count })}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="request-many-category">{t("requests.many.category")}</Label>
            <SearchableSelect
              id="request-many-category"
              options={(categories ?? []).filter((c) => c.isActive).map((c) => ({ value: c.id, label: c.name }))}
              value={categoryId}
              onChange={(v) => {
                setCategoryId(v);
                setWhatError(null);
              }}
              placeholder={t("requests.many.noCategory")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="request-many-what">{t("requests.whatDoYouNeed")}</Label>
            <Input
              id="request-many-what"
              value={what}
              placeholder={category?.name ?? ""}
              aria-invalid={whatError ? true : undefined}
              onChange={(e) => {
                setWhat(e.target.value);
                setWhatError(null);
              }}
            />
            <FieldError>{whatError}</FieldError>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="request-many-due">{t("requests.dueBy")}</Label>
            <DatePicker id="request-many-due" value={due} onChange={setDue} placeholder={t("requests.noDue")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="request-many-note">{t("requests.note")}</Label>
            <Textarea id="request-many-note" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <FormError message={formError} />
          <DialogFooter className="items-center sm:justify-between">
            <p className="text-hint text-tertiary">{t("requests.many.hint")}</p>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={onCloseAction}>
                {t("requests.cancel")}
              </Button>
              <Button type="submit" loading={busy}>
                {t("requests.send")}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
