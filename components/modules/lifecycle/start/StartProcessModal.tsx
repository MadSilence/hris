"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TriangleAlert, Undo2, X } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/public/desact/src/components/ui/select";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { DatePicker } from "@/components/ui/DatePicker";
import { FormError } from "@/components/feedback/FormError";
import { UserPickerField, type PickedUser } from "@/components/modules/settings/shared/UserPickerField/UserPickerField";
import { ActionStatus } from "@/components/models/ActionStatus";
import { formatDisplayDate } from "@/lib/date";
import { previewStartAction, startProcessAction } from "@/components/modules/lifecycle/actions/lifecycleActions";
import { useInvalidateLifecycle, useLifecycleTemplates } from "@/components/modules/lifecycle/hooks";
import {
  ASSIGNEE_PROBLEM_LABELS,
  PROCESS_TYPE_LABELS,
  TASK_KIND_LABELS,
  describeDue,
  type ItemOverride,
  type PlannedTask,
  type ProcessType,
  type StartPreview,
  type StartProcessRequest,
} from "@/models/lifecycle";

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
  const router = useRouter();
  const invalidate = useInvalidateLifecycle();
  const { data: templates } = useLifecycleTemplates(type, open);

  const [step, setStep] = useState<"choose" | "review">("choose");
  const [templateId, setTemplateId] = useState("");
  const [manager, setManager] = useState<PickedUser | null>(null);
  const [hireDate, setHireDate] = useState("");
  const [email, setEmail] = useState("");
  const [preview, setPreview] = useState<StartPreview | null>(null);
  const [edits, setEdits] = useState<Record<string, Edit>>({});
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
    setError(null);
    setFieldErrors({});
  }, [open, lineManager]);

  const usable = useMemo(() => (templates ?? []).filter((t) => !t.archivedAt), [templates]);

  const request = (withOverrides: boolean): StartProcessRequest => ({
    type,
    templateId,
    managerUserId: manager?.id ?? null,
    hireDate: hireDate || null,
    email: email.trim() || null,
    items: withOverrides && preview ? preview.tasks
      .filter((t) => edits[t.templateItemId])
      .map((t): ItemOverride => {
        const e = edits[t.templateItemId];
        return {
          templateItemId: t.templateItemId,
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
      setFieldErrors({ templateId: "Choose a template." });
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

  const unresolved = (t: PlannedTask) => {
    const e = edits[t.templateItemId];
    if (e?.removed) return false;
    if (e?.assignee) return false;
    return Boolean(t.assigneeProblem) || !t.assigneeUserId;
  };
  const blocking = preview?.tasks.some(unresolved) ?? false;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !busy) onCloseAction(); }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Start {PROCESS_TYPE_LABELS[type]}</DialogTitle>
          <DialogDescription>
            {step === "choose"
              ? `For ${fullName}. You review every task before anything is created.`
              : "Check who does what and when. Anything marked needs a decision before the process can start."}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto py-2 pr-1">
          {step === "choose" ? (
            <>
              <div className="space-y-1.5">
                <RequiredLabel htmlFor="start-template" required>Template</RequiredLabel>
                <Select value={templateId} onValueChange={setTemplateId}>
                  <SelectTrigger id="start-template"><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {usable.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name} ({t.taskCount})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {usable.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    There are no {PROCESS_TYPE_LABELS[type].toLowerCase()} templates yet. Add one in Settings → Preboarding &amp; Onboarding.
                  </p>
                )}
                {fieldErrors.templateId && <p role="alert" className="text-xs text-destructive">{fieldErrors.templateId}</p>}
              </div>

              <div className="space-y-1.5">
                <RequiredLabel required>Onboarding Manager</RequiredLabel>
                <UserPickerField value={manager} onChange={setManager} />
                <p className="text-xs text-muted-foreground">Follows the process through. Anybody who works here can be one.</p>
                {fieldErrors.managerUserId && <p role="alert" className="text-xs text-destructive">{fieldErrors.managerUserId}</p>}
              </div>

              {(preview?.hireDateRequired || fieldErrors.hireDate) && (
                <div className="space-y-1.5">
                  <RequiredLabel htmlFor="start-hire-date" required>Hire Date</RequiredLabel>
                  <DatePicker id="start-hire-date" value={hireDate} onChange={setHireDate} ariaLabel="Hire Date" />
                  <p className="text-xs text-muted-foreground">Every task is dated from it. It is saved on the profile.</p>
                  {fieldErrors.hireDate && <p role="alert" className="text-xs text-destructive">{fieldErrors.hireDate}</p>}
                </div>
              )}

              {(preview?.emailRequired || fieldErrors.email) && (
                <div className="space-y-1.5">
                  <RequiredLabel htmlFor="start-email" required>Email</RequiredLabel>
                  <Input id="start-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <p className="text-xs text-muted-foreground">The preboarding link is sent here. It is saved on the profile.</p>
                  {fieldErrors.email && <p role="alert" className="text-xs text-destructive">{fieldErrors.email}</p>}
                </div>
              )}
            </>
          ) : preview && (
            <>
              <p className="text-sm">
                <span className="font-medium">{preview.templateName}</span> · starts{" "}
                {formatDisplayDate(preview.anchorDate ?? hireDate, { style: "medium" })} · onboarding manager{" "}
                {preview.manager?.name ?? manager?.firstName ?? "—"}
              </p>
              <ul className="divide-y divide-brown-100 rounded-md border border-brown-200">
                {preview.tasks.map((t) => {
                  const e = edits[t.templateItemId] ?? {};
                  const problem = unresolved(t);
                  return (
                    <li key={t.templateItemId} className={`space-y-2 px-3 py-3 ${e.removed ? "opacity-60" : ""}`} data-testid="planned-task">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 space-y-1">
                          <Input
                            aria-label="Task Title"
                            value={e.title ?? t.title}
                            disabled={e.removed}
                            onChange={(ev) => setEdits((all) => ({ ...all, [t.templateItemId]: { ...e, title: ev.target.value } }))}
                          />
                          <p className="text-xs text-muted-foreground">
                            {TASK_KIND_LABELS[t.kind]} · {describeDue(t.dueKind, t.offsetDays)}
                            {t.dueDate ? ` (${formatDisplayDate(t.dueDate, { style: "medium" })})` : ""} · done by{" "}
                            {e.assignee ? e.assignee.firstName : t.assigneeName ?? "nobody"}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label={e.removed ? "Keep Task" : "Remove Task"}
                          onClick={() => setEdits((all) => ({ ...all, [t.templateItemId]: { ...e, removed: !e.removed } }))}
                        >
                          {e.removed ? <Undo2 className="h-4 w-4" /> : <X className="h-4 w-4" />}
                        </Button>
                      </div>
                      {!e.removed && (problem || e.assignee) && (
                        <div className="space-y-1.5">
                          {problem && (
                            <p role="alert" className="flex items-center gap-1.5 text-xs text-warning-700">
                              <TriangleAlert className="h-3.5 w-3.5" />
                              {t.assigneeName ? `${t.assigneeName}: ` : ""}
                              {ASSIGNEE_PROBLEM_LABELS[t.assigneeProblem ?? "MISSING"]}. Choose somebody else or remove the task.
                            </p>
                          )}
                          <Label className="text-xs">Done By</Label>
                          <UserPickerField
                            value={e.assignee ?? null}
                            onChange={(u) => setEdits((all) => ({ ...all, [t.templateItemId]: { ...e, assignee: u } }))}
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
            <Button variant="outline" onClick={() => setStep("choose")} disabled={busy}>Back</Button>
          )}
          <Button variant="outline" onClick={onCloseAction} disabled={busy}>Cancel</Button>
          {step === "choose" ? (
            <Button
              onClick={() => (preview && (hireDate || !preview.hireDateRequired) && (email.trim() || !preview.emailRequired)
                ? setStep("review")
                : loadPreview())}
              disabled={busy}
            >
              {busy ? "Checking…" : "Review Tasks"}
            </Button>
          ) : (
            <Button onClick={start} disabled={busy || blocking}>{busy ? "Starting…" : "Start"}</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
