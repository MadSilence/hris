"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Input } from "@/components/desact/input";
import { cn } from "@/lib/cn";
import type { SplitPath } from "@/models/automations";
import { newPathId, OTHERWISE } from "../../model/tree";
import { AddConditionButton } from "../conditions/chrome";
import { ConditionBuilder } from "../conditions/ConditionBuilder";
import { Field, FieldStack, Hint } from "../parts/parts";
import { errorFor } from "../parts/problems";
import type { StepPartProps } from "./stepPartProps";

/** Paths at most, "Anyone else" included (H4's split card draws three; the brief allows five). */
export const MAX_PATHS = 5;

const hasCondition = (path: SplitPath) => Boolean(path.condition?.filters?.length);

/**
 * Split by a condition (`new-screens/spec.md` § 2, S10–S10c): the question that labels the card, then the paths — each
 * a name and its conditions, joined by "and", tried from the top — and the last one, "Anyone else", fixed. A path is
 * added up to five with Anyone else, and removed while more than one named path is left; the steps on a removed path
 * go with it. A path just added opens its field list at once (S10b); one without a condition while the check holds a
 * turn-on says what to add (S10c).
 */
export const SplitFields: React.FC<StepPartProps> = ({ step, problems, onStep }) => {
  const t = useTranslations("automationsSettings");
  const tShared = useTranslations("automations");
  const questionId = React.useId();
  const pathsId = React.useId();
  const paths = step.paths ?? [];
  const pathsError = errorFor(t, problems, "paths");
  // The paths whose field list opens at once: a split's first path while it is new, and each path added here.
  const [fresh, setFresh] = React.useState<Set<string>>(
    () => new Set(step.question?.trim() ? [] : paths.filter((p) => !hasCondition(p)).map((p) => p.id)),
  );

  const setPath = (id: string, patch: Partial<SplitPath>) =>
    onStep({ paths: paths.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
  const addPath = () => {
    const id = newPathId(step);
    setFresh((s) => new Set(s).add(id));
    onStep({ paths: [...paths, { id, name: tShared("pathDefault", { n: paths.length + 1 }), condition: null, steps: [] }] });
  };
  const removePath = (id: string) => onStep({ paths: paths.filter((p) => p.id !== id) });
  const nameOf = (path: SplitPath, i: number) => path.name.trim() || tShared("pathDefault", { n: i + 1 });

  return (
    <FieldStack>
      <Field label={t("split.question")} htmlFor={questionId} error={errorFor(t, problems, "question")} hint={t("split.questionHint")}>
        <Input
          id={questionId}
          value={step.question ?? ""}
          onChange={(e) => onStep({ question: e.target.value })}
          placeholder={t("split.questionPlaceholder")}
          aria-invalid={Boolean(errorFor(t, problems, "question")) || undefined}
        />
      </Field>
      <Field label={t("split.paths")} labelId={pathsId}>
        <div className="flex flex-col gap-3" role="group" aria-labelledby={pathsId}>
          {paths.map((path, i) => {
            const missing = Boolean(pathsError) && !hasCondition(path);
            return (
              <div
                key={path.id}
                className={cn(
                  "flex flex-col gap-2.5 rounded-popover border p-3",
                  missing ? "border-status-declined-fill" : "border-divider",
                )}
              >
                <div className="flex items-center gap-2">
                  <Input
                    value={path.name}
                    onChange={(e) => setPath(path.id, { name: e.target.value })}
                    aria-label={t("split.pathName", { n: i + 1 })}
                    className="h-8 min-w-0 flex-1 px-2.5 font-medium"
                  />
                  {paths.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePath(path.id)}
                      aria-label={t("split.removePath", { name: nameOf(path, i) })}
                      className="flex size-7 shrink-0 items-center justify-center rounded-control text-tertiary outline-none hover:bg-mist focus-visible:shadow-focus"
                    >
                      <Icon icon={Cancel01Icon} size="sm" className="size-3.5" />
                    </button>
                  )}
                </div>
                <ConditionBuilder
                  value={path.condition ?? null}
                  onChange={(condition) => setPath(path.id, { condition })}
                  autoOpen={fresh.has(path.id) && !hasCondition(path)}
                  narrow
                />
                {missing && <p className="text-hint text-status-declined-text">{t("split.pathNeedsCondition")}</p>}
              </div>
            );
          })}
          <div className="flex flex-col gap-0.5 rounded-popover bg-subtle p-3">
            <span className="text-body font-medium">{t("split.anyoneElse")}</span>
            <Hint>{t("split.anyoneElseHint")}</Hint>
          </div>
          {paths.length + 1 < MAX_PATHS && <AddConditionButton onClick={addPath}>{t("split.addPath")}</AddConditionButton>}
          <Hint>{t("split.firstMatch")}</Hint>
        </div>
      </Field>
    </FieldStack>
  );
};

export { OTHERWISE };
