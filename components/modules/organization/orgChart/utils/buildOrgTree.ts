import type { OrgChartUser } from "@/models/orgChart/OrgChartUser";

export interface OrgTreeNode {
  user: OrgChartUser;
  children: OrgTreeNode[];
}

export interface OrgForest {
  roots: OrgTreeNode[];
  byId: Map<string, OrgChartUser>;
  reportsById: Map<string, OrgChartUser[]>;
}

export function buildOrgForest(users: OrgChartUser[]): OrgForest {
  const byId = new Map(users.map((u) => [u.id, u]));
  const reportsById = new Map<string, OrgChartUser[]>();
  for (const u of users) reportsById.set(u.id, []);

  const rootUsers: OrgChartUser[] = [];
  for (const u of users) {
    const managerId = u.managerId && byId.has(u.managerId) && u.managerId !== u.id ? u.managerId : null;
    if (managerId) reportsById.get(managerId)!.push(u);
    else rootUsers.push(u);
  }

  const building = new Set<string>();
  const build = (u: OrgChartUser): OrgTreeNode => {
    building.add(u.id);
    const children = (reportsById.get(u.id) ?? [])
      .filter((child) => !building.has(child.id))
      .map(build);
    building.delete(u.id);
    return { user: u, children };
  };

  return { roots: rootUsers.map(build), byId, reportsById };
}
