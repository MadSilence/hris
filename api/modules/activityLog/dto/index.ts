import type { ActivityCatalog, ActivityLogEntry, ActivityLogPage } from "@/models/activityLog";

/**
 * The journal's DTOs are the models.
 *
 * <p>Nothing is renamed, reshaped or computed between Java and the screen: a row is a record of what
 * happened, and a BFF that edits it on the way through would be editing the record. Declaring the
 * aliases rather than skipping the file keeps the domain's shape in one place if that ever changes.
 */
export type ActivityLogEntryDTO = ActivityLogEntry;
export type ActivityLogPageDTO = ActivityLogPage;
export type ActivityCatalogDTO = ActivityCatalog;
