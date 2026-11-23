"use client";

import * as React from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Add01Icon, FileImportIcon, InformationCircleIcon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/desact/button";
import { Checkbox } from "@/components/desact/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/desact/dialog";
import { Icon } from "@/components/desact/icon";
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
import { cn } from "@/lib/cn";
import type { DocumentDTO } from "@/api/modules/documents/dto";
import type { DocumentRequestPayload } from "@/api/modules/signing/dto";
import { requestDocumentsAction, withdrawRequestsAction } from "../actions";
import { ExpiryCell } from "./ExpiryPieces";
import { FileTypeTile } from "./DocumentPieces";

const firstNameOf = (name: string) => name.trim().split(/\s+/)[0] ?? name;

/** What a file is called in a sentence — "your passport": its category, or its name without the extension. */
const whatOf = (d: DocumentDTO) => (d.categoryName ?? d.name.replace(/\.[^.]+$/, "")).toLowerCase();

const isFlagged = (d: DocumentDTO) => d.expiryState === "EXPIRING" || d.expiryState === "EXPIRED";

/**
 * Asking for a document (documents-requests R02, R03, R06, R06b): **Request the new one** for one expiring file, or
 * **Request documents** — tick the files to replace (the expiring and expired ones ticked already), or "Something else"
 * typed in its own row — then who uploads it, a due date and a note written from what is ticked until the reader edits
 * it. 560 wide, everything inside its 512 (R3). One request per document; the toast's Undo withdraws them all (R04).
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
  const choices = React.useMemo(
    () => (replacing ? [replacing] : documents.filter((d) => !d.signedAt)),
    [replacing, documents],
  );
  const [ticked, setTicked] = React.useState<Set<string>>(
    () => new Set(replacing ? [replacing.id] : documents.filter((d) => !d.signedAt && isFlagged(d)).map((d) => d.id)),
  );
  const [other, setOther] = React.useState(false);
  const [otherTitle, setOtherTitle] = React.useState("");
  const [uploader, setUploader] = React.useState<PickedUser | null>(null);
  const [due, setDue] = React.useState("");
  const [noteEdited, setNoteEdited] = React.useState(false);
  const [noteText, setNoteText] = React.useState("");
  const [whatError, setWhatError] = React.useState<string | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const firstName = firstNameOf(person.name);

  // The note follows what is ticked (R1, R3, R4) until the reader writes their own.
  const picked = choices.filter((d) => ticked.has(d.id));
  const suggested = (() => {
    if (picked.length === 1 && !other) {
      const d = picked[0];
      if (d.expiresOn && isFlagged(d)) {
        const date = formatDate(d.expiresOn, { style: "medium" });
        return d.expiryState === "EXPIRED"
          ? t("requests.noteExpired", { what: whatOf(d), date })
          : t("requests.noteExpires", { what: whatOf(d), date });
      }
      return t("requests.noteDefault");
    }
    if (picked.length === 0 && other && otherTitle.trim()) return t("requests.noteOther", { what: otherTitle.trim().toLowerCase() });
    if (picked.length + (other ? 1 : 0) > 1) return t("requests.noteMany");
    return t("requests.noteDefault");
  })();
  const note = noteEdited ? noteText : suggested;

  const uploaderFirst = uploader && uploader.id !== person.id ? firstNameOf(uploader.firstName ?? "") || firstName : firstName;

  const submit = async () => {
    const base = {
      userIds: [person.id],
      note: note.trim() || null,
      dueDate: due || null,
      uploaderId: uploader && uploader.id !== person.id ? uploader.id : null,
    };
    const payloads: DocumentRequestPayload[] = picked.map((d) => ({
      ...base,
      categoryId: d.categoryId,
      folderId: d.folderId,
      title: d.categoryName ?? d.name,
      replacesDocumentId: d.id,
    }));
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
    // R04 (R2): who it went to, and Undo in the accent.
    toast(t("requests.sentTo", { name: uploaderFirst }), {
      action: {
        label: t("requests.undo"),
        onClick: async () => {
          const back = await withdrawRequestsAction(taskIds);
          if (back.status === ActionStatus.SUCCESS) showSuccess(t("requests.withdrawnToast"));
          else showActionError(back);
          onSentAction();
        },
      },
    });
    onSentAction();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCloseAction()}>
      <DialogContent size="md">
        <DialogHeader className="min-w-0">
          <DialogTitle>{replacing ? t("requests.newOne") : t("requests.documents")}</DialogTitle>
          <DialogDescription className="truncate">
            {replacing
              ? replacing.expiresOn
                ? t("requests.fileExpires", { name: replacing.name, date: formatDate(replacing.expiresOn, { style: "medium" }) })
                : replacing.name
              : t("requests.from", { name: person.name })}
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex min-w-0 flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          {!replacing && (
            <fieldset className="flex min-w-0 flex-col gap-2">
              <legend className="mb-2 text-label font-medium text-primary">{t("requests.whatShould", { name: firstName })}</legend>
              {/* R06: the list looks like the tab — a header row, each file with its tile and its expiry. */}
              <div className="max-h-64 min-w-0 overflow-auto rounded-card border border-divider">
                <div className="flex h-9 items-center gap-3 border-b border-divider px-3 text-hint font-medium text-tertiary">
                  <span className="w-4" />
                  <span className="flex-1">{t("requests.replace")}</span>
                  <span className="w-32">{t("expiry.expires")}</span>
                </div>
                {choices.map((d) => (
                  <label key={d.id} className="flex h-12 min-w-0 cursor-pointer items-center gap-3 border-b border-divider px-3">
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
                    <FileTypeTile mimeType={d.mimeType} name={d.name} />
                    <span className="min-w-0 flex-1 truncate text-body font-medium text-primary" title={d.name}>{d.name}</span>
                    <span className="w-32 flex-none"><ExpiryCell document={d} /></span>
                  </label>
                ))}
                {/* R06b (R4): Something else is typed in its own row. */}
                <div className="flex h-12 min-w-0 items-center gap-3 px-3">
                  <Checkbox
                    aria-label={t("requests.somethingElse")}
                    checked={other}
                    onCheckedChange={(on) => {
                      setWhatError(null);
                      setOther(Boolean(on));
                    }}
                  />
                  <span className="grid size-7 flex-none place-items-center rounded-control border border-dashed border-strong text-secondary">
                    <Icon icon={Add01Icon} size="sm" />
                  </span>
                  {other ? (
                    <Input
                      autoFocus
                      aria-label={t("requests.whatDoYouNeed")}
                      className="h-8 min-w-0 flex-1"
                      value={otherTitle}
                      onChange={(e) => setOtherTitle(e.target.value)}
                    />
                  ) : (
                    <button type="button" className="flex min-w-0 flex-1 items-center gap-2 text-left" onClick={() => setOther(true)}>
                      <span className="text-body font-medium text-primary">{t("requests.somethingElse")}</span>
                      <span className="text-body text-tertiary">{t("requests.anythingNew")}</span>
                    </button>
                  )}
                </div>
              </div>
              <FieldError>{whatError}</FieldError>
            </fieldset>
          )}
          <div className="flex min-w-0 flex-col gap-1.5">
            <Label>{t("requests.who")}</Label>
            <UserPickerField value={uploader ?? { id: person.id, firstName: person.name }} onChange={setUploader} />
          </div>
          <div className="flex w-[250px] max-w-full flex-col gap-1.5">
            <Label htmlFor="request-due">
              {t("requests.dueBy")} <span className="font-normal text-tertiary">{t("expiry.optional")}</span>
            </Label>
            <DatePicker id="request-due" value={due} onChange={setDue} placeholder={t("requests.noDue")} />
          </div>
          <div className="flex min-w-0 flex-col gap-1.5">
            <Label htmlFor="request-note">{t("requests.note")}</Label>
            <Textarea
              id="request-note"
              className="h-[72px] min-h-[72px]"
              value={note}
              onChange={(e) => {
                setNoteEdited(true);
                setNoteText(e.target.value);
              }}
            />
          </div>
          <FormError message={formError} />
          <DialogFooter className="items-center gap-4 sm:justify-between">
            <p className={cn("flex max-w-[276px] items-start gap-2 text-hint text-tertiary")}>
              <Icon icon={InformationCircleIcon} size="sm" className="mt-px" />
              {t("requests.hintThey", { name: uploaderFirst })}
            </p>
            <div className="flex flex-none gap-2">
              <Button type="button" variant="secondary" onClick={onCloseAction}>
                {t("requests.cancel")}
              </Button>
              <Button type="submit" loading={busy}>
                <Icon icon={FileImportIcon} size="sm" />
                {t("requests.send")}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
