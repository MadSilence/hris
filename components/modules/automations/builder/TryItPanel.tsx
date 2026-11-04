"use client";

import React, { useState } from "react";
import { Button } from "@/components/desact/button";
import { FormError } from "@/components/feedback/FormError";
import { formatDisplayDate } from "@/lib/date";
import {
  ACTION_LABELS,
  type AutomationDefinition,
  type AutomationSimulation,
  type AutomationTestResult,
  type PersonRef,
} from "@/models/automations";
import { simulateAutomationAction, testAutomationAction } from "@/components/modules/automations/actions/automationActions";
import { unwrapAction } from "@/components/modules/automations/hooks";

const OUTCOME_TEXTS: Record<string, string> = {
  EMAILED: "Emailed to you",
  NOTIFIED: "Notified you",
  NOT_CREATED: "A task — not created in a test",
  NOT_SENT: "Changes data — not done in a test",
  NO_EMAIL: "Not emailed: you have no address",
};

/**
 * Trying a rule before trusting it (D1, D2): its messages, rendered for one person, sent to you alone; and what it
 * would do to that person, on which days. Neither writes a run.
 */
export function TryItPanel({
  definition,
  person,
  disabled,
}: {
  definition: AutomationDefinition;
  /** The preview's sample person — whom the test and the simulation are rendered for. */
  person: PersonRef | null;
  disabled: boolean;
}) {
  const [test, setTest] = useState<AutomationTestResult | null>(null);
  const [simulation, setSimulation] = useState<AutomationSimulation | null>(null);
  const [busy, setBusy] = useState<"test" | "simulate" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (kind: "test" | "simulate") => {
    if (!person) return;
    setBusy(kind);
    setError(null);
    try {
      if (kind === "test") {
        setTest(unwrapAction(await testAutomationAction({ definition, personId: person.id })));
      } else {
        setSimulation(unwrapAction(await simulateAutomationAction({ definition, personId: person.id })));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="space-y-3 rounded-card border border-divider bg-card p-5" data-test="try-it">
      <div>
        <h3 className="m-0 text-section-title text-primary">Try it</h3>
        <p className="m-0 text-hint text-tertiary">
          {person ? `For ${person.name ?? "the sample person"}. Nothing runs, nobody else is told.` : "Choose a sample person in the preview."}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" size="sm" disabled={disabled || !person || busy !== null} onClick={() => void run("test")}>
          {busy === "test" ? "Sending…" : "Send a test to me"}
        </Button>
        <Button type="button" variant="secondary" size="sm" disabled={disabled || !person || busy !== null} onClick={() => void run("simulate")}>
          {busy === "simulate" ? "Simulating…" : "Simulate"}
        </Button>
      </div>
      <FormError message={error} />

      {test && (
        <ul className="m-0 list-none space-y-1 p-0 text-body" data-test="test-result">
          {test.items.map((i) => (
            <li key={i.position}>
              <span className="text-primary">{i.position + 1}. {ACTION_LABELS[i.actionType]}</span>
              <span className="text-tertiary"> — {OUTCOME_TEXTS[i.outcome] ?? i.outcome}{i.text ? `: ${i.text}` : ""}</span>
              {i.missingPlaceholders.length > 0 && (
                <span className="block text-hint text-status-pending-text">No value for {i.missingPlaceholders.join(", ")}</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {simulation && (
        <div className="space-y-2" data-test="simulation">
          {simulation.notes.map((n) => <p key={n} className="m-0 text-hint text-tertiary">{n}</p>)}
          <ol className="m-0 list-none space-y-1 p-0 text-body">
            {simulation.steps.map((s) => (
              <li key={s.position} className={s.conditionMet === false ? "text-tertiary" : "text-primary"}>
                <span className="tabular-nums">{s.date ? formatDisplayDate(s.date, { style: "medium" }) : "—"}</span>
                {" · "}{s.summary}{s.late ? " (late)" : ""}
                {s.note && <span className="block text-hint text-tertiary">{s.note}</span>}
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
