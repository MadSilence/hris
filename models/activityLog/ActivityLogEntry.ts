/** One row of the company's journal, as the Logs page reads it. */
export type ActivityLogEntry = {
  id: string;
  createdAt: string;
  module: string | null;
  action: string;
  /** What the action says to a person — "Changed a person's manager", not `USER_MANAGER_CHANGED`. */
  actionLabel: string;
  verb: string | null;
  /**
   * The actor's id, or null when the row was written by a scheduler or by somebody who has since been
   * deleted. `actorName` outlives the id on purpose — it is snapshotted on the row.
   */
  actorUserId: string | null;
  actorName: string | null;
  actorRole: string | null;
  actorType: string | null;
  /** The background process that applied a decision somebody else made. */
  source: string | null;
  impersonatedBy: string | null;
  objectType: string | null;
  objectId: string | null;
  objectName: string | null;
  targetUserId: string | null;
  targetUserName: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  traceId: string | null;
  metadata: Record<string, unknown> | null;
};

export type ActivityLogPage = {
  items: ActivityLogEntry[];
  /** Null on the last page. There is deliberately no total — see the backend read service. */
  nextCursor: string | null;
};

export type ActivityLogFilters = {
  from?: string;
  to?: string;
  module?: string;
  verb?: string;
  action?: string;
  actorUserId?: string;
  actorType?: string;
  objectType?: string;
  targetUserId?: string;
  search?: string;
};
