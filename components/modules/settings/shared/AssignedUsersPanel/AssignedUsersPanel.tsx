"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import { Button } from "@/components/desact/button";
import { Skeleton } from "@/components/desact/skeleton";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/desact/table";
import { Add01Icon, Cancel01Icon, Download01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ForbiddenError } from "@/components/clients/exceptions";
import type { AccessAction, ResourceCode } from "@/models/access";
import type { AssignedUser } from "@/models/assignedUser";
import UserChip from "@/components/modules/settings/shared/UserChip/UserChip";
import { AssignPeopleModal, type AssignTargetKind } from "@/components/audience/assignment/AssignPeopleModal";
import { assignedUsersQueryKey } from "@/components/audience/assignment/hooks/useAssignedUsers";
import { unassignUserAction } from "@/components/audience/assignment/actions/assignmentActions";
import { ActionStatus } from "@/components/models/ActionStatus";
import { showActionError } from "@/lib/errors/errorToast";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import { UserStatusBadge } from "@/components/ui/StatusBadge";
import { SearchBox } from "@/components/ui/SearchBox";
import { ListEmptyState } from "@/components/feedback/ListEmptyState";
import { AssignmentHistoryList, HistoryToggle } from "@/components/audience/assignment/history/AssignmentHistory";
import { assignableTypeOf } from "@/components/audience/assignment/assignableTypes";

export interface AssignedUsersPanelProps {
  title?: string;
  description: string;
  manageResource?: ResourceCode;
  /** The action that lets somebody assign and unassign. EDIT unless the resource has no EDIT. */
  manageAction?: AccessAction;
  rows?: AssignedUser[];
  isLoading?: boolean;
  /**
   * The fetch that failed, if it did. Every caller had one and none of them passed it, so a
   * refusal or an outage rendered as "No people assigned yet" — the panel could not tell an empty
   * list from a list it was not allowed to read, and invited the reader to assign people into it.
   */
  error?: unknown;
  total?: number;
  /** The reader sees only the people their access covers — `total` may count more than the rows. */
  limited?: boolean;
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
    kind: AssignTargetKind;
    semantics?: "add" | "replace";
    invalidateKeys?: QueryKey[];
  };
}

const SCROLL_OFFSET = "calc(100svh - 390px)";

export default function AssignedUsersPanel({
  title,
  description,
  manageResource,
  manageAction = "EDIT",
  rows = [],
  isLoading = false,
  error,
  total,
  limited = false,
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
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const secondary = secondaryColumn ?? {
    header: t("shared.assignedPanel.position"),
    render: (u: AssignedUser) => u.jobName,
  };
  const queryClient = useQueryClient();
  const [internalQuery, setInternalQuery] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  /** Unassign confirms — `technical_documentation/ui/ACTIONS_AND_MENUS.md` § 7. */
  const [removeTarget, setRemoveTarget] = useState<AssignedUser | null>(null);
  /** Who had it when, by which rule or by hand — the same panel, a second view (DECISIONS.md, 2026-10-16, decision 7). */
  const [showHistory, setShowHistory] = useState(false);
  const historyType = assign ? assignableTypeOf(assign.basePath) : undefined;

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
    <Button type="button"
      className="gap-1.5"
      onClick={() => setAssignOpen(true)}
      disabled={!assign || isArchived}
      title={isArchived ? t("shared.assignedPanel.archived") : undefined}
    >
      <Icon icon={Add01Icon} size="sm" />
      {t("shared.assignedPanel.assign")}
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
      <h2 className="text-section-title text-primary">
        {title ?? t("shared.assignedPanel.title")}
        {error ? null : <span className="font-normal text-tertiary"> ({total ?? rows.length})</span>}
      </h2>
      <p className="text-body text-tertiary">{description}</p>
      {limited && !error ? (
        <p className="text-hint text-tertiary">{t("shared.assignedPanel.limited")}</p>
      ) : null}
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
        {/* The search reads the roster; the history is its own list, newest first. */}
        {showHistory ? <span/> : <SearchBox value={q} onChange={setQuery}/>}

        <div className="flex items-center gap-3">
          {historyType ? <HistoryToggle showing={showHistory} onChange={setShowHistory}/> : null}

          {manageResource ? (
            <PermissionGate resource={manageResource} action={manageAction}>
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
            <Button type="button"
              size="icon"
              variant="secondary"
              aria-label={tCommon("actions.export")}
              onClick={onExport}
            >
              <Icon icon={Download01Icon} size="sm" />
            </Button>
          ) : null}
        </div>
      </div>

      {showHistory && historyType && assign ? (
        <div className={scrollClass} style={scrollStyle}>
          <AssignmentHistoryList assignableType={historyType} assignableId={assign.assignableId}/>
        </div>
      ) : isEmpty ? (
        <div style={emptyStyle}>
          <ListEmptyState
            query={searching ? q : ""}
            scene="people"
            title={limited && (total ?? 0) > 0 ? t("shared.assignedPanel.emptyHiddenTitle") : t("shared.assignedPanel.emptyTitle")}
            description={limited && (total ?? 0) > 0
              ? t("shared.assignedPanel.emptyHiddenDescription")
              : t("shared.assignedPanel.emptyDescription")}
            noResultsHint={t("shared.assignedPanel.noResultsHint")}
            /* An archived record takes no new people, so the block is a panel rather than a
               button — a control that cannot work is not offered. */
            onCreate={assign && !isArchived ? () => setAssignOpen(true) : undefined}
            createLabel={t("shared.assignedPanel.assignPeople")}
            className={emptyClass}
          />
        </div>
      ) : (
        <div className={scrollClass} style={scrollStyle}>
          <table className="w-full caption-bottom text-body table-fixed">
            <TableHeader className="[&_tr]:border-divider sticky top-0 z-10 bg-card">
              <TableRow>
                <TableHead className="pl-4">{t("shared.assignedPanel.user")}</TableHead>
                <TableHead>{secondary.header}</TableHead>
                <TableHead>{tCommon("fields.status")}</TableHead>
                {canRemove ? <TableHead className="w-10"/> : null}
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={`assigned-skel-${i}`} className="border-divider [&_td]:py-2">
                    <TableCell className="py-2 pl-4">
                      <div className="flex items-center gap-2.5">
                        <Skeleton className="h-7 w-7 rounded-pill"/>
                        <Skeleton className="h-4 w-32"/>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24 rounded-pill"/>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16 rounded-pill"/>
                    </TableCell>
                    {canRemove ? <TableCell className="w-10"/> : null}
                  </TableRow>
                ))
              ) : (
                rows.map((u) => {
                  const fullName = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email;

                  return (
                    <TableRow key={u.id} className="group border-divider hover:bg-subtle [&_td]:py-2">
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

                      <TableCell className="text-tertiary">{secondary.render(u)}</TableCell>

                      <TableCell>
                        <UserStatusBadge status={u.status}/>
                      </TableCell>

                      {canRemove ? (
                        <TableCell className="w-10 pr-2 text-right">
                          {manageResource ? (
                            <PermissionGate resource={manageResource} action={manageAction}>
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
              <Button type="button" variant="secondary" size="sm" onClick={onLoadMore} disabled={isLoadingMore}>
                {isLoadingMore ? tCommon("states.loading") : t("shared.assignedPanel.loadMore")}
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
          kind={assign.kind}
          semantics={assign.semantics ?? "replace"}
          invalidateKeys={assign.invalidateKeys}
        />
      ) : null}

      <ConfirmActionModal
        isOpen={removeTarget !== null}
        title={t("shared.assignedPanel.unassignTitle")}
        description={removeTarget
          ? t("shared.assignedPanel.unassignBody", {
              name: `${removeTarget.firstName ?? ""} ${removeTarget.lastName ?? ""}`.trim() || removeTarget.email,
            })
          : t("shared.assignedPanel.unassignBodyUnnamed")}
        confirmLabel={t("shared.assignedPanel.unassign")}
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
  const t = useTranslations("settings");
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={t("shared.assignedPanel.unassignNamed", { name })}
      className="inline-flex h-7 w-7 items-center justify-center rounded-tag text-tertiary transition hover:bg-mist hover:text-danger-text disabled:opacity-50"
    >
      <Icon icon={Cancel01Icon} size="sm" />
    </button>
  );
}

