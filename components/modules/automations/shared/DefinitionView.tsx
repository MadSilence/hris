"use client";

import React from "react";
import { useUserFields } from "@/components/modules/organization/hooks/useUserFields/useUserFields";
import { useTranslations } from "next-intl";
import type { AutomationDefinition } from "@/models/automations";
import { actionSentence, offsetText, triggerSentence } from "./vocabulary";
import { conditionsSentence, typesInDefinition } from "./sentence";
import { startsReviews, useAutomationNames } from "./useAutomationNames";

function Clause({ word, children }: { word: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[6rem_1fr] gap-4 py-3">
      <span className="text-hint font-semibold text-tertiary">{word}</span>
      <div className="min-w-0 text-body text-primary">{children}</div>
    </div>
  );
}

/**
 * A definition read, not edited — an old version, or the current one for somebody who may view the
 * rule but not change it. The same three clauses the builder edits.
 */
export function DefinitionView({ definition }: { definition: AutomationDefinition }) {
  const t = useTranslations("automations");
  const tAccess = useTranslations("access");
  const { data: fields } = useUserFields();
  const names = useAutomationNames(typesInDefinition(definition, fields), true, startsReviews(definition));

  return (
    <div className="divide-y divide-divider">
      <Clause word={t("clause.when")}>
        {triggerSentence(t, definition.trigger)}
        {definition.latePolicy === "SKIP" && <span className="text-tertiary"> · {t("definition.skippedIfPast")}</span>}
      </Clause>
      <Clause word={t("clause.forWhom")}>{conditionsSentence(t, tAccess, definition.conditions, fields, names.targets)}</Clause>
      <Clause word={t("clause.do")}>
        <ol className="m-0 list-decimal space-y-2 pl-5">
          {definition.actions.map((a, i) => (
            <li key={i}>
              <span>{actionSentence(t, a, { targets: names.targets, roles: names.roles })}</span>
              <span className="text-tertiary"> · {offsetText(t, a.offsetDays)}</span>
              {a.type === "SEND_EMAIL" && a.body && (
                <p className="m-0 mt-1 whitespace-pre-line text-hint text-tertiary">{a.body}</p>
              )}
              {a.type === "CREATE_TASK" && a.description && (
                <p className="m-0 mt-1 whitespace-pre-line text-hint text-tertiary">{a.description}</p>
              )}
            </li>
          ))}
        </ol>
      </Clause>
    </div>
  );
}
