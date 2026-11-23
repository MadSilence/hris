"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Add01Icon,
  Cancel01Icon,
  DragDropVerticalIcon,
  InformationCircleIcon,
  MailIcon,
  SearchIcon,
  SignatureIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/desact/avatar";
import { Button } from "@/components/desact/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/desact/dialog";
import { Icon } from "@/components/desact/icon";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { FieldError } from "@/components/desact/field-error";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/desact/popover";
import { FormError } from "@/components/feedback/FormError";
import { HighlightedLabel } from "@/components/ui/Combobox";
import { useSegmentResolve } from "@/components/audience/hooks/useSegmentResolve";
import { useDebouncedValue } from "@/components/modules/organization/modules/profile/hooks/useDebouncedValue/useDebouncedValue";
import { emptySegment, type UserRefDTO } from "@/models/segment/Segment";
import { ActionStatus } from "@/components/models/ActionStatus";
import { showSuccess } from "@/lib/errors/errorToast";
import { useDisplayLocale } from "@/lib/date";
import { cn } from "@/lib/cn";
import type { EnvelopeDTO, SignerInput } from "@/api/modules/signing/dto";
import { sendForSignatureAction } from "../actions";

/** One signer in a step box: a person in the company, or a guest by name and email. */
type Draft =
  | { id: string; kind: "user"; userId: string; name: string; sub: string | null; avatarUrl?: string | null }
  | { id: string; kind: "guest"; guestName: string; guestEmail: string };

const newId = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Math.random()));

/** The steps of a signing sent before, for Send again (S08e): the same people in the same boxes. */
export const stepsFrom = (envelope: EnvelopeDTO): Draft[][] => {
  const byOrder = new Map<number, Draft[]>();
  for (const s of [...envelope.signers].sort((a, b) => a.order - b.order)) {
    const draft: Draft = s.isGuest
      ? { id: newId(), kind: "guest", guestName: s.name, guestEmail: s.email ?? "" }
      : { id: newId(), kind: "user", userId: s.userId ?? "", name: s.name, sub: null };
    byOrder.set(s.order, [...(byOrder.get(s.order) ?? []), draft]);
  }
  return [...byOrder.values()];
};

const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;

/** "People partner · Vilnius" — the job and the office a picker reads from the directory's extras. */
const jobAndOffice = (u: UserRefDTO): string | null => {
  const name = (key: string) => {
    const v = u.extras?.[key] as { name?: string } | undefined;
    return v?.name ?? null;
  };
  const parts = [name("job"), name("office")].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
};

const fullName = (u: UserRefDTO) => `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email || "";

/**
 * Send for signature (documents-send-for-signature S02–S06): a title, and **who signs** in step boxes — "Add co-signer"
 * signs in the same step, "Add next signer" adds a step. A signer is somebody in the company or a guest, a name and an
 * email typed in place; a signer is dragged by its handle into another box. The word "order" is never shown. No
 * "Signs as": the label comes from a template (Q-31).
 */
export function SendForSignatureDialog({
  open,
  documentId,
  fileName,
  person,
  initialSteps,
  initialTitle,
  manager = null,
  demo = false,
  onCloseAction,
  onSentAction,
}: {
  open: boolean;
  documentId: string;
  fileName: string;
  person: { id: string; name: string; avatarUrl?: string | null };
  /** Their manager today, offered first in the picker (A7); null when they have none. */
  manager?: { id: string; name: string } | null;
  /** A demo mails only its owners: a sample person cannot get their code (B3, S3 — the note is demo only). */
  demo?: boolean;
  initialSteps?: Draft[][];
  initialTitle?: string;
  onCloseAction: () => void;
  onSentAction: (envelope: EnvelopeDTO) => void;
}) {
  const t = useTranslations("signing");
  const locale = useDisplayLocale();
  const [title, setTitle] = React.useState(initialTitle ?? fileName.replace(/\.pdf$/i, ""));
  const [steps, setSteps] = React.useState<Draft[][]>(
    initialSteps ?? [[{ id: newId(), kind: "user", userId: person.id, name: person.name, sub: null, avatarUrl: person.avatarUrl ?? null }]],
  );
  /** Where the search field stands: inside a box (co-signer) or as the next numbered step. */
  const [adding, setAdding] = React.useState<number | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const dragged = React.useRef<{ step: number; id: string } | null>(null);

  const add = (step: number, draft: Draft) =>
    setSteps((current) => {
      const next = current.map((s) => [...s]);
      if (step >= next.length) next.push([draft]);
      else next[step].push(draft);
      return next;
    });

  const remove = (step: number, id: string) =>
    setSteps((current) => current.map((s, i) => (i === step ? s.filter((d) => d.id !== id) : s)).filter((s) => s.length > 0));

  const move = (from: { step: number; id: string }, to: number) =>
    setSteps((current) => {
      if (from.step === to) return current;
      const draft = current[from.step]?.find((d) => d.id === from.id);
      if (!draft) return current;
      const next = current.map((s, i) => (i === from.step ? s.filter((d) => d.id !== from.id) : [...s]));
      if (to >= next.length) next.push([draft]);
      else next[to].push(draft);
      return next.filter((s) => s.length > 0);
    });

  const update = (step: number, id: string, patch: Partial<{ guestName: string; guestEmail: string }>) =>
    setSteps((current) =>
      current.map((s, i) => (i === step ? s.map((d) => (d.id === id && d.kind === "guest" ? { ...d, ...patch } : d)) : s)),
    );

  const subOf = (d: Extract<Draft, { kind: "user" }>) =>
    d.userId === person.id ? t("send.person") : manager && d.userId === manager.id ? t("send.theirManager") : d.sub;

  const taken = new Set(steps.flat().flatMap((d) => (d.kind === "user" ? [d.userId] : [])));

  const submit = async () => {
    const problems: Record<string, string> = {};
    const signers: SignerInput[] = [];
    steps.forEach((step, i) =>
      step.forEach((d) => {
        if (d.kind === "guest") {
          if (!d.guestName.trim()) problems[`${d.id}:name`] = t("send.enterName");
          if (!/^\S+@\S+\.\S+$/.test(d.guestEmail.trim())) problems[`${d.id}:email`] = t("send.enterEmail");
          signers.push({ guestName: d.guestName.trim(), guestEmail: d.guestEmail.trim(), order: i + 1 });
        } else {
          signers.push({ userId: d.userId, order: i + 1 });
        }
      }),
    );
    setErrors(problems);
    if (signers.length === 0) {
      setFormError(t("send.needSigner"));
      return;
    }
    if (Object.keys(problems).length > 0) return;
    setBusy(true);
    setFormError(null);
    const result = await sendForSignatureAction({ documentId, title: title.trim() || null, signers });
    setBusy(false);
    if (result.status !== ActionStatus.SUCCESS || !result.data) {
      setFormError(result.errorMessage ?? null);
      return;
    }
    // S4: who signs first, by first name — "Sent for signature. Meryem signs first".
    const first = (steps[0] ?? []).map((d) => firstName(d.kind === "user" ? d.name : d.guestName));
    const names = new Intl.ListFormat(locale, { type: "conjunction" }).format(first);
    showSuccess(first.length ? t("send.sentFirst", { names, count: first.length }) : t("send.sent"));
    onSentAction(result.data);
  };

  const stepNumber = (n: number) => (
    <span className="mt-2 flex size-6 shrink-0 items-center justify-center rounded-pill bg-accent-subtle text-hint font-semibold text-accent-text">
      {n}
    </span>
  );

  const dropProps = (step: number) => ({
    onDragOver: (e: React.DragEvent) => {
      if (dragged.current) e.preventDefault();
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      if (dragged.current) move(dragged.current, step);
      dragged.current = null;
    },
  });

  const search = (step: number) => (
    <SignerSearch
      manager={manager && !taken.has(manager.id) ? manager : null}
      exclude={taken}
      onCancelAction={() => setAdding(null)}
      onPickAction={(draft) => {
        add(step, draft);
        setAdding(null);
      }}
    />
  );

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCloseAction()}>
      <DialogContent className="gap-5 sm:max-w-[680px]" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-start gap-3 pr-8">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-accent-subtle text-accent-text">
              <Icon icon={SignatureIcon} />
            </span>
            <div className="min-w-0">
              <DialogTitle>{t("send.title")}</DialogTitle>
              <DialogDescription className="truncate">{t("send.subtitle", { file: fileName, person: person.name })}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="signing-title">{t("send.titleLabel")}</Label>
            <Input id="signing-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <p className="text-hint text-tertiary">{t("send.titleHint")}</p>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-label text-primary">{t("send.whoSigns")}</p>
            {steps.map((step, i) => (
              <div key={i} className="flex gap-3" {...dropProps(i)}>
                {stepNumber(i + 1)}
                <div className="flex min-w-0 flex-1 flex-col rounded-card border border-divider px-3 pb-2.5 pt-1.5">
                  {step.map((d) => (
                    <div key={d.id} className="flex min-h-11 items-center gap-2.5 border-b border-divider py-1">
                      <span
                        draggable
                        aria-label={t("send.drag")}
                        title={t("send.drag")}
                        onDragStart={(e) => {
                          dragged.current = { step: i, id: d.id };
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onDragEnd={() => {
                          dragged.current = null;
                        }}
                        className="flex shrink-0 cursor-grab text-disabled"
                      >
                        <Icon icon={DragDropVerticalIcon} size="sm" />
                      </span>
                      {d.kind === "user" ? (
                        <>
                          <Avatar className="size-6 shrink-0">
                            {d.avatarUrl ? <AvatarImage src={d.avatarUrl} alt="" /> : null}
                            <AvatarFallback name={d.name} />
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-body font-medium text-primary">{d.name}</p>
                            {subOf(d) && <p className="truncate text-hint text-tertiary">{subOf(d)}</p>}
                          </div>
                        </>
                      ) : (
                        <div className="grid min-w-0 flex-1 grid-cols-2 gap-2 py-1">
                          <div>
                            <Input
                              aria-label={t("send.guestName")}
                              placeholder={t("send.guestName")}
                              value={d.guestName}
                              aria-invalid={errors[`${d.id}:name`] ? true : undefined}
                              onChange={(e) => update(i, d.id, { guestName: e.target.value })}
                            />
                            <FieldError>{errors[`${d.id}:name`]}</FieldError>
                          </div>
                          <div>
                            <Input
                              type="email"
                              aria-label={t("send.guestEmail")}
                              placeholder={t("send.emailPlaceholder")}
                              value={d.guestEmail}
                              aria-invalid={errors[`${d.id}:email`] ? true : undefined}
                              onChange={(e) => update(i, d.id, { guestEmail: e.target.value })}
                            />
                            <FieldError>{errors[`${d.id}:email`]}</FieldError>
                          </div>
                        </div>
                      )}
                      <Button type="button" variant="ghost" size="icon-sm" aria-label={t("send.remove")} onClick={() => remove(i, d.id)}>
                        <Icon icon={Cancel01Icon} size="sm" />
                      </Button>
                    </div>
                  ))}
                  {adding === i ? (
                    <div className="pt-2">{search(i)}</div>
                  ) : (
                    <AddLink label={t("send.addCoSigner")} onClick={() => setAdding(i)} />
                  )}
                </div>
              </div>
            ))}
            {adding === steps.length ? (
              <div className="flex gap-3">
                {stepNumber(steps.length + 1)}
                <div className="flex-1 rounded-card border border-divider px-3 py-1.5">{search(steps.length)}</div>
              </div>
            ) : (
              <div className="pl-9" {...dropProps(steps.length)}>
                <AddLink label={t("send.addNextSigner")} onClick={() => setAdding(steps.length)} />
              </div>
            )}
          </div>

          {demo && <p className="rounded-control bg-subtle px-3 py-2 text-hint text-secondary">{t("send.demoNote")}</p>}
          <FormError message={formError} />
          <DialogFooter className="items-center sm:justify-between">
            <p className="flex max-w-[280px] items-start gap-2 text-hint text-tertiary">
              <Icon icon={InformationCircleIcon} size="sm" className="shrink-0" />
              <span>{t("send.hint")}</span>
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={onCloseAction}>
                {t("send.cancel")}
              </Button>
              <Button type="submit" loading={busy}>
                {t("send.send")}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-2.5 inline-flex w-fit items-center gap-1.5 rounded-control text-label text-accent-text hover:underline"
    >
      <Icon icon={Add01Icon} size="sm" className="size-3.5" />
      {label}
    </button>
  );
}

/**
 * S03: the field is the search — "Find a person" — and the menu under it: their manager first, then people with their
 * job and office, then someone outside the company. Escape or a click outside closes it.
 */
function SignerSearch({
  manager,
  exclude,
  onPickAction,
  onCancelAction,
}: {
  manager: { id: string; name: string } | null;
  exclude: Set<string>;
  onPickAction: (draft: Draft) => void;
  onCancelAction: () => void;
}) {
  const t = useTranslations("signing");
  const [query, setQuery] = React.useState("");
  const debounced = useDebouncedValue(query, 250);
  const segment = React.useMemo(() => emptySegment(), []);
  const { items, isLoading } = useSegmentResolve(segment, true, debounced, ["job", "office"]);
  const people = items.filter((u) => !exclude.has(u.id)).slice(0, 6);
  const q = query.trim().toLocaleLowerCase();
  const showManager = manager && (!q || manager.name.toLocaleLowerCase().includes(q));

  const row = "flex w-full items-center gap-2.5 rounded-control px-2.5 py-1 text-left min-h-11 hover:bg-accent-subtle";
  const keep = (e: React.MouseEvent) => e.preventDefault();

  return (
    <Popover open onOpenChange={(next) => !next && onCancelAction()}>
      <PopoverAnchor asChild>
        <div className="flex h-9 items-center gap-2 rounded-control border border-field bg-card px-3 focus-within:border-accent focus-within:shadow-focus">
          <Icon icon={SearchIcon} size="sm" className="shrink-0 text-tertiary" />
          <input
            autoFocus
            value={query}
            placeholder={t("send.findPerson")}
            aria-label={t("send.findPerson")}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                onCancelAction();
              }
            }}
            className="min-w-0 flex-1 bg-transparent text-body text-primary outline-none placeholder:text-tertiary"
          />
        </div>
      </PopoverAnchor>
      <PopoverContent
        align="start"
        className="w-[440px] p-1"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {showManager && (
          <button type="button" onMouseDown={keep} className={row}
            onClick={() => onPickAction({ id: newId(), kind: "user", userId: manager.id, name: manager.name, sub: t("send.theirManager") })}>
            <span className="flex size-7 shrink-0 items-center justify-center rounded-pill bg-mist text-secondary">
              <Icon icon={UserIcon} size="sm" />
            </span>
            <span className="min-w-0">
              <span className="block text-body font-medium text-primary">{t("send.theirManager")}</span>
              <span className="block truncate text-hint text-tertiary">{manager.name}</span>
            </span>
          </button>
        )}
        <p className="px-2.5 pb-1 pt-2 text-hint font-medium text-tertiary">{t("send.people")}</p>
        {!isLoading && people.length === 0 && q && (
          <p className="px-2.5 py-2 text-body text-tertiary">{t("send.noOneCalled", { query: query.trim() })}</p>
        )}
        <div className="max-h-56 overflow-y-auto">
          {people.map((u) => {
            const name = fullName(u);
            const sub = jobAndOffice(u);
            return (
              <button key={u.id} type="button" onMouseDown={keep} className={row}
                onClick={() => onPickAction({ id: newId(), kind: "user", userId: u.id, name, sub, avatarUrl: u.avatarUrl ?? null })}>
                <Avatar className="size-7 shrink-0">
                  {u.avatarUrl ? <AvatarImage src={u.avatarUrl} alt="" /> : null}
                  <AvatarFallback name={name} />
                </Avatar>
                <span className="min-w-0">
                  <span className="block truncate text-body font-medium text-primary"><HighlightedLabel text={name} query={query} /></span>
                  {sub && <span className="block truncate text-hint text-tertiary">{sub}</span>}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mx-1.5 my-1 h-px bg-divider" />
        <button type="button" onMouseDown={keep} className={cn(row)}
          onClick={() => onPickAction({ id: newId(), kind: "guest", guestName: "", guestEmail: "" })}>
          <span className="flex size-7 shrink-0 items-center justify-center rounded-pill bg-mist text-secondary">
            <Icon icon={MailIcon} size="sm" />
          </span>
          <span className="min-w-0">
            <span className="block text-body font-medium text-primary">{t("send.outside")}</span>
            <span className="block truncate text-hint text-tertiary">{t("send.outsideHint")}</span>
          </span>
        </button>
      </PopoverContent>
    </Popover>
  );
}
