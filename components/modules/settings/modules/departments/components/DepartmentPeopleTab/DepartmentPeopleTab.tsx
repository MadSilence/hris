"use client";

import React, { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { UserPlus, Users, X } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { Checkbox } from "@/public/desact/src/components/ui/checkbox";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ForbiddenError } from "@/components/clients/exceptions";
import UserChip from "@/components/modules/settings/shared/UserChip/UserChip";
import type { AssignedUser } from "@/models/assignedUser";
import { AssignPeopleModal } from "@/components/audience/assignment/AssignPeopleModal";
import {
  assignedUsersQueryKey,
  useAssignedUsers,
} from "@/components/audience/assignment/hooks/useAssignedUsers";
import { unassignUserAction } from "@/components/audience/assignment/actions/assignmentActions";
import { ActionStatus } from "@/components/models/ActionStatus";
import { showActionError } from "@/lib/errors/errorToast";
import { useDebouncedValue } from "@/components/modules/organization/modules/profile/hooks/useDebouncedValue/useDebouncedValue";
import { DEPARTMENTS_QUERY_KEY } from "@/components/modules/settings/modules/departments/utils/departmentQueryKeys";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import { SearchBox } from "@/components/ui/SearchBox";
import { ListEmptyState } from "@/components/feedback/ListEmptyState";

const BASE_PATH = "/departments";

type Props = {
  departmentId: string;
  departmentName: string;
  isArchived: boolean;
  /** Only then is the sub-node toggle worth showing. */
  hasChildren: boolean;
  /** Seeded from a people search so the person is visible without scrolling the roster. */
  initialQuery?: string;
  highlightUserId?: string | null;
};

export function DepartmentPeopleTab({
  departmentId,
  departmentName,
  isArchived,
  hasChildren,
  initialQuery,
  highlightUserId,
}: Props) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState(initialQuery ?? "");

  useEffect(() => {
    if (initialQuery !== undefined) setQuery(initialQuery);
  }, [initialQuery]);
  const debouncedQuery = useDebouncedValue(query, 300);
  const [assignOpen, setAssignOpen] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  /**
   * Unassign confirms, per `technical_documentation/ui/ACTIONS_AND_MENUS.md` § 7.
   *
   * It used to be a bare ✕ that removed on click — and the button was `opacity-0` until the row was
   * hovered, so on touch it could not be reached at all.
   */
  const [removeTarget, setRemoveTarget] = useState<AssignedUser | null>(null);

  const [includeSubNodes, setIncludeSubNodes] = useState(false);

  const { items, isLoading, error, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useAssignedUsers(BASE_PATH, departmentId, debouncedQuery, includeSubNodes);

  const handleRemove = async (userId: string) => {
    setRemovingId(userId);
    try {
      const result = await unassignUserAction(BASE_PATH, departmentId, userId);
      if (result.status === ActionStatus.SUCCESS) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: assignedUsersQueryKey(BASE_PATH, departmentId) }),
          queryClient.invalidateQueries({ queryKey: [DEPARTMENTS_QUERY_KEY] }),
        ]);
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

  const listRef = useRef<HTMLDivElement>(null);
  const onScroll = () => {
    const el = listRef.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 96) void fetchNextPage();
  };

  const assignModal = (
    <AssignPeopleModal
      isOpen={assignOpen}
      onCloseAction={() => setAssignOpen(false)}
      basePath={BASE_PATH}
      assignableId={departmentId}
      assignableName={departmentName}
      noun="department"
      semantics="replace"
      invalidateKeys={[[DEPARTMENTS_QUERY_KEY], assignedUsersQueryKey(BASE_PATH, departmentId)]}
    />
  );

  // Truly empty (no members at all) → a single call-to-action, no toolbar.
  const isEmpty = !isLoading && !error && items.length === 0 && !debouncedQuery;
  if (isEmpty) {
    return (
      <div className="flex h-full min-h-0 flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brown-100 text-brown-500">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-brown-900">No people in this department yet</p>
          <p className="mt-1 text-sm text-brown-400">Assign people to see them here.</p>
        </div>
        <PermissionGate resource="ORG.DEPARTMENT" action="EDIT">
          {!isArchived && (
            <Button size="sm" onClick={() => setAssignOpen(true)} className="mt-1 gap-1.5">
              <UserPlus className="h-4 w-4" />
              Add Member
            </Button>
          )}
        </PermissionGate>
        {assignModal}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {/* Toolbar */}
      <div className="flex flex-none items-center gap-2">
        <SearchBox value={query} onChange={setQuery} fullWidth/>
        <PermissionGate resource="ORG.DEPARTMENT" action="EDIT">
          {!isArchived && (
            <Button size="sm" onClick={() => setAssignOpen(true)} className="flex-none gap-1.5">
              <UserPlus className="h-4 w-4" />
              Add Member
            </Button>
          )}
        </PermissionGate>
      </div>

      {hasChildren && (
        <label className="flex flex-none cursor-pointer select-none items-center gap-2 text-xs text-brown-600">
          <Checkbox
            checked={includeSubNodes}
            onCheckedChange={(v) => setIncludeSubNodes(v === true)}
          />
          Show also from sub-departments
        </label>
      )}

      {/* List (the only scroll area) */}
      <div ref={listRef} onScroll={onScroll} className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-2 px-1 py-2">
                <div className="h-6 w-6 flex-none animate-pulse rounded-full bg-brown-100" />
                <div className="h-3.5 w-32 animate-pulse rounded bg-brown-100" />
              </div>
            ))}
          </div>
        ) : error instanceof ForbiddenError ? (
          <AccessDenied compact/>
        ) : error ? (
          <ErrorState error={error} compact/>
        ) : items.length === 0 ? (
          <ListEmptyState
            query={query}
            icon={<Users className="h-7 w-7" />}
            title={`No people in this ${'department'} yet`}
            description="Assign people to see them here."
            noResultsHint="Try a different name or email."
          />
        ) : (
          <div className="flex flex-col">
            {items.map((member) => (
              <div
                key={member.id}
                className={`group flex items-center justify-between gap-2 rounded-md py-1 pl-3 pr-1 hover:bg-brown-50 ${
                  member.id === highlightUserId ? "bg-amber-50 ring-1 ring-amber-200" : ""
                }`}
              >
                <UserChip
                  id={member.id}
                  name={`${member.firstName ?? ""} ${member.lastName ?? ""}`.trim() || member.email}
                  firstName={member.firstName}
                  lastName={member.lastName}
                  email={member.email}
                  avatarUrl={member.avatarUrl}
                />
                <PermissionGate resource="ORG.DEPARTMENT" action="EDIT">
                  {!isArchived && (
                    <button
                      type="button"
                      onClick={() => setRemoveTarget(member)}
                      disabled={removingId === member.id}
                      aria-label={`Remove ${member.firstName ?? member.email}`}
                      className="flex h-7 w-7 flex-none items-center justify-center rounded-md text-brown-400 transition hover:bg-brown-100 hover:text-red-600 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </PermissionGate>
              </div>
            ))}
            {isFetchingNextPage && (
              <p className="py-2 text-center text-xs text-brown-400">Loading more…</p>
            )}
          </div>
        )}
      </div>

      {assignModal}

      <ConfirmActionModal
        isOpen={removeTarget !== null}
        title="Remove From Department"
        description={`${removeTarget ? `${removeTarget.firstName ?? ""} ${removeTarget.lastName ?? ""}`.trim() || removeTarget.email : "This person"} will no longer be in this department. They keep their account and everything else.`}
        confirmLabel="Remove"
        destructive
        isLoading={removingId === removeTarget?.id}
        onConfirmAction={confirmRemove}
        onCancelAction={() => setRemoveTarget(null)}
      />
    </div>
  );
}
