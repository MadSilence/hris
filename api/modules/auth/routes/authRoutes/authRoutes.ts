import type { HrisApiAuthService } from "@/api/modules/auth/services/hrisAuthService";
import { hrisApiAuthService } from "@/api/modules/auth/services/hrisAuthService";
import { CompleteRegisterRequest, LoginRequest, RegisterRequest } from "@/api/modules/auth/dto";
import { BadRequestError } from "@/components/clients/exceptions";

export class AuthRoutes {
  private readonly hrisApiAuthService: HrisApiAuthService;

  public constructor(service: HrisApiAuthService) {
    this.hrisApiAuthService = service;
  }

  public async login(payload: LoginRequest) {
    if (!payload?.email || !payload?.password) {
      throw new BadRequestError("Missing email or password");
    }

    const {accessToken} = await this.hrisApiAuthService.login(payload);

    return {accessToken};
  }

  public async register(payload: RegisterRequest) {
    if (
      !payload?.consent ||
      !payload?.email ||
      !payload?.firstName ||
      !payload?.lastName ||
      !payload?.companyName
    ) {
      throw new BadRequestError("Validation error.");
    }

    return this.hrisApiAuthService.register(payload);
  }

  public async completeRegister(payload: CompleteRegisterRequest) {
    if (!payload?.password || !payload?.token) {
      throw new BadRequestError("Validation error.");
    }

    return this.hrisApiAuthService.completeRegister(payload);
  }
}

export const authRoutes = new AuthRoutes(hrisApiAuthService);
