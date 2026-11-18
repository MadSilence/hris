import type { EnvelopeDTO } from "@/api/modules/signing/dto";
import type { AgreementRow } from "@/models/hub";
import type { Task } from "@/models/lifecycle";
import type { TimeOffRequest } from "@/models/timeOff";

/** A holiday source change waiting on the reader: the inbox line that carries it, and its calendar. */
export type WaitingDrift = {
  notificationId: string;
  driftId: string;
  calendarId: string | null;
  calendarName: string | null;
};

/**
 * What waits on the signed-in person — one list, `GET /me/actions` (DECISIONS.md § "Notifications and the inbox — the
 * audit's answers", A1). Home's *Waiting on you*, a profile's bar and the inbox's *Needs action* read it, so their
 * counts agree. `count` is everything in the lists.
 */
export type WaitingOnMe = {
  requests: TimeOffRequest[];
  tasks: Task[];
  agreements: AgreementRow[];
  /** Documents to sign that no task stands for — sent from a profile, not from a process or an automation. */
  envelopes: EnvelopeDTO[];
  drifts: WaitingDrift[];
  count: number;
};
