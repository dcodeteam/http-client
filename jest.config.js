"use strict";

module.exports = {
  testEnvironment: "node",
  setupFiles: ["<rootDir>/src/__testutils___/setupTests.ts"],
  transform: { "^.+\\.(ts|tsx)$": "babel-jest" },
  testMatch: ["**/*.spec.ts?(x)"],

  moduleFileExtensions: ["ts", "js"],
  coveragePathIgnorePatterns: [
    "/__mocks__/",
    "/__tests__/",
    "/__testutils___/"
  ],
  coverageThreshold: {
    global: { branches: 95, functions: 95, lines: 95, statements: 95 }
  }
};
