import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type { PersonEmails, UnsubscribeResult } from "@/models/email";

/**
 * Email (EMAIL_NOTIFICATIONS_DESIGN.md). The unsubscribe paths are public — `/public/email/` is in
 * `publicBackendPaths`, so no session travels with them; the token in the query is the credential.
 */
export class HrisApiEmailClient {
  public async describeUnsubscribe(token: string): Promise<UnsubscribeResult> {
    return hrisApiClient.get<UnsubscribeResult>(`/public/email/unsubscribe?token=${encodeURIComponent(token)}`);
  }

  public async unsubscribe(token: string): Promise<UnsubscribeResult> {
    return hrisApiClient.post<UnsubscribeResult>(`/public/email/unsubscribe?token=${encodeURIComponent(token)}`);
  }

  public async undoUnsubscribe(token: string): Promise<UnsubscribeResult> {
    return hrisApiClient.post<UnsubscribeResult>(`/public/email/unsubscribe/undo?token=${encodeURIComponent(token)}`);
  }

  public async personEmails(userId: string): Promise<PersonEmails> {
    return hrisApiClient.get<PersonEmails>(`/users/${userId}/emails`);
  }

  public async liftSuppression(userId: string): Promise<void> {
    await hrisApiClient.post<void>(`/users/${userId}/email-suppression/lift`);
  }
}

export const hrisApiEmailClient = new HrisApiEmailClient();
