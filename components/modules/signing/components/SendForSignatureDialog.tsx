"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Add01Icon, Cancel01Icon, SignatureIcon, UserIcon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/desact/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/desact/dialog";
import { Icon } from "@/components/desact/icon";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { FieldError } from "@/components/desact/field-error";
import { FormError } from "@/components/feedback/FormError";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { UserPickerField, type PickedUser } from "@/components/modules/settings/shared/UserPickerField/UserPickerField";
import { ActionStatus } from "@/components/models/ActionStatus";
import { showSuccess } from "@/lib/errors/errorToast";
import type { EnvelopeDTO, SignerInput } from "@/api/modules/signing/dto";
import { sendForSignatureAction } from "../actions";

/** One signer in a step box: a person in the company, or a guest by name and email. */
type Draft =
  | { id: string; kind: "user"; userId: string; name: string; sub: string | null }
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

/**
 * Send for signature (documents-send-for-signature S02–S06): a title, and **who signs** in step boxes — "Add co-signer"
 * signs in the same step, "Add next signer" adds a step. A signer is somebody in the company or a guest, a name and an
 * email typed in place. The word "order" is never shown. No "Signs as": the label comes from a template (Q-31).
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
  person: { id: string; name: string };
  /** Their manager today, offered first in the picker (A7); null when they have none. */
  manager?: { id: string; name: string } | null;
  /** A demo mails only its owners: a sample person cannot get their code (B3). */
  demo?: boolean;
  initialSteps?: Draft[][];
  initialTitle?: string;
  onCloseAction: () => void;
  onSentAction: (envelope: EnvelopeDTO) => void;
}) {
  const t = useTranslations("signing");
  const [title, setTitle] = React.useState(initialTitle ?? fileName.replace(/\.pdf$/i, ""));
  const [steps, setSteps] = React.useState<Draft[][]>(
    initialSteps ?? [[{ id: newId(), kind: "user", userId: person.id, name: person.name, sub: null }]],
  );
  const [adding, setAdding] = React.useState<{ step: number; kind: "user" | "guest" } | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const add = (step: number, draft: Draft) =>
    setSteps((current) => {
      const next = current.map((s) => [...s]);
      if (step >= next.length) next.push([draft]);
      else next[step].push(draft);
      return next;
    });

  const remove = (step: number, id: string) =>
    setSteps((current) => current.map((s, i) => (i === step ? s.filter((d) => d.id !== id) : s)).filter((s) => s.length > 0));

  const update = (step: number, id: string, patch: Partial<{ guestName: string; guestEmail: string }>) =>
    setSteps((current) =>
      current.map((s, i) => (i === step ? s.map((d) => (d.id === id && d.kind === "guest" ? { ...d, ...patch } : d)) : s)),
    );

  const submit = async () => {
    const problems: Record<string, string> = {};
    const signers: SignerInput[] = [];
    steps.forEach((step, i) =>
      step.forEach((d) => {
        if (d.kind === "guest") {
          if (!d.guestName.trim()) problems[`${d.id}:name`] = t("send.needName");
          if (!/^\S+@\S+\.\S+$/.test(d.guestEmail.trim())) problems[`${d.id}:email`] = t("send.needEmail");
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
    showSuccess(t("send.sent"));
    onSentAction(result.data);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCloseAction()}>
      <DialogContent size="md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <span className="flex size-10 items-center justify-center rounded-control bg-accent-subtle text-accent-text">
              <Icon icon={SignatureIcon} />
            </span>
            <div>
              <DialogTitle>{t("send.title")}</DialogTitle>
              <DialogDescription>{t("send.subtitle", { file: fileName, person: person.name })}</DialogDescription>
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
              <div key={i} className="flex gap-3">
                <span className="mt-3 flex size-5 shrink-0 items-center justify-center rounded-pill bg-mist text-hint text-secondary">
                  {i + 1}
                </span>
                <div className="flex flex-1 flex-col rounded-card border border-divider">
                  {step.map((d) => (
                    <div key={d.id} className="flex items-start gap-2 border-b border-divider px-3 py-2 last:border-b-0">
                      <span className="mt-1.5 flex size-[22px] shrink-0 items-center justify-center rounded-pill bg-mist text-tertiary">
                        <Icon icon={UserIcon} size="sm" />
                      </span>
                      {d.kind === "user" ? (
                        <div className="min-w-0 flex-1 py-1">
                          <p className="truncate text-body text-primary">{d.name}</p>
                          {d.userId === person.id && <p className="text-hint text-tertiary">{t("send.person")}</p>}
                        </div>
                      ) : (
                        <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
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
                              placeholder={t("send.guestEmail")}
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
                  <AddSigner
                    manager={manager}
                    label={t("send.addCoSigner")}
                    open={adding?.step === i}
                    kind={adding?.step === i ? adding.kind : "user"}
                    onOpenAction={() => setAdding({ step: i, kind: "user" })}
                    onKindAction={(kind) => setAdding({ step: i, kind })}
                    onAddAction={(draft) => {
                      add(i, draft);
                      setAdding(null);
                    }}
                  />
                </div>
              </div>
            ))}
            <AddSigner
              manager={manager}
              label={t("send.addNextSigner")}
              standalone
              open={adding?.step === steps.length}
              kind={adding?.step === steps.length ? adding.kind : "user"}
              onOpenAction={() => setAdding({ step: steps.length, kind: "user" })}
              onKindAction={(kind) => setAdding({ step: steps.length, kind })}
              onAddAction={(draft) => {
                add(steps.length, draft);
                setAdding(null);
              }}
            />
          </div>

          {demo && <p className="rounded-control bg-subtle px-3 py-2 text-hint text-secondary">{t("send.demoNote")}</p>}
          <FormError message={formError} />
          <DialogFooter className="items-center sm:justify-between">
            <p className="text-hint text-tertiary">{t("send.hint")}</p>
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

/** "Add co-signer" inside a box, "Add next signer" under them: somebody in the company, or a guest (S03, S05). */
function AddSigner({
  manager,
  label,
  standalone,
  open,
  kind,
  onOpenAction,
  onKindAction,
  onAddAction,
}: {
  manager: { id: string; name: string } | null;
  label: string;
  standalone?: boolean;
  open: boolean;
  kind: "user" | "guest";
  onOpenAction: () => void;
  onKindAction: (kind: "user" | "guest") => void;
  onAddAction: (draft: Draft) => void;
}) {
  const t = useTranslations("signing");
  const [picked, setPicked] = React.useState<PickedUser | null>(null);
  if (!open) {
    return (
      <div className={standalone ? "pl-8" : "px-3 py-2"}>
        <Button type="button" variant="link" onClick={onOpenAction}>
          <Icon icon={Add01Icon} size="sm" />
          {label}
        </Button>
      </div>
    );
  }
  return (
    <div className={standalone ? "ml-8 flex flex-col gap-2 rounded-card border border-divider p-3" : "flex flex-col gap-2 px-3 py-2"}>
      <SegmentedControl
        options={[
          { value: "user", label: t("send.someone") },
          { value: "guest", label: t("send.guest") },
        ]}
        value={kind}
        onChange={(v) => onKindAction(v)}
      />
      {kind === "user" && manager && (
        // A7: their manager first, one click — whoever it is today.
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="justify-start"
          onClick={() => onAddAction({ id: newId(), kind: "user", userId: manager.id, name: manager.name, sub: t("send.theirManager") })}
        >
          <Icon icon={UserIcon} size="sm" />
          {t("send.theirManagerName", { name: manager.name })}
        </Button>
      )}
      {kind === "user" ? (
        <UserPickerField
          value={picked}
          placeholder={t("send.pick")}
          onChange={(user) => {
            setPicked(null);
            if (!user) return;
            const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email || "";
            onAddAction({ id: newId(), kind: "user", userId: user.id, name, sub: user.email ?? null });
          }}
        />
      ) : (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onAddAction({ id: newId(), kind: "guest", guestName: "", guestEmail: "" })}
        >
          <Icon icon={Add01Icon} size="sm" />
          {t("send.guest")}
        </Button>
      )}
    </div>
  );
}
