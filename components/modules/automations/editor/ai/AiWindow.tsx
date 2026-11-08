"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Alert02Icon, SparklesIcon, Undo02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/desact/button";
import { Icon } from "@/components/desact/icon";
import { AiPromptField } from "@/components/modules/automations/shared";
import type { AiReply, AiTurn } from "./noddoAiDraft";

/** "Drafted by AI — review before turning on" (D1). */
export const DraftedByAiLabel: React.FC = () => {
  const t = useTranslations("automationsEditor");
  return (
    <span className="inline-flex items-center gap-1 rounded-tag bg-accent-subtle px-1.5 py-0.5 text-hint text-accent-text">
      <Icon icon={SparklesIcon} size="sm" className="size-3.5" />
      {t("ai.draftedLabel")}
    </span>
  );
};

/** One reply of noddo AI, in every state the design draws (D1, H1). */
export const AiReplyView: React.FC<{ reply: AiReply; undone?: boolean; onUndo?: () => void; onRetry?: () => void }> = ({
  reply,
  undone,
  onUndo,
  onRetry,
}) => {
  const t = useTranslations("automationsEditor");
  switch (reply.kind) {
    case "notConnected":
      return <p className="text-body text-primary">{t("ai.notConnected")}</p>;
    case "error":
      return (
        <div className="flex flex-col items-start gap-2">
          <p className="flex items-start gap-1.5 text-body text-status-declined-text">
            <Icon icon={Alert02Icon} size="sm" className="mt-0.5 shrink-0" />
            {t("ai.error")}
          </p>
          {onRetry && (
            <Button type="button" variant="secondary" size="sm" onClick={onRetry}>
              {t("ai.tryAgain")}
            </Button>
          )}
        </div>
      );
    case "draft":
    case "cantDo":
      return (
        <div className="flex flex-col items-start gap-2">
          <p className="text-body text-primary">{reply.message}</p>
          <div className="flex items-center gap-2 text-hint text-tertiary">
            <span>{t("ai.changed", { count: reply.changedSteps })}</span>
            {onUndo && !undone && (
              <Button type="button" variant="ghost" size="sm" onClick={onUndo}>
                <Icon icon={Undo02Icon} size="sm" />
                {t("ai.undo")}
              </Button>
            )}
          </div>
          {reply.kind === "draft" && <DraftedByAiLabel />}
        </div>
      );
  }
};

/**
 * The noddo AI tool window (D1, H1), 400 wide: the conversation, then the prompt field as the reply box. Not
 * connected yet (K10): a prompt gets the fixed reply, and the text stays.
 */
export const AiWindow: React.FC<{
  turns: AiTurn[];
  value: string;
  busy: boolean;
  onChange: (value: string) => void;
  onSubmit: (prompt: string) => void;
  onUndo: (turnId: number) => void;
}> = ({ turns, value, busy, onChange, onSubmit, onUndo }) => {
  const t = useTranslations("automationsEditor");
  const endRef = React.useRef<HTMLDivElement>(null);
  // A block body, not an expression: Chromium's `scrollIntoView` now returns a Promise, and an effect that returns
  // anything but a function or nothing breaks the page on unmount ("destroy is not a function").
  React.useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: "end" });
  }, [turns.length]);

  return (
    <div className="flex min-h-full flex-col gap-4">
      {turns.length === 0 && <p className="text-body text-tertiary">{t("ai.intro")}</p>}
      <ol className="flex flex-col gap-4" aria-live="polite">
        {turns.map((turn) => (
          <li key={turn.id} className="flex flex-col gap-2">
            <p className="sr-only">{t("ai.you")}</p>
            <p className="self-end rounded-popover bg-mist px-3 py-2 text-body text-primary whitespace-pre-line">{turn.prompt}</p>
            {turn.reply && (
              <div className="flex items-start gap-2">
                <Icon icon={SparklesIcon} size="sm" className="mt-0.5 shrink-0 text-accent-text" />
                <AiReplyView reply={turn.reply} undone={turn.undone} onUndo={() => onUndo(turn.id)} onRetry={() => onSubmit(turn.prompt)} />
              </div>
            )}
          </li>
        ))}
      </ol>
      <div ref={endRef} />
      <div className="mt-auto">
        <AiPromptField value={value} onChange={onChange} onSubmit={onSubmit} busy={busy} variant="window" />
      </div>
    </div>
  );
};
