export const lifecycleQueryKeys = {
  templates: (type?: string | null) => ["LIFECYCLE_TEMPLATES", type ?? "ALL"] as const,
  templatesRoot: ["LIFECYCLE_TEMPLATES"] as const,
  template: (id: string) => ["LIFECYCLE_TEMPLATE", id] as const,
  processes: (archived: boolean, userId?: string | null) => ["LIFECYCLE_PROCESSES", archived, userId ?? "ALL"] as const,
  processesRoot: ["LIFECYCLE_PROCESSES"] as const,
  process: (id: string) => ["LIFECYCLE_PROCESS", id] as const,
  processRoot: ["LIFECYCLE_PROCESS"] as const,
  deleteImpact: (id: string) => ["LIFECYCLE_PROCESS_DELETE_IMPACT", id] as const,
  myTasks: (includeDone: boolean) => ["MY_TASKS", includeDone] as const,
  myTasksRoot: ["MY_TASKS"] as const,
};
