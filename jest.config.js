"use strict";

module.exports = {
  globals: {
    "ts-jest": {
      tsConfig: "./tsconfig.test.json",
      babelConfig: {
        presets: [["@babel/preset-env", { targets: { node: true } }]]
      }
    }
  },

  testEnvironment: "node",
  setupFiles: ["<rootDir>/config/jest.js"],
  transform: { ".ts": "ts-jest" },
  testMatch: ["**/src/**/*.spec.ts"],
  moduleFileExtensions: ["ts", "js"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/__tests__/**/*.ts"],
  coverageThreshold: {
    global: { branches: 95, functions: 95, lines: 95, statements: 95 }
  }
};
