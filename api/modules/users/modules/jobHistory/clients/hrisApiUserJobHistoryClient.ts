import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type { PositionHistoryEntry } from "@/models/user/PositionHistoryEntry";

export class HrisApiUserJobHistoryClient {
  private readonly USERS_PATH = "/users";

  /** A person's position timeline, newest first. */
  public async listByUserId(userId: string): Promise<PositionHistoryEntry[]> {
    return hrisApiClient.get<PositionHistoryEntry[]>(`${this.USERS_PATH}/${userId}/job-history`);
  }
}

export const hrisApiUserJobHistoryClient = new HrisApiUserJobHistoryClient();
