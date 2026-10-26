"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Archive, ArchiveRestore, ChevronLeft, LayoutGrid, List, UserPlus } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/public/desact/src/components/ui/popover";
import { useIsMobile } from "@/public/desact/src/components/ui/use-mobile";
import { cn } from "@/public/desact/src/components/ui/utils";
import { ErrorState } from "@/components/feedback/ErrorState";
import { FormError } from "@/components/feedback/FormError";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import { ConfirmCancelModal } from "@/components/ui/ConfirmCancelModal/ConfirmCancelModal";
import { RowAction, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useCanAccess } from "@/components/auth/useAccess";
import { UserPickerField } from "@/components/modules/settings/shared/UserPickerField/UserPickerField";
import { ActionStatus } from "@/components/models/ActionStatus";
import { showActionError, showSuccess } from "@/lib/errors/errorToast";
import { useUnsavedChangesGuard } from "@/components/modules/automations/builder/useUnsavedChangesGuard";
import {
  archiveTemplateAction,
  saveTemplateAction,
  unarchiveTemplateAction,
} from "@/components/modules/lifecycle/actions/lifecycleActions";
import { useInvalidateLifecycle, useLifecycleTemplate } from "@/components/modules/lifecycle/hooks";
import { PROCESS_TYPE_LABELS, type ProcessType, type TaskKind } from "@/models/lifecycle";
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
import { QuickAddCard } from "./QuickAddCard";
import { TemplateTaskListView } from "./TemplateTaskListView";
import { effectiveView, readViewPreference, writeViewPreference, type EditorView } from "./viewPreference";

type Props = {
  type: ProcessType;
  templateId: string;
};

type QuickAdd = { laneId: string; columnId: string; left: number; top: number };

const listHref = (type: ProcessType) => `/settings/automation/${type === "ONBOARDING" ? "onboarding" : "preboarding"}`;

/**
 * Settings → Onboarding / Preboarding → one template, as a canvas (DECISIONS.md § "Automations and the
 * onboarding canvas", items 3–7, 10, 12, 13): time runs across from the start day, one lane per assignee
 * runs down the side, and the tasks are blocks on it. An arrow from one block to another makes the second
 * wait for the first.
 *
 * <p>The template is edited as one draft and saved as one thing — Save is the one primary action, and
 * leaving with unsaved changes asks first. A block's place is derived from its task, never stored.
 * The list view is the same draft grouped by phase, and the only view on a small screen.
 */
export function TemplateCanvasEditor({ type, templateId }: Props) {
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
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [laneOpen, setLaneOpen] = useState(false);

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
  const guard = useUnsavedChangesGuard(dirty && !busy);

  const items = useMemo(() => draft?.items ?? [], [draft]);
  const lanes = useMemo(() => deriveLanes(items, extraLanes), [items, extraLanes]);
  const axis = useMemo(() => buildAxis(items), [items]);
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
    setNotice(`${item.title || "Untitled task"} moved to ${dayLabel(timing)}, ${lane.label}.`);
  }, [items, laneById, patchItem]);

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
      setNotice("That arrow would make the tasks wait for each other in a circle, so it was not added.");
      return;
    }
    setItems(() => result.items);
    const dependent = items.find((i) => i.key === dependentKey);
    const predecessor = items.find((i) => i.key === predecessorKey);
    setNotice(`${dependent?.title || "The task"} now waits for ${predecessor?.title || "the other task"}.`);
  }, [items, setItems]);

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
        setNotice("The arrow was removed.");
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
  }, [selectedEdgeId, selectedKey, selected, readOnly, lanes, moveItem, selectBlock, setItems]);

  const save = async () => {
    if (!draft) return;
    setSaveError(null);
    const problems = draftProblems(draft);
    if (problems.length) {
      setSaveError(problems.join(" "));
      return;
    }
    setBusy(true);
    try {
      const res = await saveTemplateAction({ id: templateId, body: draftToWrite(type, draft, version) });
      if (res.status !== ActionStatus.SUCCESS || !res.data) {
        setSaveError(res.errorMessage ?? "Something went wrong.");
        return;
      }
      const saved = draftFromTemplate(res.data);
      setBaseline(saved);
      setDraft(saved);
      setVersion(res.data.version);
      setSelectedKey(null);
      setSelectedEdgeId(null);
      setPanelOpen(false);
      await invalidate();
      showSuccess("Template saved.");
    } finally {
      setBusy(false);
    }
  };

  const archive = async () => {
    setArchiveError(null);
    const res = await archiveTemplateAction(templateId);
    if (res.status !== ActionStatus.SUCCESS) {
      setArchiveError(res.errorMessage ?? "Something went wrong.");
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
        <Skeleton className="h-[420px] w-full rounded-xl" />
      </div>
    );
  }

  const quickAddLane = quickAdd ? laneById(quickAdd.laneId) : null;
  const quickAddColumn = quickAdd ? axis.columns.find((c) => c.id === quickAdd.columnId) ?? null : null;
  const quickAddTiming = quickAddColumn ? timingForColumn(quickAddColumn) : null;
  const removing = items.find((i) => i.key === confirmRemove) ?? null;

  return (
    <div className="flex h-full flex-col gap-4">
      <header className="flex flex-wrap items-center gap-3 px-8">
        <Link
          href={listHref(type)}
          aria-label={`Back to ${PROCESS_TYPE_LABELS[type]} Templates`}
          className="no-underline grid h-10 w-10 shrink-0 place-items-center rounded-full border bg-white hover:bg-brown-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <Input
            aria-label="Template Name"
            value={draft.name}
            disabled={readOnly}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            className="h-10 max-w-xl border-transparent bg-transparent px-2 text-2xl font-semibold text-brown-900 shadow-none hover:border-brown-200 focus-visible:border-brown-300"
          />
          <div className="flex items-center gap-2 px-2 text-xs text-muted-foreground">
            <span>{PROCESS_TYPE_LABELS[type]} Template</span>
            <span aria-hidden>·</span>
            <span>{items.length === 1 ? "1 task" : `${items.length} tasks`}</span>
            {archived && <StatusBadge status="archived" />}
            {dirty && <span className="text-brown-600">Unsaved changes</span>}
          </div>
        </div>

        {!narrow && (
          <div className="flex rounded-lg border border-brown-100 bg-white p-0.5" role="group" aria-label="View">
            {(["canvas", "list"] as EditorView[]).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => setView(v)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm",
                  view === v ? "bg-brown-100 font-medium text-brown-900" : "text-brown-600 hover:bg-brown-50",
                )}
              >
                {v === "canvas" ? <LayoutGrid className="h-4 w-4" /> : <List className="h-4 w-4" />}
                {v === "canvas" ? "Canvas" : "List"}
              </button>
            ))}
          </div>
        )}

        {!readOnly && view === "canvas" && (
          <Popover open={laneOpen} onOpenChange={setLaneOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-1.5">
                <UserPlus className="h-4 w-4" />
                Add Lane
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 space-y-2">
              <p className="text-sm font-medium">A lane for a named person</p>
              <p className="text-xs text-muted-foreground">
                HR or IT are a named person, or the onboarding manager. A named person makes the template depend on them.
              </p>
              <UserPickerField
                value={null}
                onChange={(u) => {
                  if (!u) return;
                  const label = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email || "Named Person";
                  setExtraLanes((l) => [...l, { id: `USER:${u.id}`, assigneeKind: "SPECIFIC_USER", userId: u.id, label, problem: null }]);
                  setLaneOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        )}

        {!readOnly && (
          <Button onClick={save} disabled={!dirty || busy}>{busy ? "Saving…" : "Save"}</Button>
        )}

        {canManage && (
          <RowActionsMenu label="Template Actions">
            {archived ? (
              <RowAction icon={<ArchiveRestore className="h-4 w-4 text-muted-foreground" />} onClick={() => void unarchive()}>
                Unarchive
              </RowAction>
            ) : (
              <RowAction icon={<Archive className="h-4 w-4 text-muted-foreground" />} onClick={() => { setArchiveError(null); setConfirmArchive(true); }}>
                Archive
              </RowAction>
            )}
          </RowActionsMenu>
        )}
      </header>

      {(saveError || notice || archived) && (
        <div className="space-y-2 px-8">
          <FormError message={saveError} />
          {archived && (
            <p className="text-sm text-muted-foreground">An archived template cannot be changed or used. Unarchive it to edit it.</p>
          )}
          {notice && view === "list" && <p role="status" className="text-sm text-muted-foreground">{notice}</p>}
        </div>
      )}

      <div className="flex min-h-0 flex-1 gap-0 px-8 pb-6">
        <div className="relative min-w-0 flex-1">
          {view === "canvas" ? (
            <div className="relative h-[calc(100vh-220px)] min-h-[440px]">
              <TemplateCanvas
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
                onCellClickAction={(laneId, columnId, point) => setQuickAdd({ laneId, columnId, ...point })}
                onAddInLaneAction={(laneId, point) => setQuickAdd({ laneId, columnId: "d0", ...point })}
                onCommandAction={runCommand}
                announcement={notice}
              />
              {items.length === 0 && !readOnly && !quickAdd && (
                <p className="pointer-events-none absolute inset-x-0 top-1/2 text-center text-sm text-muted-foreground">
                  Click any day in a lane to add a task there.
                </p>
              )}
              {quickAdd && quickAddLane && quickAddTiming && (
                <QuickAddCard
                  left={Math.max(8, quickAdd.left)}
                  top={Math.max(8, quickAdd.top)}
                  where={`${quickAddLane.label} · ${dayLabel(quickAddTiming)}`}
                  onAddAction={({ title, kind }) => addTask(quickAdd.laneId, quickAddTiming, title, kind)}
                  onCancelAction={() => setQuickAdd(null)}
                />
              )}
            </div>
          ) : (
            <TemplateTaskListView
              items={items}
              lanes={lanes}
              selectedKey={selectedKey}
              readOnly={readOnly}
              onSelectAction={(key) => selectBlock(key)}
              onAddAction={() => addTask("TARGET", { dueKind: "OFFSET", offsetDays: 0 }, "", "CHECKLIST")}
            />
          )}
        </div>

        {selected && panelOpen && (
          <div className={cn(narrow ? "fixed inset-0 z-30 bg-white" : "ml-4 h-[calc(100vh-220px)] min-h-[440px] overflow-hidden rounded-xl border border-brown-100")}>
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
        title="Remove Task"
        confirmLabel="Remove"
        destructive
        description={
          <>
            <strong>{removing?.title || "This task"}</strong> leaves the template, with its arrows. Nothing changes
            until you save, and processes already started keep their own copy.
          </>
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
        title="Archive Template"
        confirmLabel="Archive"
        errorMessage={archiveError}
        description={
          <>
            <strong>{template?.name}</strong> can no longer be used to start a process. Processes already started
            from it keep their own copy. You can unarchive it later.
            {dirty ? " Unsaved changes are not kept." : ""}
          </>
        }
        onCancelAction={() => setConfirmArchive(false)}
        onConfirmAction={archive}
      />

      <ConfirmCancelModal
        isOpen={guard.pendingHref !== null}
        title="Leave without saving?"
        description="The changes to this template have not been saved."
        cancelText="Keep Editing"
        confirmText="Leave"
        onCancelAction={guard.stay}
        onConfirmAction={() => {
          guard.leave();
        }}
      />
    </div>
  );
}
