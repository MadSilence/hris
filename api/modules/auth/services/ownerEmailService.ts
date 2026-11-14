import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";

/** Whether the app asks the signed-in owner to confirm their address, and which one (SIGN_IN_IMPLEMENTATION_DESIGN.md § 6.3). */
export type OwnerEmailStatus = { unverified: boolean; email: string | null };

/**
 * The owner proving the address they registered with. Until they do, the company sends no email and invites nobody;
 * Java decides who is asked (a System Owner of such a company) and holds the mail.
 */
class OwnerEmailService {
  public async status(): Promise<OwnerEmailStatus> {
    return hrisApiClient.get<OwnerEmailStatus>("/company/owner-email");
  }

  /** `browserToken` is the `__Host-code` cookie: the code is typed in the browser that asked for it. */
  public async sendCode(browserToken: string): Promise<void> {
    await hrisApiClient.post<void>("/company/owner-email/code", { browserToken });
  }

  public async verify(code: string, browserToken: string): Promise<void> {
    await hrisApiClient.post<void>("/company/owner-email/verify", { code, browserToken });
  }
}

export const ownerEmailService = new OwnerEmailService();
