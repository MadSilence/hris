"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCanAccess } from "@/components/auth/useAccess";
import { useAppFrame } from "@/components/layout/AppFrame";
import type { AutomationEditorProps } from "@/components/modules/automations/contracts";
import { useAutomation, useAutomationCatalog, useAutomationTemplates } from "@/components/modules/automations/hooks";
import { emptyDefinition } from "@/components/modules/automations/model/tree";
import type { Automation, AutomationTemplate } from "@/models/automations";
import { AutomationEditor, type AutomationEditorInitial } from "./AutomationEditor";
import { EditorLoadError, EditorLoading } from "./frame/EditorStates";
import type { EditorDraft } from "./state/editorLogic";

const blank = (): EditorDraft => ({ name: "", description: "", icon: null, definition: emptyDefinition() });

const fromAutomation = (a: Automation): EditorDraft => ({
  name: a.name,
  description: a.description ?? "",
  icon: a.icon,
  definition: a.definition ?? emptyDefinition(),
});

/** What the editor starts from: the automation as loaded, or a new one — from a template, for noddo AI, or empty. */
export const initialFor = ({
  automation,
  template,
  aiPrompt,
  focusStepId,
  focusRunId,
  turnOnOnLoad,
  editOnLoad = false,
}: {
  automation: Automation | null;
  template: AutomationTemplate | null;
  aiPrompt: string | null;
  focusStepId: string | null;
  focusRunId: string | null;
  turnOnOnLoad: boolean;
  /** Edit from the list's menu (`?edit=1`) and "Fix the step" open in fields, not in read mode. */
  editOnLoad?: boolean;
}): AutomationEditorInitial => {
  if (automation) {
    const loaded = fromAutomation(automation);
    return {
      automation,
      draft: loaded,
      baseline: loaded,
      tool: focusRunId ? "runs" : null,
      selectedStepId: focusStepId,
      runId: focusRunId,
      aiPrompt: null,
      turnOnOnLoad,
      editOnLoad: editOnLoad || Boolean(focusStepId),
    };
  }
  // A template is unsaved until "Save draft": the baseline is an empty automation, so it counts as a change.
  const draft: EditorDraft = template
    ? { name: template.name, description: template.description ?? "", icon: null, definition: template.definition }
    : blank();
  return {
    automation: null,
    draft,
    baseline: blank(),
    tool: aiPrompt ? "ai" : draft.definition.trigger ? null : "trigger",
    selectedStepId: null,
    runId: null,
    aiPrompt,
    turnOnOnLoad: false,
    editOnLoad: false,
  };
};

/**
 * The editor page (`/automations/<id>`, `/automations/new`): an automation by id, or a new one from a template, a
 * prompt for noddo AI, or nothing. Folds the app sidebar while it is open (AppFrame `canvas`). `?turnOn=1` opens the
 * turn-on flow on load.
 */
export const AutomationEditorContainer: React.FC<AutomationEditorProps> = ({
  automationId = null,
  templateKey = null,
  aiPrompt = null,
  focusStepId = null,
  focusRunId = null,
}) => {
  useAppFrame("canvas");
  const router = useRouter();
  const searchParams = useSearchParams();
  const turnOnOnLoad = searchParams?.get("turnOn") === "1";
  const editOnLoad = searchParams?.get("edit") === "1";
  const canManage = useCanAccess("SETTINGS.AUTOMATIONS", "MANAGE");

  const automationQuery = useAutomation(automationId);
  const catalogQuery = useAutomationCatalog();
  const templatesQuery = useAutomationTemplates(!automationId && Boolean(templateKey));

  const loading =
    catalogQuery.isLoading || (automationId ? automationQuery.isLoading : false) || (!automationId && templateKey ? templatesQuery.isLoading : false);
  const error = catalogQuery.error ?? (automationId ? automationQuery.error : null);
  const back = () => router.push("/automations");

  if (loading) return <EditorLoading onClose={back} />;
  if (error || !catalogQuery.data || (automationId && !automationQuery.data)) {
    return (
      <EditorLoadError
        onRetry={() => {
          void catalogQuery.refetch();
          if (automationId) void automationQuery.refetch();
        }}
        onBack={back}
      />
    );
  }

  const template = templateKey ? templatesQuery.data?.find((x) => x.key === templateKey) ?? null : null;
  const initial = initialFor({
    automation: automationQuery.data ?? null,
    template,
    aiPrompt,
    focusStepId,
    focusRunId,
    turnOnOnLoad,
    editOnLoad,
  });

  // Keyed by what it opened: a different automation is a different editor, never a carried-over draft.
  return (
    <AutomationEditor
      key={automationId ?? `new:${templateKey ?? ""}`}
      initial={initial}
      catalog={catalogQuery.data}
      canManage={canManage}
    />
  );
};
