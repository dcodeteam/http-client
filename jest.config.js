"use strict";

module.exports = {
  testEnvironment: "node",
  setupFiles: ["<rootDir>/config/jest.js"],
  transform: { "^.+\\.(ts|tsx)$": "babel-jest" },
  testMatch: ["**/src/**/*.spec.ts"],
  moduleFileExtensions: ["ts", "js"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/__tests__/**/*.ts"],
  coverageThreshold: {
    global: { branches: 95, functions: 95, lines: 95, statements: 95 }
  }
};
