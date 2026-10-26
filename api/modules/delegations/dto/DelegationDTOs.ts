/** Mirrors `ApprovalDelegationDTOs` on the backend: "Delegate Approvals" on a person's own preferences. */
export type DelegationSource = "MANUAL" | "LEAVE";

export type DelegationPersonRef = { id: string; name: string | null };

export type DelegationDTO = {
  id: string;
  delegator: DelegationPersonRef;
  delegate: DelegationPersonRef;
  startDate: string;
  endDate: string;
  /** MANUAL — set here; LEAVE — made when the person's own leave was approved, and follows it. */
  source: DelegationSource;
  sourceRequestId: string | null;
  /** In force today, on the company's calendar. */
  active: boolean;
};

export type DelegationsDTO = {
  /** Who a new delegation proposes: the reader's own manager, when they can decide. */
  defaultDelegate: DelegationPersonRef | null;
  given: DelegationDTO[];
  received: DelegationDTO[];
};

export type CreateDelegationRequest = {
  delegateUserId: string;
  startDate: string;
  endDate: string;
};
