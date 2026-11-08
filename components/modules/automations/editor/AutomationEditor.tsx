"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Layers01Icon, ShieldCheckIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/desact/button";
import { useUnsavedChangesGuard } from "@/components/hooks/useUnsavedChangesGuard";
import { useCompanyData } from "@/components/providers/CompanyDataProvider/CompanyDataProvider";
import { showUndoToast } from "@/lib/feedback/undoToast";
import { showError } from "@/lib/errors/errorToast";
import { isFallbackErrorMessage, messageForError } from "@/lib/errors/errorMessages";
import { useDateFormatter } from "@/lib/date";
import { STEP_TYPE_ICONS } from "@/components/modules/automations/shared";
import {
  createAutomationAction,
  renameAutomationAction,
  saveAutomationAction,
  saveAutomationDraftAction,
  turnOffAutomationAction,
  turnOnAutomationAction,
  undoTurnOnAutomationAction,
} from "@/components/modules/automations/actions/automationActions";
import { useAutomationCheck, useAutomationMutation } from "@/components/modules/automations/hooks";
import {
  duplicateStep,
  findStep,
  insertStep,
  moveStep,
  moveStepAfter,
  newStep,
  newStepId,
  numbers,
  removeStep,
  updateStep,
  type InsertTarget,
} from "@/components/modules/automations/model/tree";
import type {
  Automation,
  AutomationCatalog,
  AutomationCheck,
  AutomationDefinition,
  AutomationRun,
  AutomationStepType,
  AutomationVersion,
  BackfillChoice,
  InFlightChoice,
  RecipientKind,
  RecipientSpec,
  StepSpec,
  TriggerSpec,
} from "@/models/automations";
import { AutomationCanvas, type CanvasInsets } from "./canvas/AutomationCanvas";
import { AiWindow } from "./ai/AiWindow";
import { noddoAiDraft, type AiTurn } from "./ai/noddoAiDraft";
import { NameAndIconDialog, type NameAndIcon } from "./dialogs/NameAndIconDialog";
import { RunsGoingDialog } from "./dialogs/RunsGoingDialog";
import { TurnOnDialog } from "./dialogs/TurnOnDialog";
import { UnsavedChangesDialog } from "./dialogs/UnsavedChangesDialog";
import { CanvasBanner } from "./frame/CanvasBanner";
import { EditorHeader } from "./frame/EditorHeader";
import { SentenceCard } from "./frame/SentenceCard";
import { ToolBlock, ToolWindowFrame, type BlockTool, type ToolId } from "./frame/ToolBlock";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import {
  RunHistoryWindow,
  RunWindow,
  StepFields,
  TestRunWindow,
  TriggerFields,
  TriggerList,
  VersionsWindow,
  WhoItRunsFor,
  useAutomationWords,
  choiceOf,
} from "./seams";
import {
  countsRequests,
  editedStepIds,
  headerButtons,
  firingOverVolume,
  needsKey,
  nextProblem,
  notConnectedSteps,
  opensReadOnly,
  problemsByStep,
  runCardStates,
  sameDefinition,
  sameMeta,
  turnOnNext,
  type CardCommand,
  type EditorDraft,
  type HeaderButton,
} from "./state/editorLogic";
import { AddStepWindow } from "./windows/AddStepWindow";
import { StepSettingsWindow } from "./windows/StepSettingsWindow";
import { WhoSeesWhat } from "./windows/WhoSeesWhat";

export type AutomationEditorInitial = {
  automation: Automation | null;
  draft: EditorDraft;
  /** What counts as saved: the automation as loaded, or an empty new one (so a template starts unsaved). */
  baseline: EditorDraft;
  /** The name was suggested, not typed (a template's name stays a suggestion until saved). */
  tool: ToolId | null;
  selectedStepId: string | null;
  runId: string | null;
  aiPrompt: string | null;
  turnOnOnLoad: boolean;
  editOnLoad?: boolean;
};

type Selection = { kind: "step"; id: string } | { kind: "trigger" } | null;
/** What to do once the Name and icon dialog has saved the first draft, or V7 has saved: carry on to it. */
type Intent = "turnOn" | "leave" | null;
type SaveOutcome = "saved" | "dialog" | "held" | "failed";

const TOOL_W: Record<ToolId, number> = { ai: 400, add: 320, who: 320, runs: 320, versions: 320, trigger: 320, test: 400 };
const EDGE = 16;
const BLOCK_W = 48;
const RIGHT_W = 340;
const ZOOM_ROOM = 76;

/**
 * The automation editor (`design/screens/automations-editor`, plan batches 9, 11, 13): the header, the sentence, the
 * canvas, the tool block and its windows, the step settings with Who sees what, the dialogs and banners, the turn-on
 * and save flows. The definition lives here until it is saved; positions on the canvas are computed, never stored.
 */
export const AutomationEditor: React.FC<{
  initial: AutomationEditorInitial;
  catalog: AutomationCatalog;
  canManage: boolean;
}> = ({ initial, catalog, canManage }) => {
  const t = useTranslations("automationsEditor");
  const tShared = useTranslations("automations");
  /** F4's "who will hear from it": the backend names them by code ("MANAGER", "ROLE:<id>") — said in words here, as the
   *  sentence says them ("Their manager and HR Admin"). Shown as the codes, the dialog read "MANAGER will get…". */
  const audienceWords = (codes: string[]): string[] => {
    const specs = codes.map((code): RecipientSpec => {
      const [kind, id] = code.split(":");
      if (kind === "ROLE") return { kind: "ROLE", roleId: id ?? null };
      if (kind === "USER") return { kind: "USER", userId: id ?? null };
      return { kind: kind as RecipientKind };
    });
    const said = words.recipients(specs);
    return said ? [said.charAt(0).toLocaleUpperCase() + said.slice(1)] : [];
  };
  /** The trigger settings window's title: the event's own name from the list ("A related date comes up"), which stays
   *  the same while the fields under it change (`automations-triggers` spec). */
  const triggerName = (trigger: TriggerSpec): string => {
    const key = choiceOf(trigger);
    return key ? tShared(`trigger.${key}`) : words.triggerTitle(trigger);
  };
  const router = useRouter();
  const words = useAutomationWords();
  const formatDate = useDateFormatter();
  const { company } = useCompanyData();

  // ── what is being edited ─────────────────────────────────────────────────────────────────
  const [automation, setAutomation] = React.useState<Automation | null>(initial.automation);
  const [draft, setDraft] = React.useState<EditorDraft>(initial.draft);
  const [baseline, setBaseline] = React.useState<EditorDraft>(initial.baseline);
  const [editing, setEditing] = React.useState(Boolean(initial.editOnLoad));
  const id = automation?.id ?? null;
  const status = automation?.status ?? "DRAFT";
  const system = automation?.origin === "SYSTEM";
  const definition = draft.definition;
  const setDefinition = React.useCallback(
    (next: AutomationDefinition | ((d: AutomationDefinition) => AutomationDefinition)) =>
      setDraft((d) => ({ ...d, definition: typeof next === "function" ? next(d.definition) : next })),
    [],
  );

  const definitionChanged = !sameDefinition(draft.definition, baseline.definition);
  const dirty = definitionChanged || !sameMeta(draft, baseline);
  const displayName = draft.name.trim() || tShared("unnamed");

  // ── the windows ──────────────────────────────────────────────────────────────────────────
  const [selection, setSelection] = React.useState<Selection>(initial.selectedStepId ? { kind: "step", id: initial.selectedStepId } : null);
  const [tool, setTool] = React.useState<ToolId | null>(initial.tool);
  const [runId, setRunId] = React.useState<string | null>(initial.runId);
  const [run, setRun] = React.useState<AutomationRun | null>(null);
  const [version, setVersion] = React.useState<AutomationVersion | null>(null);
  const [testExpanded, setTestExpanded] = React.useState(false);
  const [paletteDrag, setPaletteDrag] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [announcement, setAnnouncement] = React.useState<string | null>(null);

  /** Read mode of the automation itself (R3, R4); looking at an old version is read only on top of it. */
  const readModeOwn = !canManage || system || status === "ARCHIVED" || (opensReadOnly(status) && !editing);
  const readMode = readModeOwn || version !== null;
  const shown = version?.definition ?? definition;

  // ── the check: missing details, the turn-on numbers, Who sees what ───────────────────────
  const checkMutation = useAutomationCheck();
  const checkAsync = checkMutation.mutateAsync;
  const [check, setCheck] = React.useState<AutomationCheck | null>(null);
  const [checking, setChecking] = React.useState(false);
  const checkSeq = React.useRef(0);
  const runCheck = React.useCallback(
    async (d: AutomationDefinition): Promise<AutomationCheck> => {
      const seq = ++checkSeq.current;
      setChecking(true);
      try {
        const result = await checkAsync({ automationId: id, definition: d });
        if (seq === checkSeq.current) setCheck(result);
        return result;
      } finally {
        if (seq === checkSeq.current) setChecking(false);
      }
    },
    [checkAsync, id],
  );
  React.useEffect(() => {
    if (!shown.trigger) {
      setCheck(null);
      return;
    }
    const timer = window.setTimeout(() => void runCheck(shown).catch(() => undefined), 500);
    return () => window.clearTimeout(timer);
  }, [shown, runCheck]);

  /** F3: shown once a Turn on (or a save of a live automation) was held for them; they clear as they are fixed. */
  const [problemsFor, setProblemsFor] = React.useState<"turnOn" | "save" | null>(null);
  const problems = React.useMemo(() => (problemsFor && check ? check.problems : []), [problemsFor, check]);
  const byStep = React.useMemo(() => problemsByStep(definition, problems), [definition, problems]);
  const needs = React.useMemo(() => {
    const out = new Map<string | null, string>();
    byStep.forEach((list, stepId) => out.set(stepId, t(`needs.${needsKey(list[0], findStep(definition, stepId))}`)));
    return out;
  }, [byStep, definition, t]);
  React.useEffect(() => {
    if (problemsFor && check && check.problems.length === 0) setProblemsFor(null);
  }, [problemsFor, check]);

  const edited = React.useMemo(
    () => (!readMode && (status === "ACTIVE" || status === "PAUSED") ? editedStepIds(baseline.definition, definition) : new Set<string>()),
    [readMode, status, baseline.definition, definition],
  );
  const runStates = React.useMemo(() => (runId ? runCardStates(run, shown) : null), [runId, run, shown]);

  // ── selecting and the windows ────────────────────────────────────────────────────────────
  const selectStep = React.useCallback((stepId: string) => {
    setSelection({ kind: "step", id: stepId });
    setRunId(null);
    setRun(null);
  }, []);
  const selectTrigger = React.useCallback(() => {
    setSelection({ kind: "trigger" });
    setRunId(null);
    setRun(null);
    if (!readMode) setTool("trigger");
  }, [readMode]);
  const deselect = React.useCallback(() => {
    setSelection(null);
    setMenuOpen(false);
  }, []);
  const toggleTool = (next: BlockTool) => setTool((current) => (current === next ? null : next));
  const openAddStep = React.useCallback((_target: InsertTarget | null) => setTool("add"), []);
  const openTriggerList = React.useCallback(() => setTool("trigger"), []);
  const openAi = React.useCallback(() => setTool("ai"), []);

  // ── editing the steps ────────────────────────────────────────────────────────────────────
  const titleOf = React.useCallback((step: StepSpec) => words.stepTitle(step) || words.stepKind(step), [words]);

  const insert = React.useCallback(
    (type: AutomationStepType, target: InsertTarget) => {
      const step = newStep(newStepId(definition), type);
      setDefinition(insertStep(definition, step, target));
      selectStep(step.id);
      setPaletteDrag(false);
    },
    [definition, setDefinition, selectStep],
  );
  const addFromList = (type: AutomationStepType) => {
    const target: InsertTarget =
      selection?.kind === "step" ? { kind: "after", stepId: selection.id } : selection?.kind === "trigger" ? { kind: "trunkStart" } : { kind: "trunkEnd" };
    insert(type, target);
  };

  const announceMove = React.useCallback(
    (d: AutomationDefinition, stepId: string) => {
      const step = findStep(d, stepId);
      if (step) setAnnouncement(t("canvas.moved", { title: titleOf(step), number: numbers(d)[stepId] ?? "" }));
    },
    [t, titleOf],
  );
  const move = React.useCallback(
    (stepId: string, target: InsertTarget) => {
      const next = moveStepAfter(definition, stepId, target);
      setDefinition(next);
      announceMove(next, stepId);
    },
    [definition, setDefinition, announceMove],
  );

  const remove = React.useCallback(
    (stepId: string) => {
      const before = definition;
      const step = findStep(before, stepId);
      setDefinition(removeStep(before, stepId));
      setSelection((s) => (s?.kind === "step" && s.id === stepId ? null : s));
      setMenuOpen(false);
      if (step) setAnnouncement(t("canvas.removed", { title: titleOf(step) }));
      // A draft edit inside the editor: nothing is saved until Save, so it fires with Undo and no confirm (G4).
      showUndoToast({ message: t("settings.removed"), onUndo: () => setDefinition(before) });
    },
    [definition, setDefinition, t, titleOf],
  );
  const duplicate = (stepId: string) => {
    const copyId = newStepId(definition);
    setDefinition(duplicateStep(definition, stepId));
    selectStep(copyId);
    setMenuOpen(false);
  };
  const toggleSkip = (stepId: string) => {
    setDefinition((d) => updateStep(d, stepId, (s) => ({ ...s, skipped: !s.skipped })));
    setMenuOpen(false);
  };

  const onCardCommand = React.useCallback(
    (stepId: string, command: CardCommand) => {
      switch (command) {
        case "open":
          selectStep(stepId);
          break;
        case "menu":
          selectStep(stepId);
          if (!readMode) window.setTimeout(() => setMenuOpen(true), 0);
          break;
        case "up":
        case "down": {
          const next = moveStep(definition, stepId, command === "up" ? -1 : 1);
          if (next !== definition && !sameDefinition(next, definition)) {
            setDefinition(next);
            announceMove(next, stepId);
          }
          break;
        }
        case "remove":
          remove(stepId);
          break;
        case "deselect":
          deselect();
          break;
      }
    },
    [selectStep, readMode, definition, setDefinition, announceMove, remove, deselect],
  );

  // ── saving ───────────────────────────────────────────────────────────────────────────────
  const createM = useAutomationMutation(createAutomationAction);
  const draftM = useAutomationMutation(saveAutomationDraftAction);
  const renameM = useAutomationMutation(renameAutomationAction);
  const saveM = useAutomationMutation(saveAutomationAction);
  const turnOnM = useAutomationMutation(turnOnAutomationAction);
  const turnOffM = useAutomationMutation(turnOffAutomationAction);
  const undoTurnOnM = useAutomationMutation(undoTurnOnAutomationAction);

  const [nameDialog, setNameDialog] = React.useState<{ firstSave: boolean } | null>(null);
  const [nameError, setNameError] = React.useState<string | null>(null);
  const [intent, setIntent] = React.useState<Intent>(null);
  /** Where "Save and leave" goes once the save is through: a held link, or the list (null). */
  const [leaveHref, setLeaveHref] = React.useState<string | null>(null);
  const [runsGoingOpen, setRunsGoingOpen] = React.useState(false);
  // Save changes over the volume threshold (`requireVolume`): asked once, then sent with every save of this session.
  // Without it the backend refused and the editor said only that the save failed (walk of 2026-11-07).
  const [volumeAsk, setVolumeAsk] = React.useState<number | null>(null);
  const volumeConfirmed = React.useRef(false);
  const [runsGoingError, setRunsGoingError] = React.useState<string | null>(null);
  const [turnOnCheck, setTurnOnCheck] = React.useState<AutomationCheck | null>(null);
  const [turnOnError, setTurnOnError] = React.useState<string | null>(null);
  const [h2, setH2] = React.useState<{ href: string | null } | null>(null);
  const [busy, setBusy] = React.useState<Partial<Record<HeaderButton, boolean>>>({});
  const guard = useUnsavedChangesGuard(dirty);

  /** A save that did not go through: the editor stays as it is, and the toast offers it again. */
  const saveFailed = (error: unknown, retry: () => void) => {
    const message = messageForError(error);
    toast.error(t("toasts.saveFailed"), {
      description: isFallbackErrorMessage(message) ? undefined : message,
      action: { label: t("toasts.retry"), onClick: retry },
    });
  };

  const leave = React.useCallback(
    (href: string | null) => {
      if (href) guard.leave();
      else router.push("/automations");
    },
    [guard, router],
  );

  /** A leave that was waiting on a save which did not happen: the held link is let go, the editor stays. */
  const abandonIntent = () => {
    if (intent === "leave" && leaveHref) guard.stay();
    setIntent(null);
    setLeaveHref(null);
  };

  const showProblems = (found: AutomationCheck["problems"], purpose: "turnOn" | "save") => {

    setProblemsFor(purpose);
    const first = problemsByStep(definition, found).keys().next().value;
    if (first === null) selectTrigger();
    else if (first) selectStep(first);
  };

  /** Saves the definition of a live automation, then the name if that changed too. */
  const saveDefinition = async (inFlight: InFlightChoice) => {
    if (!automation) return;
    const result = await saveM.mutateAsync({
      id: automation.id,
      request: { definition, inFlight, expectedVersionNo: automation.versionNo, confirmVolume: volumeConfirmed.current },
    });
    let saved = result.automation;
    if (!sameMeta(draft, baseline)) {
      saved = await renameM.mutateAsync({ id: automation.id, request: { name: draft.name, description: draft.description || null, icon: draft.icon } });
    }
    setAutomation(saved);
    setBaseline(draft);
    toast.success(t("toasts.changesSaved"));
  };

  /** Save draft / Save changes: saved, a dialog took over (the first save's name, runs going), held by missing details, or failed. */
  const persist = async (): Promise<SaveOutcome> => {
    if (!id || !automation) {
      setNameDialog({ firstSave: true });
      return "dialog";
    }
    try {
      if (status === "DRAFT") {
        setBusy({ saveDraft: true });
        const saved = await draftM.mutateAsync({
          id,
          request: { name: draft.name, description: draft.description || null, icon: draft.icon, definition },
        });
        setAutomation(saved);
        setBaseline(draft);
        toast.success(t("toasts.draftSaved"));
        return "saved";
      }
      setBusy({ saveChanges: true });
      if (!definitionChanged) {
        // Only the name or the description: saved at once, with runs going or not (N6).
        const saved = await renameM.mutateAsync({ id, request: { name: draft.name, description: draft.description || null, icon: draft.icon } });
        setAutomation(saved);
        setBaseline(draft);
        toast.success(t("toasts.changesSaved"));
        return "saved";
      }
      const checked = await runCheck(definition);
      if (checked.problems.length > 0) {
        showProblems(checked.problems, "save");
        return "held";
      }
      if (firingOverVolume(checked) && !volumeConfirmed.current) {
        setVolumeAsk(checked.messagesPerFiring);
        return "dialog";
      }
      if (Math.max(checked.runsGoing, automation.runsGoing) > 0) {
        setRunsGoingError(null);
        setRunsGoingOpen(true);
        return "dialog";
      }
      await saveDefinition("KEEP");
      return "saved";
    } catch (error) {
      saveFailed(error, () => void persist());
      return "failed";
    } finally {
      setBusy({});
    }
  };

  const save = async () => {
    setIntent(null);
    await persist();
  };

  const onRunsGoingSave = async (choice: InFlightChoice) => {
    try {
      await saveDefinition(choice);
      setRunsGoingOpen(false);
      if (intent === "leave") leave(leaveHref);
      setIntent(null);
    } catch {
      setRunsGoingError(t("runsGoingDialog.failed"));
    }
  };

  // ── turning on and off ───────────────────────────────────────────────────────────────────
  const startTurnOn = async () => {
    if (!definition.trigger) return;
    if (!id) {
      setIntent("turnOn");
      setNameDialog({ firstSave: true });
      return;
    }
    setBusy({ turnOn: true });
    try {
      const checked = await runCheck(definition);
      const next = turnOnNext(checked);
      if (next.kind === "problems") {
        showProblems(next.problems, "turnOn");
        return;
      }
      setProblemsFor(null);
      setTurnOnError(null);
      setTurnOnCheck(checked);
    } catch (error) {
      showError(error);
    } finally {
      setBusy({});
    }
  };

  const confirmTurnOn = async (backfill: BackfillChoice, confirmVolume: boolean) => {
    if (!automation) return;
    setTurnOnError(null);
    setBusy({ turnOn: true });
    try {
      // Turning on validates what is stored (K5): unsaved changes are saved first.
      if (definitionChanged || !sameMeta(draft, baseline)) {
        if (status === "DRAFT") {
          await draftM.mutateAsync({
            id: automation.id,
            request: { name: draft.name, description: draft.description || null, icon: draft.icon, definition },
          });
        } else {
          await saveM.mutateAsync({ id: automation.id, request: { definition, inFlight: "KEEP", expectedVersionNo: automation.versionNo } });
        }
        setBaseline(draft);
      }
      const result = await turnOnM.mutateAsync({ id: automation.id, request: { backfill, confirmVolume } });
      setAutomation(result.automation);
      // Turned on from the editor, it stays in fields: the live banner says what saving now means (F5).
      setEditing(true);
      setTurnOnCheck(null);
      const turnedOnId = automation.id;
      showUndoToast({
        message: t("toasts.turnedOn"),
        onUndo: async () => {
          const undone = await undoTurnOnM.mutateAsync(turnedOnId);
          setAutomation(undone.automation);
        },
      });
    } catch {
      setTurnOnError(t("turnOnDialog.failed"));
    } finally {
      setBusy({});
    }
  };

  const turnOff = async () => {
    if (!id) return;
    setBusy({ turnOff: true });
    try {
      const result = await turnOffM.mutateAsync(id);
      setAutomation(result.automation);
      showUndoToast({
        message: t("toasts.turnedOff"),
        onUndo: async () => {
          const back = await turnOnM.mutateAsync({ id, request: { backfill: "NONE", confirmVolume: true } });
          setAutomation(back.automation);
        },
      });
    } catch (error) {
      showError(error);
    } finally {
      setBusy({});
    }
  };

  const openTestRun = () => {
    setTurnOnCheck(null);
    setTestExpanded(false);
    setTool("test");
  };

  const onHeaderButton = (button: HeaderButton) => {
    switch (button) {
      case "testRun":
        openTestRun();
        break;
      case "saveDraft":
      case "saveChanges":
        void save();
        break;
      case "turnOn":
        void startTurnOn();
        break;
      case "turnOff":
        void turnOff();
        break;
      case "edit":
        setEditing(true);
        break;
    }
  };

  // The first save goes through Name and icon (I1); a rename from the header changes the draft until it is saved.
  const onNameSave = async (value: NameAndIcon) => {
    const firstSave = nameDialog?.firstSave ?? false;
    const nextDraft: EditorDraft = { ...draft, name: value.name, description: value.description, icon: value.icon };
    setNameError(null);
    if (!firstSave || id) {
      setDraft(nextDraft);
      setNameDialog(null);
      return;
    }
    try {
      const created = await createM.mutateAsync({
        name: value.name,
        description: value.description || null,
        icon: value.icon,
        definition: nextDraft.definition,
      });
      setAutomation(created);
      setDraft(nextDraft);
      setBaseline(nextDraft);
      setNameDialog(null);
      toast.success(t("toasts.draftSaved"));
      // The address names the automation from now on, without a navigation that would drop the editor's state.
      window.history.replaceState(null, "", `/automations/${created.id}`);
      if (intent === "leave") leave(leaveHref);
      if (intent === "turnOn") window.setTimeout(() => void startTurnOnRef.current(), 0);
      setIntent(null);
    } catch (error) {
      setNameError(messageForError(error));
    }
  };
  const startTurnOnRef = React.useRef(startTurnOn);
  startTurnOnRef.current = startTurnOn;

  // ?turnOn=1: the list's "Turn on" opens the editor straight into the turn-on flow.
  const turnedOnOnLoad = React.useRef(false);
  React.useEffect(() => {
    if (!initial.turnOnOnLoad || turnedOnOnLoad.current) return;
    turnedOnOnLoad.current = true;
    void startTurnOnRef.current();
  }, [initial.turnOnOnLoad]);

  // ── leaving ──────────────────────────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (guard.pendingHref) setH2({ href: guard.pendingHref });
  }, [guard.pendingHref]);
  const close = () => (dirty ? setH2({ href: null }) : router.push("/automations"));
  const keepEditing = () => {
    if (h2?.href) guard.stay();
    setH2(null);
  };
  const saveAndLeave = async () => {
    const href = h2?.href ?? null;
    setIntent("leave");
    setLeaveHref(href);
    setH2(null);
    // A save that needs a dialog first (the first save's name, runs going) leaves once that dialog has saved.
    const outcome = await persist();
    if (outcome === "saved") {
      setIntent(null);
      leave(href);
    } else if (outcome !== "dialog") {
      if (href) guard.stay();
      setIntent(null);
      setLeaveHref(null);
    }
  };

  // ── noddo AI (K10: answered, never drafted) ──────────────────────────────────────────────
  const [aiValue, setAiValue] = React.useState(initial.aiPrompt ?? "");
  const [aiTurns, setAiTurns] = React.useState<AiTurn[]>([]);
  const [aiBusy, setAiBusy] = React.useState(false);
  const aiUndo = React.useRef(new Map<number, AutomationDefinition>());
  const askAi = React.useCallback(
    async (prompt: string) => {
      const turnId = Date.now();
      setAiTurns((turns) => [...turns, { id: turnId, prompt, reply: null }]);
      setAiBusy(true);
      try {
        const before = draftRef.current.definition;
        const reply = await noddoAiDraft(prompt, before);
        if (reply.kind === "draft" || reply.kind === "cantDo") {
          aiUndo.current.set(turnId, before);
          setDefinition(reply.definition);
        }
        setAiTurns((turns) => turns.map((turn) => (turn.id === turnId ? { ...turn, reply } : turn)));
      } catch {
        setAiTurns((turns) => turns.map((turn) => (turn.id === turnId ? { ...turn, reply: { kind: "error" } } : turn)));
      } finally {
        setAiBusy(false);
      }
    },
    [setDefinition],
  );
  const draftRef = React.useRef(draft);
  draftRef.current = draft;
  const undoAi = (turnId: number) => {
    const before = aiUndo.current.get(turnId);
    if (before) setDefinition(before);
    setAiTurns((turns) => turns.map((turn) => (turn.id === turnId ? { ...turn, undone: true } : turn)));
  };
  const askedOnLoad = React.useRef(false);
  React.useEffect(() => {
    if (!initial.aiPrompt || askedOnLoad.current) return;
    askedOnLoad.current = true;
    void askAi(initial.aiPrompt);
  }, [initial.aiPrompt, askAi]);

  // ── read mode hides what cannot be used there ────────────────────────────────────────────
  React.useEffect(() => {
    if (readMode && (tool === "ai" || tool === "add" || tool === "trigger")) setTool(null);
    if (readMode) setMenuOpen(false);
  }, [readMode, tool]);

  // ── where the windows are, so the canvas fits into what is left ──────────────────────────
  const selectedStep = selection?.kind === "step" ? findStep(shown, selection.id) : null;
  const rightOpen = runId !== null || selectedStep !== null || (selection?.kind === "trigger" && shown.trigger !== null);
  const topRef = React.useRef<HTMLDivElement>(null);
  const [topHeight, setTopHeight] = React.useState(0);
  React.useEffect(() => {
    const el = topRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setTopHeight(el.offsetHeight));
    observer.observe(el);
    setTopHeight(el.offsetHeight);
    return () => observer.disconnect();
  }, []);
  const leftInset = EDGE + BLOCK_W + (tool && !(tool === "test" && testExpanded) ? TOOL_W[tool] : 0) + EDGE;
  const insets: CanvasInsets = {
    left: leftInset,
    right: rightOpen ? RIGHT_W + 2 * EDGE : 0,
    top: topHeight + 2 * EDGE,
    bottom: ZOOM_ROOM,
  };
  // The top block grows with a banner (F3, the live one): the canvas moves down with it, or the When card slides under
  // the sentence (walk of 2026-11-07).
  const fitKey = `${tool ?? ""}|${testExpanded}|${rightOpen}|${version?.versionNo ?? ""}|${topHeight}`;

  // ── the header ───────────────────────────────────────────────────────────────────────────
  const buttons = headerButtons({ status, readMode: readModeOwn, canManage, system });
  const disabled: Partial<Record<HeaderButton, boolean>> = {
    testRun: !definition.trigger,
    turnOn: !definition.trigger,
  };

  // ── F3's banner ──────────────────────────────────────────────────────────────────────────
  const problemOrder = React.useMemo(() => [...byStep.keys()], [byStep]);
  const showNext = () => {
    const current = selection?.kind === "trigger" ? null : selection?.kind === "step" ? selection.id : undefined;
    const next = nextProblem(problemOrder, current);
    if (next === null) selectTrigger();
    else if (next) selectStep(next);
  };

  // ── the left window ──────────────────────────────────────────────────────────────────────
  const leftWindow = (): React.ReactNode => {
    switch (tool) {
      case "ai":
        return (
          <ToolWindowFrame title={t("tools.ai.title")} width={400} onClose={() => setTool(null)}>
            <AiWindow turns={aiTurns} value={aiValue} busy={aiBusy} onChange={setAiValue} onSubmit={(p) => void askAi(p)} onUndo={undoAi} />
          </ToolWindowFrame>
        );
      case "add":
        return (
          <ToolWindowFrame title={t("tools.add.title")} width={320} onClose={() => setTool(null)}>
            <AddStepWindow actions={catalog.actions} onAdd={addFromList} onDragChange={setPaletteDrag} />
          </ToolWindowFrame>
        );
      case "trigger":
        return (
          <ToolWindowFrame title={t("tools.trigger.title")} width={320} onClose={() => setTool(null)}>
            <TriggerList
              catalog={catalog}
              current={definition.trigger}
              onPick={(trigger) => {
                setDefinition((d) => ({ ...d, trigger }));
                setSelection({ kind: "trigger" });
                setTool(null);
              }}
            />
          </ToolWindowFrame>
        );
      case "who":
        return (
          <ToolWindowFrame title={t("tools.who.title")} width={320} onClose={() => setTool(null)}>
            <WhoItRunsFor
              conditions={shown.conditions}
              readOnly={readMode}
              check={check}
              onChange={(conditions) => setDefinition((d) => ({ ...d, conditions }))}
            />
          </ToolWindowFrame>
        );
      case "runs":
        return id ? (
          <RunHistoryWindow
            automationId={id}
            selectedRunId={runId}
            onOpenRun={(next) => {
              setSelection(null);
              setRun(null);
              setRunId(next);
            }}
            onClose={() => setTool(null)}
          />
        ) : null;
      case "versions":
        return (
          <VersionsWindow
            automationId={id}
            onView={(next) => {
              setVersion(next);
              setSelection(null);
            }}
            onClose={() => setTool(null)}
          />
        );
      case "test":
        // One instance, windowed or expanded into its dialog (a portal): two instances, one per place, lost the pick
        // and the result on expanding (walk of 2026-11-07).
        return (
          <TestRunWindow
            automationId={id}
            name={displayName}
            definition={definition}
            expanded={testExpanded}
            onExpand={setTestExpanded}
            onClose={() => {
              setTestExpanded(false);
              setTool(null);
            }}
          />
        );
      default:
        return null;
    }
  };

  // ── the right window ─────────────────────────────────────────────────────────────────────
  const stepNumbers = React.useMemo(() => numbers(shown), [shown]);
  const rightWindow = (): React.ReactNode => {
    if (runId) {
      return (
        <RunWindow
          runId={runId}
          definition={shown}
          canManage={canManage}
          onRun={setRun}
          onClose={() => {
            setRunId(null);
            setRun(null);
          }}
        />
      );
    }
    if (selectedStep) {
      const type = tShared(`stepType.${selectedStep.type}`);
      const example = check?.examples.find((e) => e.stepId === selectedStep.id) ?? null;
      return (
        <>
          <StepSettingsWindow
            eyebrow={t("settings.stepWithType", { number: stepNumbers[selectedStep.id] ?? "", type })}
            title={titleOf(selectedStep)}
            icon={STEP_TYPE_ICONS[selectedStep.type]}
            menu={
              readMode
                ? null
                : {
                    skipped: Boolean(selectedStep.skipped),
                    open: menuOpen,
                    onOpenChange: setMenuOpen,
                    onDuplicate: () => duplicate(selectedStep.id),
                    onToggleSkip: () => toggleSkip(selectedStep.id),
                    onRemove: () => remove(selectedStep.id),
                  }
            }
            onClose={deselect}
          >
            <StepFields
              definition={shown}
              step={selectedStep}
              catalog={catalog}
              readOnly={readMode}
              problems={problems.filter((p) => p.stepId === selectedStep.id)}
              onChange={(step) => setDefinition((d) => updateStep(d, step.id, () => step))}
            />
          </StepSettingsWindow>
          <WhoSeesWhat
            step={selectedStep}
            example={example}
            loading={checking}
            companyName={company?.name ?? ""}
            timeOff={countsRequests(shown)}
          />
        </>
      );
    }
    if (selection?.kind === "trigger" && shown.trigger) {
      return (
        <StepSettingsWindow eyebrow={t("settings.trigger")} title={triggerName(shown.trigger)} onClose={deselect}>
          <TriggerFields
            definition={shown}
            catalog={catalog}
            readOnly={readMode}
            problems={problems.filter((p) => !p.stepId)}
            onChange={setDefinition}
          />
        </StepSettingsWindow>
      );
    }
    return null;
  };

  const left = leftWindow();
  const right = rightWindow();
  const live = !readMode && version === null && (status === "ACTIVE" || status === "PAUSED");
  const problemCount = byStep.size;

  return (
    <div className="flex h-full min-h-0 flex-col bg-canvas" data-test="automation-editor">
      <EditorHeader
        name={displayName}
        icon={draft.icon}
        trigger={definition.trigger}
        status={status}
        buttons={buttons}
        disabled={disabled}
        busy={busy}
        canRename={!readMode}
        onRename={() => {
          setNameError(null);
          setNameDialog({ firstSave: !id });
        }}
        onClose={close}
        onButton={onHeaderButton}
      />

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <AutomationCanvas
          definition={shown}
          actions={catalog.actions}
          readOnly={readMode}
          selectedStepId={selection?.kind === "step" ? selection.id : null}
          triggerSelected={selection?.kind === "trigger"}
          needs={needs}
          edited={edited}
          runStates={runStates}
          offerAi={!id && !readMode}
          insets={insets}
          fitKey={fitKey}
          paletteDrag={paletteDrag}
          announcement={announcement}
          onSelectStep={selectStep}
          onSelectTrigger={selectTrigger}
          onDeselect={deselect}
          onChooseTrigger={openTriggerList}
          onOpenAi={openAi}
          onOpenAddStep={openAddStep}
          onInsert={insert}
          onMove={move}
          onCardCommand={onCardCommand}
        />

        {/* The tool block and its window, top left. */}
        <div className="pointer-events-none absolute top-4 bottom-4 left-4 z-10 flex items-start">
          <div className="pointer-events-auto">
            <ToolBlock open={tool} readOnly={readMode} disabled={{ runs: !id }} onToggle={toggleTool} />
          </div>
          {left && <div className="pointer-events-auto flex h-full min-h-0 flex-col">{left}</div>}
        </div>

        {/* Banners and the sentence, top centre, in the part the windows leave free. */}
        <div className="pointer-events-none absolute top-4 z-10 flex justify-center px-4" style={{ left: insets.left - EDGE, right: insets.right }}>
          <div ref={topRef} className="pointer-events-auto flex w-full max-w-[720px] flex-col gap-3">
            {system && <CanvasBanner icon={ShieldCheckIcon}>{t("banners.system")}</CanvasBanner>}
            {version && (
              <CanvasBanner
                icon={Layers01Icon}
                action={
                  <Button type="button" variant="link" onClick={() => setVersion(null)}>
                    {t("banners.backToCurrent")}
                  </Button>
                }
              >
                {t("banners.version", { number: version.versionNo, date: formatDate(version.createdAt) })}
              </CanvasBanner>
            )}
            {problemCount > 0 && (
              <CanvasBanner
                tone="warning"
                action={
                  <Button type="button" variant="link" onClick={showNext}>
                    {t("banners.showNext")}
                  </Button>
                }
              >
                {problemsFor === "save" ? t("banners.needsDetailsToSave", { count: problemCount }) : t("banners.needsDetails", { count: problemCount })}
              </CanvasBanner>
            )}
            {live && problemCount === 0 && <CanvasBanner>{t("banners.live")}</CanvasBanner>}
            <SentenceCard parts={words.sentence(shown)} selectedStepId={selection?.kind === "step" ? selection.id : null} />
          </div>
        </div>

        {/* The step settings and Who sees what, or a run's window, on the right above the zoom. */}
        {right && (
          <div className="absolute top-4 right-4 bottom-[76px] z-10 flex w-[340px] flex-col gap-3 overflow-y-auto" data-test="right-windows">
            {right}
          </div>
        )}
      </div>

      <NameAndIconDialog
        open={nameDialog !== null}
        firstSave={nameDialog?.firstSave ?? false}
        initial={{ name: draft.name || (definition.trigger ? words.triggerTitle(definition.trigger) : ""), description: draft.description, icon: draft.icon }}
        suggested={!draft.name && Boolean(definition.trigger)}
        status={status}
        trigger={definition.trigger}
        triggerLine={definition.trigger ? words.triggerLine(definition.trigger) : null}
        saving={createM.isPending}
        error={nameError}
        onCancel={() => {
          setNameDialog(null);
          abandonIntent();
        }}
        onSave={(value) => void onNameSave(value)}
      />

      <UnsavedChangesDialog
        open={h2 !== null && nameDialog === null && !runsGoingOpen}
        name={displayName}
        saving={draftM.isPending || saveM.isPending || renameM.isPending}
        onKeepEditing={keepEditing}
        onSaveAndLeave={() => void saveAndLeave()}
      />

      <ConfirmActionModal
        isOpen={volumeAsk !== null}
        title={t("volumeDialog.title", { name: displayName })}
        description={t.rich("volumeDialog.description", {
          count: volumeAsk ?? 0,
          b: (chunks) => <strong className="font-semibold">{chunks}</strong>,
        })}
        confirmLabel={t("volumeDialog.confirm")}
        onCancelAction={() => {
          setVolumeAsk(null);
          abandonIntent();
        }}
        onConfirmAction={() => {
          volumeConfirmed.current = true;
          setVolumeAsk(null);
          void persist();
        }}
      />

      <RunsGoingDialog
        open={runsGoingOpen}
        name={displayName}
        runsGoing={Math.max(check?.runsGoing ?? 0, automation?.runsGoing ?? 0)}
        saving={saveM.isPending || renameM.isPending}
        error={runsGoingError}
        onCancel={() => {
          setRunsGoingOpen(false);
          abandonIntent();
        }}
        onSave={(choice) => void onRunsGoingSave(choice)}
      />

      {turnOnCheck && (
        <TurnOnDialog
          open
          name={displayName}
          check={{ ...turnOnCheck, audiences: audienceWords(turnOnCheck.audiences) }}
          everyone={(definition.conditions?.filters ?? []).length === 0}
          requests={countsRequests(definition)}
          notConnected={notConnectedSteps(definition).map(titleOf)}
          turning={Boolean(busy.turnOn)}
          error={turnOnError}
          onCancel={() => setTurnOnCheck(null)}
          onTestFirst={openTestRun}
          onConfirm={(backfill, confirmVolume) => void confirmTurnOn(backfill, confirmVolume)}
        />
      )}
    </div>
  );
};
