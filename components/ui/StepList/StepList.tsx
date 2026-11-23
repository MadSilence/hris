import * as React from "react";
import { Cancel01Icon, Tick02Icon } from "@hugeicons/core-free-icons";

import { Icon } from "@/components/desact/icon";
import { cn } from "@/lib/cn";

/*
 * A list of steps a person goes through — who approves a request, who signs a document (the designers' product-wide
 * rule `hris/design/handoffs/2026-11-20-answers-from-design/7-product-wide/STEPS.md`; measured in AQ04a–c). Done is a
 * tick, not a colour: with a green company colour "done" and "now" would both be green.
 *
 *   - Marks 16, avatars 24, both centred on the name's first line; mark, avatar and name 10 apart.
 *   - Done: a Mist circle with an Ink tick. Now: an accent ring with the number, the name in the accent. Not yet: a grey
 *     ring with the number. Declined stays red. Unordered ("any 2 of 3"): no numbers — the tick, an 8 accent dot, an
 *     8 grey dot.
 *   - No frame: a grey label on top, the optional count on its right, the steps 14 apart with a 1 px line between the
 *     marks; under each name one 13/18 line (role · status) in its tone.
 */

/** `skipped`: never needed — the chain finished without it (any N of M reached, or decided over it); a grey dot. */
export type StepListState = "done" | "now" | "next" | "declined" | "skipped";

/** The tone of the line under a name: done green, waiting on somebody amber, declined red, otherwise grey. */
export type StepListTone = "approved" | "pending" | "declined" | "neutral";

export type StepListPerson = {
  key: string;
  /** The person's avatar, 24 (`size-6`) — the caller's own, so a guest or a group can draw theirs. */
  avatar: React.ReactNode;
  name: React.ReactNode;
  /** The line under the name: "Manager · Approved Fri 20 Nov". */
  status?: React.ReactNode;
  statusTone?: StepListTone;
  /** Anything under the status, e.g. a decline's comment. */
  after?: React.ReactNode;
};

export type StepListStep = {
  key: string;
  state: StepListState;
  /** The step's own number when the list shows only part of a chain ("Next to sign": 3, 4); otherwise its position. */
  number?: number;
  /** Usually one; a signing step may hold several people who sign at the same time. */
  people: StepListPerson[];
};

const TONE: Record<StepListTone, string> = {
  approved: "text-status-approved-text",
  pending: "text-status-pending-text",
  declined: "text-status-declined-text",
  neutral: "text-tertiary",
};

/** One mark, 16. `number` is omitted in an unordered list. */
export function StepMark({ state, number }: { state: StepListState; number?: number }) {
  if (state === "done") {
    return (
      <span aria-hidden className="flex size-4 shrink-0 items-center justify-center rounded-pill bg-mist text-primary">
        <Icon icon={Tick02Icon} size="sm" strokeWidth={2.5} className="size-2.5" />
      </span>
    );
  }
  if (state === "declined") {
    return (
      <span aria-hidden className="flex size-4 shrink-0 items-center justify-center rounded-pill bg-status-declined-bg text-status-declined-icon">
        <Icon icon={Cancel01Icon} size="sm" strokeWidth={2.5} className="size-2.5" />
      </span>
    );
  }
  if (number === undefined) {
    return (
      <span aria-hidden className="flex size-4 shrink-0 items-center justify-center">
        <span className={cn("size-2 rounded-pill", state === "now" ? "bg-accent" : "border-4 border-field")} />
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-pill border-[1.5px] text-step-mark",
        state === "now" ? "border-accent text-accent-text" : "border-field text-tertiary",
      )}
    >
      {number}
    </span>
  );
}

export function StepList({
  label,
  summary,
  steps,
  ordered = true,
  className,
}: {
  /** The grey label on top: "Who signs", "Who approves", "Next to sign". */
  label: React.ReactNode;
  /** On the label row's right: "1 approved", "1 of 3 approved". */
  summary?: React.ReactNode;
  steps: StepListStep[];
  /** In order (numbered marks), or "any N of M" (dots, no numbers). */
  ordered?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-label font-normal text-tertiary">{label}</p>
        {summary && <p className="text-label text-status-approved-text">{summary}</p>}
      </div>
      <ol className="flex flex-col">
        {steps.map((step, i) => (
          <li key={step.key} className="relative flex gap-2.5 pb-3.5 last:pb-0">
            {/* The line runs from 4 under this mark to 2 above the next one. */}
            {i < steps.length - 1 && <span aria-hidden className="absolute -bottom-0.5 left-[7.5px] top-6 w-px bg-divider" />}
            <span className="relative z-10 flex h-6 shrink-0 items-center">
              <StepMark state={step.state} number={ordered && step.state !== "skipped" ? step.number ?? i + 1 : undefined} />
            </span>
            <ul className="flex min-w-0 flex-1 flex-col gap-3">
              {step.people.map((person) => (
                <li key={person.key} className="flex min-w-0 gap-2.5">
                  <span className="flex shrink-0">{person.avatar}</span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className={cn("truncate text-body font-medium", step.state === "now" ? "text-accent-text" : "text-primary")}>
                      {person.name}
                    </p>
                    {person.status && (
                      <p className={cn("text-label font-normal", TONE[person.statusTone ?? "neutral"])}>{person.status}</p>
                    )}
                    {person.after}
                  </div>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
