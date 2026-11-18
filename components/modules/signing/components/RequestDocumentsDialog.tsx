"use client";

import * as React from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/desact/button";
import { Checkbox } from "@/components/desact/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/desact/dialog";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { Textarea } from "@/components/desact/textarea";
import { FieldError } from "@/components/desact/field-error";
import { FormError } from "@/components/feedback/FormError";
import { DatePicker } from "@/components/ui/DatePicker";
import { UserPickerField, type PickedUser } from "@/components/modules/settings/shared/UserPickerField/UserPickerField";
import { ActionStatus } from "@/components/models/ActionStatus";
import { showActionError, showSuccess } from "@/lib/errors/errorToast";
import { useDateFormatter } from "@/lib/date";
import type { DocumentDTO } from "@/api/modules/documents/dto";
import type { DocumentRequestPayload } from "@/api/modules/signing/dto";
import { requestDocumentsAction, withdrawRequestsAction } from "../actions";

/**
 * Asking for a document (documents-requests R02, R03, R06, R06b): **Request the new one** for one expiring file, or
 * **Request documents** — tick the files to replace, or "Something else" typed — then who uploads it (the person, or
 * anyone in the company), a due date and a note. One request per document; the toast's Undo withdraws them all (R04).
 */
export function RequestDocumentsDialog({
  open,
  person,
  documents,
  replacing,
  onCloseAction,
  onSentAction,
}: {
  open: boolean;
  person: { id: string; name: string };
  /** The person's documents to choose from (R06); ignored when `replacing` is given. */
  documents: DocumentDTO[];
  /** R02: the one file whose new copy is asked for. */
  replacing?: DocumentDTO | null;
  onCloseAction: () => void;
  onSentAction: () => void;
}) {
  const t = useTranslations("signing");
  const formatDate = useDateFormatter();
  const [ticked, setTicked] = React.useState<Set<string>>(new Set(replacing ? [replacing.id] : []));
  const [other, setOther] = React.useState(false);
  const [otherTitle, setOtherTitle] = React.useState("");
  const [uploader, setUploader] = React.useState<PickedUser | null>(null);
  const [due, setDue] = React.useState("");
  const [note, setNote] = React.useState(t("requests.noteDefault"));
  const [whatError, setWhatError] = React.useState<string | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const choices = replacing ? [replacing] : documents.filter((d) => !d.signedAt);

  const submit = async () => {
    const base = {
      userIds: [person.id],
      note: note.trim() || null,
      dueDate: due || null,
      uploaderId: uploader && uploader.id !== person.id ? uploader.id : null,
    };
    const payloads: DocumentRequestPayload[] = choices
      .filter((d) => ticked.has(d.id))
      .map((d) => ({ ...base, categoryId: d.categoryId, folderId: d.folderId, title: d.categoryName ?? d.name }));
    if (other && otherTitle.trim()) payloads.push({ ...base, categoryId: null, folderId: null, title: otherTitle.trim() });
    if (payloads.length === 0) {
      setWhatError(t("requests.needWhat"));
      return;
    }
    setBusy(true);
    setFormError(null);
    const r = await requestDocumentsAction(payloads);
    setBusy(false);
    if (r.status !== ActionStatus.SUCCESS || !r.data) {
      setFormError(r.errorMessage ?? null);
      return;
    }
    const taskIds = r.data.taskIds;
    toast(t("requests.sent"), {
      action: {
        label: t("requests.undo"),
        onClick: async () => {
          const back = await withdrawRequestsAction(taskIds);
          if (back.status === ActionStatus.SUCCESS) showSuccess(t("requests.withdrawn"));
          else showActionError(back);
          onSentAction();
        },
      },
    });
    onSentAction();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCloseAction()}>
      <DialogContent size={replacing ? "sm" : "md"}>
        <DialogHeader>
          <DialogTitle>{replacing ? t("requests.newOne") : t("requests.documents")}</DialogTitle>
          <DialogDescription>
            {replacing
              ? `${replacing.name}${replacing.expiresOn ? ` · ${formatDate(replacing.expiresOn, { style: "medium" })}` : ""}`
              : t("requests.from", { name: person.name })}
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          {!replacing && (
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-label text-primary">{t("requests.whatShould", { name: person.name })}</legend>
              <div className="max-h-56 overflow-auto rounded-card border border-divider">
                {choices.map((d) => (
                  <label key={d.id} className="flex cursor-pointer items-center gap-2 border-b border-divider px-3 py-2 last:border-b-0">
                    <Checkbox
                      checked={ticked.has(d.id)}
                      onCheckedChange={(on) => {
                        setWhatError(null);
                        setTicked((s) => {
                          const next = new Set(s);
                          if (on) next.add(d.id);
                          else next.delete(d.id);
                          return next;
                        });
                      }}
                    />
                    <span className="min-w-0 flex-1 truncate text-body text-primary">{d.name}</span>
                    {d.categoryName && <span className="text-hint text-tertiary">{d.categoryName}</span>}
                  </label>
                ))}
                <label className="flex cursor-pointer items-center gap-2 px-3 py-2">
                  <Checkbox checked={other} onCheckedChange={(on) => setOther(Boolean(on))} />
                  <span className="text-body text-primary">{t("requests.somethingElse")}</span>
                  <span className="text-hint text-tertiary">{t("requests.anythingNew")}</span>
                </label>
              </div>
              {other && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="request-what">{t("requests.whatDoYouNeed")}</Label>
                  <Input id="request-what" value={otherTitle} onChange={(e) => setOtherTitle(e.target.value)} />
                </div>
              )}
              <FieldError>{whatError}</FieldError>
            </fieldset>
          )}
          <div className="flex flex-col gap-1.5">
            <Label>{t("requests.who")}</Label>
            <UserPickerField value={uploader ?? { id: person.id, firstName: person.name }} onChange={setUploader} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="request-due">{t("requests.dueBy")}</Label>
            <DatePicker id="request-due" value={due} onChange={setDue} placeholder={t("requests.noDue")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="request-note">{t("requests.note")}</Label>
            <Textarea id="request-note" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <FormError message={formError} />
          <DialogFooter className="items-center sm:justify-between">
            <p className="text-hint text-tertiary">{t("requests.hint", { name: (uploader?.firstName ?? person.name).split(" ")[0] })}</p>
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
