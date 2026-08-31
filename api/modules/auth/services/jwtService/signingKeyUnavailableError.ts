import { RootError } from "@/api/models/errors";

/**
 * The signing key could not be fetched — which says nothing about the token.
 *
 * `verifyToken` reads the key from the backend's JWKS endpoint, so when the backend is down,
 * verification fails for a reason the person cannot fix by logging in again. Flattening that into
 * `UnauthorizedError` is what made an outage look like a dead session: the BFF answered 401, the
 * API client took the 401 as proof and redirected to /login, and people were thrown out of a
 * perfectly good session every time the API blinked.
 *
 * Deliberately **not** a subclass of {@link UnauthorizedError}: `withAuthMiddleware` tells the two
 * apart by class, and the whole point is that this one is infrastructure, not authentication.
 *
 * A missing *kid* is the opposite case and stays an `UnauthorizedError` — the JWKS answered, it
 * simply does not know that key, which is a fact about the token.
 */
export class SigningKeyUnavailableError extends RootError {
  public constructor(message?: string, cause?: unknown) {
    super("SigningKeyUnavailableError", message, cause);
  }
}
