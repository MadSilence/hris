import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";

/** One Google or Microsoft account a person connected (SOCIAL_SIGN_IN_DESIGN.md § 6.1). */
export type ConnectedAccountDTO = {
  provider: "GOOGLE" | "MICROSOFT";
  email: string | null;
  connectedAt: string;
  lastUsedAt: string | null;
};

/**
 * A person's ways in, for *My Preferences*: the password, the connected accounts, which providers this company offers,
 * and whether the password may be removed now — the last way in never may (§ 5.5).
 */
export type SignInOverviewDTO = {
  hasPassword: boolean;
  accounts: ConnectedAccountDTO[];
  offered: ("GOOGLE" | "MICROSOFT")[];
  passwordRemovable: boolean;
};

/** `/me/sign-in` — Java decides what may go; every change there asks for step-up first. */
class PersonalSignInService {
  public async overview(): Promise<SignInOverviewDTO> {
    return hrisApiClient.get<SignInOverviewDTO>("/me/sign-in");
  }

  public async setPassword(password: string): Promise<void> {
    await hrisApiClient.post<void>("/me/sign-in/password", { password });
  }

  public async removePassword(): Promise<void> {
    await hrisApiClient.delete<void>("/me/sign-in/password");
  }

  public async disconnect(provider: "GOOGLE" | "MICROSOFT"): Promise<void> {
    await hrisApiClient.delete<void>(`/me/sign-in/accounts/${provider}`);
  }
}

export const personalSignInService = new PersonalSignInService();
