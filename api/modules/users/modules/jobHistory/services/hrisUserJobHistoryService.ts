import { hrisApiUserJobHistoryClient } from "@/api/modules/users/modules/jobHistory/clients";
import type { PositionHistoryEntry } from "@/models/user/PositionHistoryEntry";

export class HrisUserJobHistoryService {
  public async listByUserId(userId: string): Promise<PositionHistoryEntry[]> {
    return hrisApiUserJobHistoryClient.listByUserId(userId);
  }
}

export const hrisUserJobHistoryService = new HrisUserJobHistoryService();
