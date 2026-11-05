/**
 * Who a request would go to first, before it is filed — "Goes to …" in the request form (C7). The people who may
 * decide the first step today, the approver first; empty when nobody resolves.
 */
export interface TimeOffApproverPreviewDTO {
  deciders: { userId: string; name: string; avatarUrl: string | null }[];
}
