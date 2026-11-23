"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { AutomationEvent, EventAnchor } from "@/models/automations";
import { CompactPick } from "../conditions/chrome";
import { EventConditionBuilder } from "../conditions/EventConditionBuilder";
import { AddConditionButton } from "@/components/audience/ConditionChrome";
import { Field, FieldStack, Hint, PartDivider } from "../parts/parts";
import { errorFor } from "../parts/problems";
import type { TriggerPartProps } from "./triggerPartProps";

const TIME_OFF_EVENTS = ["TIME_OFF_REQUESTED", "TIME_OFF_APPROVED", "TIME_OFF_REJECTED", "TIME_OFF_CANCELLED"] as const;
type TimeOffEvent = (typeof TIME_OFF_EVENTS)[number];
const ANCHORS: EventAnchor[] = ["EVENT", "LEAVE_START", "LEAVE_END"];

export const ANY_ONBOARDING = "ANY_ONBOARDING";
export const ANY_OFFBOARDING = "ANY_OFFBOARDING";

/** "Only when": the builder once there is something in it, or a button that opens it with the field list. */
const OnlyWhen: React.FC<TriggerPartProps & { event: AutomationEvent }> = ({ trigger, catalog, problems, onTrigger, event }) => {
  const t = useTranslations("automationsSettings");
  const fields = catalog.events.find((e) => e.value === event)?.fields ?? [];
  const [shown, setShown] = React.useState(Boolean(trigger.eventConditions));
  return (
    <Field label={t("event.onlyWhen")} error={errorFor(t, problems, "trigger.eventConditions")}>
      {shown || trigger.eventConditions ? (
        <EventConditionBuilder value={trigger.eventConditions} fields={fields} autoOpen={!trigger.eventConditions}
          onEmpty={() => setShown(false)} onChange={(eventConditions) => onTrigger({ eventConditions })} />
      ) : (
        <AddConditionButton onClick={() => setShown(true)}>{t("conditions.add")}</AddConditionButton>
      )}
    </Field>
  );
};

/**
 * Time off is requested / approved / declined / cancelled (T3, T3b): the event as a segmented control, Only when over
 * the request's own fields, and what step days count from — the request, the first day off or the last.
 */
export const TimeOffFields: React.FC<TriggerPartProps> = (props) => {
  const { trigger, onTrigger, problems } = props;
  const t = useTranslations("automationsSettings");
  const labelId = React.useId();
  const anchorId = React.useId();
  const event = (TIME_OFF_EVENTS as readonly string[]).includes(trigger.event ?? "") ? (trigger.event as TimeOffEvent) : "TIME_OFF_REQUESTED";
  const anchor = trigger.anchor ?? "EVENT";
  return (
    <FieldStack>
      {/* C24: one row — "Time off is" and a select; four options are a dropdown, not a switch. */}
      <Field error={errorFor(t, problems, "trigger.event")}>
        <div className="flex items-center justify-between gap-3">
          <span id={labelId} className="text-body font-medium text-primary">
            {t("event.timeOffIs")}
          </span>
          <div className="w-[216px] shrink-0">
            <CompactPick
              size="md"
              options={TIME_OFF_EVENTS.map((e) => ({ value: e, label: t(`event.timeOff.${e}`) }))}
              value={event}
              onChange={(next) => onTrigger({ event: next as TimeOffEvent })}
              placeholder={t("event.timeOff.TIME_OFF_REQUESTED")}
              emptyLabel={t("common.noResults")}
              ariaLabel={t("event.timeOffIs")}
            />
          </div>
        </div>
      </Field>
      <OnlyWhen {...props} event={event} />
      <PartDivider />
      <Field label={t("event.countFrom")} labelId={anchorId} error={errorFor(t, problems, "trigger.anchor")}>
        <SegmentedControl<EventAnchor>
          size="window"
          aria-labelledby={anchorId}
          value={anchor}
          onChange={(next) => onTrigger({ anchor: next })}
          options={ANCHORS.map((a) => ({ value: a, label: t(`event.anchor.${a}`) }))}
        />
        <Hint>{t(`event.anchorHint.${anchor}`)}</Hint>
      </Field>
    </FieldStack>
  );
};

/** A process is completed (T6): which process — any onboarding, any offboarding, or one template — and Only when. */
export const ProcessFields: React.FC<TriggerPartProps> = (props) => {
  const { trigger, catalog, problems, onTrigger } = props;
  const t = useTranslations("automationsSettings");
  const process = trigger.process ?? ANY_ONBOARDING;
  const known = process === ANY_ONBOARDING || process === ANY_OFFBOARDING || catalog.processTemplates.some((p) => p.value === process);
  return (
    <FieldStack>
      <Field label={t("process.label")} required error={known ? errorFor(t, problems, "trigger.process") : t("problems.removed")}>
        <CompactPick
          size="md"
          options={[
            { value: ANY_ONBOARDING, label: t("process.anyOnboarding") },
            { value: ANY_OFFBOARDING, label: t("process.anyOffboarding") },
            ...catalog.processTemplates.map((p) => ({ value: p.value, label: p.label ?? p.value, group: t("process.templates") })),
          ]}
          value={known ? process : null}
          onChange={(value) => onTrigger({ process: value })}
          placeholder={t("process.pick")}
          emptyLabel={t("common.noResults")}
          ariaLabel={t("process.label")}
        />
      </Field>
      <OnlyWhen {...props} event="PROCESS_COMPLETED" />
    </FieldStack>
  );
};
