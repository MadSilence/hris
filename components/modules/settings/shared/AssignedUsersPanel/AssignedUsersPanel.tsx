"use client";

import { useState, type ReactNode } from "react";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import { Input } from "@/public/desact/src/components/ui/input";
import { Button } from "@/public/desact/src/components/ui/button";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/public/desact/src/components/ui/table";
import { Download, Plus, Search, Users, X } from "lucide-react";
import { PermissionGate } from "@/components/auth/PermissionGate";
import type { ResourceCode } from "@/models/access";
import type { AssignedUser } from "@/models/assignedUser";
import { formatUserStatus, isActiveStatus } from "@/models/user/status";
import UserChip from "@/components/modules/settings/shared/UserChip/UserChip";
import { AssignPeopleModal } from "@/components/audience/assignment/AssignPeopleModal";
import { assignedUsersQueryKey } from "@/components/audience/assignment/hooks/useAssignedUsers";
import { unassignUserAction } from "@/components/audience/assignment/actions/assignmentActions";
import { ActionStatus } from "@/components/models/ActionStatus";

export interface AssignedUsersPanelProps {
  title?: string;
  description: string;
  searchPlaceholder?: string;
  manageResource?: ResourceCode;
  rows?: AssignedUser[];
  isLoading?: boolean;
  total?: number;
  query?: string;
  onQueryChange?: (value: string) => void;
  secondaryColumn?: { header: string; render: (user: AssignedUser) => ReactNode };
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  fillParent?: boolean;

  assign?: {
    basePath: string;
    assignableId: string;
    assignableName?: string;
    noun: string;
    semantics?: "add" | "replace";
    invalidateKeys?: QueryKey[];
  };
}

const SCROLL_OFFSET = "calc(100svh - 390px)";

export default function AssignedUsersPanel({
  title = "Assigned People",
  description,
  searchPlaceholder = "Search users",
  manageResource,
  rows = [],
  isLoading = false,
  total,
  query,
  onQueryChange,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  assign,
  secondaryColumn,
  fillParent = false,
}: AssignedUsersPanelProps) {
  const secondary = secondaryColumn ?? {
    header: "Position",
    render: (u: AssignedUser) => u.jobName || "—",
  };
  const queryClient = useQueryClient();
  const [internalQuery, setInternalQuery] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const q = query ?? internalQuery;
  const setQuery = onQueryChange ?? setInternalQuery;
  const searching = q.trim().length > 0;

  const isEmpty = !isLoading && rows.length === 0;
  const canRemove = Boolean(assign);

  const handleRemove = async (userId: string) => {
    if (!assign) return;

    setRemovingId(userId);
    try {
      const result = await unassignUserAction(assign.basePath, assign.assignableId, userId);
      if (result.status === ActionStatus.SUCCESS) {
        await queryClient.invalidateQueries({
          queryKey: assignedUsersQueryKey(assign.basePath, assign.assignableId),
        });
        await Promise.all(
          (assign.invalidateKeys ?? []).map((key) =>
            queryClient.invalidateQueries({ queryKey: key }),
          ),
        );
      }
    } finally {
      setRemovingId(null);
    }
  };

  const assignButton = (
    <Button className="gap-1.5" onClick={() => setAssignOpen(true)} disabled={!assign}>
      <Plus className="h-4 w-4"/>
      Assign
    </Button>
  );

  const rootClass = fillParent
    ? "flex h-full min-h-0 flex-col gap-6"
    : "space-y-6";
  const scrollClass = fillParent
    ? "min-h-0 flex-1 overflow-y-auto pr-1"
    : "overflow-y-auto pr-1";
  const scrollStyle = fillParent ? undefined : { maxHeight: SCROLL_OFFSET };
  const emptyClass = fillParent ? "min-h-0 flex-1" : "";
  const emptyStyle = fillParent ? undefined : { minHeight: SCROLL_OFFSET };

  return (
    <div className={rootClass}>
      {/* Info block */}
      <div className="flex-none space-y-1 pt-2 pb-1">
        <h2 className="text-lg font-semibold text-foreground">
          {title} <span className="font-normal text-brown-400">({total ?? rows.length})</span>
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-none items-center justify-between gap-4">
        <div className="relative w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-400"/>
          <Input
            value={q}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9 w-[260px] h-9"
            inputMode="search"
          />
        </div>

        <div className="flex items-center gap-3">
          {manageResource ? (
            <PermissionGate resource={manageResource} action="EDIT">
              {assignButton}
            </PermissionGate>
          ) : (
            assignButton
          )}

          <Button size="icon" variant="outline" aria-label="Export">
            <Download className="h-4 w-4"/>
          </Button>
        </div>
      </div>

      {isEmpty ? (
        searching ? (
          <div
            className={`flex flex-col items-center justify-center gap-4 text-center ${emptyClass}`}
            style={emptyStyle}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brown-50 text-brown-500">
              <Users className="h-7 w-7"/>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">No people match your search</p>
              <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                Try a different name or position.
              </p>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => assign && setAssignOpen(true)}
            disabled={!assign}
            className={`flex w-full flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-brown-300 text-center transition-colors enabled:hover:border-brown-400 enabled:hover:bg-brown-50 disabled:cursor-default ${emptyClass}`}
            style={emptyStyle}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brown-50 text-brown-500">
              <Users className="h-7 w-7"/>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">No people assigned yet</p>
              <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                Click to assign people to this record.
              </p>
            </div>
          </button>
        )
      ) : (
        <div className={scrollClass} style={scrollStyle}>
          <table className="w-full caption-bottom text-sm table-fixed">
            <TableHeader className="[&_tr]:border-brown-200 sticky top-0 z-10 bg-white">
              <TableRow>
                <TableHead className="pl-4">User</TableHead>
                <TableHead>{secondary.header}</TableHead>
                <TableHead>Status</TableHead>
                {canRemove ? <TableHead className="w-10"/> : null}
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={`assigned-skel-${i}`} className="border-brown-200 [&_td]:py-2">
                    <TableCell className="py-2 pl-4">
                      <div className="flex items-center gap-2.5">
                        <Skeleton className="h-7 w-7 rounded-full"/>
                        <Skeleton className="h-4 w-32"/>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24 rounded-full"/>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16 rounded-full"/>
                    </TableCell>
                    {canRemove ? <TableCell className="w-10"/> : null}
                  </TableRow>
                ))
              ) : (
                rows.map((u) => {
                  const fullName = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email;

                  return (
                    <TableRow key={u.id} className="group border-brown-200 hover:bg-brown-50 [&_td]:py-2">
                      <TableCell className="py-2 pl-4">
                        <UserChip
                          id={u.id}
                          name={fullName}
                          avatarUrl={u.avatarUrl}
                          firstName={u.firstName}
                          lastName={u.lastName}
                          email={u.email}
                        />
                      </TableCell>

                      <TableCell className="text-muted-foreground">{secondary.render(u)}</TableCell>

                      <TableCell>
                        <StatusBadge status={u.status}/>
                      </TableCell>

                      {canRemove ? (
                        <TableCell className="w-10 pr-2 text-right">
                          {manageResource ? (
                            <PermissionGate resource={manageResource} action="EDIT">
                              <RemoveButton
                                name={fullName}
                                disabled={removingId === u.id}
                                onClick={() => handleRemove(u.id)}
                              />
                            </PermissionGate>
                          ) : (
                            <RemoveButton
                              name={fullName}
                              disabled={removingId === u.id}
                              onClick={() => handleRemove(u.id)}
                            />
                          )}
                        </TableCell>
                      ) : null}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </table>

          {hasMore ? (
            <div className="flex justify-center py-3">
              <Button variant="outline" size="sm" onClick={onLoadMore} disabled={isLoadingMore}>
                {isLoadingMore ? "Loading…" : "Load more"}
              </Button>
            </div>
          ) : null}
        </div>
      )}

      {assign ? (
        <AssignPeopleModal
          isOpen={assignOpen}
          onCloseAction={() => setAssignOpen(false)}
          basePath={assign.basePath}
          assignableId={assign.assignableId}
          assignableName={assign.assignableName}
          noun={assign.noun}
          semantics={assign.semantics ?? "replace"}
          invalidateKeys={assign.invalidateKeys}
        />
      ) : null}
    </div>
  );
}

function RemoveButton({
  name,
  disabled,
  onClick,
}: {
  name: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`Unassign ${name}`}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-brown-400 opacity-0 transition hover:bg-brown-100 hover:text-red-600 focus:opacity-100 group-hover:opacity-100 disabled:opacity-50"
    >
      <X className="h-4 w-4"/>
    </button>
  );
}

function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return <span className="text-muted-foreground">—</span>;

  const label = formatUserStatus(status);
  const active = isActiveStatus(status);

  return (
    <Badge
      variant={active ? "outline" : "secondary"}
      className={active ? "border-green-200 bg-green-50 text-green-700" : ""}
    >
      {label}
    </Badge>
  );
}
