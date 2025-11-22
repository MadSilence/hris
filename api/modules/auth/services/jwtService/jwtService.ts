import { cookies, headers } from "next/headers";
import jsonwebtoken, { JsonWebTokenError, Jwt, JwtPayload, TokenExpiredError } from "jsonwebtoken";
import { jwksClient } from "@/api/clients/auth/jwksClient/jwksClient";
import { AuthErrorMessage, UnauthorizedError } from "@/api/modules/auth/services/jwtService/unauthorizedError";

export type TokenPayload = JwtPayload & {
  email?: string;
  roles?: string[];
  permissions?: string[];
  modules?: string[];
};

export class JwtService {
  public async verifyToken(): Promise<TokenPayload> {
    try {
      const encodedToken = await this.getEncodedToken();
      const decoded = this.getDecodedToken(encodedToken);
      const publicKey = await this.getPublicKeyFromToken(decoded);

      return jsonwebtoken.verify(encodedToken, publicKey) as TokenPayload;
    } catch (e) {
      throw e instanceof UnauthorizedError ? e : new UnauthorizedError(this.getErrorMessage(e), e);
    }
  }

  public getDecodedToken(token: string): Jwt {
    const decoded = jsonwebtoken.decode(token, { complete: true });
    if (!decoded) throw new UnauthorizedError(AuthErrorMessage.MALFORMED);
    return decoded as Jwt;
  }

  public async getEncodedToken(): Promise<string> {
    const cookieToken = (await cookies()).get("access_token")?.value;
    if (cookieToken) return cookieToken;

    const authHeader = (await headers()).get("Authorization"); // ✅ sync
    const tokenPart = authHeader?.split(" ")?.[1];
    if (!tokenPart) {
      throw new UnauthorizedError(AuthErrorMessage.MALFORMED);
    }

    return tokenPart;
  }

  public getModules(jwt: Jwt): string[] {
    const payload = jwt.payload as JwtPayload & { modules?: string[] | string };
    const m = payload.modules;
    if (!m) throw new UnauthorizedError(AuthErrorMessage.MALFORMED);
    return Array.isArray(m) ? m : [m];
  }

  public getEmailFromJwt(jwt: Jwt): string | undefined {
    const payload = jwt.payload as JwtPayload & { email?: string };
    return payload.email;
  }

  private async getPublicKeyFromToken(jwt: Jwt) {
    const signingKey = await jwksClient.getSigningKey((jwt.header as any).kid);
    return signingKey.getPublicKey();
  }

  private getErrorMessage(e: unknown): AuthErrorMessage {
    if (e instanceof TokenExpiredError) return AuthErrorMessage.EXPIRED;
    if (e instanceof JsonWebTokenError) return AuthErrorMessage.INVALID;
    return AuthErrorMessage.DEFAULT;
  }

  public isExpired(encodedToken: string): boolean {
    try {
      const decoded = this.getDecodedToken(encodedToken);
      const { exp } = decoded.payload as JwtPayload;
      if (!exp) return true;
      const now = Math.floor(Date.now() / 1000);
      return exp <= now;
    } catch {
      return true;
    }
  }
}

export const jwtService = new JwtService();
export const getJwtService = () => jwtService;
