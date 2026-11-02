import { BookOpenCheck, ClipboardList, FileUp, ListChecks, TextCursorInput } from "lucide-react";
import type { TaskKind } from "@/models/lifecycle";

/** A task's kind is an icon, not a colour — colour is kept for status (research § B.4). */
export const TASK_KIND_ICON: Record<TaskKind, typeof ListChecks> = {
  TODO: ListChecks,
  FILL_FIELDS: TextCursorInput,
  DOCUMENT: FileUp,
  ACKNOWLEDGE: BookOpenCheck,
  QUESTIONNAIRE: ClipboardList,
};
