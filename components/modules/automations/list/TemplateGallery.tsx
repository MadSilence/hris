"use client";

import React from "react";
import { Skeleton } from "@/components/desact/skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useAutomationTemplates } from "@/components/modules/automations/hooks";
import type { AutomationTemplate } from "@/models/automations";

/**
 * The shipped starting points (D3), by what they are about. Each opens the builder filled in; nothing is saved until
 * Publish, and what a template leaves for the company to choose (a role, a calendar) the preview asks for.
 */
export function TemplateGallery({ onPick }: { onPick: (key: string) => void }) {
  const templates = useAutomationTemplates();
  if (templates.error) return <ErrorState error={templates.error} />;
  if (templates.isLoading || !templates.data) {
    return (
      <div className="grid w-full gap-2 sm:grid-cols-2" aria-busy="true">
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-card" />)}
      </div>
    );
  }
  const byCategory = templates.data.reduce<Record<string, AutomationTemplate[]>>((acc, t) => {
    (acc[t.category] ??= []).push(t);
    return acc;
  }, {});
  return (
    <div className="w-full space-y-4 text-left" data-test="template-gallery">
      {Object.entries(byCategory).map(([category, list]) => (
        <section key={category} className="space-y-2">
          <h4 className="m-0 text-hint font-medium text-tertiary">{category}</h4>
          <div className="grid gap-2 sm:grid-cols-2">
            {list.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => onPick(t.key)}
                className="rounded-card border border-divider bg-card p-4 text-left transition hover:bg-subtle"
              >
                <span className="block text-body font-medium text-primary">{t.name}</span>
                <span className="block text-hint text-tertiary">{t.description}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
