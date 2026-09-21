"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ExternalLink, Mail, PanelRightClose } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/public/desact/src/components/ui/avatar";
import { cn } from "@/public/desact/src/components/ui/utils";
import type { OrgChartUser } from "@/models/orgChart/OrgChartUser";
import { Button } from "@/public/desact/src/components/ui/button";
import { UserPickerField } from "@/components/modules/settings/shared/UserPickerField/UserPickerField";

type Props = {
  user: OrgChartUser;
  manager: OrgChartUser | null;
  reports: OrgChartUser[];
  onSelect: (id: string) => void;
  onCollapse: () => void;
  /** Whether the viewer may change reporting lines — the same right the drag asks for. */
  canEditManager?: boolean;
  isSavingManager?: boolean;
  /** A new manager, or null to make the person a top of the organisation. */
  onChangeManager?: (managerId: string | null) => void;
  /**
   * Puts the picked person between this one and their manager: the picked person takes this one's
   * place, and this one reports to them. One call — the server moves both lines together.
   */
  onInsertManagerAbove?: (managerId: string) => void;
};

function fullName(u: OrgChartUser): string {
  return `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email;
}

function initials(u: OrgChartUser): string {
  const a = (u.firstName ?? "").trim();
  const b = (u.lastName ?? "").trim();
  const fromParts = (a ? a[0] : "") + (b ? b[0] : "");
  if (fromParts) return fromParts.toUpperCase();
  return (u.email ?? "?").slice(0, 2).toUpperCase();
}

function PersonRow({ user, onSelect }: { user: OrgChartUser; onSelect: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(user.id)}
      className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left transition-colors hover:bg-brown-50"
    >
      <Avatar className="h-6 w-6 flex-none">
        {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
        <AvatarFallback className="text-[10px]">{initials(user)}</AvatarFallback>
      </Avatar>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-brown-900">{fullName(user)}</span>
        {user.jobName ? (
          <span className="block truncate text-xs text-brown-500">{user.jobName}</span>
        ) : null}
      </span>
    </button>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-brown-400">{children}</h3>
  );
}

export function UserDetailPanel({
  user,
  manager,
  reports,
  onSelect,
  onCollapse,
  canEditManager = false,
  isSavingManager = false,
  onChangeManager,
  onInsertManagerAbove,
}: Props) {
  const [insertingAbove, setInsertingAbove] = useState(false);
  const isActive = user.status === "ACTIVE";
  const name = fullName(user);
  const orgRows: { label: string; value: string }[] = [];
  if (user.department) orgRows.push({ label: "Department", value: user.department.name });
  if (user.office) orgRows.push({ label: "Office", value: user.office.name });
  if (user.legalEntity) orgRows.push({ label: "Legal entity", value: user.legalEntity.name });

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="flex flex-none items-start gap-3 border-b border-brown-200 p-5">
        <Avatar className="h-12 w-12 flex-none">
          {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={name} /> : null}
          <AvatarFallback className="text-sm">{initials(user)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-semibold text-brown-900">{name}</h2>
          <p className="truncate text-sm text-brown-500">{user.jobName}</p>
          {/* Status is a field like any other: a caller who may not see it gets none, and "Suspended"
              would be a claim about somebody the API said nothing about. */}
          {user.status ? (
            <span
              className={cn(
                "mt-1.5 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-medium leading-none",
                isActive ? "bg-success-50 text-success-700" : "bg-brown-100 text-brown-500",
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", isActive ? "bg-success-500" : "bg-brown-400")} />
              {isActive ? "Active" : "Suspended"}
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onCollapse}
          aria-label="Hide panel"
          title="Hide panel"
          className="flex h-8 w-8 flex-none items-center justify-center rounded-md text-brown-400 hover:bg-brown-100 hover:text-brown-700"
        >
          <PanelRightClose className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
        {/* Contacts */}
        <div>
          <SectionTitle>Contacts</SectionTitle>
          {user.email ? (
            <a
              href={`mailto:${user.email}`}
              className="flex items-center gap-2 text-sm text-brown-700 no-underline hover:text-brown-900"
            >
              <Mail className="h-4 w-4 flex-none text-brown-400" />
              <span className="truncate">{user.email}</span>
            </a>
          ) : null}
          <Link
            href={`/organization/people/${user.id}/personal`}
            className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-brown-200 px-2.5 py-1.5 text-sm text-brown-700 no-underline transition-colors hover:bg-brown-50"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open full profile
          </Link>
        </div>

        {/* Reporting */}
        <div>
          <SectionTitle>Manager</SectionTitle>
          {manager ? (
            <PersonRow user={manager} onSelect={onSelect} />
          ) : (
            <p className="px-1.5 text-sm text-brown-400">Top of the organisation.</p>
          )}
          {/* The drag is the fast way; this is the way that does not need the other person on screen.
              Both write the profile's own manager field, so the rules (no cycles, not oneself) are the
              server's, and a refusal arrives as a card. */}
          {canEditManager && onChangeManager ? (
            <div className="mt-2 space-y-2 px-1.5">
              <UserPickerField
                value={null}
                onChange={(picked) => {
                  if (picked && picked.id !== user.id) onChangeManager(picked.id);
                }}
                placeholder={manager ? "Change manager…" : "Set a manager…"}
                allowClear={false}
                disabled={isSavingManager}
              />
              {manager ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSavingManager}
                  onClick={() => onChangeManager(null)}
                >
                  Remove Manager
                </Button>
              ) : null}
            </div>
          ) : null}
          {/* Inserting a level is the one reporting change a drag cannot express: two people move at
              once. It is its own action rather than two picks, so the server can do both or neither. */}
          {canEditManager && onInsertManagerAbove ? (
            <div className="mt-2 space-y-2 px-1.5">
              {insertingAbove ? (
                <>
                  <p className="text-xs text-brown-500">
                    {manager
                      ? `The person you pick will take ${name}'s place under ${fullName(manager)}, and ${name} will report to them.`
                      : `The person you pick will become the top of this branch, and ${name} will report to them.`}
                  </p>
                  <UserPickerField
                    value={null}
                    onChange={(picked) => {
                      if (!picked || picked.id === user.id) return;
                      setInsertingAbove(false);
                      onInsertManagerAbove(picked.id);
                    }}
                    allowClear={false}
                    disabled={isSavingManager}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isSavingManager}
                    onClick={() => setInsertingAbove(false)}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSavingManager}
                  onClick={() => setInsertingAbove(true)}
                >
                  Add Manager Above
                </Button>
              )}
            </div>
          ) : null}
        </div>

        <div>
          <SectionTitle>Direct reports ({reports.length})</SectionTitle>
          {reports.length > 0 ? (
            <div className="flex flex-col">
              {reports.map((r) => (
                <PersonRow key={r.id} user={r} onSelect={onSelect} />
              ))}
            </div>
          ) : (
            <p className="px-1.5 text-sm text-brown-400">No direct reports.</p>
          )}
        </div>

        {/* Organization */}
        {(orgRows.length > 0 || user.teams.length > 0) && (
          <div>
            <SectionTitle>Organization</SectionTitle>
            <div className="space-y-2">
              {orgRows.map((row) => (
                <div key={row.label} className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-brown-500">{row.label}</span>
                  <span className="truncate text-right text-brown-800">{row.value}</span>
                </div>
              ))}
              {user.teams.length > 0 && (
                <div className="text-sm">
                  <span className="text-brown-500">Teams</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {user.teams.map((t) => (
                      <span
                        key={t.id}
                        className="rounded border border-brown-200 bg-brown-50 px-1.5 py-0.5 text-[11px] leading-none text-brown-600"
                      >
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
