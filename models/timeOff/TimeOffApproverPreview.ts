/** Who a request would go to first — the approver, then their delegates or the fallback role's holders. */
export type TimeOffApproverPreview = {
  deciders: { userId: string; name: string; avatarUrl: string | null }[];
};
