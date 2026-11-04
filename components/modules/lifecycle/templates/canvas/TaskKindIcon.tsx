import { BookOpen01Icon, CheckListIcon, FileUploadIcon, ShieldCheckIcon, Task01Icon, TaskDone01Icon, TextIcon, UserAdd01Icon, UserCheck01Icon } from "@hugeicons/core-free-icons";
import type { TaskKind } from "@/models/lifecycle";
import type { IconSvgElement } from "@/components/desact/icon";

/** A task's kind is an icon, not a colour — colour is kept for status (research § B.4). */
export const TASK_KIND_ICON: Record<TaskKind, IconSvgElement> = {
  TODO: CheckListIcon,
  FILL_FIELDS: TextIcon,
  DOCUMENT: FileUploadIcon,
  ACKNOWLEDGE: BookOpen01Icon,
  QUESTIONNAIRE: Task01Icon,
  REVIEW: TaskDone01Icon,
  NOMINATE_PEERS: UserAdd01Icon,
  APPROVE_PEERS: UserCheck01Icon,
  APPROVE_REVIEW: ShieldCheckIcon,
};
