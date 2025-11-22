import { PublicEnvironmentConfig } from "@/config/env.types";

const publicConfig: Readonly<PublicEnvironmentConfig> = {
  environment: {
    basePath: "http://localhost:3000",
  },
  auth: {
    issuerUri: "http://localhost:8081/.well-known/jwks.json",
  },
};

export default publicConfig;
