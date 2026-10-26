import { hrisApiUserScheduledChangesClient } from "@/api/modules/users/modules/scheduledChanges/clients";
import type { ScheduledChange } from "@/models/user/ScheduledChange";

export class HrisUserScheduledChangesService {
  public async listByUserId(userId: string): Promise<ScheduledChange[]> {
    return hrisApiUserScheduledChangesClient.listByUserId(userId);
  }

  public async cancel(userId: string, changeId: string): Promise<void> {
    return hrisApiUserScheduledChangesClient.cancel(userId, changeId);
  }

  public async reschedule(userId: string, changeId: string, date: string): Promise<void> {
    return hrisApiUserScheduledChangesClient.reschedule(userId, changeId, date);
  }
}

export const hrisUserScheduledChangesService = new HrisUserScheduledChangesService();
