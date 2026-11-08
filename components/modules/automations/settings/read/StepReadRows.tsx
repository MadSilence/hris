"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  BeachIcon,
  Calendar03Icon,
  CheckListIcon,
  Clock01Icon,
  FilterIcon,
  GitBranchIcon,
  HourglassIcon,
  Mail01Icon,
  NoteEditIcon,
  Notification03Icon,
  SignatureIcon,
  StarIcon,
  UserIcon,
  UserSwitchIcon,
} from "@hugeicons/core-free-icons";
import type { AutomationCatalog, AutomationDefinition, StepSpec } from "@/models/automations";
import { TokenText } from "../tokens/TokenTextField";
import { MistNote } from "../parts/parts";
import { useAutomationWords } from "../words/useAutomationWords";
import { ReadRows, type ReadRow } from "./ReadRows";

const upperFirst = (s: string) => (s ? s[0].toLocaleUpperCase() + s.slice(1) : s);

/** A step in read mode (R3): its own values as icon rows, then when it runs and for whom. */
export const StepReadRows: React.FC<{ definition: AutomationDefinition; step: StepSpec; catalog: AutomationCatalog }> = ({ step }) => {
  const t = useTranslations("automationsSettings");
  const tA = useTranslations("automations");
  const w = useAutomationWords();
  const who = (s: string | null) => (s ? upperFirst(s) : t("read.nobody"));
  const rows: ReadRow[] = [];

  switch (step.type) {
    case "NOTIFY":
      rows.push({ icon: Notification03Icon, value: who(w.recipients(step.recipients)), caption: t("read.getsIt") });
      rows.push({ icon: NoteEditIcon, value: <TokenText value={step.text} className="font-normal" />, caption: t("notify.message") });
      break;
    case "SEND_EMAIL":
      rows.push({ icon: Mail01Icon, value: who(w.recipients(step.recipients)), caption: t("read.getsEmail") });
      rows.push({ icon: NoteEditIcon, value: <TokenText value={step.subject} />, caption: <TokenText value={step.body} /> });
      break;
    case "CREATE_TASK":
      rows.push({ icon: CheckListIcon, value: <TokenText value={step.title} />, caption: step.description ? <TokenText value={step.description} /> : null });
      rows.push({ icon: UserIcon, value: who(step.assignee ? w.recipient(step.assignee) : null), caption: t("read.getsTask") });
      if (step.dueDays != null) rows.push({ icon: Calendar03Icon, value: t("read.dueIn", { days: step.dueDays }), caption: t("read.afterCreated") });
      break;
    case "REQUEST_APPROVAL":
      rows.push({ icon: UserIcon, value: who(step.assignee ? w.recipient(step.assignee) : null), caption: t("read.approves") });
      if (step.maxDays != null) {
        rows.push({
          icon: HourglassIcon,
          value: t("read.noAnswerIn", { days: step.maxDays }),
          caption: upperFirst(t(`words.noAnswer.${step.ifNoAnswer ?? "ASK_THEIR_MANAGER"}`)),
        });
      }
      if (step.remindDaily) rows.push({ icon: Notification03Icon, value: t("approval.remind") });
      break;
    case "START_REVIEW":
      rows.push({ icon: StarIcon, value: w.stepTitle(step), caption: t("review.form") });
      rows.push({ icon: UserIcon, value: who(step.assignee ? w.recipient(step.assignee) : null), caption: t("read.reviews") });
      if (step.dueDays != null) rows.push({ icon: Calendar03Icon, value: t("read.dueIn", { days: step.dueDays }), caption: t("read.afterStarts") });
      break;
    case "WAIT_UNTIL":
      rows.push({ icon: HourglassIcon, value: w.stepTitle(step), caption: t("read.waitsUntil") });
      if (step.maxDays != null) rows.push({ icon: Clock01Icon, value: w.stepSubtitle({ ...step, when: null, condition: null }) ?? "" });
      break;
    case "ASSIGN":
    case "UNASSIGN":
      rows.push({
        icon: UserSwitchIcon,
        value: w.stepTitle(step),
        caption: step.assignableType ? tA(`assignable.${step.assignableType}`) : null,
      });
      break;
    case "GRANT_TIME_OFF_POLICY":
      rows.push({ icon: BeachIcon, value: w.stepTitle(step), caption: t("policy.label") });
      break;
    case "SIGN_DOCUMENT":
      rows.push({ icon: SignatureIcon, value: w.stepTitle(step), caption: t("sign.documents") });
      rows.push({ icon: UserIcon, value: who(step.assignee ? w.recipient(step.assignee) : null), caption: t("read.signs") });
      break;
    case "SEND_SURVEY":
      rows.push({ icon: NoteEditIcon, value: w.stepTitle(step), caption: t("survey.name") });
      rows.push({ icon: UserIcon, value: who(w.recipients(step.recipients)), caption: t("read.getsIt") });
      break;
    case "SPLIT":
      rows.push({ icon: GitBranchIcon, value: w.stepTitle(step), caption: t("words.step.paths", { count: (step.paths?.length ?? 0) + 1 }) });
      (step.paths ?? []).forEach((p) =>
        rows.push({ icon: FilterIcon, value: p.name || t("split.unnamed"), caption: w.conditionsText(p.condition) ?? t("read.noConditions") }),
      );
      rows.push({ icon: FilterIcon, value: t("split.anyoneElse"), caption: t("split.anyoneElseHint") });
      break;
    default:
      break;
  }

  const timing = w.timing(step.when);
  rows.push(
    timing
      ? { icon: Clock01Icon, value: upperFirst(timing), caption: t("read.atTime", { at: step.when?.at || "09:00" }) }
      : { icon: Clock01Icon, value: t("when.rightAway") },
  );
  const only = w.conditionsText(step.condition);
  rows.push(
    only
      ? { icon: FilterIcon, value: only, caption: t("onlyIf.label") }
      : { icon: FilterIcon, value: t("read.forEveryone"), caption: t("read.noConditions") },
  );

  return (
    <div className="flex flex-col gap-4">
      <ReadRows rows={rows} />
      {(step.type === "SIGN_DOCUMENT" || step.type === "SEND_SURVEY") && (
        <MistNote>{t(step.type === "SIGN_DOCUMENT" ? "notConnected.documents" : "notConnected.surveys")}</MistNote>
      )}
    </div>
  );
};
