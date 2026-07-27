export const ROLES_QUERY_KEY = "ROLES";

export const rolesQueryKeys = {
  roles: () => [ROLES_QUERY_KEY] as const,
  rolePermissions: (roleId: string) => [ROLES_QUERY_KEY, "permissions", roleId] as const,
  roleFieldAccess: (roleId: string) => [ROLES_QUERY_KEY, "field-access", roleId] as const,
  roleAssignmentRules: (roleId: string, page: number) =>
    [ROLES_QUERY_KEY, "assignment-rules", roleId, page] as const,
  roleAssignmentJob: (roleId: string, jobId: string) =>
    [ROLES_QUERY_KEY, "assignment-job", roleId, jobId] as const,
  roleUsers: (roleId: string, q: string | null) =>
    [ROLES_QUERY_KEY, "users", roleId, q ?? ""] as const,
};
