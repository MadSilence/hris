/** One email the product sent a person — the log line, never the body (EMAIL_NOTIFICATIONS_DESIGN.md § 7.1). */
export interface EmailLine {
  id: string;
  kind: "AUTH" | "INVITATION" | "SECURITY" | "PREBOARDING" | "AUTOMATION" | "NOTIFICATION" | "DIGEST";
  templateKey: string;
  subject: string;
  status: "QUEUED" | "SENT" | "DELIVERED" | "FAILED" | "BOUNCED" | "COMPLAINED" | "SUPPRESSED";
  createdAt: string;
  sentAt: string | null;
  lastError: string | null;
}

/** The block on an address after bounces or a complaint (§ 9.1). */
export interface EmailSuppression {
  reason: "HARD_BOUNCE" | "SOFT_BOUNCES" | "COMPLAINT" | "MANUAL";
  since: string;
}

/**
 * A page of a person's emails, newest first, and the state of their address (EM10). `total` is every email ever
 * logged to them (Manage account's "Emails sent · {n}"); `page` is zero-based.
 */
export interface PersonEmails {
  address: string | null;
  suppression: EmailSuppression | null;
  emails: EmailLine[];
  total: number;
  page: number;
  size: number;
}

/** What an unsubscribe link is about, and whether it has acted. */
export interface UnsubscribeResult {
  categories: string[];
  done: boolean;
}
