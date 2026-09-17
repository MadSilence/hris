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
import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { CreateResponse } from "@/api/models/misc";

class HrisApiAuthClient {
  private readonly API_AUTH_PATH: string = '/auth';

  public async login(payload: LoginRequest): Promise<LoginResponse> {
    return hrisApiClient.post<LoginResponse>(this.API_AUTH_PATH + "/login", payload);
  }

  public async register(payload: RegisterRequest): Promise<CreateResponse> {
    return hrisApiClient.post<CreateResponse>(this.API_AUTH_PATH + "/register", payload);
  }

  public async completeRegister(payload: CompleteRegisterRequest): Promise<CompleteRegisterResponse> {
    return await hrisApiClient.post<CompleteRegisterResponse>(this.API_AUTH_PATH + "/register/confirm", {
      token: payload.token,
      password: payload.password,
    });
  }

  /** A POST so the token stays out of access logs. Does not use the link. */
  public async peekInvite(token: string): Promise<InvitePeekResponse> {
    return hrisApiClient.post<InvitePeekResponse>(this.API_AUTH_PATH + "/invite/peek", { token });
  }

  public async acceptInvite(payload: AcceptInviteRequest): Promise<CreateResponse> {
    return hrisApiClient.post<CreateResponse>(this.API_AUTH_PATH + "/invite/accept", payload);
  }

  // The request bodies are strict on the backend — an unknown property is a 422 — so each one is
  // rebuilt from exactly the fields it declares rather than passed through.

  public async forgotPassword(payload: ForgotPasswordRequest): Promise<void> {
    await hrisApiClient.post<void>(this.API_AUTH_PATH + "/password/forgot", {
      email: payload.email,
      subdomain: payload.subdomain,
    });
  }

  public async remindCompanyAddresses(payload: CompanyAddressReminderRequest): Promise<void> {
    await hrisApiClient.post<void>(this.API_AUTH_PATH + "/company-addresses/remind", { email: payload.email });
  }

  /** A POST so the token stays out of access logs. Does not use the link. */
  public async peekPasswordReset(token: string): Promise<PasswordResetPeekResponse> {
    return hrisApiClient.post<PasswordResetPeekResponse>(this.API_AUTH_PATH + "/password/peek", { token });
  }

  public async resetPassword(payload: ResetPasswordRequest): Promise<void> {
    await hrisApiClient.post<void>(this.API_AUTH_PATH + "/password/reset", {
      token: payload.token,
      password: payload.password,
    });
  }

  /** Signed in: not under `/auth`, and it travels with the session's Bearer. */
  public async changePassword(payload: ChangePasswordRequest): Promise<void> {
    await hrisApiClient.post<void>("/me/password", {
      currentPassword: payload.currentPassword,
      newPassword: payload.newPassword,
    });
  }
}

export const hrisApiAuthClient = new HrisApiAuthClient();
