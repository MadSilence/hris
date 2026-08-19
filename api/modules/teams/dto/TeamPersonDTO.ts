export interface TeamPersonDTO {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  avatarUrl: string | null;
  status: string;
  jobName: string | null;
  teamIds: string[];
}
