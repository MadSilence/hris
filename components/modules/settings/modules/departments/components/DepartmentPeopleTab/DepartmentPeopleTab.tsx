"use client";

import React, { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Search, UserPlus, Users, X } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Checkbox } from "@/public/desact/src/components/ui/checkbox";
import { PermissionGate } from "@/components/auth/PermissionGate";
import UserChip from "@/components/modules/settings/shared/UserChip/UserChip";
import { AssignPeopleModal } from "@/components/audience/assignment/AssignPeopleModal";
import {
  assignedUsersQueryKey,
  useAssignedUsers,
} from "@/components/audience/assignment/hooks/useAssignedUsers";
import { unassignUserAction } from "@/components/audience/assignment/actions/assignmentActions";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useDebouncedValue } from "@/components/modules/organization/modules/profile/hooks/useDebouncedValue/useDebouncedValue";
import { DEPARTMENTS_QUERY_KEY } from "@/components/modules/settings/modules/departments/utils/departmentQueryKeys";

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
      }
    } finally {
      setRemovingId(null);
    }
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
              Add member
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
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brown-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            placeholder="Search members…"
            className="h-9 pl-8 text-sm"
          />
        </div>
        <PermissionGate resource="ORG.DEPARTMENT" action="EDIT">
          {!isArchived && (
            <Button size="sm" onClick={() => setAssignOpen(true)} className="flex-none gap-1.5">
              <UserPlus className="h-4 w-4" />
              Add member
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
        ) : error ? (
          <p className="py-6 text-center text-sm text-red-500">Failed to load members.</p>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brown-50 text-brown-500">
              <Users className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-brown-900">No people match your search</p>
              <p className="text-sm text-brown-400">Try a different name or email.</p>
            </div>
          </div>
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
                      onClick={() => handleRemove(member.id)}
                      disabled={removingId === member.id}
                      aria-label={`Remove ${member.firstName ?? member.email}`}
                      className="flex h-7 w-7 flex-none items-center justify-center rounded-md text-brown-400 opacity-0 transition hover:bg-brown-100 hover:text-red-600 focus:opacity-100 group-hover:opacity-100 disabled:opacity-50"
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
    </div>
  );
}
