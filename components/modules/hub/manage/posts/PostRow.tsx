"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Cancel01Icon,
  Copy01Icon,
  Delete02Icon,
  PencilEdit02Icon,
  PinIcon,
  PinOffIcon,
  SentIcon,
  UnavailableIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { useCanAccess } from "@/components/auth";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import { RowAction, RowActionDestructive, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { showUndoToast } from "@/lib/feedback/undoToast";
import { showError } from "@/lib/errors/errorToast";
import type { ActionResult } from "@/lib/errors/withActionError";
import type { ManagePostRow } from "@/models/hub";
import {
  cancelHubPostScheduleAction,
  deleteHubPostAction,
  duplicateHubPostAction,
  pinHubPostAction,
  publishHubPostAction,
  scheduleHubPostAction,
  unpinHubPostAction,
  unpublishHubPostAction,
} from "../../actions";
import { unwrapHub, useInvalidateHub } from "../../hooks";
import { PostTile, TruncatedTitle, useAudienceLabel, useHubDates } from "../../shared";

/** A post's status as a pill: Published, Scheduled with its date and time, or Draft (dashed). */
export const PostStatusPill: React.FC<{ post: Pick<ManagePostRow, "status" | "publishAt"> }> = ({ post }) => {
  const t = useTranslations("hub");
  const dates = useHubDates();
  if (post.status === "PUBLISHED") return <StatusBadge status="approved" label={t("manage.status.published")} />;
  if (post.status === "SCHEDULED")
    return (
      <StatusBadge
        status="scheduled"
        label={post.publishAt ? t("manage.status.scheduledAt", { date: dates.short(post.publishAt), time: dates.time(post.publishAt) }) : t("manage.status.scheduled")}
      />
    );
  return <StatusBadge status="draft" label={t("manage.status.draft")} />;
};

/** The row menu's acts (CM02): immediate ones with an Undo toast; Duplicate and Delete confirm first. */
export const usePostActions = () => {
  const t = useTranslations("hub");
  const router = useRouter();
  const invalidate = useInvalidateHub();

  const act = async <T,>(action: () => Promise<ActionResult<T>>): Promise<{ ok: true; data: T } | { ok: false }> => {
    try {
      const data = unwrapHub(await action());
      void invalidate();
      return { ok: true, data };
    } catch (error) {
      showError(error);
      return { ok: false };
    }
  };

  const withUndo = async (message: string, run: () => Promise<ActionResult<void>>, undo: () => Promise<ActionResult<void>>) => {
    const done = await act(run);
    if (done.ok) showUndoToast({ message, onUndo: () => act(undo) });
  };

  return {
    pin: (post: ManagePostRow) => withUndo(t("manage.toasts.pinned"), () => pinHubPostAction(post.id), () => unpinHubPostAction(post.id)),
    unpin: (post: ManagePostRow) => withUndo(t("manage.toasts.unpinned"), () => unpinHubPostAction(post.id), () => pinHubPostAction(post.id)),
    unpublish: (post: ManagePostRow) =>
      withUndo(t("manage.toasts.unpublished"), () => unpublishHubPostAction(post.id), () => publishHubPostAction(post.id)),
    publishNow: (post: ManagePostRow) =>
      withUndo(t("manage.toasts.published"), () => publishHubPostAction(post.id), () => unpublishHubPostAction(post.id)),
    cancelSchedule: (post: ManagePostRow) =>
      withUndo(
        t("manage.toasts.scheduleCancelled"),
        () => cancelHubPostScheduleAction(post.id),
        () => (post.publishAt ? scheduleHubPostAction({ id: post.id, publishAt: post.publishAt }) : publishHubPostAction(post.id)),
      ),
    duplicate: async (post: ManagePostRow) => {
      const created = await act(() => duplicateHubPostAction(post.id));
      if (created.ok) router.push(`/hub/manage/posts?edit=${created.data.id}`);
    },
    remove: (post: ManagePostRow) => act(() => deleteHubPostAction(post.id)),
  };
};

/** The row menu of a post (CM02, CM01). */
export const PostRowMenu: React.FC<{ post: ManagePostRow; onEdit: () => void }> = ({ post, onEdit }) => {
  const t = useTranslations("hub");
  const actions = usePostActions();
  // Pin and delete are MANAGE (design § 5.1); an editor writes, publishes and schedules.
  const canManage = useCanAccess("HUB.CONTENT", "MANAGE");
  const [confirm, setConfirm] = React.useState<"duplicate" | "delete" | null>(null);
  const [busy, setBusy] = React.useState(false);

  const run = async () => {
    setBusy(true);
    if (confirm === "duplicate") await actions.duplicate(post);
    if (confirm === "delete") await actions.remove(post);
    setBusy(false);
    setConfirm(null);
  };

  return (
    <>
      <RowActionsMenu label={t("manage.postMenu", { title: post.title })} stopPropagation>
        <RowAction icon={<Icon icon={PencilEdit02Icon} size="sm" />} onClick={onEdit}>
          {t("manage.menu.edit")}
        </RowAction>
        {!canManage ? null : post.pinned ? (
          <RowAction icon={<Icon icon={PinOffIcon} size="sm" />} onClick={() => void actions.unpin(post)}>
            {t("manage.menu.unpin")}
          </RowAction>
        ) : (
          <RowAction icon={<Icon icon={PinIcon} size="sm" />} onClick={() => void actions.pin(post)}>
            {t("manage.menu.pin")}
          </RowAction>
        )}
        <RowAction icon={<Icon icon={Copy01Icon} size="sm" />} onClick={() => setConfirm("duplicate")}>
          {t("manage.menu.duplicate")}
        </RowAction>
        {post.status === "PUBLISHED" && (
          <RowAction icon={<Icon icon={UnavailableIcon} size="sm" />} onClick={() => void actions.unpublish(post)}>
            {t("manage.menu.unpublish")}
          </RowAction>
        )}
        {post.status === "SCHEDULED" && (
          <>
            <RowAction icon={<Icon icon={SentIcon} size="sm" />} onClick={() => void actions.publishNow(post)}>
              {t("manage.menu.publishNow")}
            </RowAction>
            <RowAction icon={<Icon icon={Cancel01Icon} size="sm" />} onClick={() => void actions.cancelSchedule(post)}>
              {t("manage.menu.cancelSchedule")}
            </RowAction>
          </>
        )}
        {canManage && (
          <RowActionDestructive icon={<Icon icon={Delete02Icon} size="sm" />} onClick={() => setConfirm("delete")}>
            {t("manage.menu.delete")}
          </RowActionDestructive>
        )}
      </RowActionsMenu>
      <ConfirmActionModal
        isOpen={confirm !== null}
        title={confirm === "duplicate" ? t("manage.confirm.duplicateTitle", { title: post.title }) : t("manage.confirm.deleteTitle", { title: post.title })}
        description={confirm === "duplicate" ? t("manage.confirm.duplicateLine") : t("manage.confirm.deleteLine")}
        confirmLabel={confirm === "duplicate" ? t("manage.menu.duplicate") : t("manage.confirm.deletePost")}
        destructive={confirm === "delete"}
        isLoading={busy}
        onConfirmAction={run}
        onCancelAction={() => setConfirm(null)}
      />
    </>
  );
};

/**
 * A post on Manage hub (CM02 88 high; CM01 as `NewsRow`): the cover or type tile, the title, "{author} · {audience}"
 * with "· pinned", the status pill, the date and the row menu. The row opens the post in CM05.
 */
export const ManagePostRowView: React.FC<{ post: ManagePostRow; onEdit: (id: string) => void; compact?: boolean }> = ({ post, onEdit, compact = false }) => {
  const t = useTranslations("hub");
  const audience = useAudienceLabel();
  const dates = useHubDates();
  const today = new Date().toDateString();
  const when = post.publishedAt ?? post.createdAt;
  const date = when && new Date(when).toDateString() === today ? t("manage.today") : dates.short(when);
  const meta = compact
    ? post.status === "DRAFT"
      ? t("manage.meta.onlyYou")
      : post.status === "SCHEDULED"
        ? t("manage.meta.goesOut", { audience: audience(post.audienceLabel), date: dates.short(post.publishAt) })
        : post.pinned
          ? t("manage.meta.pinned", { audience: audience(post.audienceLabel) })
          : audience(post.audienceLabel)
    : post.status === "DRAFT"
      ? t("manage.meta.authorOnlyYou", { author: post.author?.name ?? "" })
      : t(post.pinned ? "manage.meta.authorPinned" : "manage.meta.author", { author: post.author?.name ?? "", audience: audience(post.audienceLabel) });
  return (
    <li
      className={`relative flex cursor-pointer items-center gap-4 border-b border-divider last:border-b-0 hover:bg-row-hover ${compact ? "min-h-20" : "min-h-[88px]"}`}
      onClick={() => onEdit(post.id)}
    >
      <PostTile coverFileId={post.coverFileId} type={post.type} size={compact ? 48 : 56} alt={t("news.photo")} />
      <div className="flex min-w-0 flex-1 flex-col">
        <button type="button" className="flex min-w-0 text-left text-card-title text-primary" onClick={() => onEdit(post.id)}>
          <TruncatedTitle title={post.title || t("manage.untitled")} />
        </button>
        <span className="truncate text-hint text-tertiary">{meta}</span>
      </div>
      <PostStatusPill post={post} />
      {!compact && <span className="w-16 shrink-0 text-right text-label text-tertiary tabular-nums">{date}</span>}
      {!compact && <PostRowMenu post={post} onEdit={() => onEdit(post.id)} />}
    </li>
  );
};
