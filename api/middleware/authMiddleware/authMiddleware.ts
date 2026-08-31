import { NextRequestHandler } from "@/api/utils/apiRequestWrapper";
import { NextRequest } from "next/server";
import { AuthErrorMessage, jwtService, UnauthorizedError } from "@/api/modules/auth/services/jwtService";
import { BackendUnavailableError } from "@/components/clients/exceptions";

export const withAuthMiddleware =
  <T>(handler: NextRequestHandler<T>) =>
    async (request: NextRequest, params: T) => {
      try {
        await jwtService.verifyToken();
      } catch (e) {
        // A bad token is an answer; an unreachable signing key is not.
        //
        // `verifyToken` reads the signing key from the backend's JWKS endpoint, so when the backend
        // is down verification fails for a reason that has nothing to do with the token. This used
        // to be flattened into 401, and the session probe in InternalApiClient took that 401 as
        // proof the session was gone — so an outage logged people out of a perfectly good session.
        //
        // Everything jwtService throws for an actual token problem is an UnauthorizedError, so
        // anything else reaching here is infrastructure and answers 503 instead.
        if (e instanceof UnauthorizedError) throw e;

        // Keep the reason the key source gave. `AuthErrorMessage.DEFAULT` reads "an unexpected
        // error occurred while validating JWT token", which points a reader at the token — the one
        // thing that is not the problem here.
        const reason = e instanceof Error && e.message ? e.message : AuthErrorMessage.DEFAULT;

        throw new BackendUnavailableError(reason, { cause: e });
      }

      return handler(request, params);
    }
