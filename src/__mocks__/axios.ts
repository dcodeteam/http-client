const axios = {
  isCancel: jest.fn(x => x && x.isCancel),

  CancelTokens: [],
  CancelToken: {
    source: jest.fn(() => {
      const cancelToken = {
        token: {},
        cancel: jest.fn()
      };

      // @ts-ignore
      axios.CancelTokens.push(cancelToken);

      return cancelToken;
    })
  },

  instances: [],
  create: jest.fn(() => {
    const instance = {
      request: jest.fn(
        config =>
          new Promise((resolve, reject) => {
            if (config.url === "error") {
              const error = new Error("Http Error");

              // @ts-ignore
              error.config = config;

              reject(error);
            } else if (config.url === "cancel") {
              const error = new Error("Cancel Error");

              // @ts-ignore
              error.isCancel = true;

              reject(error);
            } else {
              resolve({ data: config });
            }
          })
      )
    };

    // @ts-ignore
    axios.instances.push(instance);

    return instance;
  })
};

export default axios;
