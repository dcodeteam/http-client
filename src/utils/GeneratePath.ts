import { PathFunction, compile } from "path-to-regexp";

let cacheCount = 0;
const cacheLimit = 10000;
const patternCache: { [urlPattern: string]: PathFunction } = {};

function compileGenerator(urlPattern: string): PathFunction {
  if (patternCache[urlPattern]) {
    return patternCache[urlPattern];
  }

  const compiledGenerator = compile(urlPattern);

  /* istanbul ignore else */
  if (cacheCount < cacheLimit) {
    cacheCount += 1;

    patternCache[urlPattern] = compiledGenerator;
  }

  return compiledGenerator;
}

export function generatePath(
  urlPattern: string,
  urlParams: object | undefined
): string {
  if (!urlPattern || !urlParams) {
    return urlPattern;
  }

  const generator = compileGenerator(urlPattern);

  return generator(urlParams);
}
