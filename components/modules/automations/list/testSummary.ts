import type { AutomationSummary } from "@/models/automations";
import { partialMock } from "@/test/types";

/** A card for the list's tests: the fields under test, the rest an active automation nobody ran. */
export const summary = (over: Partial<AutomationSummary> = {}): AutomationSummary =>
  partialMock<AutomationSummary>({
    id: "a1",
    name: "New hire: first week",
    description: null,
    icon: null,
    status: "ACTIVE",
    origin: "BUILDER",
    trigger: { type: "PERSON_HIRED" },
    versionNo: 1,
    owner: { id: "u1", name: "Ulia Tykoon" },
    pause: null,
    lastRun: null,
    runs: 0,
    waiting: 0,
    updatedAt: null,
    archivedAt: null,
    archivedBy: null,
    ...over,
  });
