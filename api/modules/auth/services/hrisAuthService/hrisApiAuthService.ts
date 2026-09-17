import { hrisApiAuthClient } from "@/api/modules/auth/clients/hrisApiAuthClient";
import {
  AcceptInviteRequest,
  ChangePasswordRequest,
  CompanyAddressReminderRequest,
  CompleteRegisterRequest,
  CompleteRegisterResponse,
  ForgotPasswordRequest,
  InvitePeekResponse,
  LoginRequest,
  LoginResponse,
  PasswordResetPeekResponse,
  RegisterRequest,
  ResetPasswordRequest,
} from "@/api/modules/auth/dto";
import { CreateResponse } from "@/api/models/misc";

export class HrisApiAuthService {
  public async login(payload: LoginRequest): Promise<LoginResponse> {
    return await hrisApiAuthClient.login(payload);
  }

  public async register(payload: RegisterRequest): Promise<CreateResponse> {
    return await hrisApiAuthClient.register(payload);
  }

  public async completeRegister(payload: CompleteRegisterRequest): Promise<CompleteRegisterResponse> {
    return await hrisApiAuthClient.completeRegister(payload);
  }

  public async peekInvite(token: string): Promise<InvitePeekResponse> {
    return hrisApiAuthClient.peekInvite(token);
  }

  public async acceptInvite(payload: AcceptInviteRequest): Promise<CreateResponse> {
    return hrisApiAuthClient.acceptInvite(payload);
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
}

export const hrisApiAuthService = new HrisApiAuthService();
