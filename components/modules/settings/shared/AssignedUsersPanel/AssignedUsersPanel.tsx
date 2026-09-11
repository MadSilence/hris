"use client";

import { useState, type ReactNode } from "react";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import { Button } from "@/public/desact/src/components/ui/button";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/public/desact/src/components/ui/table";
import { Download, Plus, Users, X } from "lucide-react";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ForbiddenError } from "@/components/clients/exceptions";
import type { ResourceCode } from "@/models/access";
import type { AssignedUser } from "@/models/assignedUser";
import UserChip from "@/components/modules/settings/shared/UserChip/UserChip";
import { AssignPeopleModal } from "@/components/audience/assignment/AssignPeopleModal";
import { assignedUsersQueryKey } from "@/components/audience/assignment/hooks/useAssignedUsers";
import { unassignUserAction } from "@/components/audience/assignment/actions/assignmentActions";
import { ActionStatus } from "@/components/models/ActionStatus";
import { showActionError } from "@/lib/errors/errorToast";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import { UserStatusBadge } from "@/components/ui/StatusBadge";
import { SearchBox } from "@/components/ui/SearchBox";
import { ListEmptyState } from "@/components/feedback/ListEmptyState";

export interface AssignedUsersPanelProps {
  title?: string;
  description: string;
  manageResource?: ResourceCode;
  rows?: AssignedUser[];
  isLoading?: boolean;
  /**
   * The fetch that failed, if it did. Every caller had one and none of them passed it, so a
   * refusal or an outage rendered as "No people assigned yet" — the panel could not tell an empty
   * list from a list it was not allowed to read, and invited the reader to assign people into it.
   */
  error?: unknown;
  total?: number;
  query?: string;
  onQueryChange?: (value: string) => void;
  secondaryColumn?: { header: string; render: (user: AssignedUser) => ReactNode };
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  onExport?: () => void;
  fillParent?: boolean;
  /**
   * Whether the thing people are assigned to is archived.
   *
   * The engine refuses these now (`INVALID_TARGET`), which is the enforcement; this is the half that
   * stops the refusal being a surprise. Offering an action that is guaranteed to be skipped is the
   * same defect as the dead Download button, one screen along.
   */
  isArchived?: boolean;

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
  manageResource,
  rows = [],
  isLoading = false,
  error,
  total,
  query,
  onQueryChange,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  onExport,
  assign,
  secondaryColumn,
  fillParent = false,
  isArchived = false,
}: AssignedUsersPanelProps) {
  const secondary = secondaryColumn ?? {
    header: "Position",
    render: (u: AssignedUser) => u.jobName,
  };
  const queryClient = useQueryClient();
  const [internalQuery, setInternalQuery] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  /** Unassign confirms — `technical_documentation/ui/ACTIONS_AND_MENUS.md` § 7. */
  const [removeTarget, setRemoveTarget] = useState<AssignedUser | null>(null);

  const q = query ?? internalQuery;
  const setQuery = onQueryChange ?? setInternalQuery;
  const searching = q.trim().length > 0;

  const isEmpty = !isLoading && !error && rows.length === 0;
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
      } else {
      // A row action whose context is the row itself: by the time the answer arrives there is no
      // dialog left to put it in, so it goes to the card. This branch did not exist — a refused
      // removal invalidated nothing, said nothing, and left the person on screen looking as though
      // the click had missed.
        showActionError(result);
      }
    } finally {
      setRemovingId(null);
    }
  };

  const confirmRemove = async () => {
    if (!removeTarget) return;
    await handleRemove(removeTarget.id);
    setRemoveTarget(null);
  };

  const assignButton = (
    <Button
      className="gap-1.5"
      onClick={() => setAssignOpen(true)}
      disabled={!assign || isArchived}
      title={isArchived ? "This record is archived, so nobody new can be assigned to it." : undefined}
    >
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

  const infoBlock = (
    <div className="flex-none space-y-1 pt-2 pb-1">
      <h2 className="text-lg font-semibold text-foreground">
        {title}
        {error ? null : <span className="font-normal text-brown-400"> ({total ?? rows.length})</span>}
      </h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );

  // A count of nothing and a toolbar for data we could not read are both lies. The heading stays so
  // the reader knows which panel failed; everything that acts on the list goes.
  if (error) {
    return (
      <div className={rootClass}>
        {infoBlock}
        {error instanceof ForbiddenError ? <AccessDenied compact/> : <ErrorState error={error} compact/>}
      </div>
    );
  }

  return (
    <div className={rootClass}>
      {infoBlock}

      {/* Toolbar */}
      <div className="flex flex-none items-center justify-between gap-4">
        <SearchBox value={q} onChange={setQuery}/>

        <div className="flex items-center gap-3">
          {manageResource ? (
            <PermissionGate resource={manageResource} action="EDIT">
              {assignButton}
            </PermissionGate>
          ) : (
            assignButton
          )}

          {/*
            * No handler, no button. This rendered unconditionally, so the holiday-calendar tab —
            * the one caller that passes no `onExport` — showed a Download button that did nothing
            * when pressed. A control that is offered and does not work is worse than an absent one:
            * the reader concludes the export is broken rather than that it is not offered here.
            */}
          {onExport ? (
            <Button
              size="icon"
              variant="outline"
              aria-label="Export"
              onClick={onExport}
            >
              <Download className="h-4 w-4"/>
            </Button>
          ) : null}
        </div>
      </div>

      {isEmpty ? (
        <div style={emptyStyle}>
          <ListEmptyState
            query={searching ? q : ""}
            icon={<Users className="h-7 w-7"/>}
            title="No people assigned yet"
            description="Assign people to this record to see them here."
            noResultsHint="Try a different name or position."
            /* An archived record takes no new people, so the block is a panel rather than a
               button — a control that cannot work is not offered. */
            onCreate={assign && !isArchived ? () => setAssignOpen(true) : undefined}
            createLabel="Assign People"
            className={emptyClass}
          />
        </div>
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
                        <UserStatusBadge status={u.status}/>
                      </TableCell>

                      {canRemove ? (
                        <TableCell className="w-10 pr-2 text-right">
                          {manageResource ? (
                            <PermissionGate resource={manageResource} action="EDIT">
                              <RemoveButton
                                name={fullName}
                                disabled={removingId === u.id}
                                onClick={() => setRemoveTarget(u)}
                              />
                            </PermissionGate>
                          ) : (
                            <RemoveButton
                              name={fullName}
                              disabled={removingId === u.id}
                              onClick={() => setRemoveTarget(u)}
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

      <ConfirmActionModal
        isOpen={removeTarget !== null}
        title="Unassign Person"
        description={`${removeTarget ? `${removeTarget.firstName ?? ""} ${removeTarget.lastName ?? ""}`.trim() || removeTarget.email : "This person"} will no longer be assigned here. They keep their account and everything else.`}
        confirmLabel="Unassign"
        destructive
        isLoading={removingId === removeTarget?.id}
        onConfirmAction={confirmRemove}
        onCancelAction={() => setRemoveTarget(null)}
      />
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
      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-brown-400 transition hover:bg-brown-100 hover:text-red-600 disabled:opacity-50"
    >
      <X className="h-4 w-4"/>
    </button>
  );
}

