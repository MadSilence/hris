"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, LayoutTemplate } from "lucide-react";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { EmptyState, NoResults } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { formatDisplayDate } from "@/lib/date";
import type { TemplateKind, TemplateSummaryDTO } from "@/api/modules/templates/dto";
import { useTemplates } from "@/components/modules/settings/modules/templates/hooks";

/** The order the owner asked for (T1): field sets first, then roles, then checklists. */
export const TEMPLATE_KIND_ORDER: TemplateKind[] = ["FIELD_SET", "ROLE", "PROCESS"];

export const TEMPLATE_KIND_LABEL: Record<TemplateKind, string> = {
  FIELD_SET: "Field Sets",
  ROLE: "Roles",
  PROCESS: "Onboarding Checklists",
};

const KIND_DESCRIPTION: Record<TemplateKind, string> = {
  FIELD_SET: "A section of the profile and the fields in it.",
  ROLE: "A role with its permissions and field access.",
  PROCESS: "A checklist for a new joiner's first days, ready for the canvas.",
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
          icon={<LayoutTemplate className="h-6 w-6 text-brown-600"/>}
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
                <h2 id={`templates-${k}`} className="text-base font-semibold">{TEMPLATE_KIND_LABEL[k]}</h2>
                <p className="text-sm text-muted-foreground">{KIND_DESCRIPTION[k]}</p>
              </div>
              <ul className="divide-y divide-brown-100 rounded-lg border border-brown-200">
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
        className="flex items-center gap-4 px-4 py-3 no-underline hover:bg-brown-50"
      >
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-foreground">{template.title}</span>
            {template.suggested && <Badge variant="outline">Suggested</Badge>}
            {template.appliedVersion != null && (
              <Badge variant="outline" className="border-brown-200 bg-brown-50 text-brown-600">
                Applied v{template.appliedVersion}
                {template.appliedAt ? ` · ${formatDisplayDate(template.appliedAt, { style: "medium" })}` : ""}
              </Badge>
            )}
            {newer && <Badge variant="outline">v{template.version} Available</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">{template.summary}</p>
        </div>
        <span className="shrink-0 text-sm text-muted-foreground">
          {template.itemCount} {template.itemCount === 1 ? "item" : "items"}
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground"/>
      </Link>
    </li>
  );
};

const CatalogueSkeleton: React.FC = () => (
  <div className="space-y-2" aria-busy="true">
    <Skeleton className="h-5 w-40"/>
    <ul className="divide-y divide-brown-100 rounded-lg border border-brown-200">
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
