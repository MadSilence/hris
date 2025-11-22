"use server";

import type { PublicEnvironmentConfig } from "@/config/env.types";
import publicConfig from "@/config/publicConfig";

export default async function getPublicEnv(): Promise<PublicEnvironmentConfig> {
  return publicConfig;
}
