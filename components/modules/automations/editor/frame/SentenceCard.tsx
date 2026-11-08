"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import type { SentencePart } from "@/components/modules/automations/contracts";
import { cn } from "@/lib/cn";

/**
 * "In short" (`automations-editor` → Layout 3): the automation read as one sentence. Key words are chips; the selected
 * step's words are stronger; before anything is picked, its parts are grey dashed chips (F2). Two lines, then
 * "Show all" (H4).
 */
export const SentenceCard: React.FC<{ parts: SentencePart[]; selectedStepId: string | null }> = ({ parts, selectedStepId }) => {
  const t = useTranslations("automationsEditor");
  const textRef = React.useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = React.useState(false);
  const [overflows, setOverflows] = React.useState(false);

  React.useLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const measure = () => setOverflows(el.scrollHeight > el.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [parts, expanded]);

  return (
    <section aria-label={t("sentence.label")} className="rounded-card border border-divider bg-card px-6 py-5 shadow-card">
      <p
        ref={textRef}
        data-test="sentence"
        className={cn("font-heading text-section-title text-primary", !expanded && "line-clamp-2")}
      >
        {parts.map((part, i) =>
          part.chip || part.placeholder ? (
            <span
              key={i}
              className={cn(
                "mx-0.5 rounded-tag px-1 [box-decoration-break:clone]",
                part.placeholder
                  ? "border border-dashed border-field font-normal text-tertiary"
                  : part.stepId !== null && part.stepId === selectedStepId
                    ? "bg-accent-muted text-accent-text"
                    : "bg-accent-subtle text-accent-text",
              )}
            >
              {part.text}
            </span>
          ) : (
            <React.Fragment key={i}>{part.text}</React.Fragment>
          ),
        )}
      </p>
      {(overflows || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 text-label text-accent-text hover:underline outline-none focus-visible:underline"
        >
          {expanded ? t("sentence.showLess") : t("sentence.showAll")}
        </button>
      )}
    </section>
  );
};
