"use client";

import React from "react";
import { useUserFields } from "@/components/modules/organization/hooks/useUserFields/useUserFields";
import {
  actionSentence,
  offsetText,
  triggerSentence,
  type AutomationDefinition,
} from "@/models/automations";
import { conditionsSentence, typesInDefinition } from "./sentence";
import { useAutomationNames } from "./useAutomationNames";

function Clause({ word, children }: { word: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[6rem_1fr] gap-4 py-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-brown-500">{word}</span>
      <div className="min-w-0 text-sm text-foreground">{children}</div>
    </div>
  );
}

/**
 * A definition read, not edited — an old version, or the current one for somebody who may view the
 * rule but not change it. The same three clauses the builder edits.
 */
export function DefinitionView({ definition }: { definition: AutomationDefinition }) {
  const { data: fields } = useUserFields();
  const names = useAutomationNames(typesInDefinition(definition, fields), true);

  return (
    <div className="divide-y divide-brown-100">
      <Clause word="When">
        {triggerSentence(definition.trigger)}
        {definition.latePolicy === "SKIP" && <span className="text-muted-foreground"> · skipped if the date is already past</span>}
      </Clause>
      <Clause word="For Whom">{conditionsSentence(definition.conditions, fields, names.targets)}</Clause>
      <Clause word="Do">
        <ol className="m-0 list-decimal space-y-2 pl-5">
          {definition.actions.map((a, i) => (
            <li key={i}>
              <span>{actionSentence(a, { targets: names.targets, roles: names.roles })}</span>
              <span className="text-muted-foreground"> · {offsetText(a.offsetDays)}</span>
              {a.type === "SEND_EMAIL" && a.body && (
                <p className="m-0 mt-1 whitespace-pre-line text-xs text-muted-foreground">{a.body}</p>
              )}
              {a.type === "CREATE_TASK" && a.description && (
                <p className="m-0 mt-1 whitespace-pre-line text-xs text-muted-foreground">{a.description}</p>
              )}
            </li>
          ))}
        </ol>
      </Clause>
    </div>
  );
}
