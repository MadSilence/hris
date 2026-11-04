"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Badge } from "@/components/desact/badge";
import { Skeleton } from "@/components/desact/skeleton";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { EmptyState, NoResults } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { formatDisplayDate } from "@/lib/date";
import type { TemplateKind, TemplateSummaryDTO } from "@/api/modules/templates/dto";
import { useTemplates } from "@/components/modules/settings/modules/templates/hooks";

/** The order the owner asked for (T1): field sets first, then roles, then checklists. */
export const TEMPLATE_KIND_ORDER: TemplateKind[] = ["FIELD_SET", "ROLE", "PROCESS", "REVIEW_FORM"];

export const TEMPLATE_KIND_LABEL: Record<TemplateKind, string> = {
  FIELD_SET: "Field sets",
  ROLE: "Roles",
  PROCESS: "Onboarding checklists",
  REVIEW_FORM: "Review forms",
};

const KIND_DESCRIPTION: Record<TemplateKind, string> = {
  FIELD_SET: "A section of the profile and the fields in it.",
  ROLE: "A role with its permissions and field access.",
  PROCESS: "A checklist for a new joiner's first days, ready for the canvas.",
  REVIEW_FORM: "A performance review form, ready for a review cycle.",
};

export interface TemplatesCatalogueProps {
  /** Only this kind — the "Add from Library" entry on the attributes page opens the field sets. */
  kind?: TemplateKind;
}

/**
 * Settings → General → Templates: the catalogue of ready-made configuration (TEMPLATES_DESIGN.md § 4.3).
 * A quiet list grouped by kind; each row opens the template's preview, which is where it is applied.
 */
export const TemplatesCatalogue: React.FC<TemplatesCatalogueProps> = ({ kind }) => {
  const { data, isLoading, error, refetch } = useTemplates();
  const [query, setQuery] = React.useState("");

  const visible = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? [])
      .filter((t) => !kind || t.kind === kind)
      .filter((t) => !q || t.title.toLowerCase().includes(q) || t.summary.toLowerCase().includes(q));
  }, [data, kind, query]);

  const kinds = TEMPLATE_KIND_ORDER.filter((k) => !kind || k === kind);

  return (
    <div className="space-y-6">
      <ListToolbar search={{ value: query, onChange: setQuery }}/>

      {error ? (
        <ErrorState error={error} compact onRetry={() => void refetch()}/>
      ) : isLoading ? (
        <CatalogueSkeleton/>
      ) : (data ?? []).filter((t) => !kind || t.kind === kind).length === 0 ? (
        <EmptyState
          scene="forms"
          title="No templates to apply"
          description="Templates appear here for what you may set up: roles, profile fields or onboarding checklists."
        />
      ) : visible.length === 0 ? (
        <NoResults hint="Try a different name."/>
      ) : (
        kinds.map((k) => {
          const rows = visible.filter((t) => t.kind === k);
          if (rows.length === 0) return null;
          return (
            <section key={k} className="space-y-2" aria-labelledby={`templates-${k}`}>
              <div>
                <h2 id={`templates-${k}`} className="text-body font-semibold">{TEMPLATE_KIND_LABEL[k]}</h2>
                <p className="text-body text-tertiary">{KIND_DESCRIPTION[k]}</p>
              </div>
              <ul className="divide-y divide-divider rounded-control border border-divider">
                {rows.map((t) => <TemplateRow key={t.key} template={t}/>)}
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
};

const TemplateRow: React.FC<{ template: TemplateSummaryDTO }> = ({ template }) => {
  const newer = template.appliedVersion != null && template.appliedVersion < template.version;
  return (
    <li>
      <Link
        href={`/settings/general/templates/${encodeURIComponent(template.key)}`}
        className="flex items-center gap-4 px-4 py-3 no-underline hover:bg-subtle"
      >
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-primary">{template.title}</span>
            {template.suggested && <Badge variant="outline">Suggested</Badge>}
            {template.appliedVersion != null && (
              <Badge variant="outline" className="border-divider bg-subtle text-secondary">
                Applied v{template.appliedVersion}
                {template.appliedAt ? ` · ${formatDisplayDate(template.appliedAt, { style: "medium" })}` : ""}
              </Badge>
            )}
            {newer && <Badge variant="outline">v{template.version} Available</Badge>}
          </div>
          <p className="text-body text-tertiary">{template.summary}</p>
        </div>
        <span className="shrink-0 text-body text-tertiary">
          {template.itemCount} {template.itemCount === 1 ? "item" : "items"}
        </span>
        <Icon icon={ArrowRight01Icon} size="sm" className="shrink-0 text-tertiary" />
      </Link>
    </li>
  );
};

const CatalogueSkeleton: React.FC = () => (
  <div className="space-y-2" aria-busy="true">
    <Skeleton className="h-5 w-40"/>
    <ul className="divide-y divide-divider rounded-control border border-divider">
      {[0, 1, 2].map((i) => (
        <li key={i} className="flex items-center gap-4 px-4 py-3">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48"/>
            <Skeleton className="h-3 w-80"/>
          </div>
          <Skeleton className="h-3 w-12"/>
        </li>
      ))}
    </ul>
  </div>
);
