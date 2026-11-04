import * as React from "react";
import { Tick02Icon } from "@hugeicons/core-free-icons";

import { Icon } from "@/components/desact/icon";
import { cn } from "@/lib/cn";

/*
 * Wizard progress (SPEC § 13.10): every step is a ring — an empty gray ring ahead, an accent ring for the
 * current one, an accent ring with a check once done. The current step's ring is one of the things the
 * workspace accent paints (§ 2).
 *
 *   StepRing   one ring, for a rail that lays out its own labels (the policy wizard's side list)
 *   Stepper    a row of rings with the current step's name, for a full-page wizard (setup, the welcome)
 */
export type StepState = "ahead" | "current" | "done";

export function StepRing({ state, number, className }: { state: StepState; number?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-pill border-2 text-hint font-semibold",
        state === "ahead" ? "border-strong text-tertiary" : "border-accent text-accent-text",
        className,
      )}
    >
      {state === "done" ? <Icon icon={Tick02Icon} size="sm" strokeWidth={2.25} /> : number}
    </span>
  );
}

export function Stepper({ steps, current, className }: { steps: readonly string[]; current: number; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <ol className="flex items-center gap-2" aria-label="Progress">
        {steps.map((label, index) => {
          const state: StepState = index < current ? "done" : index === current ? "current" : "ahead";
          return (
            <li key={label} className="flex items-center gap-2" aria-current={state === "current" ? "step" : undefined}>
              <StepRing state={state} />
              <span className="sr-only">
                {label}
                {state === "done" ? ", done" : ""}
              </span>
              {index < steps.length - 1 && (
                <span aria-hidden className={cn("h-0.5 w-6 rounded-pill", index < current ? "bg-accent" : "bg-divider")} />
              )}
            </li>
          );
        })}
      </ol>
      <p className="text-hint text-tertiary">
        Step {current + 1} of {steps.length} · {steps[current]}
      </p>
    </div>
  );
}
