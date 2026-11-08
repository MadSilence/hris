"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { FilterIcon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { RadioGroup, RadioGroupItem } from "@/components/desact/radio-group";
import { Skeleton } from "@/components/desact/skeleton";
import { emptySegment } from "@/models/segment/Segment";
import type { WhoItRunsForProps } from "../../contracts";
import { ConditionBuilder, useConditionFields } from "../conditions/ConditionBuilder";
import { ConditionSummaryList } from "../conditions/ConditionSummary";
import { MatchCount } from "../conditions/MatchCount";
import { Hint } from "../parts/parts";

/**
 * Who it runs for (G3, G3b; read mode R4): Everyone, or only some people — the condition builder — with the last
 * check's count ("48 people match · See who") and the note that new teammates who match join on their own.
 *
 * <p>"Only some people" with no condition yet is a state of this window, not of the segment (an empty segment is
 * everyone), so it is kept here until the first condition is complete.
 */
export const WhoItRunsFor: React.FC<WhoItRunsForProps> = ({ conditions, readOnly, check, onChange }) => {
  const t = useTranslations("automationsSettings");
  const some = (conditions?.filters?.length ?? 0) > 0;
  const [mode, setMode] = React.useState<"EVERYONE" | "SOME">(some ? "SOME" : "EVERYONE");
  const { catalog, dtos } = useConditionFields();

  React.useEffect(() => {
    if (some) setMode("SOME");
  }, [some]);

  const count = check ? { matching: check.matchingCount, people: check.matching } : null;
  const countBlock = count ? <MatchCount count={count} /> : <Skeleton className="h-11 w-full rounded-popover" />;

  if (readOnly) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-body font-medium text-primary">
          <Icon icon={some ? FilterIcon : UserGroupIcon} size="sm" className="text-tertiary" />
          {some ? t("who.some") : t("who.everyone")}
        </div>
        {some && <ConditionSummaryList filters={conditions.filters} catalog={catalog} dtos={dtos} />}
        {countBlock}
        <Hint>{t("who.newJoin")}</Hint>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <RadioGroup
        value={mode}
        onValueChange={(v) => {
          const next = v === "SOME" ? "SOME" : "EVERYONE";
          setMode(next);
          // Everyone clears the conditions; what was excluded by hand stays with the segment.
          if (next === "EVERYONE") onChange({ ...(conditions ?? emptySegment()), filters: [] });
        }}
        aria-label={t("who.title")}
      >
        <label className="flex cursor-pointer items-center gap-2.5">
          <RadioGroupItem value="EVERYONE" />
          <span className="text-body">{t("who.everyone")}</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2.5">
          <RadioGroupItem value="SOME" />
          <span className="text-body">{t("who.some")}</span>
        </label>
      </RadioGroup>
      {mode === "SOME" && (
        <ConditionBuilder
          value={conditions}
          autoOpen={!some}
          onChange={(segment) => onChange(segment ?? { ...(conditions ?? emptySegment()), filters: [] })}
        />
      )}
      {countBlock}
      <Hint>{t("who.newJoin")}</Hint>
    </div>
  );
};
