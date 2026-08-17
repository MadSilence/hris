import { PublicEnvironmentConfig } from "@/config/env.types";

/** Where the JWKS lives on the backend — the path is fixed, only the host comes from the env. */
const JWKS_PATH = "/.well-known/jwks.json";

/**
 * The issuer is the backend, so it is derived from `BACKEND_URL` rather than configured twice —
 * two variables that must agree are a bug waiting to happen.
 *
 * The fallback is not decoration: this module is also pulled into the client bundle (via
 * `internalApiClient`), and `BACKEND_URL` has no `NEXT_PUBLIC_` prefix, so in the browser it is
 * `undefined`. Without a default, `new URL()` would throw while the module is loading. Nothing on
 * the client reads `issuerUri` — every consumer (jwksClient, hrisApiClient, the upload route) runs
 * on the server, where the real value is present.
 */
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8081";

const publicConfig: Readonly<PublicEnvironmentConfig> = {
  environment: {
    basePath: "http://localhost:3000",
  },
  auth: {
    // new URL() joins correctly whether or not BACKEND_URL has a trailing slash.
    issuerUri: new URL(JWKS_PATH, BACKEND_URL).toString(),
  },
};

export default publicConfig;
