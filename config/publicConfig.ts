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
    // Empty, so the browser calls `/api/…` on whatever host it is on. It was `http://localhost:3000`,
    // which is a different origin from `acme.localhost:3000`: the session cookies live on the company's
    // host, never travelled to `localhost`, and every read failed as signed out.
    basePath: "",
  },
  auth: {
    // new URL() joins correctly whether or not BACKEND_URL has a trailing slash.
    issuerUri: new URL(JWKS_PATH, BACKEND_URL).toString(),
  },
  // Server-side variables, handed to the browser through `getPublicEnv` rather than a `NEXT_PUBLIC_`
  // prefix, so one deployment's addresses are not baked into the bundle at build time.
  web: {
    scheme: process.env.APP_SCHEME || "http",
    rootDomain: process.env.APP_ROOT_DOMAIN || "localhost:3000",
  },
};

export default publicConfig;
