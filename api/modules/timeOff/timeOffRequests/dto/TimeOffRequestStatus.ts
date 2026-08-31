export enum TimeOffRequestStatus {
  Pending = "PENDING",
  Approved = "APPROVED",
  /**
   * The employee asked to cancel an approved absence and the approver has not answered. The days
   * are still booked and still deducted: nothing moves until the answer arrives.
   */
  CancellationPending = "CANCELLATION_PENDING",
  Rejected = "REJECTED",
  Cancelled = "CANCELLED",
}
