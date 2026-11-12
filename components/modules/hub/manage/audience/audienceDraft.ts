import type { HubAudience, HubAudienceMode } from "@/models/hub";
import type { RecipientSpec } from "@/models/automations";

/**
 * What the audience dialog sends for the mode on screen (CM07): Everyone carries nothing; Filter people carries its
 * filters and "Also add"; Choose people carries only the people and roles. The other modes' picks are kept in the
 * draft while the author switches, and dropped on Apply.
 */
export const normalizeAudience = (mode: HubAudienceMode, draft: HubAudience): HubAudience => {
  switch (mode) {
    case "EVERYONE":
      return { mode, filters: [], userIds: [], roleIds: [] };
    case "FILTER":
      return { mode, filters: draft.filters, userIds: draft.userIds, roleIds: draft.roleIds };
    case "PEOPLE":
      return { mode, filters: [], userIds: draft.userIds, roleIds: draft.roleIds };
  }
};

/** Whether two audiences reach the same definition — the dialog's "unsaved changes" test. */
export const sameAudience = (a: HubAudience, b: HubAudience): boolean => JSON.stringify(normalizeAudience(a.mode, a)) === JSON.stringify(normalizeAudience(b.mode, b));

/** Apply waits for an answer and refuses an audience that reaches nobody (CM07: disabled at 0 people). */
export const canApplyAudience = (total: number | undefined, loading: boolean): boolean => !loading && (total ?? 0) > 0;

/** People and roles as the shared people picker holds them (`RecipientSpec`), and back. */
export const toRecipients = (audience: Pick<HubAudience, "userIds" | "roleIds">): RecipientSpec[] => [
  ...audience.roleIds.map((roleId): RecipientSpec => ({ kind: "ROLE", roleId })),
  ...audience.userIds.map((userId): RecipientSpec => ({ kind: "USER", userId })),
];

export const fromRecipients = (recipients: RecipientSpec[]): Pick<HubAudience, "userIds" | "roleIds"> => ({
  userIds: recipients.filter((r) => r.kind === "USER" && r.userId).map((r) => r.userId as string),
  roleIds: recipients.filter((r) => r.kind === "ROLE" && r.roleId).map((r) => r.roleId as string),
});
