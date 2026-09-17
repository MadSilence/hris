import type { HrisApiAuthService } from "@/api/modules/auth/services/hrisAuthService";
import { hrisApiAuthService } from "@/api/modules/auth/services/hrisAuthService";
import { CompleteRegisterRequest, LoginRequest, RegisterRequest } from "@/api/modules/auth/dto";
import { BadRequestError } from "@/components/clients/exceptions";
import {
  hrisAuthSessionService,
  type SessionTokens,
} from "@/api/modules/auth/services/hrisAuthSessionService";

export class AuthRoutes {
  private readonly hrisApiAuthService: HrisApiAuthService;

  public constructor(service: HrisApiAuthService) {
    this.hrisApiAuthService = service;
  }

  /**
   * Returns both tokens. The refresh one comes back as a `Set-Cookie` addressed to this server, so
   * it has to be read off the response — see `hrisAuthSessionService`.
   */
  public async login(payload: LoginRequest): Promise<SessionTokens> {
    if (!payload?.email || !payload?.password) {
      throw new BadRequestError("Missing email or password");
    }
    // Only a company's own address has a login form; the root has no company to sign in to.
    if (!payload.subdomain) {
      throw new BadRequestError("Sign in at your company's address");
    }

    return hrisAuthSessionService.login(payload);
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
