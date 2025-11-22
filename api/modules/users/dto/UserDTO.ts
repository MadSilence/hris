export type UserDTO = {
  id: string;
  companyId: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  isEmailVerified: boolean;
  lastLoginAt: string;
  avatarColor: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  custom: Map<string, object>;
}
