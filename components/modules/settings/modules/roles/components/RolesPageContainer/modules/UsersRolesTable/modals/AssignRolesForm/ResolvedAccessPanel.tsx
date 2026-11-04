"use client";

import { FC } from "react";
import { Badge } from "@/components/desact/badge";
import { ShieldCheckIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import {
  RoleAccessPreviewField,
  RoleAccessPreviewResource,
} from "@/api/modules/roles/dto/RoleAccessPreviewDTO";

/** Human wording for a scope — "SELF" tells an admin nothing at a glance. */
const SCOPE_LABELS: Record<string, string> = {
  SELF: "Own record",
  DIRECT_REPORTS: "Direct reports",
  COMPANY: "Whole company",
  CUSTOM: "Custom",
};

const ACTION_LABELS: Record<string, string> = {
  VIEW: "View",
  EDIT: "Edit",
  MANAGE: "Manage",
  BLOCK: "Block",
};

const scopeText = (scopes: string[]) =>
  scopes.length === 0 ? "" : scopes.map((s) => SCOPE_LABELS[s] ?? s).join(", ");

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
  if (isLoading) {
    return <p className="py-6 text-body text-tertiary">Resolving access…</p>;
  }

  if (systemOwner) {
    return (
      <div className="flex items-start gap-3 rounded-card border border-divider bg-subtle p-4">
        <Icon icon={ShieldCheckIcon} className="mt-0.5 shrink-0 text-secondary" />
        <div className="text-body">
          <p className="font-medium">Full access</p>
          <p className="text-tertiary">
            This selection includes the System Owner role, which grants everything and bypasses
            field-level restrictions. Listing individual rights here would understate it.
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
                <Badge variant="neutral" className="shrink-0">Custom</Badge>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Badge variant="outline">{ACTION_LABELS[row.action] ?? row.action}</Badge>
              <span className="text-hint text-tertiary">{scopeText(row.scopes)}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
};
