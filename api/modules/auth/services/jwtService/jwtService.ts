import { cookies, headers } from "next/headers";
import jsonwebtoken, { JsonWebTokenError, Jwt, JwtPayload, TokenExpiredError } from "jsonwebtoken";
import { jwksClient } from "@/api/clients/auth/jwksClient/jwksClient";
import publicConfig from "@/config/publicConfig";
import { AuthErrorMessage, UnauthorizedError } from "@/api/modules/auth/services/jwtService/unauthorizedError";
import { SigningKeyUnavailableError } from "@/api/modules/auth/services/jwtService/signingKeyUnavailableError";

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
      // Not everything that goes wrong here is a token problem. An unreachable JWKS endpoint has
      // to keep its own class all the way out, or `withAuthMiddleware` cannot tell an outage from
      // a dead session — see SigningKeyUnavailableError.
      if (e instanceof SigningKeyUnavailableError) throw e;

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

  /**
   * Two very different failures come out of one call here, and they must not be merged.
   *
   * `SigningKeyNotFoundError` means the JWKS answered and does not know this `kid` — a fact about
   * the token, so it stays a 401. Anything else (connection refused, timeout, a non-JSON answer)
   * means the key source could not be read at all, which says nothing about the token.
   */
  private async getPublicKeyFromToken(jwt: Jwt) {
    try {
      const signingKey = await jwksClient.getSigningKey(jwt.header.kid);
      return signingKey.getPublicKey();
    } catch (e) {
      if (e instanceof Error && e.name === "SigningKeyNotFoundError") {
        throw new UnauthorizedError(AuthErrorMessage.INVALID, e);
      }

      throw new SigningKeyUnavailableError(
        `Cannot read the signing key from ${publicConfig.auth.issuerUri} — is the backend running?`,
        e,
      );
    }
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
