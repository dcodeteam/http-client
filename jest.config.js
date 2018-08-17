"use strict";

module.exports = {
  globals: {
    "ts-jest": {
      useBabelrc: true,
      tsConfigFile: "tsconfig.test.json"
    }
  },

  testEnvironment: "node",
  setupFiles: ["<rootDir>/config/jest.js"],
  transform: {
    ".ts": "ts-jest"
  },
  testMatch: ["**/src/**/*.spec.ts"],
  moduleFileExtensions: ["ts", "js"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/__tests__/**/*.ts"],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  }
};