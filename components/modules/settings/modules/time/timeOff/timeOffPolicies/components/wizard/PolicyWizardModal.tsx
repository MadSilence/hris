"use client";

import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useTimeOffPolicies } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useTimeOffPolicies";
import { POLICY_COLORS, nextPolicyColor, toPolicyColor, type TagColor } from "@/lib/theme/tags";
import { useTranslations } from "next-intl";
import { ArrowLeft01Icon, ArrowRight01Icon, Calendar03Icon, CalendarLock01Icon, CheckmarkCircle02Icon, FileTextIcon, PencilEdit01Icon, Refresh01Icon, Task01Icon, UserCheck01Icon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { Icon, type IconSvgElement } from "@/components/desact/icon";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/desact/dialog";
import { Button } from "@/components/desact/button";
import { ConfirmCancelModal } from "@/components/ui/ConfirmCancelModal/ConfirmCancelModal";
import { cn } from "@/lib/cn";
import { StepRing } from "@/components/ui/Stepper";
import {
  AccrualStep,
  ApprovalsStep,
  BasicsStep,
  CarryoverStep,
  CountingStep,
  RestrictionsStep,
  EditingStep,
  EligibilityStep,
  EntitlementStep,
  RequestsStep,
  ReviewStep,
  TenureStep,
} from "./PolicyWizardSteps";
import {
  PolicyWizardValues,
  WizardStepId,
  defaultPolicyWizardValues,
  validatePolicyStep,
} from "./policyWizardTypes";
import { PolicyActionError } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/policyActionError";
import { FormError } from "@/components/feedback/FormError";
import { InlineAlert } from "@/components/desact/alert";

/** Each step's title and subtitle are `timeOff.policyWizard.steps.<id>.title|subtitle`. */
const STEPS: {
  id: WizardStepId;
  icon: IconSvgElement;
}[] = [
  { id: "basics", icon: FileTextIcon },
  { id: "entitlement", icon: CalendarLock01Icon },
  { id: "accrual", icon: Refresh01Icon },
  { id: "carryover", icon: Refresh01Icon },
  { id: "counting", icon: Calendar03Icon },
  { id: "requests", icon: Task01Icon },
  { id: "approvals", icon: UserCheck01Icon },
  { id: "tenure", icon: CalendarLock01Icon },
  { id: "eligibility", icon: CalendarLock01Icon },
  { id: "restrictions", icon: UserGroupIcon },
  { id: "editing", icon: PencilEdit01Icon },
  { id: "review", icon: CheckmarkCircle02Icon },
];

type Props = {
  isOpen: boolean;
  isLoading?: boolean;
  mode?: "create" | "edit";
  leaveTypeName?: string;
  initialValues?: PolicyWizardValues;
  /** The policy being edited — its own colour is not "in use". */
  policyId?: string;
  /**
   * What is already standing under the rules being changed, shown on the Review step.
   *
   * Editing a policy re-prices nothing — the numbers already decided stay decided. This is what
   * makes that visible before the save instead of leaving the administrator to guess.
   */
  editImpact?: {
    affectedRequests: number;
    inProgressRequests: number;
    affectedPeople: number;
  };
  onSubmitAction: (values: PolicyWizardValues, activate: boolean) => void | Promise<void>;
  onCancelAction: () => void;
};

export const PolicyWizardModal: FC<Props> = ({
  isOpen,
  isLoading = false,
  mode = "create",
  leaveTypeName,
  editImpact,
  initialValues,
  policyId,
  onSubmitAction,
  onCancelAction,
}) => {
  const t = useTranslations("timeOff");
  const tCommon = useTranslations("common");
  const [values, setValues] = useState<PolicyWizardValues>(defaultPolicyWizardValues);
  const [stepIndex, setStepIndex] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);

  // The other policies' colours: "In use" in the picker, and a new policy opens on the first free one.
  const { data: policies } = useTimeOffPolicies();
  const usedBy = useMemo(() => {
    const out: Partial<Record<TagColor, string[]>> = {};
    for (const p of policies ?? []) {
      if (p.id === policyId) continue;
      const color = toPolicyColor(p.color);
      (out[color] ??= []).push(p.name);
    }
    return out;
  }, [policies, policyId]);
  const freeColor = useRef<TagColor>(POLICY_COLORS[0]);
  freeColor.current = nextPolicyColor((policies ?? []).filter((p) => p.id !== policyId).map((p) => p.color));
  // What the wizard opened with — the dirty check compares against it, so the colour picked for a new policy is not
  // an edit of its own.
  const [openedWith, setOpenedWith] = useState<PolicyWizardValues>(defaultPolicyWizardValues);

  useEffect(() => {
    if (isOpen) {
      const start = initialValues ?? { ...defaultPolicyWizardValues, color: freeColor.current };
      setOpenedWith(start);
      setValues(start);
      setStepIndex(0);
      setMaxReached(mode === "edit" ? STEPS.length - 1 : 0);
      setError(null);
      setNameError(null);
    }
  }, [isOpen, initialValues, mode]);

  const isDirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(openedWith),
    [values, openedWith],
  );

  const set = <K extends keyof PolicyWizardValues>(key: K, value: PolicyWizardValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setError(null);
    if (key === "name") setNameError(null);
  };

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;
  const busy = isLoading || isSaving;

  const goTo = (index: number) => {
    if (index <= maxReached) {
      setStepIndex(index);
      setError(null);
    }
  };

  const handleNext = () => {
    const validationError = validatePolicyStep(step.id, values, t);
    if (validationError) {
      setError(validationError);
      return;
    }
    const next = Math.min(stepIndex + 1, STEPS.length - 1);
    setStepIndex(next);
    setMaxReached((m) => Math.max(m, next));
    setError(null);
  };

  const handleBack = () => {
    setStepIndex((i) => Math.max(0, i - 1));
    setError(null);
  };

  const handleSave = async (activate: boolean) => {
    // Validate every step before saving.
    for (const s of STEPS) {
      const err = validatePolicyStep(s.id, values, t);
      if (err) {
        setError(err);
        return;
      }
    }
    setError(null);
    setIsSaving(true);
    try {
      await onSubmitAction(values, activate);
    } catch (e) {
      const forName = e instanceof PolicyActionError ? e.fieldErrors?.name : undefined;
      if (forName) {
        // The name is on the first step: go there and say it under the field.
        setNameError(forName);
        setStepIndex(0);
        return;
      }
      setError(e instanceof Error ? e.message : t("policyWizard.saveFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  const requestClose = () => {
    if (busy) return;
    if (isDirty) {
      setIsConfirmCancelOpen(true);
      return;
    }
    onCancelAction();
  };

  const renderStep = () => {
    switch (step.id) {
      case "basics":
        return <BasicsStep values={values} set={set} nameError={nameError} usedBy={usedBy} />;
      case "entitlement":
        return <EntitlementStep values={values} set={set} />;
      case "accrual":
        return <AccrualStep values={values} set={set} />;
      case "carryover":
        return <CarryoverStep values={values} set={set} />;
      case "counting":
        return <CountingStep values={values} set={set} />;
      case "requests":
        return <RequestsStep values={values} set={set} />;
      case "approvals":
        return <ApprovalsStep values={values} set={set} />;
      case "tenure":
        return <TenureStep values={values} set={set} />;
      case "eligibility":
        return <EligibilityStep values={values} set={set} />;
      case "restrictions":
        return <RestrictionsStep values={values} set={set} />;
      case "editing":
        return <EditingStep values={values} set={set} />;
      case "review":
        return (
          <>
            <ReviewStep values={values} leaveTypeName={leaveTypeName} mode={mode} />
            {mode === "edit" && editImpact && editImpact.affectedRequests > 0 && (
              <InlineAlert tone="pending" className="mt-4">
                <p className="font-medium">
                  {t("policyWizard.impact.title", { count: editImpact.affectedRequests })}
                </p>
                <p className="mt-1 text-hint">
                  {editImpact.inProgressRequests > 0
                    ? t("policyWizard.impact.inProgress", { count: editImpact.inProgressRequests })
                    : ""}
                  {t.rich("policyWizard.impact.body", {
                    people: editImpact.affectedPeople,
                    b: (chunks) => <span className="font-medium">{chunks}</span>,
                  })}
                </p>
              </InlineAlert>
            )}
          </>
        );
    }
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) requestClose();
        }}
      >
        <DialogContent hideClose size="lg" className="gap-0 overflow-hidden p-0">
          <div className="flex h-[86vh] max-h-[880px]">
            {/* Vertical step sidebar */}
            <aside className="hidden w-64 shrink-0 flex-col border-r border-divider bg-subtle/40 p-5 sm:flex">
              <DialogHeader className="mb-5 space-y-1 text-left">
                <DialogTitle className="text-body">
                  {mode === "edit" ? t("policyWizard.editTitle") : t("policyWizard.createTitle")}
                </DialogTitle>
                {leaveTypeName && (
                  <p className="text-hint text-tertiary">{t("policyWizard.inLeaveType", { name: leaveTypeName })}</p>
                )}
              </DialogHeader>

              <nav className="space-y-1">
                {STEPS.map((s, index) => {
                  const isActive = index === stepIndex;
                  const isDone = index < maxReached;
                  const clickable = index <= maxReached;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      disabled={!clickable}
                      onClick={() => goTo(index)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-control px-2.5 py-2 text-left transition-colors",
                        isActive ? "bg-card shadow-card" : "hover:bg-card/60",
                        !clickable && "cursor-not-allowed opacity-60",
                      )}
                    >
                      <StepRing state={isActive ? "current" : isDone ? "done" : "ahead"} number={index + 1} />
                      <span className="min-w-0">
                        <span
                          className={cn(
                            "block text-body font-medium",
                            isActive ? "text-primary" : "text-secondary",
                          )}
                        >
                          {t(`policyWizard.steps.${s.id}.title`)}
                        </span>
                        <span className="block truncate text-hint text-tertiary">
                          {t(`policyWizard.steps.${s.id}.subtitle`)}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Step content */}
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex flex-none items-center justify-between gap-3 border-b border-divider px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-control bg-mist text-secondary">
                    <Icon icon={step.icon} />
                  </span>
                  <div>
                    <h2 className="text-section-title leading-tight text-primary">{t(`policyWizard.steps.${step.id}.title`)}</h2>
                    <p className="text-body text-tertiary">{t(`policyWizard.steps.${step.id}.subtitle`)}</p>
                  </div>
                </div>
                <span className="shrink-0 text-hint font-medium text-tertiary">
                  {t("policyWizard.stepOf", { current: stepIndex + 1, total: STEPS.length })}
                </span>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
                <div className="mx-auto max-w-2xl">{renderStep()}</div>
              </div>

              <div className="flex-none space-y-3 border-t border-divider px-6 py-4">
                {error && <FormError message={error} />}
                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleBack}
                    disabled={stepIndex === 0 || busy}
                    className="gap-1"
                  >
                    <Icon icon={ArrowLeft01Icon} size="sm" />
                    {tCommon("actions.back")}
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button type="button" variant="ghost" onClick={requestClose} disabled={busy}>
                      {tCommon("actions.cancel")}
                    </Button>
                    {isLast ? (
                      mode === "edit" ? (
                        <Button type="button" onClick={() => handleSave(false)} disabled={busy}>
                          {tCommon("actions.saveChanges")}
                        </Button>
                      ) : (
                        <>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => handleSave(false)}
                            disabled={busy}
                          >
                            {t("policyWizard.saveDraft")}
                          </Button>
                          <Button type="button" onClick={() => handleSave(true)} disabled={busy}>
                            {t("policyWizard.saveActivate")}
                          </Button>
                        </>
                      )
                    ) : (
                      <Button type="button" onClick={handleNext} disabled={busy} className="gap-1">
                        {tCommon("actions.next")}
                        <Icon icon={ArrowRight01Icon} size="sm" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmCancelModal
        isOpen={isConfirmCancelOpen}
        onCancelAction={() => setIsConfirmCancelOpen(false)}
        onConfirmAction={() => {
          setIsConfirmCancelOpen(false);
          onCancelAction();
        }}
      />
    </>
  );
};
