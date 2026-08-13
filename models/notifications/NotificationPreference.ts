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
}
