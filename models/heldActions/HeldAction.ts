export type { HeldActionKind } from "@/api/modules/heldActions/dto";

/** An answer held on the server (DECISIONS.md § "Undo and the Admin role"): what to undo, and how long Undo lasts. */
export interface HeldAction {
  id: string;
  /** The moment the server applies it, an ISO-8601 instant. */
  executeAt: string;
  /**
   * `executeAt` less the time it was answered, in milliseconds — measured on the server side of the BFF, so a browser
   * whose clock is off still shows the toast for as long as the hold really lasts.
   */
  windowMs: number;
}
