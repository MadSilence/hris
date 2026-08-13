"use client";

import { ComponentType, FC, useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  PencilLine,
  RefreshCw,
  UserCheck,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { ConfirmCancelModal } from "@/components/ui/ConfirmCancelModal/ConfirmCancelModal";
import { cn } from "@/public/desact/src/components/ui/utils";
import {
  ApprovalsStep,
  BasicsStep,
  CarryoverStep,
  CountingStep,
  EditingStep,
  EntitlementStep,
  RequestsStep,
  ReviewStep,
} from "./PolicyWizardSteps";
import {
  PolicyWizardValues,
  WizardStepId,
  defaultPolicyWizardValues,
  validatePolicyStep,
} from "./policyWizardTypes";

const STEPS: {
  id: WizardStepId;
  title: string;
  subtitle: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  { id: "basics", title: "Basics", subtitle: "Name, unit, visibility", icon: FileText },
  { id: "entitlement", title: "Entitlement", subtitle: "Quota & renewal", icon: CalendarClock },
  { id: "carryover", title: "Carryover & balance", subtitle: "Rollover & negatives", icon: RefreshCw },
  { id: "counting", title: "Counting", subtitle: "How days are counted", icon: CalendarDays },
  { id: "requests", title: "Requests", subtitle: "How employees request", icon: ClipboardList },
  { id: "approvals", title: "Approvals", subtitle: "Who signs off", icon: UserCheck },
  { id: "editing", title: "Editing", subtitle: "Who can edit requests", icon: PencilLine },
  { id: "review", title: "Review", subtitle: "Confirm & create", icon: CheckCircle2 },
];

type Props = {
  isOpen: boolean;
  isLoading?: boolean;
  mode?: "create" | "edit";
  leaveTypeName?: string;
  initialValues?: PolicyWizardValues;
  onSubmitAction: (values: PolicyWizardValues, activate: boolean) => void | Promise<void>;
  onCancelAction: () => void;
};

export const PolicyWizardModal: FC<Props> = ({
  isOpen,
  isLoading = false,
  mode = "create",
  leaveTypeName,
  initialValues,
  onSubmitAction,
  onCancelAction,
}) => {
  const [values, setValues] = useState<PolicyWizardValues>(defaultPolicyWizardValues);
  const [stepIndex, setStepIndex] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setValues(initialValues ?? defaultPolicyWizardValues);
      setStepIndex(0);
      setMaxReached(mode === "edit" ? STEPS.length - 1 : 0);
      setError(null);
    }
  }, [isOpen, initialValues, mode]);

  const isDirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(initialValues ?? defaultPolicyWizardValues),
    [values, initialValues],
  );

  const set = <K extends keyof PolicyWizardValues>(key: K, value: PolicyWizardValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const step = STEPS[stepIndex];
  const StepIcon = step.icon;
  const isLast = stepIndex === STEPS.length - 1;
  const busy = isLoading || isSaving;

  const goTo = (index: number) => {
    if (index <= maxReached) {
      setStepIndex(index);
      setError(null);
    }
  };

  const handleNext = () => {
    const validationError = validatePolicyStep(step.id, values);
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
      const err = validatePolicyStep(s.id, values);
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
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
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
        return <BasicsStep values={values} set={set} />;
      case "entitlement":
        return <EntitlementStep values={values} set={set} />;
      case "carryover":
        return <CarryoverStep values={values} set={set} />;
      case "counting":
        return <CountingStep values={values} set={set} />;
      case "requests":
        return <RequestsStep values={values} set={set} />;
      case "approvals":
        return <ApprovalsStep values={values} set={set} />;
      case "editing":
        return <EditingStep values={values} set={set} />;
      case "review":
        return <ReviewStep values={values} leaveTypeName={leaveTypeName} />;
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
        <DialogContent hideClose className="max-w-4xl gap-0 overflow-hidden p-0">
          <div className="flex h-[80vh] max-h-[720px]">
            {/* Vertical step sidebar */}
            <aside className="hidden w-64 shrink-0 flex-col border-r border-brown-100 bg-brown-50/40 p-5 sm:flex">
              <DialogHeader className="mb-5 space-y-1 text-left">
                <DialogTitle className="text-base">
                  {mode === "edit" ? "Edit policy" : "Create policy"}
                </DialogTitle>
                {leaveTypeName && (
                  <p className="text-xs text-muted-foreground">in {leaveTypeName}</p>
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
                        "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
                        isActive ? "bg-white shadow-sm" : "hover:bg-white/60",
                        !clickable && "cursor-not-allowed opacity-60",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                          isActive
                            ? "border-brown-700 bg-brown-50 text-brown-700"
                            : isDone
                              ? "border-brown-700 bg-brown-700 text-white"
                              : "border-brown-300 bg-white text-brown-400",
                        )}
                      >
                        {isDone ? <Check className="h-3.5 w-3.5" /> : index + 1}
                      </span>
                      <span className="min-w-0">
                        <span
                          className={cn(
                            "block text-sm font-medium",
                            isActive ? "text-brown-800" : "text-brown-600",
                          )}
                        >
                          {s.title}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {s.subtitle}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Step content */}
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex flex-none items-center justify-between gap-3 border-b border-brown-100 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brown-100 text-brown-700">
                    <StepIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold leading-tight text-foreground">{step.title}</h2>
                    <p className="text-sm text-muted-foreground">{step.subtitle}</p>
                  </div>
                </div>
                <span className="shrink-0 text-xs font-medium text-brown-400">
                  Step {stepIndex + 1} of {STEPS.length}
                </span>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
                <div className="mx-auto max-w-xl">{renderStep()}</div>
              </div>

              <div className="flex-none space-y-3 border-t border-brown-100 px-6 py-4">
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={stepIndex === 0 || busy}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button type="button" variant="ghost" onClick={requestClose} disabled={busy}>
                      Cancel
                    </Button>
                    {isLast ? (
                      mode === "edit" ? (
                        <Button type="button" onClick={() => handleSave(false)} disabled={busy}>
                          Save changes
                        </Button>
                      ) : (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleSave(false)}
                            disabled={busy}
                          >
                            Save as draft
                          </Button>
                          <Button type="button" onClick={() => handleSave(true)} disabled={busy}>
                            Save &amp; activate
                          </Button>
                        </>
                      )
                    ) : (
                      <Button type="button" onClick={handleNext} disabled={busy} className="gap-1">
                        Next
                        <ChevronRight className="h-4 w-4" />
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
