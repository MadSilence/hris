import { InternalApiClient } from "./internalApiClient";
import publicConfig from "@/config/publicConfig";

export * from "./internalApiClient";

export const internalApiClient = new InternalApiClient(publicConfig.environment.basePath);
