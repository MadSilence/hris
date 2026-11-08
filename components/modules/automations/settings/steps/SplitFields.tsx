"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import type { SplitPath } from "@/models/automations";
import { newPathId, OTHERWISE } from "../../model/tree";
import { AddConditionButton } from "../conditions/chrome";
import { ConditionBuilder } from "../conditions/ConditionBuilder";
import { Field, FieldStack, Hint } from "../parts/parts";
import { errorFor } from "../parts/problems";
import type { StepPartProps } from "./stepPartProps";

/** Paths at most, "Anyone else" included (H4's split card draws three; the brief allows five). */
export const MAX_PATHS = 5;

/**
 * Split by a condition (H4): the question that labels the card, then the paths — each a name and a condition, tried
 * in order — and the last one, "Anyone else", fixed. A path is added up to five with Anyone else, and removed while
 * more than one named path is left; the steps on a removed path go with it.
 */
export const SplitFields: React.FC<StepPartProps> = ({ step, problems, onStep }) => {
  const t = useTranslations("automationsSettings");
  const questionId = React.useId();
  const paths = step.paths ?? [];
  const pathsError = errorFor(t, problems, "paths");

  const setPath = (id: string, patch: Partial<SplitPath>) =>
    onStep({ paths: paths.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
  const addPath = () =>
    onStep({ paths: [...paths, { id: newPathId(step), name: "", condition: null, steps: [] }] });
  const removePath = (id: string) => onStep({ paths: paths.filter((p) => p.id !== id) });

  return (
    <FieldStack>
      <Field label={t("split.question")} htmlFor={questionId} required error={errorFor(t, problems, "question")}
        hint={t("split.questionHint")}>
        <Input id={questionId} value={step.question ?? ""} onChange={(e) => onStep({ question: e.target.value })}
          aria-invalid={Boolean(errorFor(t, problems, "question")) || undefined} />
      </Field>
      <Field label={t("split.paths")} error={pathsError}>
        <div className="flex flex-col gap-3">
          {paths.map((path, i) => (
            <div key={path.id} className="flex flex-col gap-2 rounded-popover border border-divider p-3">
              <div className="flex items-center gap-2">
                <Input
                  value={path.name}
                  onChange={(e) => setPath(path.id, { name: e.target.value })}
                  aria-label={t("split.pathName", { n: i + 1 })}
                  className="h-8"
                />
                {paths.length > 1 && (
                  <Button type="button" variant="ghost" size="icon-sm" onClick={() => removePath(path.id)}
                    aria-label={t("split.removePath", { name: path.name || t("split.pathName", { n: i + 1 }) })}
                    className="text-tertiary">
                    <Icon icon={Delete02Icon} size="sm" />
                  </Button>
                )}
              </div>
              <ConditionBuilder
                value={path.condition ?? null}
                onChange={(condition) => setPath(path.id, { condition })}
                autoOpen={!path.condition}
              />
            </div>
          ))}
          <div className="flex flex-col gap-1 rounded-popover border border-dashed border-strong px-3 py-2.5">
            <span className="text-body font-medium">{t("split.anyoneElse")}</span>
            <Hint>{t("split.anyoneElseHint")}</Hint>
          </div>
          {paths.length + 1 < MAX_PATHS && <AddConditionButton onClick={addPath}>{t("split.addPath")}</AddConditionButton>}
        </div>
      </Field>
    </FieldStack>
  );
};

export { OTHERWISE };
