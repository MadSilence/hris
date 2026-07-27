"use client";

import { FC } from "react";
import { Clock, FilePlus2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { CardContent } from "@/public/desact/src/components/ui/card";
import { Badge } from "@/public/desact/src/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/public/desact/src/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/public/desact/src/components/ui/table";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import { TimeOffPoliciesSettingsSkeleton } from "../TimeOffPoliciesSettingsSkeleton";
import { TimeOffPolicyStatus } from "@/api/modules/timeOff/timeOffPolicies/dto";
import type { TimeOffPolicy } from "@/models/timeOff";

type Props = {
  policies: TimeOffPolicy[];
  isLoading: boolean;
  onCreateAction: () => void;
  onEditAction: (policy: TimeOffPolicy) => void;
  onActivateAction: (policy: TimeOffPolicy) => void;
  onArchiveAction: (policy: TimeOffPolicy) => void;
  onDeleteAction: (policy: TimeOffPolicy) => void;
};

const getStatusBadgeClassName = (status: TimeOffPolicyStatus) => {
  switch (status) {
    case TimeOffPolicyStatus.Active:
      return "bg-green-100 text-green-800 border-green-200";
    case TimeOffPolicyStatus.Draft:
      return "bg-gray-100 text-gray-800 border-gray-200";
    case TimeOffPolicyStatus.Archived:
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusLabel = (status: TimeOffPolicyStatus) => {
  switch (status) {
    case TimeOffPolicyStatus.Active:
      return "Active";
    case TimeOffPolicyStatus.Draft:
      return "Draft";
    case TimeOffPolicyStatus.Archived:
      return "Archived";
    default:
      return status;
  }
};

export const TimeOffPoliciesSettingsComponent: FC<Props> = ({
  policies,
  isLoading,
  onCreateAction,
  onEditAction,
  onActivateAction,
  onArchiveAction,
  onDeleteAction,
}) => {
  const hasPolicies = policies.length > 0;

  return (
    <div className="min-h-svh bg-[var(--color-bg-primary)] p-4">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <SettingsPageHeader title="Time off" backHref="/settings" />

        <CardContent className="flex flex-col gap-4 px-0 py-5">
          <div className="flex flex-col gap-4 py-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                Leave policies
              </h2>
              <p className="text-sm text-[var(--color-text-tertiary)]">
                Define leave types and quota rules for your organization.
              </p>
            </div>

            <Button onClick={onCreateAction}>
              <FilePlus2 className="mr-2 h-4 w-4" />
              Add policy
            </Button>
          </div>

          {isLoading ? (
            <TimeOffPoliciesSettingsSkeleton />
          ) : hasPolicies ? (
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Policy</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Pay type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {policies.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-[var(--color-text-primary)]">
                            {policy.displayName}
                          </p>
                          {policy.description && (
                            <p className="text-sm text-[var(--color-text-tertiary)]">
                              {policy.description}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="capitalize">
                        {policy.unit === "DAYS" ? "Days" : "Hours"}
                      </TableCell>

                      <TableCell>
                        {policy.paid ? "Paid" : "Unpaid"}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusBadgeClassName(policy.status)}
                        >
                          {getStatusLabel(policy.status)}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Policy actions"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onSelect={() => onEditAction(policy)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>

                            {policy.status === TimeOffPolicyStatus.Draft && (
                              <DropdownMenuItem
                                onSelect={() => onActivateAction(policy)}
                              >
                                <Clock className="mr-2 h-4 w-4" />
                                Activate
                              </DropdownMenuItem>
                            )}

                            {policy.status === TimeOffPolicyStatus.Active && (
                              <DropdownMenuItem
                                onSelect={() => onArchiveAction(policy)}
                              >
                                <Clock className="mr-2 h-4 w-4" />
                                Archive
                              </DropdownMenuItem>
                            )}

                            {policy.status === TimeOffPolicyStatus.Draft && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  variant="destructive"
                                  onSelect={() => onDeleteAction(policy)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed px-6 py-12 text-center">
              <div className="mb-4 rounded-2xl bg-brown-50 p-4">
                <Clock className="h-7 w-7 text-[var(--color-text-primary)]" />
              </div>

              <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
                No time off policies yet
              </h3>

              <p className="mt-2 max-w-md text-sm text-[var(--color-text-tertiary)]">
                Create your first leave policy to start managing time off for
                your team.
              </p>

              <Button className="mt-5" onClick={onCreateAction}>
                <FilePlus2 className="mr-2 h-4 w-4" />
                Add policy
              </Button>
            </div>
          )}
        </CardContent>
      </div>
    </div>
  );
};
