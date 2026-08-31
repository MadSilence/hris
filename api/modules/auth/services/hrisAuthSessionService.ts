import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type { LoginResponse } from "@/api/modules/auth/dto";

/** The name the backend uses for its refresh cookie, on both the way in and the way out. */
export const REFRESH_COOKIE = "refresh_token";

export type SessionTokens = {
  accessToken: string;
  /** Absent when the backend chose not to rotate the refresh token on this call. */
  refreshToken?: string;
};

/**
 * Reads the refresh token out of the backend's `Set-Cookie`.
 *
 * The backend answers login and refresh with an httpOnly cookie — addressed to whoever made the
 * request, which is this server, not the browser. Nothing forwarded it, so the browser never had a
 * refresh token and `POST /auth/refresh` had no possible caller. Pulling the value out here is what
 * lets the route set it as a cookie of our own.
 */
const refreshTokenFrom = (response: Response): string | undefined => {
  const header = response.headers.get("set-cookie");
  if (!header) return undefined;

  const match = new RegExp(`(?:^|,\s*)${REFRESH_COOKIE}=([^;]*)`).exec(header);
  const value = match?.[1];
  // A logout answers with the same cookie emptied; an empty value is not a token.
  return value ? value : undefined;
};

class HrisAuthSessionService {
  public async login(payload: { email: string; password: string }): Promise<SessionTokens> {
    const { data, response } = await hrisApiClient.postWithResponse<LoginResponse>(
      "/auth/login",
      payload
    );
    return { accessToken: data.accessToken, refreshToken: refreshTokenFrom(response) };
  }

  /**
   * Exchanges a refresh token for a new pair.
   *
   * The backend reads the token from a cookie on the request, so it is sent as one — this server is
   * acting on the browser's behalf and has to look like the browser to the API.
   */
  public async refresh(refreshToken: string): Promise<SessionTokens> {
    const { data, response } = await hrisApiClient.postWithResponse<LoginResponse>(
      "/auth/refresh",
      undefined,
      { Cookie: `${REFRESH_COOKIE}=${refreshToken}` }
    );
    return { accessToken: data.accessToken, refreshToken: refreshTokenFrom(response) };
  }
}

export const hrisAuthSessionService = new HrisAuthSessionService();
