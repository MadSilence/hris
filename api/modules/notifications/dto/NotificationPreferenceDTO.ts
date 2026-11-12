export interface NotificationPreferenceDTO {
  category: string;
  label: string;
  enabled: boolean;
  mandatory: boolean;
  canManage: boolean;
  /** Something in this category is ever emailed (EMAIL_NOTIFICATIONS_DESIGN.md § 5). */
  emailAvailable: boolean;
  /** The email column's state; always true where it is locked. */
  emailEnabled: boolean;
  /** Nothing emailed in it may be switched off: it asks to act, or it is about the account. */
  emailLocked: boolean;
}
