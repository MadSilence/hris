/**
 * One configurable notification category on the preferences page. `mandatory` types always send
 * (`enabled` forced true, not editable); `canManage` reflects whether this user holds the right to
 * opt out of the category (AccessEngine, §6 axis 2).
 */
export interface NotificationPreference {
  category: string;
  label: string;
  enabled: boolean;
  mandatory: boolean;
  canManage: boolean;
  /** Something in this category is ever emailed. */
  emailAvailable: boolean;
  emailEnabled: boolean;
  /** Nothing emailed in it may be switched off — what asks you to act, or is about the account, always goes. */
  emailLocked: boolean;
}

/** The two channels a person chooses per category. */
export type NotificationChannel = "IN_APP" | "EMAIL";
