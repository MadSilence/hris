"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { ArrowDown01Icon, Clock01Icon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/desact/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/desact/dialog";
import { FieldError } from "@/components/desact/field-error";
import { Icon } from "@/components/desact/icon";
import { Input } from "@/components/desact/input";
import { NodRing } from "@/components/desact/nod";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/desact/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/desact/select";
import { Switch } from "@/components/desact/switch";
import { ConfirmCancelModal } from "@/components/ui/ConfirmCancelModal";
import { DatePicker } from "@/components/ui/DatePicker";
import { TimePicker } from "@/components/ui/TimePicker";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useCanAccess } from "@/components/auth";
import { FormError } from "@/components/feedback/FormError";
import { dateToISO } from "@/lib/date";
import type { AudienceResolved, PostType } from "@/models/hub";
import { saveHubPostAction } from "../../actions";
import { PostEditor } from "../../document";
import { unwrapHub, useAudienceResolve, useInvalidateHub, usePostEdit } from "../../hooks";
import { useCompanyName, useHubDates } from "../../shared";
import { AudienceDialog } from "../audience";
import { CoverField } from "./CoverField";
import {
  draftFromEdit,
  emptyPostDraft,
  isPostDirty,
  publishAtOf,
  toPostWrite,
  validatePost,
  validateSchedule,
  type PostDraft,
  type PostErrors,
} from "./postDraft";

type Then = "DRAFT" | "PUBLISH" | "SCHEDULE";

/** The audience's line under "Who sees it": "Everyone at {company} · {n} people", or "{n} people · …". */
const AudienceField: React.FC<{ draft: PostDraft; onOpen: () => void }> = ({ draft, onOpen }) => {
  const t = useTranslations("hub");
  const company = useCompanyName();
  const resolved = useAudienceResolve(draft.audience);
  const total = resolved.data?.total;
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-label text-secondary">{t("post.whoSees")}</span>
      <button
        type="button"
        onClick={onOpen}
        className="flex h-9 w-full items-center gap-2 rounded-control border border-field bg-card px-3 text-left text-body hover:border-strong"
      >
        <Icon icon={UserGroupIcon} size="sm" className="shrink-0 text-tertiary" />
        <span className="min-w-0 flex-1 truncate text-primary">
          {draft.audience.mode === "EVERYONE"
            ? t("audience.everyoneCount", { company, count: total ?? 0 })
            : t("audience.people", { count: total ?? 0 })}
        </span>
        {resolved.isFetching && <NodRing size="sm" />}
        <Icon icon={ArrowDown01Icon} size="sm" className="shrink-0 text-tertiary" />
      </button>
      {draft.audience.mode === "FILTER" && draft.audience.filters.length > 0 && (
        <span className="text-hint text-tertiary">{t("audience.joinLaterHint")}</span>
      )}
    </div>
  );
};

/** Schedule (CM05): a date and a time, and "Schedule for {d Mon}, {HH:mm}". */
const SchedulePopover: React.FC<{ busy: boolean; onSchedule: (publishAt: string, when: { date: string; time: string }) => void; disabled?: boolean }> = ({
  busy,
  onSchedule,
  disabled,
}) => {
  const t = useTranslations("hub");
  const dates = useHubDates();
  const [open, setOpen] = React.useState(false);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [date, setDate] = React.useState(dateToISO(tomorrow));
  const [time, setTime] = React.useState("09:00");
  const [error, setError] = React.useState<string | null>(null);
  const label = date && time ? t("post.scheduleFor", { date: dates.short(date), time: dates.time(`${date}T${time}:00`) }) : t("post.schedule");
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="secondary" className="gap-1.5" disabled={disabled}>
          <Icon icon={Clock01Icon} size="sm" />
          {t("post.schedule")}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="flex w-72 flex-col gap-3 p-3">
        <div className="flex gap-2">
          <label className="flex flex-1 flex-col gap-1 text-label text-secondary">
            {t("post.date")}
            <DatePicker value={date} onChange={setDate} min={dateToISO(new Date())} ariaLabel={t("post.date")} />
          </label>
          <label className="flex w-28 flex-col gap-1 text-label text-secondary">
            {t("post.time")}
            <TimePicker value={time} onChange={setTime} ariaLabel={t("post.time")} />
          </label>
        </div>
        {error && <FieldError>{error}</FieldError>}
        <Button
          type="button"
          loading={busy}
          onClick={() => {
            const problem = validateSchedule(date, time);
            if (problem) {
              setError(problem === "past" ? t("post.schedulePast") : t("post.scheduleRequired"));
              return;
            }
            setError(null);
            onSchedule(publishAtOf(date, time), { date: dates.short(date), time: dates.time(`${date}T${time}:00`) });
            setOpen(false);
          }}
        >
          {label}
        </Button>
      </PopoverContent>
    </Popover>
  );
};

/**
 * CM05, New post / Edit post (800 wide): the cover, the title (required), the text, who sees it, Pin to the top and
 * Notify people; Save draft, Schedule, Publish. A published post's footer is Cancel / Save changes. Closing with
 * something written asks "Discard this post?". Show on Home is not offered until the Company news widget exists
 * (Q-12).
 */
export const PostEditorDialog: React.FC<{ open: boolean; onOpenChange: (open: boolean) => void; postId: string | null }> = ({
  open,
  onOpenChange,
  postId,
}) => {
  const t = useTranslations("hub");
  const edit = usePostEdit(open ? postId : null);
  // The form asks before it lets go of something written; until it is mounted, closing is plain.
  const requestClose = React.useRef<() => void>(() => onOpenChange(false));
  React.useEffect(() => {
    if (!open) requestClose.current = () => onOpenChange(false);
  }, [open, onOpenChange]);
  return (
    <Dialog open={open} onOpenChange={(next) => !next && requestClose.current()}>
      {open && (
        <DialogContent size="lg" className="flex max-h-[90vh] flex-col gap-0 p-0" hideClose>
          {postId && edit.isLoading ? (
            <div className="flex justify-center py-16">
              <DialogTitle className="sr-only">{t("post.editTitle")}</DialogTitle>
              <NodRing />
            </div>
          ) : postId && (edit.isError || !edit.data) ? (
            <div className="p-6">
              <DialogTitle className="sr-only">{t("post.editTitle")}</DialogTitle>
              <ErrorState compact error={edit.error} onRetry={() => void edit.refetch()} />
            </div>
          ) : (
            <PostForm
              key={postId ?? "new"}
              postId={postId}
              initial={edit.data ? draftFromEdit(edit.data) : emptyPostDraft()}
              status={edit.data?.status ?? null}
              pinnedElsewhereTitle={edit.data?.pinnedElsewhereTitle ?? null}
              onClose={() => onOpenChange(false)}
              registerClose={(close) => {
                requestClose.current = close;
              }}
            />
          )}
        </DialogContent>
      )}
    </Dialog>
  );
};

/** The form itself, mounted once its post is known. */
export const PostForm: React.FC<{
  postId: string | null;
  initial: PostDraft;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | null;
  pinnedElsewhereTitle: string | null;
  onClose: () => void;
  /** Hands the dialog this form's own close, which asks first when something is written. */
  registerClose?: (close: () => void) => void;
}> = ({ postId, initial, status, pinnedElsewhereTitle, onClose, registerClose }) => {
  const t = useTranslations("hub");
  const router = useRouter();
  const invalidate = useInvalidateHub();
  const [draft, setDraft] = React.useState<PostDraft>(initial);
  const [errors, setErrors] = React.useState<PostErrors>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState<Then | null>(null);
  const [audienceOpen, setAudienceOpen] = React.useState(false);
  const [confirmDiscard, setConfirmDiscard] = React.useState(false);
  const published = status === "PUBLISHED";
  // Pinning is MANAGE (design § 5.1).
  const canPin = useCanAccess("HUB.CONTENT", "MANAGE");
  const set = <K extends keyof PostDraft>(key: K, value: PostDraft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const tryClose = () => (isPostDirty(draft, initial) ? setConfirmDiscard(true) : onClose());
  React.useEffect(() => {
    registerClose?.(tryClose);
  });

  const submit = async (then: Then, publishAt: string | null = null, when?: { date: string; time: string }) => {
    const found = validatePost(draft);
    setErrors(found);
    if (found.title) return;
    setBusy(then);
    setFormError(null);
    try {
      const { id } = unwrapHub(await saveHubPostAction({ id: postId, write: toPostWrite(draft), then: published ? "DRAFT" : then, publishAt }));
      void invalidate();
      onClose();
      if (published) toast.success(t("post.savedChanges"));
      else if (then === "DRAFT") toast.success(t("post.draftSaved"));
      else if (then === "SCHEDULE" && when) toast.success(t("post.scheduledToast", when));
      else toast.success(t("post.published"), { action: { label: t("post.view"), onClick: () => router.push(`/hub/news/${id}`) } });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : null);
    } finally {
      setBusy(null);
    }
  };

  const typeLabel = (type: PostType) =>
    type === "ANNOUNCEMENT" ? t("post.types.announcement") : type === "POLICY_UPDATE" ? t("post.types.policyUpdate") : t("post.types.event");

  return (
    <>
      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          void submit(published ? "DRAFT" : "PUBLISH");
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            tryClose();
          }
        }}
      >
        <DialogHeader className="px-6 pt-5 pb-4">
          <DialogTitle>{postId ? t("post.editTitle") : t("post.newTitle")}</DialogTitle>
          <DialogDescription className="sr-only">{postId ? t("post.editTitle") : t("post.newTitle")}</DialogDescription>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-[18px] overflow-y-auto px-6 pb-6">
          <CoverField value={draft.coverFileId} onChange={(id) => set("coverFileId", id)} />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="hub-post-title" className="text-label text-secondary">
              {t("post.title")}
            </label>
            <Input
              id="hub-post-title"
              autoFocus
              value={draft.title}
              aria-invalid={errors.title ? true : undefined}
              onChange={(e) => {
                set("title", e.target.value);
                if (errors.title) setErrors({});
              }}
              className="h-11 text-home-sentence"
            />
            <FieldError>{errors.title ? t("post.titleRequired") : null}</FieldError>
          </div>
          <div className="flex flex-col gap-1.5">
            <span id="hub-post-text" className="text-label text-secondary">
              {t("post.text")}
            </span>
            <PostEditor body={draft.body} onChange={(body) => set("body", body)} labelledBy="hub-post-text" />
          </div>
          <div className="flex flex-col gap-6 sm:flex-row">
            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <AudienceField draft={draft} onOpen={() => setAudienceOpen(true)} />
              <div className="flex gap-3">
                <label className="flex flex-1 flex-col gap-1.5 text-label text-secondary">
                  {t("post.type")}
                  <Select value={draft.type} onValueChange={(v) => set("type", v as PostType)}>
                    <SelectTrigger aria-label={t("post.type")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(["ANNOUNCEMENT", "POLICY_UPDATE", "EVENT"] as PostType[]).map((type) => (
                        <SelectItem key={type} value={type}>
                          {typeLabel(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
                {draft.type === "EVENT" && (
                  <label className="flex flex-1 flex-col gap-1.5 text-label text-secondary">
                    {t("post.eventOn")}
                    <DatePicker value={draft.eventOn ?? ""} onChange={(v) => set("eventOn", v || null)} ariaLabel={t("post.eventOn")} clearable />
                  </label>
                )}
              </div>
            </div>
            <div className="flex w-full flex-col gap-4 sm:w-[280px]">
              <div className={canPin ? "flex flex-col gap-1" : "hidden"}>
                <label className="flex items-center justify-between gap-3 text-body text-primary">
                  {t("post.pin")}
                  <Switch checked={draft.pinned} onCheckedChange={(v) => set("pinned", v)} aria-label={t("post.pin")} />
                </label>
                {draft.pinned && pinnedElsewhereTitle && (
                  <span className="text-hint text-tertiary">{t("post.unpins", { title: pinnedElsewhereTitle })}</span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className="flex items-center justify-between gap-3 text-body text-primary">
                  {t("post.notify")}
                  <Switch checked={draft.notifyPeople} onCheckedChange={(v) => set("notifyPeople", v)} aria-label={t("post.notify")} />
                </label>
                <span className="text-hint text-tertiary">{t("post.notifyHint")}</span>
              </div>
            </div>
          </div>
          <FormError message={formError} />
        </div>
        <DialogFooter className="items-center border-t border-divider px-6 py-4 sm:justify-between">
          {published ? (
            <>
              <span />
              <span className="flex gap-2">
                <Button type="button" variant="secondary" onClick={tryClose}>
                  {t("actions.cancel")}
                </Button>
                <Button type="submit" loading={busy !== null} loadingLabel={t("post.saving")}>
                  {t("post.saveChanges")}
                </Button>
              </span>
            </>
          ) : (
            <>
              <Button type="button" variant="ghost" loading={busy === "DRAFT"} disabled={busy !== null} onClick={() => void submit("DRAFT")}>
                {t("post.saveDraft")}
              </Button>
              <span className="flex gap-2">
                <SchedulePopover
                  busy={busy === "SCHEDULE"}
                  disabled={busy !== null}
                  onSchedule={(publishAt, when) => void submit("SCHEDULE", publishAt, when)}
                />
                <Button type="submit" loading={busy === "PUBLISH"} disabled={busy !== null && busy !== "PUBLISH"}>
                  {t("post.publish")}
                </Button>
              </span>
            </>
          )}
        </DialogFooter>
      </form>
      <AudienceDialog
        open={audienceOpen}
        onOpenChange={setAudienceOpen}
        subject="post"
        value={draft.audience}
        onApply={(audience: typeof draft.audience, _resolved: AudienceResolved | undefined) => set("audience", audience)}
      />
      <ConfirmCancelModal
        isOpen={confirmDiscard}
        title={t("post.discardTitle")}
        description={t("post.discardLine")}
        cancelText={t("actions.keepEditing")}
        confirmText={t("actions.discard")}
        onCancelAction={() => setConfirmDiscard(false)}
        onConfirmAction={() => {
          setConfirmDiscard(false);
          onClose();
        }}
      />
    </>
  );
};
