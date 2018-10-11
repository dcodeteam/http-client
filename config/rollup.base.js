"use strict";

const replace = require("rollup-plugin-replace");
const prettier = require("rollup-plugin-prettier");
const typescript = require("rollup-plugin-typescript2");

module.exports = function createRollupConfig({ target }) {
  return {
    input: "./src/index.ts",
    output: {
      file: `./http-client.${target}.js`,
      format: target.startsWith("es") ? "es" : target
    },
    external(id) {
      switch (id) {
        case "axios":
        case "tslib":
        case "path-to-regexp":
          return true;
        default:
          return id.startsWith("rxjs");
      }
    },
    plugins: [
      typescript({
        clean: true,
        tsconfig: `./tsconfig.build.json`,
        tsconfigOverride: {
          compilerOptions: {
            module: "es2015",
            target: target === "es2015" ? "es2015" : "es5"
          }
        }
      }),

      target === "es" && replace({ values: { rxjs: "rxjs/_esm5" } }),
      target === "es2015" && replace({ values: { rxjs: "rxjs/_esm2015" } }),

      prettier({ parser: "babylon" })
    ].filter(Boolean)
  };
};
