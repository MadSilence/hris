"use client";

import * as React from "react";
import { SparklesIcon } from "@hugeicons/core-free-icons";
import { useTranslations } from "next-intl";

import { Button } from "@/components/desact/button";
import { FieldError } from "@/components/desact/field-error";
import { Icon } from "@/components/desact/icon";
import type { AiPromptFieldProps } from "@/components/modules/automations/contracts";
import { cn } from "@/lib/cn";

/**
 * The noddo AI prompt (`automations-start` → AiPromptField): a textarea with a hint and "Draft with AI" inside its
 * lower edge. Empty, the button is off; sending, the field is read only and the button says "Drafting…" with the nod
 * ring; an error sits under it. It grows to six lines, then scrolls. ⌘/Ctrl + Enter sends.
 *
 * The grey example is the one exception to "no example in a placeholder" (Q-6). On the empty list the label is hidden
 * (E2); in New automation it stands above the field (Main); in the AI window the field is the reply box and has no hint.
 */
export const AiPromptField: React.FC<AiPromptFieldProps & { className?: string; autoFocus?: boolean }> = ({
  value,
  onChange,
  onSubmit,
  busy = false,
  error,
  variant = "page",
  className,
  autoFocus,
}) => {
  const t = useTranslations("automationsList");
  const id = React.useId();
  const canSend = value.trim().length > 0 && !busy;
  const send = () => {
    if (canSend) onSubmit(value.trim());
  };

  return (
    <div className={cn("flex w-full flex-col", className)}>
      <label htmlFor={id} className={variant === "dialog" ? "mb-1.5 text-label text-primary" : "sr-only"}>
        {t("ai.label")}
      </label>
      <div
        className={cn(
          "flex flex-col gap-2 rounded-control border bg-card p-3",
          "transition-[border-color,box-shadow] duration-(--duration-hover)",
          error ? "border-danger" : "border-field hover:border-field-hover focus-within:border-accent focus-within:shadow-focus",
        )}
      >
        <textarea
          id={id}
          value={value}
          autoFocus={autoFocus}
          readOnly={busy}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => onChange(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              send();
            }
          }}
          placeholder={variant === "dialog" ? t("ai.exampleLong") : t("ai.example")}
          rows={variant === "window" ? 2 : 3}
          className="field-sizing-content max-h-36 min-h-10 w-full resize-none overflow-y-auto bg-transparent text-body text-primary outline-none placeholder:text-tertiary"
        />
        <div className="flex items-end justify-between gap-3">
          {variant === "window" ? (
            <span />
          ) : (
            <span className="text-hint text-tertiary">{variant === "dialog" ? t("ai.hintDialog") : t("ai.hintPage")}</span>
          )}
          <Button type="button" size="sm" onClick={send} disabled={!canSend && !busy} loading={busy}>
            {!busy && <Icon icon={SparklesIcon} size="sm" />}
            {busy ? t("ai.busy") : t("ai.submit")}
          </Button>
        </div>
      </div>
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </div>
  );
};

/**
 * The seam noddo AI will fill (plan batch 13, K10): today it drafts nothing and answers with one fixed reply, which
 * every surface shows in its own place — the prompt is kept. `AI_HELPER_DESIGN.md`'s assistant replaces the body.
 */
export type NoddoAiDraft = { connected: false; definition: null };

export const noddoAiDraft = async (_prompt: string): Promise<NoddoAiDraft> => ({ connected: false, definition: null });

/** The fixed reply, in the reader's language: "noddo AI isn't connected yet. Start from a template or from scratch…" */
export const useNoddoAiNotConnected = (): string => useTranslations("automationsList")("ai.notConnected");
