import { hrisApiAuthClient } from "@/api/modules/auth/clients/hrisApiAuthClient";
import {
  ChangePasswordRequest,
  CompanyAddressReminderRequest,
  ForgotPasswordRequest,
  InvitePeekResponse,
  LoginRequest,
  LoginResponse,
  PasswordResetPeekResponse,
  EmailChangePeekResponse,
  EmailChangeConfirmResponse,
  ResetPasswordRequest,
} from "@/api/modules/auth/dto";

export class HrisApiAuthService {
  public async login(payload: LoginRequest): Promise<LoginResponse> {
    return await hrisApiAuthClient.login(payload);
  }

  public async peekInvite(token: string): Promise<InvitePeekResponse> {
    return hrisApiAuthClient.peekInvite(token);
  }

  /** Answers the same whether or not the address has an account — the backend never says which. */
  public async forgotPassword(payload: ForgotPasswordRequest): Promise<void> {
    return hrisApiAuthClient.forgotPassword(payload);
  }

  /** Answers the same whether the email holds no account, one or many. */
  public async remindCompanyAddresses(payload: CompanyAddressReminderRequest): Promise<void> {
    return hrisApiAuthClient.remindCompanyAddresses(payload);
  }

  public async peekPasswordReset(token: string): Promise<PasswordResetPeekResponse> {
    return hrisApiAuthClient.peekPasswordReset(token);
  }

  public async resetPassword(payload: ResetPasswordRequest): Promise<void> {
    return hrisApiAuthClient.resetPassword(payload);
  }

  public async changePassword(payload: ChangePasswordRequest): Promise<void> {
    return hrisApiAuthClient.changePassword(payload);
  }

  public async peekEmailChange(token: string): Promise<EmailChangePeekResponse> {
    return hrisApiAuthClient.peekEmailChange(token);
  }

  public async confirmEmailChange(token: string): Promise<EmailChangeConfirmResponse> {
    return hrisApiAuthClient.confirmEmailChange(token);
  }
}

export const hrisApiAuthService = new HrisApiAuthService();
