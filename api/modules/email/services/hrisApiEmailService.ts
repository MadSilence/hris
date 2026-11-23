import { hrisApiEmailClient } from "@/api/modules/email/clients";
import type { PersonEmails, UnsubscribeResult } from "@/models/email";

export class HrisApiEmailService {
  public describeUnsubscribe(token: string): Promise<UnsubscribeResult> {
    return hrisApiEmailClient.describeUnsubscribe(token);
  }

  public unsubscribe(token: string): Promise<UnsubscribeResult> {
    return hrisApiEmailClient.unsubscribe(token);
  }

  public undoUnsubscribe(token: string): Promise<UnsubscribeResult> {
    return hrisApiEmailClient.undoUnsubscribe(token);
  }

  public personEmails(userId: string, page?: number, size?: number): Promise<PersonEmails> {
    return hrisApiEmailClient.personEmails(userId, page, size);
  }

  public tryAgain(userId: string): Promise<{ lifted: boolean; resent: string | null }> {
    return hrisApiEmailClient.tryAgain(userId);
  }
}

export const hrisApiEmailService = new HrisApiEmailService();
