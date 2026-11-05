"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Alert02Icon, Cancel01Icon, PencilEdit02Icon, Undo02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/desact/dialog";
import { Button } from "@/components/desact/button";
import { FieldError } from "@/components/desact/field-error";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { DatePicker } from "@/components/ui/DatePicker";
import { FormError } from "@/components/feedback/FormError";
import { UserPickerField, type PickedUser } from "@/components/modules/settings/shared/UserPickerField/UserPickerField";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useDateFormatter } from "@/lib/date";
import { previewStartAction, startProcessAction } from "@/components/modules/lifecycle/actions/lifecycleActions";
import { useInvalidateLifecycle, useLifecycleTemplates } from "@/components/modules/lifecycle/hooks";
import { assigneeKindText, describeDue } from "@/components/modules/lifecycle/i18n";
import {
  type ItemOverride,
  type PlannedTask,
  type ProcessType,
  type StartPreview,
  type StartProcessRequest,
} from "@/models/lifecycle";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

type Props = {
  open: boolean;
  type: ProcessType;
  userId: string;
  fullName: string;
  /** The person's line manager — the suggested onboarding manager. */
  lineManager?: { id: string; name: string } | null;
  onCloseAction: () => void;
};

type Edit = { title?: string; assignee?: PickedUser | null; removed?: boolean };

/**
 * Start a preboarding or an onboarding. Two steps, and nothing is written until the second.
 *
 * 1. Choose a template and the onboarding manager; give a hire date or an email if the person lacks one.
 * 2. **The editable summary** (design § 4.5): every task with its date and who does it. A named person
 *    who has left or has not started is flagged, and can be replaced or the task removed here.
 */
export function StartProcessModal({ open, type, userId, fullName, lineManager, onCloseAction }: Props) {
  const formatDisplayDate = useDateFormatter();
  const t = useTranslations("lifecycle");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const invalidate = useInvalidateLifecycle();
  const { data: templates, isLoading: isLoadingTemplates } = useLifecycleTemplates(type, open);

  const [step, setStep] = useState<"choose" | "review">("choose");
  const [templateId, setTemplateId] = useState("");
  const [manager, setManager] = useState<PickedUser | null>(null);
  const [hireDate, setHireDate] = useState("");
  const [email, setEmail] = useState("");
  const [preview, setPreview] = useState<StartPreview | null>(null);
  const [edits, setEdits] = useState<Record<string, Edit>>({});
  const [renaming, setRenaming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep("choose");
    setTemplateId("");
    setManager(lineManager ? { id: lineManager.id, firstName: lineManager.name } : null);
    setHireDate("");
    setEmail("");
    setPreview(null);
    setEdits({});
    setRenaming(null);
    setError(null);
    setFieldErrors({});
  }, [open, lineManager]);

  const usable = useMemo(() => (templates ?? []).filter((template) => !template.archivedAt), [templates]);

  const request = (withOverrides: boolean): StartProcessRequest => ({
    type,
    templateId,
    managerUserId: manager?.id ?? null,
    hireDate: hireDate || null,
    email: email.trim() || null,
    items: withOverrides && preview ? preview.tasks
      .filter((task) => edits[task.templateItemId])
      .map((task): ItemOverride => {
        const e = edits[task.templateItemId];
        return {
          templateItemId: task.templateItemId,
          removed: Boolean(e.removed),
          title: e.title ?? null,
          assigneeKind: e.assignee ? "SPECIFIC_USER" : null,
          assigneeUserId: e.assignee?.id ?? null,
        };
      }) : null,
  });

  const loadPreview = async () => {
    setError(null);
    setFieldErrors({});
    if (!templateId) {
      setFieldErrors({ templateId: t("start.chooseTemplate") });
      return;
    }
    setBusy(true);
    try {
      const res = await previewStartAction({ userId, body: request(false) });
      if (res.status !== ActionStatus.SUCCESS || !res.data) {
        setError(res.errorMessage ?? null);
        return;
      }
      setPreview(res.data);
      if (!res.data.hireDateRequired && !res.data.emailRequired) setStep("review");
    } finally {
      setBusy(false);
    }
  };

  const start = async () => {
    setError(null);
    setFieldErrors({});
    setBusy(true);
    try {
      const res = await startProcessAction({ userId, body: request(true) });
      if (res.status !== ActionStatus.SUCCESS || !res.data) {
        if (res.fieldErrors && Object.keys(res.fieldErrors).length > 0) {
          setFieldErrors(res.fieldErrors);
          setStep("choose");
        } else {
          setError(res.errorMessage ?? null);
        }
        return;
      }
      await invalidate();
      onCloseAction();
      router.push(`/processes/${res.data.id}`);
    } finally {
      setBusy(false);
    }
  };

  const unresolved = (task: PlannedTask) => {
    const e = edits[task.templateItemId];
    if (e?.removed) return false;
    if (e?.assignee) return false;
    return Boolean(task.assigneeProblem) || !task.assigneeUserId;
  };
  const blocking = preview?.tasks.some(unresolved) ?? false;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !busy) onCloseAction(); }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{t("start.title", { type })}</DialogTitle>
          <DialogDescription>
            {step === "choose"
              ? t("start.descriptionChoose", { name: fullName })
              : t("start.descriptionReview")}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto py-2 pr-1">
          {step === "choose" ? (
            <>
              <div className="space-y-1.5">
                <RequiredLabel htmlFor="start-template" required>{t("start.template")}</RequiredLabel>
                <SearchableSelect
                  id="start-template"
                  options={usable.map((template) => ({ value: template.id, label: template.name, hint: t("shared.taskCount", { count: template.taskCount }) }))}
                  value={templateId || null}
                  onChange={(v) => setTemplateId(v ?? "")}
                  placeholder={t("shared.selectPlaceholder")}
                  clearable={false}
                />
                {/* Only once the list has actually come back: an empty `data` while the query is in
                    flight told somebody who has templates that they have none, for as long as the
                    request took. */}
                {!isLoadingTemplates && usable.length === 0 && (
                  <p className="text-hint text-tertiary">{t("start.noTemplates", { type })}</p>
                )}
                {fieldErrors.templateId && <FieldError>{fieldErrors.templateId}</FieldError>}
              </div>

              <div className="space-y-1.5">
                <RequiredLabel required>{assigneeKindText(t, "ONBOARDING_MANAGER", type)}</RequiredLabel>
                <UserPickerField value={manager} onChange={setManager} />
                <p className="text-hint text-tertiary">{t("start.managerHint")}</p>
                {fieldErrors.managerUserId && <FieldError>{fieldErrors.managerUserId}</FieldError>}
              </div>

              {(preview?.hireDateRequired || fieldErrors.hireDate) && (
                <div className="space-y-1.5">
                  <RequiredLabel htmlFor="start-hire-date" required>{t("start.hireDate")}</RequiredLabel>
                  <DatePicker id="start-hire-date" value={hireDate} onChange={setHireDate} ariaLabel={t("start.hireDate")} />
                  <p className="text-hint text-tertiary">{t("start.hireDateHint")}</p>
                  {fieldErrors.hireDate && <FieldError>{fieldErrors.hireDate}</FieldError>}
                </div>
              )}

              {(preview?.emailRequired || fieldErrors.email) && (
                <div className="space-y-1.5">
                  <RequiredLabel htmlFor="start-email" required>{tCommon("fields.email")}</RequiredLabel>
                  <Input id="start-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <p className="text-hint text-tertiary">{t("start.emailHint")}</p>
                  {fieldErrors.email && <FieldError>{fieldErrors.email}</FieldError>}
                </div>
              )}
            </>
          ) : preview && (
            <>
              <p className="text-body">
                {t.rich("start.summary", {
                  template: preview.templateName,
                  leaving: type === "OFFBOARDING" ? "yes" : "no",
                  date: formatDisplayDate(preview.anchorDate ?? hireDate, { style: "medium" }),
                  name: preview.manager?.name ?? manager?.firstName ?? "—",
                  b: (chunks) => <span className="font-medium">{chunks}</span>,
                })}
              </p>
              <ul className="divide-y divide-divider rounded-control border border-divider">
                {preview.tasks.map((task) => {
                  const e = edits[task.templateItemId] ?? {};
                  const problem = unresolved(task);
                  const who = e.assignee ? e.assignee.firstName ?? "" : task.assigneeName ?? t("shared.nobody");
                  const kind = t(`taskKind.${task.kind}`);
                  const due = describeDue(t, task.dueKind, task.offsetDays, type);
                  const named = (text: string) => (task.assigneeName ? t("shared.namedProblem", { name: task.assigneeName, problem: text }) : text);
                  return (
                    <li key={task.templateItemId} className={`space-y-2 px-3 py-3 ${e.removed ? "opacity-60" : ""}`} data-testid="planned-task">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 space-y-1">
                          {/* The title is read as text, not only as the value of a box: the walk saw this
                              list as kinds alone (SWEEP S11). Renaming opens the box on request. */}
                          {renaming === task.templateItemId && !e.removed ? (
                            <Input
                              aria-label={t("shared.taskTitle")}
                              autoFocus
                              value={e.title ?? task.title}
                              onChange={(ev) => setEdits((all) => ({ ...all, [task.templateItemId]: { ...e, title: ev.target.value } }))}
                              onBlur={() => setRenaming(null)}
                              onKeyDown={(ev) => {
                                if (ev.key === "Enter") {
                                  ev.preventDefault();
                                  setRenaming(null);
                                }
                              }}
                            />
                          ) : (
                            <p className={`text-body font-medium ${e.removed ? "line-through" : ""}`}>
                              {(e.title ?? task.title).trim() || t("shared.untitledTask")}
                            </p>
                          )}
                          <p className="text-hint text-tertiary">
                            {task.dueDate
                              ? t("start.taskMetaDate", { kind, due, date: formatDisplayDate(task.dueDate, { style: "medium" }), name: who })
                              : t("start.taskMeta", { kind, due, name: who })}
                          </p>
                          {(task.waitsFor ?? []).filter((id) => !edits[id]?.removed).length > 0 && (
                            <p className="text-hint text-tertiary">
                              {t("start.waitsFor", {
                                names: (task.waitsFor ?? []).filter((id) => !edits[id]?.removed)
                                  .map((id) => preview.tasks.find((p) => p.templateItemId === id)?.title ?? t("shared.anotherTask")).join(", "),
                              })}
                            </p>
                          )}
                        </div>
                        {!e.removed && renaming !== task.templateItemId && (
                          <Button type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={t("start.renameTask")}
                            onClick={() => setRenaming(task.templateItemId)}
                          >
                            <Icon icon={PencilEdit02Icon} size="sm" />
                          </Button>
                        )}
                        <Button type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={e.removed ? t("start.keepTask") : t("shared.removeTask")}
                          onClick={() => setEdits((all) => ({ ...all, [task.templateItemId]: { ...e, removed: !e.removed } }))}
                        >
                          {e.removed ? <Icon icon={Undo02Icon} size="sm" /> : <Icon icon={Cancel01Icon} size="sm" />}
                        </Button>
                      </div>
                      {/* C4: said, not refused — access can be granted after the start. A new assignee is
                          checked again by the start itself. */}
                      {!e.removed && !problem && !e.assignee && task.accessProblem && (
                        <p role="status" className="flex items-center gap-1.5 text-hint text-status-pending-text">
                          <Icon icon={Alert02Icon} size="sm" />
                          {named(t("start.accessProblem", { problem: t(`accessProblem.${task.accessProblem}`) }))}
                        </p>
                      )}
                      {!e.removed && (problem || e.assignee) && (
                        <div className="space-y-1.5">
                          {problem && (
                            <p role="alert" className="flex items-center gap-1.5 text-hint text-status-pending-text">
                              <Icon icon={Alert02Icon} size="sm" />
                              {named(t("start.assigneeProblem", { problem: t(`assigneeProblem.${task.assigneeProblem ?? "MISSING"}`) }))}
                            </p>
                          )}
                          <Label className="text-hint">{t("shared.doneBy")}</Label>
                          <UserPickerField
                            value={e.assignee ?? null}
                            onChange={(u) => setEdits((all) => ({ ...all, [task.templateItemId]: { ...e, assignee: u } }))}
                          />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          <FormError message={error} />
        </div>

        <DialogFooter>
          {step === "review" && (
            <Button type="button" variant="secondary" onClick={() => setStep("choose")} disabled={busy}>{tCommon("actions.back")}</Button>
          )}
          <Button type="button" variant="secondary" onClick={onCloseAction} disabled={busy}>{tCommon("actions.cancel")}</Button>
          {step === "choose" ? (
            <Button type="button"
              onClick={() => (preview && (hireDate || !preview.hireDateRequired) && (email.trim() || !preview.emailRequired)
                ? setStep("review")
                : loadPreview())}
              disabled={busy}
            >
              {busy ? t("start.checking") : t("start.reviewTasks")}
            </Button>
          ) : (
            <Button type="button" onClick={start} disabled={busy || blocking}>{busy ? t("start.starting") : t("start.start")}</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
