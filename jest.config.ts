import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({
  dir: './'
});

const config: Config = {
  resetMocks: true,
  roots: ["<rootDir>"],
  modulePaths: ["<rootDir>"],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(svg)$': '<rootDir>/test/__mocks__/svgMock.tsx',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: "jsdom",
  watchPlugins: ["jest-watch-typeahead/filename", "jest-watch-typeahead/testname"],
  coverageThreshold: {
    global: {
      branches: 50,
    },
  },
};

export default createJestConfig(config);
