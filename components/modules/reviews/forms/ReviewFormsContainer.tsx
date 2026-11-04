"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Add01Icon, Archive02Icon, ArchiveArrowUpIcon, Copy01Icon, Delete02Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { ListEmptyState } from "@/components/feedback/ListEmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { useCanAccess } from "@/components/auth/useAccess";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RowAction, RowActionDestructive, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import { showActionError } from "@/lib/errors/errorToast";
import { ActionStatus } from "@/components/models/ActionStatus";
import { formatDisplayDate } from "@/lib/date";
import { ConfirmDialog } from "@/components/modules/lifecycle/shared/ConfirmDialog";
import {
  archiveReviewFormAction,
  deleteReviewFormAction,
  duplicateReviewFormAction,
  unarchiveReviewFormAction,
} from "@/components/modules/reviews/actions/reviewFormActions";
import { useInvalidateReviewForms, useReviewForms } from "@/components/modules/reviews/hooks";
import type { ReviewFormSummary } from "@/models/reviews";
import { AddReviewFormDialog } from "./AddReviewFormDialog";
import { MentionText } from "./editor/MentionText";

export const reviewFormHref = (id: string) => `/reviews/forms/${id}`;

/**
 * Reviews → Forms: the questionnaires a review cycle asks its reviewers to fill in (REVIEWS_DESIGN.md § 4).
 * A quiet list — the name, how many questions, when it changed — each opening its editor.
 */
export function ReviewFormsContainer() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [adding, setAdding] = useState(false);
  const [confirm, setConfirm] = useState<{ kind: "archive" | "delete"; form: ReviewFormSummary } | null>(null);

  const { data, isLoading, error } = useReviewForms();
  const invalidate = useInvalidateReviewForms();
  const canEdit = useCanAccess("REVIEWS.FORM", "EDIT");
  const canManage = useCanAccess("REVIEWS.FORM", "MANAGE");

  const all = useMemo(() => data ?? [], [data]);
  const archivedCount = all.filter((f) => f.archivedAt).length;
  const rows = all
    .filter((f) => Boolean(f.archivedAt) === showArchived)
    .filter((f) => !query.trim() || f.name.toLowerCase().includes(query.trim().toLowerCase()));

  const run = async (result: Promise<{ status: ActionStatus; errorMessage?: string }>) => {
    const res = await result;
    if (res.status !== ActionStatus.SUCCESS) return res.errorMessage ?? "Something went wrong.";
    await invalidate();
    return null;
  };

  const open = (f: ReviewFormSummary) => router.push(reviewFormHref(f.id));

  const duplicate = async (f: ReviewFormSummary) => {
    const res = await duplicateReviewFormAction(f.id);
    if (res.status !== ActionStatus.SUCCESS || !res.data) {
      showActionError(res);
      return;
    }
    await invalidate();
    router.push(reviewFormHref(res.data.id));
  };

  return (
    <div className="space-y-4">
      <ListToolbar
        search={{ value: query, onChange: setQuery }}
        archived={archivedCount > 0 ? { count: archivedCount, showing: showArchived, onChange: setShowArchived } : undefined}
        primary={
          <PermissionGate resource="REVIEWS.FORM" action="EDIT">
            {/* Blank, or one of the library's self, manager and peer forms (REVIEWS_PLAN.md 9.3) — the dialog asks. */}
            <Button type="button" className="gap-1.5" onClick={() => setAdding(true)}>
              <Icon icon={Add01Icon} size="sm" />
              Add form
            </Button>
          </PermissionGate>
        }
      />

      {error ? (
        <ErrorState error={error} />
      ) : isLoading ? (
        <ul className="space-y-2" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <li key={i} className="flex h-[72px] items-center gap-4 rounded-card border border-divider px-5">
              <div className="h-4 w-48 shimmer rounded-tag bg-mist" />
              <div className="ml-auto h-3 w-28 shimmer rounded-tag bg-mist" />
            </li>
          ))}
        </ul>
      ) : rows.length === 0 ? (
        <ListEmptyState
          query={query}
          archivedView={showArchived}
          scene="forms"
          title="No review forms yet"
          description="A form is the set of questions a reviewer answers — about themselves, a colleague, a report or their manager."
          onCreate={() => setAdding(true)}
          createLabel="Add form"
          createAccess={{ resource: "REVIEWS.FORM", action: "EDIT" }}
        />
      ) : (
        <ul className="space-y-2">
          {rows.map((f) => (
            <li
              key={f.id}
              role="link"
              tabIndex={0}
              aria-label={f.name}
              data-test="review-form-row"
              onClick={() => open(f)}
              onKeyDown={(e) => { if (e.key === "Enter") open(f); }}
              className="flex cursor-pointer items-center gap-4 rounded-card border border-divider bg-card px-5 py-4 transition-colors hover:border-divider hover:bg-subtle/40"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium text-primary">{f.name}</span>
                  {f.archivedAt && <StatusBadge status="archived" />}
                </div>
                <div className="mt-0.5 truncate text-hint text-tertiary">
                  {f.questionCount === 1 ? "1 question" : `${f.questionCount} questions`} · Updated {formatDisplayDate(f.updatedAt)}
                  {f.description && <> · <MentionText text={f.description} /></>}
                </div>
              </div>
              {(canEdit || canManage) && (
                <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                  <RowActionsMenu label="Form actions">
                    {canEdit && !f.archivedAt && (
                      <RowAction icon={<Icon icon={PencilEdit02Icon} size="sm" className="text-tertiary" />} onClick={() => open(f)}>
                        Edit
                      </RowAction>
                    )}
                    {canEdit && (
                      <RowAction icon={<Icon icon={Copy01Icon} size="sm" className="text-tertiary" />} onClick={() => void duplicate(f)}>
                        Duplicate
                      </RowAction>
                    )}
                    {canManage && (f.archivedAt ? (
                      <RowAction
                        icon={<Icon icon={ArchiveArrowUpIcon} size="sm" className="text-tertiary" />}
                        onClick={async () => {
                          const problem = await run(unarchiveReviewFormAction(f.id));
                          if (problem) showActionError({ errorMessage: problem });
                        }}
                      >
                        Unarchive
                      </RowAction>
                    ) : (
                      <RowAction icon={<Icon icon={Archive02Icon} size="sm" className="text-tertiary" />} onClick={() => setConfirm({ kind: "archive", form: f })}>
                        Archive
                      </RowAction>
                    ))}
                    {canManage && (
                      <RowActionDestructive icon={<Icon icon={Delete02Icon} size="sm" />} onClick={() => setConfirm({ kind: "delete", form: f })}>
                        Delete
                      </RowActionDestructive>
                    )}
                  </RowActionsMenu>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <AddReviewFormDialog
        open={adding}
        existingForms={all}
        onCloseAction={() => setAdding(false)}
        onAddedAction={async (form) => {
          setAdding(false);
          await invalidate();
          router.push(reviewFormHref(form.id));
        }}
      />

      <ConfirmDialog
        open={confirm?.kind === "archive"}
        title="Archive form"
        confirmLabel="Archive"
        onCancelAction={() => setConfirm(null)}
        onConfirmAction={async () => {
          const problem = confirm ? await run(archiveReviewFormAction(confirm.form.id)) : null;
          if (!problem) setConfirm(null);
          return problem;
        }}
      >
        <p>
          <strong>{confirm?.form.name}</strong> can no longer be chosen for a review cycle. You can unarchive
          it later.
        </p>
      </ConfirmDialog>

      <ConfirmDialog
        open={confirm?.kind === "delete"}
        title="Delete form"
        confirmLabel="Delete"
        destructive
        onCancelAction={() => setConfirm(null)}
        onConfirmAction={async () => {
          const problem = confirm ? await run(deleteReviewFormAction(confirm.form.id)) : null;
          if (!problem) setConfirm(null);
          return problem;
        }}
      >
        <p>
          <strong>{confirm?.form.name}</strong> and its questions are removed. This cannot be undone.
        </p>
      </ConfirmDialog>
    </div>
  );
}
