import type { WaitingOnMe } from "@/models/notifications/WaitingOnMe";

/** One document waiting for the reader's signature, from either of the two places `/me/actions` lists them. */
export type ToSignRow = { envelopeId: string; title: string; dueOn: string | null; /** Who sent it, by name (never "HR"). */ from: string | null };

/**
 * What the reader has to sign (`home-widgets` § 7; the profile menu's "{n} to sign", H13): a signature a task stands
 * for — a process's or an automation's — and one sent from a profile that no task stands for. Soonest due first; one
 * without a date last. A signed document leaves the list: `/me/actions` lists only what still waits.
 */
export const toSignOf = (waiting: WaitingOnMe | undefined): ToSignRow[] => {
  if (!waiting) return [];
  const seen = new Set<string>();
  const rows: ToSignRow[] = [];
  for (const task of waiting.tasks ?? []) {
    if (task.kind !== "SIGN" || !task.envelopeId || seen.has(task.envelopeId)) continue;
    seen.add(task.envelopeId);
    rows.push({ envelopeId: task.envelopeId, title: task.title, dueOn: task.dueDate ?? null, from: task.requestedBy?.name ?? null });
  }
  for (const envelope of waiting.envelopes ?? []) {
    if (seen.has(envelope.id)) continue;
    seen.add(envelope.id);
    rows.push({ envelopeId: envelope.id, title: envelope.title, dueOn: envelope.expiresAt ? envelope.expiresAt.slice(0, 10) : null, from: envelope.sentByName ?? null });
  }
  return rows.sort((a, b) => (a.dueOn ?? "9999").localeCompare(b.dueOn ?? "9999"));
};

/** The signing screen of one document — where Sign goes; signing is never done on Home. */
export const signHref = (envelopeId: string) => `/documents/sign/${envelopeId}`;
