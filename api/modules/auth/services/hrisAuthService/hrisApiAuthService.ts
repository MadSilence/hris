import { hrisApiAuthClient } from "@/api/modules/auth/clients/hrisApiAuthClient";
import { CompleteRegisterRequest, LoginRequest, LoginResponse, RegisterRequest } from "@/api/modules/auth/dto";
import { CreateResponse } from "@/api/models/misc";

export class HrisApiAuthService {
  public async login(payload: LoginRequest): Promise<LoginResponse> {
    return await hrisApiAuthClient.login(payload);
  }

  public async register(payload: RegisterRequest): Promise<CreateResponse> {
    return await hrisApiAuthClient.register(payload);
  }

  public async completeRegister(payload: CompleteRegisterRequest): Promise<CreateResponse> {
    return await hrisApiAuthClient.completeRegister(payload);
  }
}

export const hrisApiAuthService = new HrisApiAuthService();
