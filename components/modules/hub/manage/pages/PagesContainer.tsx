"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/desact/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/desact/dialog";
import { Icon } from "@/components/desact/icon";
import { RadioGroup, RadioGroupItem } from "@/components/desact/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/desact/select";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import { SearchBox } from "@/components/ui/SearchBox";
import { useCanAccess } from "@/components/auth";
import { EmptyState, NoResults } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { showUndoToast } from "@/lib/feedback/undoToast";
import { showError } from "@/lib/errors/errorToast";
import type { ActionResult } from "@/lib/errors/withActionError";
import type { HubAudience, TreePage, TreeSection } from "@/models/hub";
import {
  createHubSectionAction,
  deleteHubPageAction,
  deleteHubSectionAction,
  duplicateHubPageAction,
  moveHubPageAction,
  reorderHubPagesAction,
  reorderHubSectionsAction,
  unpublishHubPageAction,
  updateHubSectionAction,
} from "../../actions";
import { unwrapHub, useInvalidateHub, usePageTree, useSectionDeleteImpact } from "../../hooks";
import { HUB_COLORS, LoadingBlock, SkeletonRows } from "../../shared";
import { useNewPage } from "../../reader/HubHomeContainer";
import { AudienceDialog } from "../audience";
import { IconColorPicker } from "../IconColorPicker";
import { ManageFrame } from "../ManageFrame";
import { PageTree, type PageTreeHandlers } from "./PageTree";
import { filterTree, nextFreeColor, type PageMove } from "./treeOps";

type Pending =
  | { kind: "appearance"; section: TreeSection }
  | { kind: "audience"; section: TreeSection }
  | { kind: "deleteSection"; section: TreeSection }
  | { kind: "moveTo"; page: TreePage }
  | { kind: "duplicate"; page: TreePage }
  | { kind: "deletePage"; page: TreePage };

const writeOf = (section: TreeSection, change: Partial<{ name: string; icon: string; color: string; audience: HubAudience }>) => ({
  name: change.name ?? section.name,
  icon: change.icon ?? section.icon,
  color: change.color ?? section.color,
  audience: change.audience ?? section.audience,
});

/** Deleting a section: its impact, and what happens to its pages — moved to another section, or deleted with it. */
const DeleteSectionDialog: React.FC<{ section: TreeSection; others: TreeSection[]; onClose: () => void; onDone: () => void }> = ({
  section,
  others,
  onClose,
  onDone,
}) => {
  const t = useTranslations("hub");
  const impact = useSectionDeleteImpact(section.id);
  const [choice, setChoice] = React.useState<"delete" | "move">("delete");
  const [target, setTarget] = React.useState<string>(others[0]?.id ?? "");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const pages = impact.data?.pages ?? section.pages.length;

  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      unwrapHub(
        await deleteHubSectionAction({
          id: section.id,
          request: choice === "move" && target ? { movePagesTo: target, deletePages: false } : { movePagesTo: null, deletePages: pages > 0 },
        }),
      );
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ConfirmActionModal
      isOpen
      destructive
      isLoading={busy}
      errorMessage={error}
      title={t("manage.confirm.deleteSectionTitle", { section: section.name, count: pages })}
      description={
        impact.data && impact.data.mustReadPages > 0
          ? t("manage.confirm.deleteSectionLineAgreed", { count: impact.data.openRequests })
          : t("manage.confirm.deleteSectionLine")
      }
      confirmLabel={t("manage.menu.deleteSection")}
      onConfirmAction={run}
      onCancelAction={onClose}
    >
      {pages > 0 && others.length > 0 && (
        <RadioGroup value={choice} onValueChange={(v) => setChoice(v as "delete" | "move")} className="flex flex-col gap-3">
          <label className="flex items-center gap-2 text-body text-primary">
            <RadioGroupItem value="delete" />
            {t("manage.confirm.deleteItsPages")}
          </label>
          <label className="flex items-center gap-2 text-body text-primary">
            <RadioGroupItem value="move" />
            {t("manage.confirm.movePagesTo")}
          </label>
          {choice === "move" && (
            <Select value={target} onValueChange={setTarget}>
              <SelectTrigger aria-label={t("manage.confirm.movePagesTo")} className="ml-6 w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {others.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </RadioGroup>
      )}
    </ConfirmActionModal>
  );
};

/** "Move to…": the page into another section, at its end. */
const MoveToDialog: React.FC<{ page: TreePage; sections: TreeSection[]; onClose: () => void; onMove: (sectionId: string) => void }> = ({
  page,
  sections,
  onClose,
  onMove,
}) => {
  const t = useTranslations("hub");
  const current = sections.find((s) => s.pages.some((p) => p.id === page.id))?.id ?? "";
  const [target, setTarget] = React.useState(sections.find((s) => s.id !== current)?.id ?? current);
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{t("manage.moveToTitle", { title: page.title })}</DialogTitle>
          <DialogDescription className="sr-only">{t("manage.menu.moveTo")}</DialogDescription>
        </DialogHeader>
        <Select value={target} onValueChange={setTarget}>
          <SelectTrigger aria-label={t("manage.pages.section")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sections.map((s) => (
              <SelectItem key={s.id} value={s.id} disabled={s.id === current}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            {t("actions.cancel")}
          </Button>
          <Button type="button" disabled={!target || target === current} onClick={() => onMove(target)}>
            {t("manage.move")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/** CM03, Pages: the handbook as a tree, searchable, with drag and drop, section menus and New section. */
export const PagesContainer: React.FC = () => {
  const t = useTranslations("hub");
  const router = useRouter();
  const tree = usePageTree();
  const invalidate = useInvalidateHub();
  const newPage = useNewPage();
  const canManage = useCanAccess("HUB.CONTENT", "MANAGE");
  const [sections, setSections] = React.useState<TreeSection[]>([]);
  const [query, setQuery] = React.useState("");
  const [renamingId, setRenamingId] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState<Pending | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [confirmError, setConfirmError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (tree.data) setSections(tree.data.sections);
  }, [tree.data]);

  const act = async <T,>(run: () => Promise<ActionResult<T>>): Promise<boolean> => {
    try {
      unwrapHub(await run());
      void invalidate();
      return true;
    } catch (error) {
      showError(error);
      void invalidate();
      return false;
    }
  };

  const applyPageMove = async (move: PageMove, undoable = true) => {
    const before = sections;
    setSections(move.sections);
    const ok =
      move.kind === "reorder"
        ? await act(() => reorderHubPagesAction(move.request))
        : await act(() => moveHubPageAction({ id: move.pageId, request: move.request }));
    if (!ok) {
      setSections(before);
      return;
    }
    if (move.kind === "move" && undoable) {
      const name = before.find((s) => s.id === move.request.sectionId)?.name ?? "";
      showUndoToast({
        message: t("manage.toasts.movedTo", { section: name }),
        onUndo: async () => {
          setSections(before);
          await act(() => moveHubPageAction({ id: move.pageId, request: { sectionId: move.from.sectionId, position: move.from.position } }));
        },
      });
    }
  };

  const handlers: PageTreeHandlers = {
    canManage,
    onSectionMove: (move) => {
      const before = sections;
      setSections(move.sections);
      void act(() => reorderHubSectionsAction(move.request)).then((ok) => !ok && setSections(before));
    },
    onPageMove: (move) => void applyPageMove(move),
    onAddPage: (sectionId) => void newPage.create(sectionId),
    onRenameSection: (section, name) => void act(() => updateHubSectionAction({ id: section.id, write: writeOf(section, { name }) })),
    onSectionAppearance: (section) => setPending({ kind: "appearance", section }),
    onSectionAudience: (section) => setPending({ kind: "audience", section }),
    onDeleteSection: (section) => setPending({ kind: "deleteSection", section }),
    onMovePageTo: (page) => setPending({ kind: "moveTo", page }),
    onDuplicatePage: (page) => setPending({ kind: "duplicate", page }),
    onUnpublishPage: (page) =>
      // Held back, not taken back: there is no "publish again" that would not also publish the draft.
      showUndoToast({
        message: t("manage.toasts.unpublished"),
        onUndo: () => undefined,
        onExpire: () => void act(() => unpublishHubPageAction(page.id)),
      }),
    onDeletePage: (page) => setPending({ kind: "deletePage", page }),
  };

  const newSection = async () => {
    try {
      const created = unwrapHub(
        await createHubSectionAction({
          name: t("manage.pages.newSection"),
          icon: "book",
          color: nextFreeColor(sections.map((s) => s.color), HUB_COLORS),
          audience: null,
        }),
      );
      await tree.refetch();
      setRenamingId(created.id);
    } catch (error) {
      showError(error);
    }
  };

  const confirmPage = async () => {
    if (!pending || (pending.kind !== "duplicate" && pending.kind !== "deletePage")) return;
    setBusy(true);
    setConfirmError(null);
    try {
      if (pending.kind === "duplicate") {
        const created = unwrapHub(await duplicateHubPageAction(pending.page.id));
        router.push(`/hub/manage/pages/${created.id}/edit`);
      } else {
        unwrapHub(await deleteHubPageAction(pending.page.id));
      }
      void invalidate();
      setPending(null);
    } catch (error) {
      setConfirmError(error instanceof Error ? error.message : null);
    } finally {
      setBusy(false);
    }
  };

  const shown = filterTree(sections, query);
  const data = tree.data;

  return (
    <ManageFrame
      actions={
        <Button type="button" loading={newPage.busy} onClick={() => void newPage.create()}>
          {t("manage.newPage")}
        </Button>
      }
    >
      {tree.isLoading ? (
        <LoadingBlock skeleton={<SkeletonRows count={8} height="h-11" />} />
      ) : tree.isError || !data ? (
        <ErrorState error={tree.error} title={t("manage.pages.error")} onRetry={() => void tree.refetch()} />
      ) : sections.length === 0 ? (
        <EmptyState
          scene="policies"
          title={t("manage.pages.emptyTitle")}
          description={t("manage.pages.emptyLine")}
          action={
            <div className="flex gap-3">
              <Button type="button" onClick={() => void newSection()}>
                {t("manage.pages.newSection")}
              </Button>
              <Button type="button" variant="secondary" loading={newPage.busy} onClick={() => void newPage.create()}>
                {t("manage.newPage")}
              </Button>
            </div>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex max-w-[1000px] items-center gap-4">
            <p className="text-hint text-tertiary">{t("manage.pages.line", { sections: data.sectionCount, pages: data.pageCount })}</p>
            <SearchBox className="ml-auto w-60" value={query} onChange={setQuery} aria-label={t("manage.pages.search")} />
          </div>
          {shown.length === 0 ? (
            <NoResults title={t("manage.nothingMatches", { text: query.trim() })} hint="" onClearSearch={() => setQuery("")} />
          ) : (
            <PageTree sections={shown} handlers={handlers} renamingId={renamingId} setRenamingId={setRenamingId} expandAll={Boolean(query.trim())} />
          )}
          {canManage && (
            <Button type="button" variant="ghost" className="w-fit gap-1.5" onClick={() => void newSection()}>
              <Icon icon={Add01Icon} size="sm" />
              {t("manage.pages.newSection")}
            </Button>
          )}
        </div>
      )}

      {pending?.kind === "appearance" && (
        <Dialog open onOpenChange={(open) => !open && setPending(null)}>
          <DialogContent size="sm" className="w-auto">
            <DialogHeader>
              <DialogTitle>{t("manage.menu.iconColour")}</DialogTitle>
              <DialogDescription className="sr-only">{pending.section.name}</DialogDescription>
            </DialogHeader>
            <IconColorPicker
              icon={pending.section.icon}
              color={pending.section.color}
              onChange={(next) => {
                const section = pending.section;
                setSections((all) => all.map((s) => (s.id === section.id ? { ...s, ...next } : s)));
                setPending({ kind: "appearance", section: { ...section, ...next } });
                void act(() => updateHubSectionAction({ id: section.id, write: writeOf(section, next) }));
              }}
            />
          </DialogContent>
        </Dialog>
      )}
      {pending?.kind === "audience" && (
        <AudienceDialog
          open
          subject="section"
          value={pending.section.audience}
          onOpenChange={(open) => !open && setPending(null)}
          onApply={(audience) => void act(() => updateHubSectionAction({ id: pending.section.id, write: writeOf(pending.section, { audience }) }))}
        />
      )}
      {pending?.kind === "deleteSection" && (
        <DeleteSectionDialog
          section={pending.section}
          others={sections.filter((s) => s.id !== pending.section.id)}
          onClose={() => setPending(null)}
          onDone={() => {
            setPending(null);
            void invalidate();
          }}
        />
      )}
      {pending?.kind === "moveTo" && (
        <MoveToDialog
          page={pending.page}
          sections={sections}
          onClose={() => setPending(null)}
          onMove={(sectionId) => {
            const page = pending.page;
            setPending(null);
            const target = sections.find((s) => s.id === sectionId);
            if (!target) return;
            const from = sections.find((s) => s.pages.some((p) => p.id === page.id));
            if (!from) return;
            void applyPageMove({
              kind: "move",
              pageId: page.id,
              from: { sectionId: from.id, position: from.pages.findIndex((p) => p.id === page.id) },
              request: { sectionId, position: target.pages.length },
              sections: sections.map((s) =>
                s.id === from.id ? { ...s, pages: s.pages.filter((p) => p.id !== page.id) } : s.id === sectionId ? { ...s, pages: [...s.pages, page] } : s,
              ),
            });
          }}
        />
      )}
      {(pending?.kind === "duplicate" || pending?.kind === "deletePage") && (
        <ConfirmActionModal
          isOpen
          isLoading={busy}
          errorMessage={confirmError}
          destructive={pending.kind === "deletePage"}
          title={
            pending.kind === "duplicate"
              ? t("manage.confirm.duplicateTitle", { title: pending.page.title })
              : t("manage.confirm.deleteTitle", { title: pending.page.title })
          }
          description={
            pending.kind === "duplicate" ? (
              t("manage.confirm.duplicateLine")
            ) : (
              <>
                {t("manage.confirm.deleteLine")} {pending.page.mustRead && t("manage.confirm.deleteKept")}
              </>
            )
          }
          confirmLabel={pending.kind === "duplicate" ? t("manage.menu.duplicate") : t("manage.confirm.deletePage")}
          onConfirmAction={confirmPage}
          onCancelAction={() => {
            setPending(null);
            setConfirmError(null);
          }}
        />
      )}
    </ManageFrame>
  );
};
