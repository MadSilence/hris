import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  resetMocks: true,
  roots: ["<rootDir>"],
  modulePaths: ["<rootDir>"],
  moduleNameMapper: {
    // Tests read the English catalogue through the real ICU formatter, without a provider (test/nextIntl.tsx).
    "^next-intl$": "<rootDir>/test/nextIntl.tsx",
    "^next-intl/server$": "<rootDir>/test/nextIntlServer.ts",
    "^@/(.*)$": "<rootDir>/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jsdom",
  watchPlugins: ["jest-watch-typeahead/filename", "jest-watch-typeahead/testname"],
  coverageThreshold: {
    global: {
      branches: 50,
    },
  },
};

/**
 * `next-intl` and the ICU formatter under it ship only as ES modules; next/jest leaves `node_modules`
 * untransformed, so they are let through here.
 */
const ESM_PACKAGES = ["next-intl", "use-intl", "intl-messageformat", "@formatjs"];

const jestConfig = async (): Promise<Config> => {
  const resolved = await createJestConfig(config)();
  return {
    ...resolved,
    transformIgnorePatterns: [
      `/node_modules/(?!(${ESM_PACKAGES.join("|")})/)`,
      ...(resolved.transformIgnorePatterns ?? []).filter((pattern) => !pattern.includes("node_modules")),
    ],
  };
};

export default jestConfig;
