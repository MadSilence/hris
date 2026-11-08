"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { Button } from "@/components/desact/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/desact/dialog";
import { Icon } from "@/components/desact/icon";
import { Skeleton } from "@/components/desact/skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { FilterChip } from "@/components/ui/FilterChip";
import { useAutomationTemplates } from "@/components/modules/automations/hooks";
import { useAutomationWords } from "./seams";
import { AiPromptField, STEP_TYPE_ICONS, triggerLineIcon } from "@/components/modules/automations/shared";
import type { AutomationTemplate } from "@/models/automations";
import { automationsHref } from "./listModel";

/** The categories of the code's templates, in the dialog's order; a template's `category` is one of these names. */
export const TEMPLATE_CATEGORIES = ["Onboarding", "People", "Celebrations", "Compliance", "Time off", "Offboarding"] as const;
export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];

const isKnownCategory = (category: string): category is TemplateCategory =>
  (TEMPLATE_CATEGORIES as readonly string[]).includes(category);

/**
 * New automation (`automations-start` → Main): 800 wide — describe it to noddo AI, or pick a template by category,
 * or start from scratch. Each way leaves for the editor: `/automations/new?ai=…`, `?template=<key>`, or nothing.
 * Nothing is kept on close.
 */
export const NewAutomationDialog: React.FC<{
  open: boolean;
  /** "Pick a template" on the empty list opens the dialog at the templates. */
  atTemplates?: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ open, atTemplates = false, onOpenChange }) => {
  const t = useTranslations("automationsList");
  const router = useRouter();
  const [prompt, setPrompt] = React.useState("");
  const [category, setCategory] = React.useState<TemplateCategory | null>(null);
  const templatesRef = React.useRef<HTMLDivElement>(null);
  const templates = useAutomationTemplates(open);

  React.useEffect(() => {
    if (!open) {
      setPrompt("");
      setCategory(null);
    }
  }, [open]);

  React.useEffect(() => {
    if (open && atTemplates && templates.data) templatesRef.current?.scrollIntoView?.({ block: "start" });
  }, [open, atTemplates, templates.data]);

  // Only the categories that have a template — a category is never empty.
  const categories = TEMPLATE_CATEGORIES.filter((name) => (templates.data ?? []).some((tpl) => tpl.category === name));
  const shown = (templates.data ?? []).filter((tpl) => category === null || tpl.category === category);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" aria-describedby={undefined} className="max-h-[calc(100dvh-4rem)] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 bg-card p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>{t("newDialog.title")}</DialogTitle>
        </DialogHeader>

        <div className="flex min-h-0 flex-col gap-5 overflow-y-auto px-6 pb-6">
          <AiPromptField
            value={prompt}
            onChange={setPrompt}
            onSubmit={(value) => router.push(automationsHref.newWithAi(value))}
            variant="dialog"
            autoFocus={!atTemplates}
          />

          <div ref={templatesRef} className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <h3 className="shrink-0 text-body font-semibold text-primary">{t("newDialog.section")}</h3>
              <span aria-hidden className="h-px flex-1 bg-divider" />
            </div>

            {templates.isLoading ? (
              <TemplatesSkeleton />
            ) : templates.error ? (
              <ErrorState error={templates.error} title={t("newDialog.templatesError")} compact onRetry={() => void templates.refetch()} />
            ) : (
              <>
                <div className="flex flex-wrap gap-2" role="group" aria-label={t("newDialog.section")}>
                  <FilterChip selected={category === null} onClick={() => setCategory(null)}>
                    {t("newDialog.categories.all")}
                  </FilterChip>
                  {categories.map((name) => (
                    <FilterChip key={name} selected={category === name} onClick={() => setCategory(name)}>
                      {t(`newDialog.categories.${name}`)}
                    </FilterChip>
                  ))}
                </div>
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {shown.map((template) => (
                    <li key={template.key}>
                      <TemplateCard template={template} />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        <DialogFooter className="border-t border-divider px-6 py-4">
          <Button type="button" variant="secondary" onClick={() => router.push(automationsHref.newFromScratch)}>
            {t("newDialog.fromScratch")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/** A template: its category, its name, what starts it and what it does first. Radius 10, a hairline, no shadow. */
const TemplateCard: React.FC<{ template: AutomationTemplate }> = ({ template }) => {
  const t = useTranslations("automationsList");
  const words = useAutomationWords();
  const trigger = template.definition.trigger;
  const firstStep = template.definition.steps[0] ?? null;
  return (
    <Link
      href={automationsHref.newFromTemplate(template.key)}
      className="flex h-full flex-col gap-1 rounded-popover border border-divider bg-card p-4 text-left no-underline transition-colors duration-(--duration-hover) hover:border-strong hover:bg-subtle focus-visible:shadow-focus focus-visible:outline-none"
    >
      <span className="text-hint text-tertiary">
        {isKnownCategory(template.category) ? t(`newDialog.categories.${template.category}`) : template.category}
      </span>
      <span className="line-clamp-2 text-card-title text-primary">{template.name}</span>
      <span className="mt-1 flex flex-col gap-1 text-label font-normal text-secondary">
        {trigger ? (
          <span className="flex items-center gap-2">
            <Icon icon={triggerLineIcon(trigger)} size="sm" className="shrink-0 text-tertiary" />
            <span className="truncate">{words.triggerLine(trigger)}</span>
          </span>
        ) : null}
        {firstStep ? (
          <span className="flex items-center gap-2">
            <Icon icon={STEP_TYPE_ICONS[firstStep.type]} size="sm" className="shrink-0 text-tertiary" />
            <span className="truncate">{words.stepTitle(firstStep)}</span>
          </span>
        ) : null}
      </span>
    </Link>
  );
};

/** Six cards in the grid's shape while the templates load. */
const TemplatesSkeleton: React.FC = () => (
  <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-busy="true">
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <li key={i} className="flex flex-col gap-2 rounded-popover border border-divider p-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </li>
    ))}
  </ul>
);
