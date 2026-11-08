import type { AutomationDefinition } from "@/models/automations";

/**
 * The one seam noddo AI will fill (plan batch 13; the assistant of `technical_design/AI_HELPER_DESIGN.md`). Until it
 * is connected it drafts nothing (K10): every prompt is answered "not connected", and the editor keeps the text.
 *
 *   notConnected  the fixed reply — the only one that fires today
 *   draft         a drafted definition, labelled "Drafted by AI — review before turning on"
 *   cantDo        what it could not do, and what it did instead, with Undo (H1)
 *   error         "We couldn't make this change. Your automation is safe and nothing changed." + Try again (H1)
 */
export type AiReply =
  | { kind: "notConnected" }
  | { kind: "draft"; definition: AutomationDefinition; message: string; changedSteps: number }
  | { kind: "cantDo"; message: string; definition: AutomationDefinition; changedSteps: number }
  | { kind: "error" };

export const noddoAiDraft = async (_prompt: string, _definition: AutomationDefinition): Promise<AiReply> => ({ kind: "notConnected" });

/** One turn of the conversation in the AI window. */
export type AiTurn = { id: number; prompt: string; reply: AiReply | null; undone?: boolean };
