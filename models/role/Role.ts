export type Role = {
  id: string;
  name: string;
  description?: string;
  systemOwner: boolean;
  // Auto-assigned base role: always present on a user, cannot be removed, permissions editable.
  isDefault: boolean;
  active: boolean;
  // Number of users assigned to this role. Populated by GET /roles when the backend
  // includes it; undefined otherwise (rendered as "—").
  userCount?: number;
  createdAt: string;
  updatedAt: string;
}
