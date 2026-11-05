"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/desact/button";
import { FormError } from "@/components/feedback/FormError";
import { useDateFormatter } from "@/lib/date";
import type { AutomationDefinition, AutomationSimulation, AutomationTestResult, PersonRef } from "@/models/automations";
import { simulateAutomationAction, testAutomationAction } from "@/components/modules/automations/actions/automationActions";
import { unwrapAction } from "@/components/modules/automations/hooks";
import { simulatedStepText, simulationNotes } from "@/components/modules/automations/shared/simulationText";

const OUTCOMES = ["EMAILED", "NOTIFIED", "NOT_CREATED", "NOT_SENT", "NO_EMAIL"] as const;
const isOutcome = (o: string): o is (typeof OUTCOMES)[number] => (OUTCOMES as readonly string[]).includes(o);

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
  const formatDisplayDate = useDateFormatter();
  const t = useTranslations("automations");
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
        <h3 className="m-0 text-section-title text-primary">{t("tryIt.title")}</h3>
        <p className="m-0 text-hint text-tertiary">
          {person ? t("tryIt.forPerson", { name: person.name ?? t("tryIt.samplePerson") }) : t("tryIt.choose")}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" size="sm" disabled={disabled || !person || busy !== null} onClick={() => void run("test")}>
          {busy === "test" ? t("tryIt.sending") : t("tryIt.sendTest")}
        </Button>
        <Button type="button" variant="secondary" size="sm" disabled={disabled || !person || busy !== null} onClick={() => void run("simulate")}>
          {busy === "simulate" ? t("tryIt.simulating") : t("tryIt.simulate")}
        </Button>
      </div>
      <FormError message={error} />

      {test && (
        <ul className="m-0 list-none space-y-1 p-0 text-body" data-test="test-result">
          {test.items.map((i) => (
            <li key={i.position}>
              <span className="text-primary">{i.position + 1}. {t(`action.label.${i.actionType}`)}</span>
              <span className="text-tertiary"> — {isOutcome(i.outcome) ? t(`tryIt.outcome.${i.outcome}`) : i.outcome}{i.text ? `: ${i.text}` : ""}</span>
              {i.missingPlaceholders.length > 0 && (
                <span className="block text-hint text-status-pending-text">{t("tryIt.noValue", { names: i.missingPlaceholders.join(", ") })}</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {simulation && (
        <div className="space-y-2" data-test="simulation">
          {simulationNotes(t, simulation.notes, simulation.noteCodes).map((n, i) => (
            <p key={`${i}-${n}`} className="m-0 text-hint text-tertiary">{n}</p>
          ))}
          <ol className="m-0 list-none space-y-1 p-0 text-body">
            {simulation.steps.map((s) => {
              const { summary, note } = simulatedStepText(t, s);
              return (
                <li key={s.position} className={s.conditionMet === false ? "text-tertiary" : "text-primary"}>
                  <span className="tabular-nums">{s.date ? formatDisplayDate(s.date, { style: "medium" }) : "—"}</span>
                  {" · "}{summary}{s.late ? ` ${t("tryIt.late")}` : ""}
                  {note && <span className="block text-hint text-tertiary">{note}</span>}
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </section>
  );
}
