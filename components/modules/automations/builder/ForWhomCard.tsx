"use client";

import React from "react";
import { AudienceBuilder } from "@/components/audience/AudienceBuilder";
import type { FieldDTO } from "@/models/user/fields";
import type { AutomationDefinition } from "@/models/automations";
import { SentenceCard } from "./SentenceCard";

/**
 * The conditions: the People table's own filter language, through the same builder every audience
 * uses — one filter language in the product. Empty means everybody. The count beside the word is the
 * preview's, so it is the server's answer, not a guess.
 */
export function ForWhomCard({
  definition,
  fields,
  isLoadingFields,
  summary,
  matchingCount,
  onChange,
}: {
  definition: AutomationDefinition;
  fields: FieldDTO[] | undefined;
  isLoadingFields: boolean;
  summary: string;
  matchingCount: number | null;
  onChange: (patch: Partial<AutomationDefinition>) => void;
}) {
  const segment = definition.conditions;
  return (
    <SentenceCard
      word="For Whom"
      summary={
        <>
          {summary}
          {matchingCount != null && (
            <span className="ml-2 text-foreground" data-test="for-whom-count">
              · {matchingCount} {matchingCount === 1 ? "person matches" : "people match"} now
            </span>
          )}
        </>
      }
    >
      <AudienceBuilder
        fields={fields}
        isLoadingFields={isLoadingFields}
        value={segment.filters}
        onChange={(filters) => onChange({ conditions: { ...segment, filters } })}
      />
      <p className="m-0 text-xs text-muted-foreground">
        With no conditions the rule is for everyone. The conditions are checked when a run is planned
        and again just before each step.
      </p>
    </SentenceCard>
  );
}
