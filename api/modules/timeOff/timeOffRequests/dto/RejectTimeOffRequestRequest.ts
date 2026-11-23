/** Declining (AQ-13): an optional comment the person is shown. `rejectionReason` is the old name, still read. */
export interface RejectTimeOffRequestRequest {
  comment?: string;
  rejectionReason?: string;
}
