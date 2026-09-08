"use client";

import { FC, useMemo, useState } from "react";
import { Archive, ArchiveRestore, Clock, Copy, Download, Eye, MoreVertical, Play, Plus, Search, Trash2 } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/public/desact/src/components/ui/dropdown-menu";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/public/desact/src/components/ui/table";
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return policies;
    return policies.filter((p) =>
      [p.displayName, p.description, p.unit, p.paid ? "paid" : "unpaid"]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q)),
    );
  }, [policies, query]);

  const hasPolicies = policies.length > 0;

  const addPolicyButton = (
    <Button className="gap-1.5" onClick={onCreateAction}>
      <Plus className="h-4 w-4" />
      Add policy
    </Button>
  );

  return (
    <div className="flex h-[calc(100svh-6rem)] flex-col overflow-hidden">
      <div className="shrink-0 px-8 pt-2">
        <div className="space-y-2">
          <SettingsPageHeader title={title ?? "Time off"} backHref={backHref ?? "/settings"} />
          <PageDescription className="text-base text-muted-foreground/90">
            Define leave types and quota rules for your organization. Use the table below to review,
            search and navigate to specific policies.
          </PageDescription>
        </div>

        {/* Info block */}
        <div className="space-y-1 pb-1 pt-5">
          <h2 className="text-lg font-semibold text-foreground">Leave policies</h2>
          <p className="text-sm text-muted-foreground">
            Every leave policy in your company — draft, active and archived.
          </p>
        </div>

        {/* Toolbar: search (left) + actions (right) */}
        <div className="flex items-center justify-between gap-4 py-5">
          <div className="relative w-[260px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brown-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              className="h-9 w-[260px] pl-9"
              placeholder="Search policies"
              inputMode="search"
            />
          </div>

          <div className="flex items-center gap-3">
            {addPolicyButton}
            {/* The button rendered with no handler behind it — one of the two dead export buttons
                the frontend rules name as "do not copy this". */}
            <Button
              size="icon"
              variant="outline"
              aria-label="Export policies"
              onClick={() => setIsExportOpen(true)}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-8 pb-6">
        {!isLoading && !hasPolicies ? (
          <EmptyState action={addPolicyButton} />
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <table className="w-full caption-bottom text-sm table-fixed">
              <TableHeader className="[&_tr]:border-brown-200 sticky top-0 z-10 bg-white">
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
                      <SearchEmptyState query={query} noun="policies" />
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((policy) => {
                    const status = policyStatus(policy.status);
                    return (
                      <TableRow
                        key={policy.id}
                        className="group border-brown-200 cursor-pointer hover:bg-brown-50 [&_td]:py-2"
                        onClick={() => onOpenAction(policy)}
                      >
                        <TableCell className="py-3 pl-4">
                          <span className="font-medium text-primary">{policy.displayName}</span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {policy.unit === "DAYS" ? "Days" : "Hours"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {policy.paid ? "Paid" : "Unpaid"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={status}/>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-brown-500 hover:bg-brown-50 hover:text-brown-700"
                                  aria-label="Policy actions"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44 rounded-lg p-1.5">
                                <DropdownMenuItem
                                  onClick={() => onOpenAction(policy)}
                                  className="gap-2.5 rounded-md px-2.5 py-2 cursor-pointer"
                                >
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                  Open
                                </DropdownMenuItem>

                                {/* A policy is nine sections and a wizard; copying one was the
                                    only way to start from something that already works. */}
                                <DropdownMenuItem
                                  onClick={() => onDuplicateAction(policy)}
                                  className="gap-2.5 rounded-md px-2.5 py-2 cursor-pointer"
                                >
                                  <Copy className="h-4 w-4" />
                                  Duplicate
                                </DropdownMenuItem>

                                {policy.status === TimeOffPolicyStatus.Draft && (
                                  <DropdownMenuItem
                                    onClick={() => onActivateAction(policy)}
                                    className="gap-2.5 rounded-md px-2.5 py-2 cursor-pointer"
                                  >
                                    <Play className="h-4 w-4 text-muted-foreground" />
                                    Activate
                                  </DropdownMenuItem>
                                )}

                                {policy.status === TimeOffPolicyStatus.Active && (
                                  <DropdownMenuItem
                                    onClick={() => onArchiveAction(policy)}
                                    className="gap-2.5 rounded-md px-2.5 py-2 cursor-pointer"
                                  >
                                    <Archive className="h-4 w-4 text-muted-foreground" />
                                    Archive
                                  </DropdownMenuItem>
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
                                  <DropdownMenuItem
                                    onClick={() => onUnarchiveAction(policy)}
                                    className="gap-2.5 rounded-md px-2.5 py-2 cursor-pointer"
                                  >
                                    <ArchiveRestore className="h-4 w-4 text-muted-foreground" />
                                    Unarchive
                                  </DropdownMenuItem>
                                )}

                                {policy.status === TimeOffPolicyStatus.Draft && (
                                  <>
                                    <DropdownMenuSeparator className="my-1.5 bg-brown-100" />
                                    <DropdownMenuItem
                                      onClick={() => onDeleteAction(policy)}
                                      className="gap-2.5 rounded-md px-2.5 py-2 cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
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

function SearchEmptyState({ query, noun }: { query: string; noun: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-3 rounded-2xl bg-brown-50 p-3">
        <Search className="h-6 w-6 text-brown-500" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">No {noun} found</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Nothing matches{query.trim() ? ` “${query.trim()}”` : " your search"}. Try a different term.
      </p>
    </div>
  );
}

function EmptyState({ action }: { action: React.ReactNode }) {
  return (
    <div className="flex min-h-72 flex-1 flex-col items-center justify-center rounded-lg border border-dashed px-6 py-12 text-center">
      <div className="mb-4 rounded-2xl bg-brown-50 p-4">
        <Clock className="h-7 w-7 text-brown-600" />
      </div>
      <h3 className="text-base font-semibold text-foreground">No time off policies yet</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Create your first leave policy to start managing time off for your team.
      </p>
      <div className="mt-5">{action}</div>
    </div>
  );
}
