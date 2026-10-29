"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  Archive,
  ArchiveRestore,
  Play,
  Power,
  PowerOff,
  Trash2,
} from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/public/desact/src/components/ui/tabs";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import { ConfirmCancelModal } from "@/components/ui/ConfirmCancelModal/ConfirmCancelModal";
import { RowAction, RowActionDestructive, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import { useCanAccess } from "@/components/auth/useAccess";
import { showError, showSuccess } from "@/lib/errors/errorToast";
import { useUserFields } from "@/components/modules/organization/hooks/useUserFields/useUserFields";
import {
  archiveAutomationAction,
  createAutomationAction,
  deleteAutomationAction,
  disableAutomationAction,
  enableAutomationAction,
  publishAutomationAction,
  renameAutomationAction,
  resumeAutomationAction,
  unarchiveAutomationAction,
} from "@/components/modules/automations/actions/automationActions";
import {
  unwrapAction,
  useAutomation,
  useAutomationCatalog,
  useAutomationPreview,
  useInvalidateAutomations,
} from "@/components/modules/automations/hooks";
import { RuleStatusBadge } from "@/components/modules/automations/shared/AutomationStatusBadge";
import { DefinitionView } from "@/components/modules/automations/shared/DefinitionView";
import { conditionsSentence, typesInDefinition } from "@/components/modules/automations/shared/sentence";
import { useAutomationNames } from "@/components/modules/automations/shared/useAutomationNames";
import { RunLog } from "@/components/modules/automations/runs/RunLog";
import { VersionsTab } from "@/components/modules/automations/versions/VersionsTab";
import type { AutomationActivationResult, AutomationDefinition, AutomationPreview, BackfillChoice } from "@/models/automations";
import { emptyDefinition, sameDefinition, starterDraft, type Draft } from "./draft";
import { WhenCard } from "./WhenCard";
import { ForWhomCard } from "./ForWhomCard";
import { DoCard } from "./DoCard";
import { PreviewPanel } from "./PreviewPanel";
import { EnableDialog, PublishDialog, type PublishChoices } from "./PublishDialog";
import { useUnsavedChangesGuard } from "./useUnsavedChangesGuard";
import { Field } from "./SentenceCard";
import { bindingSourceLabel } from "@/models/publicHolidays/binding";

const LIST_HREF = "/settings/automation/automations";
/** Long enough not to ask on every keystroke, short enough to feel live. */
export const PREVIEW_DEBOUNCE_MS = 400;

type Confirm = "archive" | "delete" | null;

const activationText = (r: AutomationActivationResult, verb: "enabled" | "disabled" | "resumed") => {
  if (verb === "disabled") {
    return `Disabled. ${r.cancelledRuns} scheduled ${r.cancelledRuns === 1 ? "run was" : "runs were"} cancelled; ${r.completedRuns} finished ${r.completedRuns === 1 ? "run stays" : "runs stay"} as ${r.completedRuns === 1 ? "it is" : "they are"}.`;
  }
  return `${verb === "enabled" ? "Enabled" : "Resumed"}. ${r.plannedRuns} ${r.plannedRuns === 1 ? "run is" : "runs are"} planned.`;
};

/**
 * Settings → Automation → one rule. A page, not a modal: three stacked cards that read as one
 * sentence — When · For Whom · Do — beside a live preview, with Publish as the one primary action
 * (research § A.10; design direction). The draft lives here and nowhere else (design § 9.1).
 */
export function AutomationRuleContainer({ ruleId }: { ruleId: string | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const canManage = useCanAccess("SETTINGS.AUTOMATIONS", "MANAGE");
  const rule = useAutomation(ruleId);
  const catalog = useAutomationCatalog(canManage);
  const { data: fields, isLoading: fieldsLoading } = useUserFields();
  const invalidate = useInvalidateAutomations();

  const [baseline, setBaseline] = useState<Draft | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [tab, setTab] = useState("rule");

  // The draft starts from the rule, a ready-made starting point, or nothing.
  useEffect(() => {
    if (baseline) return;
    if (ruleId) {
      if (!rule.data) return;
      const loaded: Draft = {
        name: rule.data.name,
        description: rule.data.description ?? "",
        definition: rule.data.definition ?? emptyDefinition(),
      };
      setBaseline(loaded);
      setDraft(loaded);
    } else {
      const start = starterDraft(searchParams.get("starter")) ?? { name: "", description: "", definition: emptyDefinition() };
      setBaseline({ name: "", description: "", definition: emptyDefinition() });
      setDraft(start);
    }
  }, [ruleId, rule.data, baseline, searchParams]);

  const definition = draft?.definition ?? null;
  const definitionKey = useMemo(() => JSON.stringify(definition), [definition]);
  const nameChanged = Boolean(draft && baseline && (draft.name !== baseline.name || draft.description !== baseline.description));
  const definitionChanged = Boolean(draft && baseline && !sameDefinition(draft.definition, baseline.definition));
  const isNew = !ruleId;
  const dirty = isNew ? Boolean(draft && (draft.name.trim() || draft.definition.actions.length)) : nameChanged || definitionChanged;

  const status = rule.data?.status ?? "DISABLED";
  // A holiday calendar binding's rule is changed through the place's Holiday Calendar field, never here.
  const systemOwned = rule.data?.origin === "SYSTEM";
  const readOnly = !canManage || status === "ARCHIVED" || systemOwned;

  // ── the live preview ────────────────────────────────────────────────────────────────────────
  const previewMutation = useAutomationPreview();
  const [preview, setPreview] = useState<AutomationPreview | undefined>(undefined);
  const [previewedKey, setPreviewedKey] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [samplePersonId, setSamplePersonId] = useState<string | null>(null);
  const latestKey = useRef<string>("");

  useEffect(() => {
    if (!definition || readOnly) return;
    const key = `${definitionKey}|${samplePersonId ?? ""}`;
    latestKey.current = key;
    const timer = setTimeout(() => {
      previewMutation.mutate(
        { ruleId: ruleId ?? createdId, definition, samplePersonId },
        {
          onSuccess: (data) => {
            if (latestKey.current !== key) return;
            setPreview(data);
            setPreviewedKey(definitionKey);
            setPreviewError(null);
          },
          onError: (error) => {
            if (latestKey.current !== key) return;
            setPreviewError(error.message);
          },
        },
      );
    }, PREVIEW_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // previewMutation is a new object every render; the draft is what drives the preview.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [definitionKey, samplePersonId, readOnly, ruleId, createdId]);

  const previewFresh = previewedKey === definitionKey && !previewError;
  const problems = preview?.problems ?? [];

  // ── names for the sentences ─────────────────────────────────────────────────────────────────
  const names = useAutomationNames(typesInDefinition(definition, fields), true);

  // ── publish ─────────────────────────────────────────────────────────────────────────────────
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  const nameMissing = !draft?.name.trim();
  const noActions = (definition?.actions.length ?? 0) === 0;
  const gateReason = !draft
    ? null
    : nameMissing
      ? "Give the automation a name to publish it."
      : noActions
        ? "Add at least one action to publish."
        : !previewFresh
          ? "Waiting for the preview…"
          : problems.length > 0
            ? "Fix what the preview lists to publish."
            : null;
  const saveOnly = !isNew && nameChanged && !definitionChanged;
  const canPublish = isNew || definitionChanged ? gateReason === null : saveOnly && !nameMissing;

  const publish = async (choices: PublishChoices) => {
    if (!draft) return;
    setPublishing(true);
    setPublishError(null);
    try {
      let id = ruleId ?? createdId;
      if (!id) {
        const created = unwrapAction(await createAutomationAction({
          name: draft.name.trim(),
          description: draft.description.trim() || null,
          definition: draft.definition,
        }));
        id = created.id;
        setCreatedId(id);
      } else {
        if (nameChanged) {
          unwrapAction(await renameAutomationAction({ id, body: { name: draft.name.trim(), description: draft.description.trim() || null } }));
        }
        if (definitionChanged) {
          unwrapAction(await publishAutomationAction({
            id,
            body: { definition: draft.definition, inFlight: choices.inFlight, expectedVersionNo: rule.data?.versionNo ?? null },
          }));
        }
      }
      if (choices.enable) {
        unwrapAction(await enableAutomationAction({ id, body: { backfill: choices.backfill } }));
      }
      setBaseline(draft);
      setPublishOpen(false);
      await invalidate();
      showSuccess(choices.enable ? "Published and enabled." : "Published.");
      if (isNew) router.replace(`${LIST_HREF}/${id}`);
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : String(error));
    } finally {
      setPublishing(false);
    }
  };

  const saveName = async () => {
    if (!draft || !ruleId) return;
    setPublishing(true);
    try {
      unwrapAction(await renameAutomationAction({ id: ruleId, body: { name: draft.name.trim(), description: draft.description.trim() || null } }));
      setBaseline(draft);
      await invalidate();
      showSuccess("Saved.");
    } catch (error) {
      showError(error);
    } finally {
      setPublishing(false);
    }
  };

  // ── the kebab ───────────────────────────────────────────────────────────────────────────────
  const [enableOpen, setEnableOpen] = useState(false);
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [acting, setActing] = useState(false);
  const [actError, setActError] = useState<string | null>(null);

  const runAct = async (fn: () => Promise<void>, inDialog: boolean) => {
    setActing(true);
    setActError(null);
    try {
      await fn();
      await invalidate();
      if (inDialog) {
        setEnableOpen(false);
        setConfirm(null);
      }
    } catch (error) {
      if (inDialog) setActError(error instanceof Error ? error.message : String(error));
      else showError(error);
    } finally {
      setActing(false);
    }
  };

  const enable = (backfill: BackfillChoice) => runAct(async () => {
    const r = unwrapAction(await enableAutomationAction({ id: ruleId as string, body: { backfill } }));
    showSuccess(activationText(r, "enabled"));
  }, true);
  const disable = () => runAct(async () => {
    const r = unwrapAction(await disableAutomationAction(ruleId as string));
    showSuccess(activationText(r, "disabled"));
  }, false);
  const resume = () => runAct(async () => {
    const r = unwrapAction(await resumeAutomationAction(ruleId as string));
    showSuccess(activationText(r, "resumed"));
  }, false);
  const archive = () => runAct(async () => { unwrapAction(await archiveAutomationAction(ruleId as string)); }, true);
  const unarchive = () => runAct(async () => { unwrapAction(await unarchiveAutomationAction(ruleId as string)); }, false);
  const remove = () => runAct(async () => {
    unwrapAction(await deleteAutomationAction(ruleId as string));
    setBaseline(draft);
    router.replace(LIST_HREF);
  }, true);

  const totalRuns = rule.data
    ? Object.values(rule.data.runs).reduce((n, x) => n + x, 0)
    : 0;

  const guard = useUnsavedChangesGuard(dirty && !publishing);

  // ── render ──────────────────────────────────────────────────────────────────────────────────
  if (ruleId && rule.error) {
    return <div className="px-8"><ErrorState error={rule.error} /></div>;
  }
  if (!draft || !definition || (canManage && !readOnly && catalog.isLoading)) {
    return (
      <div className="space-y-4 px-8" aria-busy="true">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }
  if (canManage && !readOnly && catalog.error) {
    return <div className="px-8"><ErrorState error={catalog.error} /></div>;
  }

  const kebab = ruleId && canManage && rule.data && !systemOwned ? (
    <RowActionsMenu label="Automation actions">
      {status === "DISABLED" && (
        <RowAction icon={<Power className="h-4 w-4 text-muted-foreground" />} onClick={() => { setActError(null); setEnableOpen(true); }}>
          Enable
        </RowAction>
      )}
      {status === "PAUSED" && (
        <RowAction icon={<Play className="h-4 w-4 text-muted-foreground" />} onClick={() => void resume()}>Resume</RowAction>
      )}
      {(status === "ENABLED" || status === "PAUSED") && (
        <RowAction icon={<PowerOff className="h-4 w-4 text-muted-foreground" />} onClick={() => void disable()}>Disable</RowAction>
      )}
      {status === "ARCHIVED" ? (
        <RowAction icon={<ArchiveRestore className="h-4 w-4 text-muted-foreground" />} onClick={() => void unarchive()}>Unarchive</RowAction>
      ) : (
        <RowAction icon={<Archive className="h-4 w-4 text-muted-foreground" />} onClick={() => { setActError(null); setConfirm("archive"); }}>
          Archive
        </RowAction>
      )}
      {/* A rule that has run for somebody cannot be deleted — archive it (DELETION.md rule 4). */}
      {totalRuns === 0 && (
        <RowActionDestructive icon={<Trash2 className="h-4 w-4" />} onClick={() => { setActError(null); setConfirm("delete"); }}>
          Delete
        </RowActionDestructive>
      )}
    </RowActionsMenu>
  ) : null;

  const primary = readOnly ? null : saveOnly ? (
    <Button type="button" onClick={() => void saveName()} disabled={!canPublish || publishing}>Save</Button>
  ) : (
    <Button type="button"
      onClick={() => { setPublishError(null); setPublishOpen(true); }}
      disabled={!canPublish || publishing || (!isNew && !definitionChanged)}
    >
      Publish
    </Button>
  );

  const setDefinition = (patch: Partial<AutomationDefinition>) =>
    setDraft((d) => (d ? { ...d, definition: { ...d.definition, ...patch } } : d));

  const ruleTab = readOnly ? (
    <div className="max-w-3xl rounded-xl border border-brown-100 bg-white px-5 py-2">
      <DefinitionView definition={definition} />
    </div>
  ) : (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="automation-name" required>
            <Input
              id="automation-name"
              value={draft.name}
              onChange={(e) => setDraft((d) => (d ? { ...d, name: e.target.value } : d))}
            />
          </Field>
          <Field label="Description" htmlFor="automation-description">
            <Input
              id="automation-description"
              value={draft.description}
              onChange={(e) => setDraft((d) => (d ? { ...d, description: e.target.value } : d))}
            />
          </Field>
        </div>

        {catalog.data && (
          <div>
            <WhenCard definition={definition} catalog={catalog.data} onChange={setDefinition} />
            <ForWhomCard
              definition={definition}
              fields={fields}
              isLoadingFields={fieldsLoading}
              summary={conditionsSentence(definition.conditions, fields, names.targets)}
              matchingCount={previewFresh && preview ? preview.matchingCount : null}
              onChange={setDefinition}
            />
            <DoCard definition={definition} catalog={catalog.data} names={names} onChange={setDefinition} />
          </div>
        )}
      </div>

      <div className="lg:sticky lg:top-4 lg:self-start">
        <PreviewPanel
          preview={preview}
          isPending={previewMutation.isPending}
          error={previewError}
          stale={!previewFresh && !previewError}
          samplePersonId={samplePersonId}
          onSampleChange={setSamplePersonId}
          targetName={(id) => names.targets.get(id)}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 px-8 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SettingsPageHeader title={draft.name.trim() || (isNew ? "New Automation" : "Automation")} backHref={LIST_HREF} />
        <div className="flex items-center gap-3">
          {rule.data && <RuleStatusBadge status={status} />}
          {kebab}
          {primary}
        </div>
      </div>

      {systemOwned && rule.data?.binding && (
        <p className="-mt-3 m-0 text-sm text-muted-foreground" data-test="system-owned">
          This automation is the Holiday Calendar of {bindingSourceLabel(rule.data.binding)}. Change it there.
        </p>
      )}

      {!readOnly && gateReason && (isNew || definitionChanged) && (
        <p className="-mt-3 text-right text-xs text-muted-foreground" data-test="publish-gate">{gateReason}</p>
      )}

      {status === "PAUSED" && rule.data?.pausedReason && (
        <div className="flex items-start gap-3 rounded-lg bg-warning-50 px-4 py-3 text-sm text-warning-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
          <div>
            <p className="m-0 font-medium">This automation is paused</p>
            <p className="m-0">{rule.data.pausedReason} Fix what it points at, publish, and resume it from the menu.</p>
          </div>
        </div>
      )}

      {ruleId ? (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-fit bg-brown-50">
            <TabsTrigger value="rule">Rule</TabsTrigger>
            <TabsTrigger value="runs">Run Log</TabsTrigger>
            <TabsTrigger value="versions">Versions</TabsTrigger>
          </TabsList>
          <TabsContent value="rule" className="pt-4">{ruleTab}</TabsContent>
          <TabsContent value="runs" className="pt-4"><RunLog ruleId={ruleId} /></TabsContent>
          <TabsContent value="versions" className="pt-4">
            <VersionsTab ruleId={ruleId} currentVersionNo={rule.data?.versionNo ?? 0} />
          </TabsContent>
        </Tabs>
      ) : (
        ruleTab
      )}

      <PublishDialog
        isOpen={publishOpen}
        isNew={isNew && !createdId}
        versionNo={rule.data?.versionNo ?? 1}
        inFlight={preview?.inFlight ?? null}
        canEnable={isNew || status === "DISABLED"}
        pastMomentCount={preview?.pastMomentCount ?? null}
        matchingCount={preview?.matchingCount ?? null}
        isLoading={publishing}
        errorMessage={publishError}
        onConfirm={(choices) => void publish(choices)}
        onCancel={() => setPublishOpen(false)}
      />

      <EnableDialog
        isOpen={enableOpen}
        pastMomentCount={!definitionChanged && previewFresh ? preview?.pastMomentCount ?? null : null}
        isLoading={acting}
        errorMessage={actError}
        onConfirm={(backfill) => void enable(backfill)}
        onCancel={() => setEnableOpen(false)}
      />

      <ConfirmActionModal
        isOpen={confirm === "archive"}
        title="Archive Automation"
        description="It stops running and leaves the list; scheduled runs are cancelled. What already ran stays as it is. You can unarchive it later."
        confirmLabel="Archive"
        isLoading={acting}
        errorMessage={actError}
        onConfirmAction={() => archive()}
        onCancelAction={() => setConfirm(null)}
      />

      <ConfirmActionModal
        isOpen={confirm === "delete"}
        title="Delete Automation"
        description="It has never run for anybody, so it is removed with all its versions."
        confirmLabel="Delete"
        destructive
        isLoading={acting}
        errorMessage={actError}
        onConfirmAction={() => remove()}
        onCancelAction={() => setConfirm(null)}
      />

      <ConfirmCancelModal
        isOpen={guard.pendingHref !== null}
        title="Leave Without Publishing?"
        description="The changes to this automation are only in this page. Leaving now discards them."
        cancelText="Stay"
        confirmText="Leave"
        onCancelAction={guard.stay}
        onConfirmAction={guard.leave}
      />
    </div>
  );
}
