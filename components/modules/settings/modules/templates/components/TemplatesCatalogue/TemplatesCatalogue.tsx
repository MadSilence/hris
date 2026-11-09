"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Badge } from "@/components/desact/badge";
import { Skeleton } from "@/components/desact/skeleton";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { EmptyState, NoResults } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useDateFormatter } from "@/lib/date";
import type { TemplateKind, TemplateSummaryDTO } from "@/api/modules/templates/dto";
import { useTemplates } from "@/components/modules/settings/modules/templates/hooks";

/** The order the owner asked for (T1): field sets first, then roles, then checklists. */
export const TEMPLATE_KIND_ORDER: TemplateKind[] = ["FIELD_SET", "ROLE", "PROCESS", "REVIEW_FORM"];

/** Catalogue keys (`settings` namespace) of each kind's heading. */
export const TEMPLATE_KIND_LABEL_KEY = {
  FIELD_SET: "templates.kind.fieldSet.label",
  ROLE: "templates.kind.role.label",
  PROCESS: "templates.kind.process.label",
  REVIEW_FORM: "templates.kind.reviewForm.label",
} as const satisfies Record<TemplateKind, string>;

const KIND_DESCRIPTION_KEY = {
  FIELD_SET: "templates.kind.fieldSet.description",
  ROLE: "templates.kind.role.description",
  PROCESS: "templates.kind.process.description",
  REVIEW_FORM: "templates.kind.reviewForm.description",
} as const satisfies Record<TemplateKind, string>;

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
  const t = useTranslations("settings");

  const visible = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? [])
      .filter((template) => !kind || template.kind === kind)
      .filter((template) => !q || template.title.toLowerCase().includes(q) || template.summary.toLowerCase().includes(q));
  }, [data, kind, query]);

  const kinds = TEMPLATE_KIND_ORDER.filter((k) => !kind || k === kind);

  return (
    <div className="space-y-6">
      <ListToolbar search={{ value: query, onChange: setQuery }}/>

      {error ? (
        <ErrorState error={error} compact onRetry={() => void refetch()}/>
      ) : isLoading ? (
        <CatalogueSkeleton/>
      ) : (data ?? []).filter((template) => !kind || template.kind === kind).length === 0 ? (
        <EmptyState
          scene="templates"
          title={t("templates.catalogue.emptyTitle")}
          description={t("templates.catalogue.emptyDescription")}
        />
      ) : visible.length === 0 ? (
        <NoResults hint={t("templates.catalogue.noResultsHint")} onClearSearch={() => setQuery("")}/>
      ) : (
        kinds.map((k) => {
          const rows = visible.filter((template) => template.kind === k);
          if (rows.length === 0) return null;
          return (
            <section key={k} className="space-y-2" aria-labelledby={`templates-${k}`}>
              <div>
                <h2 id={`templates-${k}`} className="text-body font-semibold">{t(TEMPLATE_KIND_LABEL_KEY[k])}</h2>
                <p className="text-body text-tertiary">{t(KIND_DESCRIPTION_KEY[k])}</p>
              </div>
              <ul className="divide-y divide-divider rounded-control border border-divider">
                {rows.map((template) => <TemplateRow key={template.key} template={template}/>)}
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
};

const TemplateRow: React.FC<{ template: TemplateSummaryDTO }> = ({ template }) => {
  const t = useTranslations("settings");
  const formatDisplayDate = useDateFormatter();
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
            {template.suggested && <Badge variant="outline">{t("templates.suggested")}</Badge>}
            {template.appliedVersion != null && (
              <Badge variant="outline" className="border-divider bg-subtle text-secondary">
                {template.appliedAt
                  ? t("templates.catalogue.appliedAt", {
                      version: template.appliedVersion,
                      date: formatDisplayDate(template.appliedAt, { style: "medium" }),
                    })
                  : t("templates.catalogue.applied", { version: template.appliedVersion })}
              </Badge>
            )}
            {newer && <Badge variant="outline">{t("templates.catalogue.available", { version: template.version })}</Badge>}
          </div>
          <p className="text-body text-tertiary">{template.summary}</p>
        </div>
        <span className="shrink-0 text-body text-tertiary">
          {t("templates.catalogue.items", { count: template.itemCount })}
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
