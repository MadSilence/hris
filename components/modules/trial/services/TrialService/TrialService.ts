import { InternalApiClient } from "@/components/clients/apiClient";

/** The company's details after the code (sign-in-registration B2a). */
export type RegistrationDetails = {
  firstName: string;
  lastName: string;
  companyName: string;
  password: string;
};

/**
 * Registration by code (sign-in-registration B1 → B2 → B2a). The cookies — the browser a code is bound to, and the
 * draft after the right code — are the BFF's; this only says what was typed.
 */
export class TrialService {
  constructor(private readonly apiClient: InternalApiClient) {}

  /** B1, and B2's resend: a six-digit code to the address. */
  public async sendCode(email: string): Promise<void> {
    await this.apiClient.post("/auth/register/code", { email });
  }

  /** B2: the code. */
  public async verifyCode(email: string, code: string): Promise<void> {
    await this.apiClient.post("/auth/register/verify", { email, code });
  }

  /** B3: the company from a Google or Microsoft draft — no password; answers the new company's own address. */
  public async completeWithProvider(details: Omit<RegistrationDetails, "password">): Promise<{ next: string }> {
    return this.apiClient.post<{ next: string }>("/auth/register/provider-complete", details);
  }

  /** B2a: the company; answers where the browser goes next — the new company's own address. */
  public async complete(details: RegistrationDetails): Promise<{ next: string }> {
    return this.apiClient.post<{ next: string }>("/auth/register/complete", details);
  }
}
