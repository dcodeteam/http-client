/* eslint-disable typescript/no-explicit-any */

export default {
  isCancel: (x?: any) => x && x.isCancel,

  CancelToken: { source: () => ({ token: {}, cancel: () => {} }) },

  create: () => ({
    request: (config: any) =>
      new Promise((resolve, reject) => {
        if (config.url === "error") {
          const error = new Error("Http Error") as any;

          error.config = config;

          reject(error);
        } else if (config.url === "cancel") {
          const error = new Error("Cancel Error") as any;

          error.isCancel = true;

          reject(error);
        } else {
          resolve({ data: config });
        }
      })
  })
};
