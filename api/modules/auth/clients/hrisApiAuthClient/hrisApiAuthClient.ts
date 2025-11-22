import { CompleteRegisterRequest, LoginRequest, LoginResponse, RegisterRequest } from "@/api/modules/auth/dto";
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

  public async completeRegister(payload: CompleteRegisterRequest): Promise<CreateResponse> {
    return await hrisApiClient.post<CreateResponse>(this.API_AUTH_PATH + "/register/confirm", payload);
  }
}

export const hrisApiAuthClient = new HrisApiAuthClient();
