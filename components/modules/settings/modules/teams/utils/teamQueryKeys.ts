export const TEAMS_QUERY_KEY = "teams";

export const teamQueryKeys = {
  all: [TEAMS_QUERY_KEY] as const,
  tree: (includeArchived: boolean) =>
    [TEAMS_QUERY_KEY, "tree", includeArchived] as const,
};
