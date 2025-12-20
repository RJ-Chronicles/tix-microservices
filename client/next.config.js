const config = {
  turbopack: {},
};

if (process.env.NODE_ENV === 'development') {
  config.webpack = (cfg) => {
    cfg.watchOptions = cfg.watchOptions || {};
    cfg.watchOptions.poll = 300;
    return cfg;
  };
}

export default config;
