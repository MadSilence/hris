import type { RefDTO } from "@/models/user/fields";

export interface OrgChartUser {
  id: string;
  managerId: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
  avatarUrl: string | null;
  status: string;
  jobName: string | null;
  department: RefDTO | null;
  teams: RefDTO[];
  office: RefDTO | null;
  legalEntity: RefDTO | null;
}
