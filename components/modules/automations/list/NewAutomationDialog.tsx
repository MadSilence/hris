"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { useTranslations } from "next-intl";

import { Button } from "@/components/desact/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/desact/dialog";
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
 * The code's templates (`AutomationTemplates.java`), each with one short line of what it does — "Email the new
 * teammate", "Task for their manager" (the designers' Automations fixes, Words, 2026-11-18). A template not listed
 * here shows its first step's title instead.
 */
export const TEMPLATE_KEYS = [
  "welcome-email",
  "manager-first-day",
  "onboarding-done",
  "probation-review",
  "department-move",
  "monthly-details",
  "work-anniversary",
  "birthday",
  "document-expiry",
  "long-leave",
  "calendar-by-office",
  "termination-hr",
  "last-day-equipment",
] as const;
type TemplateKey = (typeof TEMPLATE_KEYS)[number];

const isKnownTemplate = (key: string): key is TemplateKey => (TEMPLATE_KEYS as readonly string[]).includes(key);

/**
 * New automation (`automations-start` → Main): 960 wide and as high as its content — describe it to noddo AI, pick a
 * template by category, or start from scratch. On a short window only the template grid scrolls (G1). Each way leaves
 * for the editor: `/automations/new?ai=…`, `?template=<key>`, or nothing. Nothing is kept on close.
 */
export const NewAutomationDialog: React.FC<{
  open: boolean;
  /** "Pick a template" on the empty list opens the dialog at the templates. */
  atTemplates?: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ open, atTemplates = false, onOpenChange }) => {
  const t = useTranslations("automationsList");
  const tCommon = useTranslations("common");
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
      <DialogContent
        size="lg"
        hideClose
        aria-describedby={undefined}
        className="flex max-h-[calc(100dvh-4rem)] flex-col gap-0 bg-card p-0 sm:max-w-[960px]"
      >
        {/* G2: padding 24 24 0; a 36 px close with a 20 px icon. */}
        <DialogHeader className="flex-row items-center justify-between gap-4 px-6 pt-6 pr-6">
          <DialogTitle>{t("newDialog.title")}</DialogTitle>
          <DialogClose asChild>
            <Button type="button" variant="ghost" size="icon" className="text-secondary" aria-label={tCommon("actions.close")}>
              <Icon icon={Cancel01Icon} />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="shrink-0 px-6 pt-4">
          <AiPromptField
            value={prompt}
            onChange={setPrompt}
            onSubmit={(value) => router.push(automationsHref.newWithAi(value))}
            variant="dialog"
            autoFocus={!atTemplates}
          />
        </div>

        {/* G4: the heading 15/22 600 with a hairline after it, 24 above; the chips 12 under it. */}
        <div ref={templatesRef} className="flex shrink-0 flex-col gap-3 px-6 pt-6">
          <div className="flex items-center gap-3">
            <h3 className="shrink-0 text-card-title text-primary">{t("newDialog.section")}</h3>
            <span aria-hidden className="h-px flex-1 bg-divider" />
          </div>
          {!templates.isLoading && !templates.error ? (
            <div className="flex flex-wrap gap-2" role="group" aria-label={t("newDialog.section")}>
              <FilterChip noCheck selected={category === null} onClick={() => setCategory(null)}>
                {t("newDialog.categories.all")}
              </FilterChip>
              {categories.map((name) => (
                <FilterChip key={name} selected={category === name} onClick={() => setCategory(name)}>
                  {t(`newDialog.categories.${name}`)}
                </FilterChip>
              ))}
            </div>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {templates.isLoading ? (
            <TemplatesSkeleton />
          ) : templates.error ? (
            <ErrorState error={templates.error} title={t("newDialog.templatesError")} compact onRetry={() => void templates.refetch()} />
          ) : (
            // G5: three to a row, 12 apart; the cards of a row as high as the highest.
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {shown.map((template) => (
                <li key={template.key} className="flex">
                  <TemplateCard template={template} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <DialogFooter className="shrink-0 border-t border-divider px-6 py-4">
          <Button type="button" variant="secondary" onClick={() => router.push(automationsHref.newFromScratch)}>
            {t("newDialog.fromScratch")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/** A template: its category, its name, what starts it and what it does. Radius 16, a hairline, the level-0 shadow (G5). */
const TemplateCard: React.FC<{ template: AutomationTemplate }> = ({ template }) => {
  const t = useTranslations("automationsList");
  const words = useAutomationWords();
  const trigger = template.definition.trigger;
  const firstStep = template.definition.steps[0] ?? null;
  return (
    <Link
      href={automationsHref.newFromTemplate(template.key)}
      className="flex w-full flex-col gap-2.5 rounded-card border border-divider bg-card p-4 text-left no-underline shadow-card transition-colors duration-(--duration-hover) hover:border-strong hover:bg-subtle focus-visible:shadow-focus focus-visible:outline-none"
    >
      <span className="text-hint text-tertiary">
        {isKnownCategory(template.category) ? t(`newDialog.categories.${template.category}`) : template.category}
      </span>
      <span className="-mt-1.5 line-clamp-2 text-card-title text-primary">{template.name}</span>
      <span className="flex flex-col gap-1 text-label font-normal text-secondary">
        {trigger ? (
          <span className="flex items-center gap-2">
            <Icon icon={triggerLineIcon(trigger)} size="sm" className="shrink-0 text-tertiary" />
            <span className="truncate">{words.triggerLine(trigger)}</span>
          </span>
        ) : null}
        {firstStep ? (
          <span className="flex items-center gap-2">
            <Icon icon={STEP_TYPE_ICONS[firstStep.type]} size="sm" className="shrink-0 text-tertiary" />
            <span className="truncate">
              {isKnownTemplate(template.key) ? t(`newDialog.does.${template.key}`) : words.stepTitle(firstStep)}
            </span>
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
      <li key={i} className="flex flex-col gap-2.5 rounded-card border border-divider p-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </li>
    ))}
  </ul>
);
