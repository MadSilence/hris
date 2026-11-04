"use client";

import { FC, useMemo, useState } from "react";
import { Add01Icon, Archive02Icon, ArchiveArrowUpIcon, Copy01Icon, Delete02Icon, Download01Icon, PlayIcon, ViewIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { Button } from "@/components/desact/button";
import { RowAction, RowActionDestructive, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { ListEmptyState } from "@/components/feedback/ListEmptyState";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/desact/table";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import { ExportDataModal } from "@/components/modules/settings/shared/ExportDataModal";
import type { ExportDataFormValues } from "@/components/modules/settings/shared/ExportDataModal/ExportDataForm";
import { triggerExportDownload } from "@/components/modules/settings/shared/ExportDataModal/triggerExportDownload";
import { PageDescription } from "@/components/ui/PageDescription/PageDescription";
import { TimeOffPoliciesSettingsSkeleton } from "../TimeOffPoliciesSettingsSkeleton";
import { TimeOffPolicyStatus } from "@/api/modules/timeOff/timeOffPolicies/dto";
import type { TimeOffPolicy } from "@/models/timeOff";
import { StatusBadge, type EntityStatus } from "@/components/ui/StatusBadge";

type Props = {
  policies: TimeOffPolicy[];
  isLoading: boolean;
  title?: string;
  backHref?: string;
  onCreateAction: () => void;
  onOpenAction: (policy: TimeOffPolicy) => void;
  onActivateAction: (policy: TimeOffPolicy) => void;
  onArchiveAction: (policy: TimeOffPolicy) => void;
  onUnarchiveAction: (policy: TimeOffPolicy) => void;
  onDeleteAction: (policy: TimeOffPolicy) => void;
  onDuplicateAction: (policy: TimeOffPolicy) => void;
};

/** This entity's three states, in the product's vocabulary. */
const policyStatus = (status: TimeOffPolicyStatus): EntityStatus => {
  switch (status) {
    case TimeOffPolicyStatus.Active:
      return "active";
    case TimeOffPolicyStatus.Archived:
      return "archived";
    default:
      return "draft";
  }
};

export const TimeOffPoliciesSettingsComponent: FC<Props> = ({
  policies,
  isLoading,
  title,
  backHref,
  onCreateAction,
  onOpenAction,
  onActivateAction,
  onArchiveAction,
  onUnarchiveAction,
  onDeleteAction,
  onDuplicateAction,
}) => {
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = async ({ format }: ExportDataFormValues) => {
    setExportError(null);
    try {
      await triggerExportDownload("/api/time-off/policies/export", format);
      setIsExportOpen(false);
    } catch (error) {
      // In the dialog, not the console: a failed download is otherwise completely silent.
      setExportError(error instanceof Error ? error.message : "Export failed.");
    }
  };

  const archivedCount = useMemo(
    () => policies.filter((p) => p.status === TimeOffPolicyStatus.Archived).length,
    [policies],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    // A switch between two views, not a widening of one. Rule:
    // `technical_documentation/ui/ACTIONS_AND_MENUS.md` § 5.
    const base = policies.filter((p) =>
      showArchived
        ? p.status === TimeOffPolicyStatus.Archived
        : p.status !== TimeOffPolicyStatus.Archived,
    );

    if (!q) return base;
    return base.filter((p) =>
      [p.name, p.description, p.unit, p.paid ? "paid" : "unpaid"]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q)),
    );
  }, [policies, query, showArchived]);

  const hasPolicies = policies.length > 0;

  const addPolicyButton = (
    <Button type="button" className="gap-1.5" onClick={onCreateAction}>
      <Icon icon={Add01Icon} size="sm" />
      Add policy
    </Button>
  );

  return (
    <div className="flex h-[calc(100svh-6rem)] flex-col overflow-hidden">
      <div className="shrink-0 px-8 pt-2">
        <div className="space-y-2">
          <SettingsPageHeader title={title ?? "Time off"} backHref={backHref ?? "/settings"} />
          <PageDescription className="text-body text-tertiary/90">
            Define leave types and quota rules for your organization. Use the table below to review,
            search and navigate to specific policies.
          </PageDescription>
        </div>

        {/* Info block */}
        <div className="space-y-1 pb-1 pt-5">
          <h2 className="text-section-title text-primary">Leave policies</h2>
          <p className="text-body text-tertiary">
            Every leave policy in your company. Archived ones are behind the toggle.
          </p>
        </div>

        <ListToolbar
          className="py-5"
          search={{ value: query, onChange: setQuery }}
          archived={{ count: archivedCount, showing: showArchived, onChange: setShowArchived }}
          secondary={
            <Button type="button"
              size="icon"
              variant="secondary"
              aria-label="Export policies"
              onClick={() => setIsExportOpen(true)}
            >
              <Icon icon={Download01Icon} size="sm" />
            </Button>
          }
          primary={addPolicyButton}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-8 pb-6">
        {!isLoading && !hasPolicies ? (
          <ListEmptyState
            scene="time-off"
            title="No time off policies yet"
            description="A policy holds the rules — how much leave, how it accrues, who approves it. Add the first one to start managing time off."
            onCreate={onCreateAction}
            createLabel="Add policy"
            className="min-h-72 flex-1"
          />
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <table className="w-full caption-bottom text-body table-fixed">
              <TableHeader className="[&_tr]:border-divider sticky top-0 z-10 bg-card">
                <TableRow>
                  <TableHead className="pl-4">Policy</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Pay type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TimeOffPoliciesSettingsSkeleton />
                ) : filtered.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={5}>
                      <ListEmptyState
                        query={query}
                        archivedView={showArchived}
                        scene="time-off"
                        title="No time off policies yet"
                        description="A policy holds the rules — how much leave, how it accrues, who approves it. Add the first one to start managing time off."
                        noResultsHint="Try a different policy name or unit."
                        archivedDescription="Archived policies will appear here."
                        onCreate={onCreateAction}
                        createLabel="Add policy"
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((policy) => {
                    const status = policyStatus(policy.status);
                    return (
                      <TableRow
                        key={policy.id}
                        className="group border-divider cursor-pointer hover:bg-subtle [&_td]:py-2"
                        onClick={() => onOpenAction(policy)}
                      >
                        <TableCell className="py-3 pl-4">
                          <span className="font-medium text-primary">{policy.name}</span>
                        </TableCell>
                        <TableCell className="text-tertiary">
                          {policy.unit === "DAYS" ? "Days" : "Hours"}
                        </TableCell>
                        <TableCell className="text-tertiary">
                          {policy.paid ? "Paid" : "Unpaid"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={status}/>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end">
                            <RowActionsMenu label="Policy actions">
                              <RowAction
                                icon={<Icon icon={ViewIcon} size="sm" />}
                                onClick={() => onOpenAction(policy)}
                              >
                                Open
                              </RowAction>

                              {/* A policy is nine sections and a wizard; copying one was the
                                  only way to start from something that already works. */}
                              <RowAction
                                icon={<Icon icon={Copy01Icon} size="sm" />}
                                onClick={() => onDuplicateAction(policy)}
                              >
                                Duplicate
                              </RowAction>

                              {policy.status === TimeOffPolicyStatus.Draft && (
                                <RowAction
                                  icon={<Icon icon={PlayIcon} size="sm" />}
                                  onClick={() => onActivateAction(policy)}
                                >
                                  Activate
                                </RowAction>
                              )}

                              {policy.status === TimeOffPolicyStatus.Active && (
                                <RowAction
                                  icon={<Icon icon={Archive02Icon} size="sm" />}
                                  onClick={() => onArchiveAction(policy)}
                                >
                                  Archive
                                </RowAction>
                              )}

                              {/*
                                Archiving a policy used to be permanent: there was an /archive
                                endpoint and no inverse, and /activate refuses an archived policy
                                outright. The row simply stopped being actionable, with nothing
                                saying it was one-way.

                                It comes back as a draft rather than active, so restoring a policy
                                and resuming accrual for everybody assigned to it stay two
                                decisions.
                              */}
                              {policy.status === TimeOffPolicyStatus.Archived && (
                                <RowAction
                                  icon={<Icon icon={ArchiveArrowUpIcon} size="sm" />}
                                  onClick={() => onUnarchiveAction(policy)}
                                >
                                  Unarchive
                                </RowAction>
                              )}

                              {policy.status === TimeOffPolicyStatus.Draft && (
                                <RowActionDestructive
                                  icon={<Icon icon={Delete02Icon} size="sm" />}
                                  onClick={() => onDeleteAction(policy)}
                                >
                                  Delete
                                </RowActionDestructive>
                              )}
                            </RowActionsMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </table>
          </div>
        )}
      </div>

      <ExportDataModal
        isOpen={isExportOpen}
        title="Export time-off policies"
        description="Export the policy catalogue, archived policies included."
        includedText="Includes leave type, name, status, unit, pay type, quota, granting mode, renewal, carryover and how many people hold each one."
        errorMessage={exportError}
        onCancelAction={() => setIsExportOpen(false)}
        onConfirmAction={handleExport}
      />
    </div>
  );
};

