"use client";

import { useTranslations } from "next-intl";
import React, { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Cancel01Icon, UserAdd01Icon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { Button } from "@/components/desact/button";
import { Checkbox } from "@/components/desact/checkbox";
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
import { AssignmentHistoryList, HistoryToggle } from "@/components/audience/assignment/history/AssignmentHistory";

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
  const t = useTranslations("structure.departments");
  const tShared = useTranslations("structure.shared");
  const tCommon = useTranslations("common");
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
  /** Who was placed here, by which rule or by hand, and when: the roster's second view. */
  const [showHistory, setShowHistory] = useState(false);

  const { items, total, limited, isLoading, error, hasNextPage, isFetchingNextPage, fetchNextPage } =
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
      kind="department"
      semantics="replace"
      invalidateKeys={[[DEPARTMENTS_QUERY_KEY], assignedUsersQueryKey(BASE_PATH, departmentId)]}
    />
  );

  // Truly empty (no members at all) → a single call-to-action, no toolbar.
  const isEmpty = !isLoading && !error && items.length === 0 && !debouncedQuery;
  if (showHistory) {
    return (
      <div className="flex h-full min-h-0 flex-col gap-3">
        <div className="flex flex-none items-center justify-end">
          <HistoryToggle showing={showHistory} onChange={setShowHistory} />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <AssignmentHistoryList assignableType="DEPARTMENT" assignableId={departmentId} />
        </div>
      </div>
    );
  }
  if (isEmpty) {
    return (
      <div className="flex h-full min-h-0 flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-pill bg-mist text-tertiary">
          <Icon icon={UserGroupIcon} />
        </div>
        <div>
          {limited && total > 0 ? (
            // A roster is people data: the reader sees the department and its size, not people outside
            // their access (decided 2026-10-27).
            <>
              <p className="text-body font-medium text-primary">{tShared("noneVisible", { count: total })}</p>
              <p className="mt-1 text-body text-tertiary">{tShared("limited")}</p>
            </>
          ) : (
            <>
              <p className="text-body font-medium text-primary">{t("people.empty")}</p>
              <p className="mt-1 text-body text-tertiary">{tShared("assignHint")}</p>
            </>
          )}
        </div>
        <PermissionGate resource="ORG.DEPARTMENT" action="EDIT">
          {!isArchived && (
            <Button type="button" size="sm" onClick={() => setAssignOpen(true)} className="mt-1 gap-1.5">
              <Icon icon={UserAdd01Icon} size="sm" />
              {tShared("addMember")}
            </Button>
          )}
        </PermissionGate>
        <HistoryToggle showing={showHistory} onChange={setShowHistory} />
        {assignModal}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {/* Toolbar */}
      <div className="flex flex-none items-center gap-2">
        <SearchBox value={query} onChange={setQuery} fullWidth/>
        <HistoryToggle showing={showHistory} onChange={setShowHistory} />
        <PermissionGate resource="ORG.DEPARTMENT" action="EDIT">
          {!isArchived && (
            <Button type="button" size="sm" onClick={() => setAssignOpen(true)} className="flex-none gap-1.5">
              <Icon icon={UserAdd01Icon} size="sm" />
              {tShared("addMember")}
            </Button>
          )}
        </PermissionGate>
      </div>

      {hasChildren && (
        <label className="flex flex-none cursor-pointer select-none items-center gap-2 text-hint text-secondary">
          <Checkbox
            checked={includeSubNodes}
            onCheckedChange={(v) => setIncludeSubNodes(v === true)}
          />
          {t("people.includeSub")}
        </label>
      )}

      {limited && !error ? (
        <p className="flex-none text-hint text-tertiary">{tShared("limited")}</p>
      ) : null}

      {/* List (the only scroll area) */}
      <div ref={listRef} onScroll={onScroll} className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-2 px-1 py-2">
                <div className="h-6 w-6 flex-none shimmer rounded-pill bg-mist" />
                <div className="h-3.5 w-32 shimmer rounded-tag bg-mist" />
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
            onClearSearch={() => setQuery("")}
            scene="team-and-org"
            title={t("people.empty")}
            description={tShared("assignHint")}
            noResultsHint={tShared("tryDifferent")}
          />
        ) : (
          <div className="flex flex-col">
            {items.map((member) => (
              <div
                key={member.id}
                className={`group flex items-center justify-between gap-2 rounded-control py-1 pl-3 pr-1 hover:bg-subtle ${
                  member.id === highlightUserId ? "bg-search-highlight" : ""
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
                      aria-label={tShared("removeNamed", { name: member.firstName ?? member.email })}
                      className="flex h-7 w-7 flex-none items-center justify-center rounded-tag text-tertiary transition hover:bg-mist hover:text-danger-text disabled:opacity-50"
                    >
                      <Icon icon={Cancel01Icon} size="sm" />
                    </button>
                  )}
                </PermissionGate>
              </div>
            ))}
            {isFetchingNextPage && (
              <p className="py-2 text-center text-hint text-tertiary">{tShared("loadingMore")}</p>
            )}
          </div>
        )}
      </div>

      {assignModal}

      <ConfirmActionModal
        isOpen={removeTarget !== null}
        title={t("people.removeTitle")}
        description={
          removeTarget
            ? t("people.removeBody", {
                name: `${removeTarget.firstName ?? ""} ${removeTarget.lastName ?? ""}`.trim() || removeTarget.email,
              })
            : t("people.removeBodyAnonymous")
        }
        confirmLabel={tCommon("actions.remove")}
        destructive
        isLoading={removingId === removeTarget?.id}
        onConfirmAction={confirmRemove}
        onCancelAction={() => setRemoveTarget(null)}
      />
    </div>
  );
}
