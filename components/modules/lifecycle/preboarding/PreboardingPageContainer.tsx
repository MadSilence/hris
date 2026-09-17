"use client";

import React, { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { Checkbox } from "@/public/desact/src/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/public/desact/src/components/ui/select";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { DatePicker } from "@/components/ui/DatePicker";
import { FormError } from "@/components/feedback/FormError";
import { ActionStatus } from "@/components/models/ActionStatus";
import { formatDisplayDate } from "@/lib/date";
import {
  preboardingCompleteAction,
  preboardingDocumentAction,
  preboardingFieldsAction,
} from "@/components/modules/lifecycle/actions/preboardingActions";
import { TASK_KIND_LABELS, describeDue, type PreboardingPage } from "@/models/lifecycle";

type PageTask = PreboardingPage["tasks"][number];
type PageField = NonNullable<PageTask["fields"]>[number];

/**
 * The joiner's preboarding page: their own tasks and nothing else — no people, no organisation
 * (design § 5.2). Each action answers with the page as it now is.
 */
export function PreboardingPageContainer({ token, initialPage }: { token: string; initialPage: PreboardingPage }) {
  const [page, setPage] = useState(initialPage);
  const open = page.tasks.filter((t) => t.status === "OPEN").length;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8 py-8">
      <header className="space-y-2 text-center">
        <h1 className="text-4xl font-medium">{page.firstName ? `Welcome, ${page.firstName}` : "Welcome"}</h1>
        <p className="text-md text-muted-foreground">
          {page.companyName ? `A few things to do before you start at ${page.companyName}` : "A few things to do before you start"}
          {page.startDate ? ` on ${formatDisplayDate(page.startDate, { style: "medium" })}` : ""}.
        </p>
        <p className="text-sm text-muted-foreground">
          {open === 0 ? "You are all done. Thank you." : `${open} of ${page.tasks.length} still to do. This link stays valid, so you can come back.`}
        </p>
      </header>

      <ul className="space-y-4">
        {page.tasks.map((task) => (
          <li key={task.id} className="space-y-3 rounded-lg border border-brown-200 p-4" data-testid="preboarding-task">
            <div className="flex items-start gap-3">
              {task.status === "DONE"
                ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-success-600" aria-label="Done" />
                : <Circle className="mt-0.5 h-5 w-5 text-muted-foreground" aria-label="To do" />}
              <div className="flex-1">
                <h2 className="font-medium">{task.title}</h2>
                <p className="text-xs text-muted-foreground">
                  {TASK_KIND_LABELS[task.kind]} · {describeDue(task.dueKind, null)}
                  {task.dueDate ? ` · by ${formatDisplayDate(task.dueDate, { style: "medium" })}` : ""}
                </p>
                {task.description && <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>}
              </div>
            </div>
            {task.status === "OPEN" && (
              <TaskBody token={token} task={task} onPageAction={setPage} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function TaskBody({ token, task, onPageAction }: { token: string; task: PageTask; onPageAction: (p: PreboardingPage) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [file, setFile] = useState<File | null>(null);

  const finish = (res: { status: ActionStatus; data?: PreboardingPage; errorMessage?: string }) => {
    if (res.status === ActionStatus.SUCCESS && res.data) onPageAction(res.data);
    else setError(res.errorMessage ?? null);
  };

  if (task.kind === "CHECKLIST") {
    return (
      <div className="space-y-2 pl-8">
        <Button
          size="sm"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setError(null);
            try { finish(await preboardingCompleteAction({ token, taskId: task.id })); } finally { setBusy(false); }
          }}
        >
          Mark Done
        </Button>
        <FormError message={error} />
      </div>
    );
  }

  if (task.kind === "DOCUMENT") {
    return (
      <div className="space-y-2 pl-8">
        <Label htmlFor={`${task.id}-file`}>{task.categoryName ? `File: ${task.categoryName}` : "File"}</Label>
        <Input id={`${task.id}-file`} type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} disabled={busy} />
        <Button
          size="sm"
          disabled={busy || !file}
          onClick={async () => {
            if (!file) return;
            setBusy(true);
            setError(null);
            const form = new FormData();
            form.set("token", token);
            form.set("taskId", task.id);
            form.set("file", file);
            try { finish(await preboardingDocumentAction(form)); } finally { setBusy(false); }
          }}
        >
          Upload
        </Button>
        <FormError message={error} />
      </div>
    );
  }

  const fields = task.fields ?? [];
  return (
    <div className="space-y-3 pl-8">
      {fields.map((f) => (
        <FieldInput key={f.id} field={f} value={values[f.id]} onChange={(v) => setValues((all) => ({ ...all, [f.id]: v }))} disabled={busy} />
      ))}
      <Button
        size="sm"
        disabled={busy || Object.keys(values).length === 0}
        onClick={async () => {
          setBusy(true);
          setError(null);
          try { finish(await preboardingFieldsAction({ token, taskId: task.id, values })); } finally { setBusy(false); }
        }}
      >
        Save
      </Button>
      <FormError message={error} />
    </div>
  );
}

/** The field kinds a person with no account may be asked for. Anything else is refused by the template. */
function FieldInput({ field, value, onChange, disabled }: {
  field: PageField; value: unknown; onChange: (v: unknown) => void; disabled: boolean;
}) {
  const id = `field-${field.id}`;
  const label = (
    <RequiredLabel htmlFor={id} required={field.isRequired}>
      {field.name}{field.isFilled ? " ✓" : ""}
    </RequiredLabel>
  );

  switch (field.type) {
    case "SELECT":
      return (
        <div className="space-y-1.5">
          {label}
          <Select value={typeof value === "string" ? value : ""} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger id={id}><SelectValue placeholder="Select…" /></SelectTrigger>
            <SelectContent>
              {field.options.map((o) => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      );
    case "MULTI_SELECT": {
      const picked = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div className="space-y-1.5">
          {label}
          {field.options.map((o) => (
            <label key={o.id} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={picked.includes(o.id)}
                disabled={disabled}
                onCheckedChange={(c) => onChange(c ? [...picked, o.id] : picked.filter((x) => x !== o.id))}
              />
              {o.label}
            </label>
          ))}
        </div>
      );
    }
    case "CHECKBOX":
      return (
        <label className="flex items-center gap-2 text-sm">
          <Checkbox id={id} checked={value === true} disabled={disabled} onCheckedChange={(c) => onChange(c === true)} />
          {field.name}{field.isFilled ? " ✓" : ""}
        </label>
      );
    case "DATE":
      return (
        <div className="space-y-1.5">
          {label}
          <DatePicker id={id} value={typeof value === "string" ? value : ""} onChange={onChange} disabled={disabled} ariaLabel={field.name} />
        </div>
      );
    default:
      return (
        <div className="space-y-1.5">
          {label}
          <Input
            id={id}
            type={field.type === "NUMBER" ? "number" : field.type === "EMAIL" ? "email" : field.type === "URL" ? "url" : field.type === "PHONE" ? "tel" : "text"}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
          />
        </div>
      );
  }
}
