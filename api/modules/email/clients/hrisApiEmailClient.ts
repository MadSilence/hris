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

  public async personEmails(userId: string, page?: number, size?: number): Promise<PersonEmails> {
    const query = new URLSearchParams();
    if (page != null) query.set("page", String(page));
    if (size != null) query.set("size", String(size));
    const qs = query.toString();
    const suffix = qs ? `?${qs}` : "";
    return hrisApiClient.get<PersonEmails>(`/users/${userId}/emails${suffix}`);
  }

  /**
   * "Try again" on a bounced address (AQ-08): lifts the block and sends again at once. `resent` is INVITATION for
   * somebody still invited, else null — no other email body is kept.
   */
  public async tryAgain(userId: string): Promise<{ lifted: boolean; resent: string | null }> {
    return hrisApiClient.post<{ lifted: boolean; resent: string | null }>(`/users/${userId}/email/try-again`);
  }
}

export const hrisApiEmailClient = new HrisApiEmailClient();
