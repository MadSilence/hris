"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Archive02Icon, ArchiveArrowUpIcon, ArrowLeft01Icon, LeftToRightListBulletIcon, Tick02Icon, TimelineIcon, ViewIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { NodRing } from "@/components/desact/nod";
import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import { Skeleton } from "@/components/desact/skeleton";
import { useIsMobile } from "@/components/desact/use-mobile";
import { cn } from "@/lib/cn";
import { ErrorState } from "@/components/feedback/ErrorState";
import { FormError } from "@/components/feedback/FormError";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import { ConfirmCancelModal } from "@/components/ui/ConfirmCancelModal/ConfirmCancelModal";
import { RowAction, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useCanAccess } from "@/components/auth/useAccess";
import { ActionStatus } from "@/components/models/ActionStatus";
import { showActionError } from "@/lib/errors/errorToast";
import { useUnsavedChangesGuard } from "@/components/modules/automations/builder/useUnsavedChangesGuard";
import {
  archiveTemplateAction,
  saveTemplateAction,
  unarchiveTemplateAction,
} from "@/components/modules/lifecycle/actions/lifecycleActions";
import { useInvalidateLifecycle, useLifecycleTemplate } from "@/components/modules/lifecycle/hooks";
import type { ProcessType, TaskKind } from "@/models/lifecycle";
import {
  addWait,
  assigneeOfLane,
  dayLabel,
  deriveLanes,
  draftFromTemplate,
  draftProblems,
  draftToWrite,
  laneIdOf,
  newItemKey,
  removeItem,
  removeWait,
  sameDraft,
  type DraftItem,
  type Lane,
  type TemplateDraft,
} from "./draft";
import type { CanvasCommand } from "./keyboard";
import { buildAxis, layoutTemplate, shiftDays, timingForColumn } from "./timeAxis";
import { TemplateCanvas } from "./TemplateCanvas";
import { TaskSidePanel } from "./TaskSidePanel";
import { AddTaskDialog } from "./AddTaskDialog";
import { TemplatePreviewDialog } from "./TemplatePreviewDialog";
import { TemplateTaskListView } from "./TemplateTaskListView";
import { effectiveView, readViewPreference, writeViewPreference, type EditorView } from "./viewPreference";

type Props = {
  type: ProcessType;
  templateId: string;
};

type QuickAdd = { laneId: string; columnId: string };

/** How long the editor waits after the last change before it saves: long enough not to save every keystroke. */
const AUTOSAVE_DELAY_MS = 800;

type SaveState = "saved" | "saving" | "blocked" | "failed";

/** What a template of each type is, and how its timeline is worked — the line between the header and the canvas. */
const INTRO = {
  PREBOARDING: "editor.introPreboarding",
  ONBOARDING: "editor.introOnboarding",
  OFFBOARDING: "editor.introOffboarding",
} as const satisfies Record<ProcessType, string>;

const listHref = (type: ProcessType) => `/settings/automation/${type.toLowerCase()}`;

/**
 * Settings → Onboarding / Preboarding → one template, as a canvas (DECISIONS.md § "Automations and the
 * onboarding canvas", items 3–7, 10, 12, 13): time runs across from the start day, one lane per assignee
 * runs down the side, and the tasks are blocks on it. An arrow from one block to another makes the second
 * wait for the first.
 *
 * <p>The template is edited as one draft and <b>saves itself</b> a moment after each change, as one thing; a
 * draft a save would refuse (a task with no title, a named task naming nobody) waits quietly until it is
 * complete, and leaving while something is not saved asks first. A save keeps the draft's own keys, so a selection and an open panel
 * survive it. Preview shows the person's side. A block's place is derived from its task, never stored. The
 * list view is the same draft grouped by phase, and the only view on a small screen.
 */
export function TemplateCanvasEditor({ type, templateId }: Props) {
  const t = useTranslations("lifecycle");
  const tCommon = useTranslations("common");
  const canEdit = useCanAccess("PEOPLE.LIFECYCLE_TEMPLATES", "EDIT");
  const canManage = useCanAccess("PEOPLE.LIFECYCLE_TEMPLATES", "MANAGE");
  const { data: template, isLoading, error } = useLifecycleTemplate(templateId);
  const invalidate = useInvalidateLifecycle();
  const narrow = useIsMobile();

  const [baseline, setBaseline] = useState<TemplateDraft | null>(null);
  const [draft, setDraft] = useState<TemplateDraft | null>(null);
  const [version, setVersion] = useState<number | undefined>(undefined);
  const [extraLanes, setExtraLanes] = useState<Lane[]>([]);
  const [preferred, setPreferred] = useState<EditorView>("canvas");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [quickAdd, setQuickAdd] = useState<QuickAdd | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const saving = useRef(false);
  const [notice, setNotice] = useState<string | null>(null);
  // A refusal is the one notice a sighted reader needs too: a move or a new arrow shows itself on the
  // canvas, a refused arrow shows nothing at all (walk of 2026-10-30). Cleared by the next change.
  const [refusal, setRefusal] = useState<string | null>(null);
  useEffect(() => setRefusal(null), [draft]);

  useEffect(() => setPreferred(readViewPreference()), []);

  // The draft starts from the template once, and again only after a save or an archive changes it.
  useEffect(() => {
    if (!template || baseline) return;
    const loaded = draftFromTemplate(template);
    setBaseline(loaded);
    setDraft(loaded);
    setVersion(template.version);
  }, [template, baseline]);

  const archived = Boolean(template?.archivedAt);
  const readOnly = !canEdit || archived;
  const view = effectiveView(preferred, narrow);
  const dirty = Boolean(draft && baseline && !sameDraft(draft, baseline));
  const guard = useUnsavedChangesGuard(dirty);

  const items = useMemo(() => draft?.items ?? [], [draft]);
  const lanes = useMemo(() => deriveLanes(items, t, extraLanes, type), [items, t, extraLanes, type]);
  const axis = useMemo(() => buildAxis(items, t, type), [items, t, type]);
  const layout = useMemo(() => layoutTemplate(items, lanes, axis), [items, lanes, axis]);
  const selected = items.find((i) => i.key === selectedKey) ?? null;

  const setItems = useCallback((fn: (items: DraftItem[]) => DraftItem[]) => {
    setDraft((d) => (d ? { ...d, items: fn(d.items) } : d));
  }, []);

  const patchItem = useCallback((key: string, patch: Partial<DraftItem>) => {
    // "Waits For" comes from the panel, which does not offer a task that would close a circle.
    setItems((list) => list.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  }, [setItems]);

  const laneById = useCallback((id: string) => lanes.find((l) => l.id === id) ?? lanes[0], [lanes]);

  const moveItem = useCallback((key: string, timing: Pick<DraftItem, "dueKind" | "offsetDays">, laneId: string) => {
    const item = items.find((i) => i.key === key);
    if (!item) return;
    const lane = laneById(laneId);
    const sameLane = laneIdOf(item) === lane.id;
    patchItem(key, { ...timing, ...(sameLane ? {} : assigneeOfLane(lane)) });
    setNotice(t("editor.moved", { title: item.title || t("shared.untitledTask"), day: dayLabel(timing, t, type), lane: lane.label }));
  }, [items, laneById, patchItem, type, t]);

  const selectBlock = useCallback((key: string | null) => {
    setSelectedKey(key);
    setSelectedEdgeId(null);
    setPanelOpen(key !== null);
    setQuickAdd(null);
  }, []);

  const focusBlock = useCallback((key: string) => {
    setSelectedKey(key);
    setSelectedEdgeId(null);
  }, []);

  const connect = useCallback((dependentKey: string, predecessorKey: string) => {
    const result = addWait(items, dependentKey, predecessorKey);
    if (result.refused) {
      const message = t("editor.circleRefused");
      setNotice(message);
      setRefusal(message);
      return;
    }
    setItems(() => result.items);
    const dependent = items.find((i) => i.key === dependentKey);
    const predecessor = items.find((i) => i.key === predecessorKey);
    setNotice(t("editor.nowWaits", {
      dependent: dependent?.title || t("editor.theTask"),
      predecessor: predecessor?.title || t("editor.theOtherTask"),
    }));
  }, [items, setItems, t]);

  const addTask = useCallback((laneId: string, timing: Pick<DraftItem, "dueKind" | "offsetDays">, title: string, kind: TaskKind) => {
    const lane = laneById(laneId);
    const item: DraftItem = {
      key: newItemKey(),
      kind,
      title,
      description: "",
      ...timing,
      ...assigneeOfLane(lane),
      attributeIds: [],
      categoryId: null,
      materials: [],
      questions: [],
      waitsFor: [],
    };
    setItems((list) => [...list, item]);
    setQuickAdd(null);
    setSelectedKey(item.key);
    setSelectedEdgeId(null);
    setPanelOpen(true);
  }, [laneById, setItems]);

  const runCommand = useCallback((command: CanvasCommand) => {
    if (command.type === "deselect") {
      selectBlock(null);
      return;
    }
    if (command.type === "remove") {
      if (selectedEdgeId) {
        const [predecessor, dependent] = selectedEdgeId.split("->");
        setItems((list) => removeWait(list, dependent, predecessor));
        setSelectedEdgeId(null);
        setNotice(t("editor.arrowRemoved"));
      } else if (selectedKey && !readOnly) {
        setConfirmRemove(selectedKey);
      }
      return;
    }
    if (!selected || readOnly) return;
    if (command.type === "openPanel") setPanelOpen(true);
    if (command.type === "shiftDays") moveItem(selected.key, shiftDays(selected, command.days), laneIdOf(selected));
    if (command.type === "shiftLane") {
      const index = lanes.findIndex((l) => l.id === laneIdOf(selected));
      const next = lanes[Math.min(lanes.length - 1, Math.max(0, index + command.lanes))];
      if (next && next.id !== laneIdOf(selected)) moveItem(selected.key, selected, next.id);
    }
  }, [selectedEdgeId, selectedKey, selected, readOnly, lanes, moveItem, selectBlock, setItems, t]);

  /**
   * One save of the draft as it was when the save began. The draft is not replaced by the answer: the template
   * gives its items new ids on every save, and swapping them in would close the panel under the reader's
   * cursor. The draft's keys go out as keys each time, which is all the arrows need.
   */
  const save = useCallback(async (sent: TemplateDraft) => {
    if (saving.current) return;
    saving.current = true;
    setSaveState("saving");
    try {
      const res = await saveTemplateAction({ id: templateId, body: draftToWrite(type, sent, version) });
      if (res.status !== ActionStatus.SUCCESS || !res.data) {
        setSaveState("failed");
        setSaveError(res.errorMessage ?? t("shared.somethingWentWrong"));
        return;
      }
      setBaseline(sent);
      setVersion(res.data.version);
      setSaveError(null);
      setSaveState("saved");
      await invalidate();
    } finally {
      saving.current = false;
    }
  }, [templateId, type, version, invalidate, t]);

  // Saves itself a moment after the last change. A draft the server would refuse waits, saying why; a failed
  // save is tried again on the next change, not in a loop.
  useEffect(() => {
    if (!draft || !baseline || readOnly || sameDraft(draft, baseline)) return;
    const problems = draftProblems(draft, t);
    if (problems.length) {
      setSaveState("blocked");
      setSaveError(problems.join(" "));
      return;
    }
    // Fixed since: the reason it waited goes, and the status reads "Saving…" until the save lands.
    setSaveState((state) => (state === "blocked" ? "saved" : state));
    const timer = setTimeout(() => void save(draft), AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [draft, baseline, readOnly, save, t]);

  const archive = async () => {
    setArchiveError(null);
    const res = await archiveTemplateAction(templateId);
    if (res.status !== ActionStatus.SUCCESS) {
      setArchiveError(res.errorMessage ?? t("shared.somethingWentWrong"));
      return;
    }
    setConfirmArchive(false);
    setBaseline(null); // reload from the archived template
    await invalidate();
  };

  const unarchive = async () => {
    const res = await unarchiveTemplateAction(templateId);
    if (res.status !== ActionStatus.SUCCESS) {
      showActionError(res);
      return;
    }
    setBaseline(null);
    await invalidate();
  };

  const setView = (next: EditorView) => {
    setPreferred(next);
    writeViewPreference(next);
  };

  if (error) return <div className="px-8"><ErrorState error={error} /></div>;
  if (isLoading || !draft) {
    return (
      <div className="space-y-4 px-8" aria-busy="true">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-[420px] w-full rounded-popover" />
      </div>
    );
  }

  const quickAddLane = quickAdd ? laneById(quickAdd.laneId) : null;
  const addPerson = (u: { id: string; firstName?: string | null; lastName?: string | null; email?: string | null }) => {
    const label = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email || t("canvas.namedPerson");
    setExtraLanes((l) => [...l, { id: `USER:${u.id}`, assigneeKind: "SPECIFIC_USER", userId: u.id, label, problem: null }]);
  };
  const quickAddColumn = quickAdd ? axis.columns.find((c) => c.id === quickAdd.columnId) ?? null : null;
  const quickAddTiming = quickAddColumn ? timingForColumn(quickAddColumn) : null;
  const removing = items.find((i) => i.key === confirmRemove) ?? null;

  return (
    // Exactly the window, less the settings page's own padding (6rem): taller, and the page scrolled a little,
    // carrying the whole editor with it.
    <div className="flex h-[calc(100vh-6rem)] min-h-[560px] flex-col gap-4">
      <header className="flex flex-wrap items-center gap-3 px-8">
        <Link
          href={listHref(type)}
          aria-label={t("editor.backTo", { type })}
          className="no-underline grid h-10 w-10 shrink-0 place-items-center rounded-pill border bg-card hover:bg-subtle"
        >
          <Icon icon={ArrowLeft01Icon} size="sm" />
        </Link>
        <div className="min-w-0 flex-1">
          <Input
            aria-label={t("editor.templateName")}
            value={draft.name}
            disabled={readOnly}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            className="h-10 max-w-xl border-transparent bg-transparent px-2 text-page-title text-primary shadow-none hover:border-divider focus-visible:border-field"
          />
          <div className="flex items-center gap-2 px-2 text-hint text-tertiary">
            <span>{t("editor.typeTemplate", { type })}</span>
            <span aria-hidden>·</span>
            <span>{t("shared.taskCount", { count: items.length })}</span>
            {archived && <StatusBadge status="archived" />}
            {!readOnly && <SaveStatus state={dirty && saveState === "saved" ? "saving" : saveState} />}
          </div>
        </div>

        {!narrow && (
          <div className="flex rounded-control border border-divider bg-card p-0.5" role="group" aria-label={t("editor.view")}>
            {(["canvas", "list"] as EditorView[]).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => setView(v)}
                className={cn(
                  "flex items-center gap-1.5 rounded-control px-2.5 py-1.5 text-body",
                  view === v ? "bg-accent-muted font-medium text-accent-text" : "text-secondary hover:bg-subtle",
                )}
              >
                {v === "canvas" ? <Icon icon={TimelineIcon} size="sm" /> : <Icon icon={LeftToRightListBulletIcon} size="sm" />}
                {v === "canvas" ? t("editor.timeline") : t("editor.list")}
              </button>
            ))}
          </div>
        )}

        <Button type="button" className="gap-1.5" onClick={() => setPreviewOpen(true)}>
          <Icon icon={ViewIcon} size="sm" />
          {tCommon("actions.preview")}
        </Button>

        {canManage && (
          <RowActionsMenu label={t("shared.templateActions")}>
            {archived ? (
              <RowAction icon={<Icon icon={ArchiveArrowUpIcon} size="sm" className="text-tertiary" />} onClick={() => void unarchive()}>
                {t("shared.unarchive")}
              </RowAction>
            ) : (
              <RowAction icon={<Icon icon={Archive02Icon} size="sm" className="text-tertiary" />} onClick={() => { setArchiveError(null); setConfirmArchive(true); }}>
                {tCommon("actions.archive")}
              </RowAction>
            )}
          </RowActionsMenu>
        )}
      </header>

      <div className="space-y-1 px-8 pb-4">
        <p className="text-body text-tertiary/90">{t(INTRO[type])}</p>
        {!readOnly && <p className="text-body text-tertiary">{t("editor.howTo")}</p>}
      </div>

      {((saveState === "failed" && saveError) || notice || refusal || archived) && (
        <div className="space-y-2 px-8">
          {/* A draft that cannot be saved yet says nothing — it is half-typed, and the panel shows what is
              missing; only a save the server refused is an error. */}
          {saveState === "failed" && <FormError message={saveError} />}
          {archived && (
            <p className="text-body text-tertiary">{t("editor.archivedNote")}</p>
          )}
          {notice && view === "list" && <p role="status" className="text-body text-tertiary">{notice}</p>}
          {refusal && view === "canvas" && <p className="text-body text-status-pending-text">{refusal}</p>}
        </div>
      )}

      <div className="flex min-h-0 flex-1 gap-0 px-8 pb-6">
        <div className="relative min-w-0 flex-1 overflow-y-auto">
          {view === "canvas" ? (
            <div className="relative h-full min-h-[320px]">
              <TemplateCanvas
                type={type}
                items={items}
                layout={layout}
                readOnly={readOnly}
                selectedKey={selectedKey}
                selectedEdgeId={selectedEdgeId}
                onSelectBlockAction={selectBlock}
                onFocusBlockAction={focusBlock}
                onSelectEdgeAction={(id) => { setSelectedEdgeId(id); setSelectedKey(null); setPanelOpen(false); }}
                onMoveAction={moveItem}
                onConnectAction={connect}
                onCellClickAction={(laneId, columnId) => setQuickAdd({ laneId, columnId })}
                onAddInLaneAction={(laneId) => setQuickAdd({ laneId, columnId: "d0" })}
                onAddPersonAction={addPerson}
                onCommandAction={runCommand}
                announcement={notice}
              />
            </div>
          ) : (
            <TemplateTaskListView
              type={type}
              items={items}
              lanes={lanes}
              selectedKey={selectedKey}
              readOnly={readOnly}
              onSelectAction={(key) => selectBlock(key)}
              onAddAction={() => addTask("TARGET", { dueKind: "OFFSET", offsetDays: 0 }, "", "TODO")}
            />
          )}
        </div>

        {selected && panelOpen && (
          <div className={cn(narrow ? "fixed inset-0 z-30 bg-card" : "ml-4 h-full overflow-hidden rounded-popover")}>
            <TaskSidePanel
              item={selected}
              items={items}
              type={type}
              readOnly={readOnly}
              onChange={(patch) => patchItem(selected.key, patch)}
              onRemove={() => setConfirmRemove(selected.key)}
              onClose={() => setPanelOpen(false)}
            />
          </div>
        )}
      </div>

      <ConfirmActionModal
        isOpen={removing !== null}
        title={t("shared.removeTask")}
        confirmLabel={tCommon("actions.remove")}
        destructive
        description={
          t.rich("editor.removeBody", { title: removing?.title || t("editor.thisTask"), b: (chunks) => <strong>{chunks}</strong> })
        }
        onCancelAction={() => setConfirmRemove(null)}
        onConfirmAction={() => {
          if (removing) setItems((list) => removeItem(list, removing.key));
          setConfirmRemove(null);
          selectBlock(null);
        }}
      />

      <ConfirmActionModal
        isOpen={confirmArchive}
        title={t("shared.archiveTemplate")}
        confirmLabel={tCommon("actions.archive")}
        errorMessage={archiveError}
        description={
          t.rich(dirty ? "editor.archiveBodyDirty" : "shared.archiveTemplateBody", {
            name: template?.name ?? "",
            b: (chunks) => <strong>{chunks}</strong>,
          })
        }
        onCancelAction={() => setConfirmArchive(false)}
        onConfirmAction={archive}
      />

      <AddTaskDialog
        open={quickAdd !== null && quickAddLane !== null && quickAddTiming !== null}
        where={quickAddLane && quickAddTiming ? t("editor.where", { lane: quickAddLane.label, day: dayLabel(quickAddTiming, t, type) }) : ""}
        onAddAction={({ title, kind }) => {
          if (quickAdd && quickAddTiming) addTask(quickAdd.laneId, quickAddTiming, title, kind);
        }}
        onCancelAction={() => setQuickAdd(null)}
      />

      <TemplatePreviewDialog
        open={previewOpen}
        type={type}
        name={draft.name}
        items={items}
        onCloseAction={() => setPreviewOpen(false)}
      />

      <ConfirmCancelModal
        isOpen={guard.pendingHref !== null}
        title={t("editor.leaveTitle")}
        description={saveError ? t("editor.leaveFailed", { error: saveError }) : t("editor.leaveSaving")}
        cancelText={tCommon("actions.keepEditing")}
        confirmText={t("editor.leave")}
        onCancelAction={guard.stay}
        onConfirmAction={() => {
          guard.leave();
        }}
      />
    </div>
  );
}

/** Saved, saving, or why not — said quietly beside the template's facts, in place of a Save button. */
function SaveStatus({ state }: { state: SaveState }) {
  const t = useTranslations("lifecycle");
  const tCommon = useTranslations("common");
  if (state === "saving") {
    return (
      <span className="flex items-center gap-1" role="status">
        <NodRing size="sm" label="" />
        {tCommon("actions.saving")}
      </span>
    );
  }
  if (state === "saved") {
    return (
      <span className="flex items-center gap-1" role="status">
        <Icon icon={Tick02Icon} size="sm" />
        {t("editor.saved")}
      </span>
    );
  }
  if (state === "blocked") return null;
  return <span className="text-status-pending-text" role="status">{t("editor.notSaved")}</span>;
}
