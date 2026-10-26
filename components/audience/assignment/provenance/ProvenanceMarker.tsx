"use client";

import * as React from "react";
import { Repeat } from "lucide-react";
import { showError, showSuccess } from "@/lib/errors/errorToast";
import { useReturnToRule } from "@/components/modules/automations/hooks";
import type { AssignableType, AssignmentProvenance } from "@/models/automations";
import { bindingSourceLabel } from "@/models/publicHolidays/binding";

/** The profile's built-in fields that an assignment fills, and the type each is assigned as. */
export const PROVENANCE_FIELD_TYPES: Record<string, AssignableType> = {
  "sys:office": "OFFICE",
  "sys:department": "DEPARTMENT",
  "sys:team": "TEAM",
  "sys:legal_entity": "LEGAL_ENTITY",
  "sys:calendar": "PUBLIC_HOLIDAY_CALENDAR",
  "sys:role": "ROLE",
  "sys:job": "JOB",
};

const SINGLE_VALUED = new Set<AssignableType>(["OFFICE", "DEPARTMENT", "LEGAL_ENTITY", "JOB"]);

/**
 * Whose decision a value is (design § 7): "From rule: Berlin office calendar" when a live rule set it;
 * and, for a value set by hand that holds a rule off, "Set by hand — Return to Rule", which only an
 * editor sees — returning is a write the target's own module right guards (Java decides; this is UX).
 *
 * Renders nothing for a plain hand value: most values are somebody's hand, and marking every one of
 * them would bury the two that matter.
 */
export const ProvenanceMarker: React.FC<{
  userId: string;
  fieldId: string;
  provenance: AssignmentProvenance[] | undefined;
  canEdit: boolean;
  /** The profile reads the person from its own cache; it is told to read them again. */
  onReturned?: () => void;
}> = ({ userId, fieldId, provenance, canEdit, onReturned }) => {
  const type = PROVENANCE_FIELD_TYPES[fieldId];
  if (!type || !provenance) return null;

  const entries = provenance.filter((p) => p.assignableType === type);
  const fromRule = entries.filter((p) => p.origin === "RULE" && p.rule);
  const overriding = SINGLE_VALUED.has(type) ? entries.find((p) => p.origin === "HAND" && p.overriddenRule) : undefined;
  // A holiday calendar of the person's own holds off the one they would inherit from where they work.
  const overridingBinding = type === "PUBLIC_HOLIDAY_CALENDAR"
    ? entries.find((p) => p.origin === "HAND" && p.overriddenSource)
    : undefined;

  if (fromRule.length === 0 && !((overriding || overridingBinding) && canEdit)) return null;

  return (
    <div className="mt-1 space-y-0.5" data-test={`provenance-${fieldId}`}>
      {fromRule.map((p) => (
        <p key={p.assignableId} className="m-0 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Repeat className="h-3 w-3 flex-none" />
          {p.source
            ? <>From {bindingSourceLabel(p.source)}</>
            : SINGLE_VALUED.has(type) || (fromRule.length === 1 && entries.length === 1)
              ? <>From rule: {p.rule?.name}</>
              : <>{p.assignableName}: from rule {p.rule?.name}</>}
        </p>
      ))}
      {overridingBinding?.overriddenSource && canEdit && (
        <p className="m-0 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          Set by hand, in place of {overridingBinding.overriddenSource.calendarName ?? "the calendar"} from{" "}
          {bindingSourceLabel(overridingBinding.overriddenSource)}.
          <ReturnToRuleButton
            userId={userId}
            assignableType={type}
            ruleName={overridingBinding.overriddenRule?.name ?? ""}
            successMessage={`Returned to ${overridingBinding.overriddenSource.calendarName ?? "the calendar"} from ${bindingSourceLabel(overridingBinding.overriddenSource)}.`}
            onReturned={onReturned}
          />
        </p>
      )}
      {overriding && canEdit && (
        <p className="m-0 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          Set by hand — the rule “{overriding.overriddenRule?.name}” would set something else.
          <ReturnToRuleButton
            userId={userId}
            assignableType={type}
            ruleName={overriding.overriddenRule?.name ?? ""}
            onReturned={onReturned}
          />
        </p>
      )}
    </div>
  );
};

/** Its own component so the mutation is mounted only where there is something to return to. */
const ReturnToRuleButton: React.FC<{
  userId: string;
  assignableType: AssignableType;
  ruleName: string;
  successMessage?: string;
  onReturned?: () => void;
}> = ({ userId, assignableType, ruleName, successMessage, onReturned }) => {
  const returnToRule = useReturnToRule();
  const onReturn = async () => {
    try {
      // Single-valued, or a holiday calendar: the rule (the winning binding) chooses the value, so no id.
      await returnToRule.mutateAsync({ userId, assignableType, assignableId: null });
      onReturned?.();
      showSuccess(successMessage ?? `Returned to the rule “${ruleName}”.`);
    } catch (error) {
      showError(error);
    }
  };
  return (
    <button
      type="button"
      onClick={() => void onReturn()}
      disabled={returnToRule.isPending}
      className="font-medium text-foreground underline-offset-2 hover:underline disabled:opacity-50"
    >
      Return to Rule
    </button>
  );
};
