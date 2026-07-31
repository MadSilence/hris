export const DEPARTMENTS_QUERY_KEY = "departments";

export const departmentQueryKeys = {
  all: [DEPARTMENTS_QUERY_KEY] as const,
  tree: (includeArchived: boolean) =>
    [DEPARTMENTS_QUERY_KEY, "tree", includeArchived] as const,
};
