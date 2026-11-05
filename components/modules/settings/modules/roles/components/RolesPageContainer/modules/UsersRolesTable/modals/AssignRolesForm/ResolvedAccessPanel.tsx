"use client";

import { FC } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/desact/badge";
import { ShieldCheckIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import {
  RoleAccessPreviewField,
  RoleAccessPreviewResource,
} from "@/api/modules/roles/dto/RoleAccessPreviewDTO";

/** Human wording for a scope — "SELF" tells an admin nothing at a glance. */
const SCOPE_LABEL_KEYS = {
  SELF: "roles.permissions.scope.self",
  DIRECT_REPORTS: "roles.permissions.scope.directReports",
  COMPANY: "roles.permissions.scope.company",
  CUSTOM: "roles.permissions.scope.customShort",
} as const;

const ACTION_LABEL_KEYS = {
  VIEW: "roles.permissions.action.view",
  EDIT: "roles.permissions.action.edit",
  MANAGE: "roles.permissions.action.manage",
  BLOCK: "roles.permissions.action.block",
} as const;

type Translator = ReturnType<typeof useTranslations<"settings">>;

const scopeText = (t: Translator, scopes: string[]) =>
  scopes.length === 0
    ? ""
    : scopes.map((s) => (s in SCOPE_LABEL_KEYS ? t(SCOPE_LABEL_KEYS[s as keyof typeof SCOPE_LABEL_KEYS]) : s)).join(", ");

export interface ResolvedAccessPanelProps {
  isLoading: boolean;
  systemOwner: boolean;
  rows: RoleAccessPreviewResource[] | RoleAccessPreviewField[] | undefined;
  emptyText: string;
}

/**
 * Renders either resolved permissions or resolved field visibility — the two differ only in what
 * the first column names, so one component covers both tabs.
 */
export const ResolvedAccessPanel: FC<ResolvedAccessPanelProps> = ({
  isLoading,
  systemOwner,
  rows,
  emptyText,
}) => {
  const t = useTranslations("settings");
  if (isLoading) {
    return <p className="py-6 text-body text-tertiary">{t("roles.assign.resolving")}</p>;
  }

  if (systemOwner) {
    return (
      <div className="flex items-start gap-3 rounded-card border border-divider bg-subtle p-4">
        <Icon icon={ShieldCheckIcon} className="mt-0.5 shrink-0 text-secondary" />
        <div className="text-body">
          <p className="font-medium">{t("roles.assign.fullAccess")}</p>
          <p className="text-tertiary">
            {t("roles.assign.fullAccessBody")}
          </p>
        </div>
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return <p className="py-6 text-body text-tertiary">{emptyText}</p>;
  }

  return (
    <ul className="divide-y divide-divider">
      {rows.map((row) => {
        const key = "resourceCode" in row ? row.resourceCode : row.fieldKey;
        const isCustomField = "source" in row && row.source === "custom";

        return (
          <li key={key} className="flex items-center justify-between gap-3 py-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="truncate text-body">{row.label}</span>
              {isCustomField && (
                <Badge variant="neutral" className="shrink-0">{t("roles.assign.customField")}</Badge>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Badge variant="outline">{row.action in ACTION_LABEL_KEYS ? t(ACTION_LABEL_KEYS[row.action as keyof typeof ACTION_LABEL_KEYS]) : row.action}</Badge>
              <span className="text-hint text-tertiary">{scopeText(t, row.scopes)}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
};
