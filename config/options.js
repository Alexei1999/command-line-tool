const DEFAULT_CONSTANTS = {
  BRANCH: "feat/DBPAY/Add-new-import-models-locale",
  CONFIG_PATH: "config.json",

  CONFIG_FILE_TEMPLATE: `module.exports.proxy = {
  '/api': {
    target: '<proxyUrl>',
    secure: false,
    changeOrigin: true,
  }
}

module.exports.token = '<token>';`,

  NPMRC_TEMPLATE: `registry=https://nexus-ci.corp.dev.vtb/repository/pfomb-npm
strict-ssl=false
_auth=<npmrcToken>`,

  REPO_URL: "ssh://git@bitbucket.region.vtb.ru:7999/paym/payments-ui.git",
  BRANCH: "feat/DBPAY/Add-new-import-models-locale",
  CONFIG_FILE_NAME: "serverConfig.ts",
};

module.exports.options = {
  branch: {
    _params: ["--branch", "-b"],
    name: "branch",
    describe: "Branch name",
    option: "--branch",
    alias: "-b",
    type: "string",
    defaultValue: DEFAULT_CONSTANTS.BRANCH,
    writeToConfig: false,
  },
  repoUrl: {
    name: "repoUrl",
    describe: "Repo URL",
    option: "--repo-url",
    alias: "-ru",
    type: "string",
    writeToConfig: true,
    defaultValue: DEFAULT_CONSTANTS.REPO_URL,
  },
  configPath: {
    name: "configPath",
    describe: "Config path",
    option: "--config-path",
    alias: "-cp",
    type: "string",
    defaultValue: DEFAULT_CONSTANTS.CONFIG_PATH,
  },
  configFileName: {
    _params: ["--config-file-name", "-fn"],
    name: "config-file-name",
    describe: "Config file name",
    option: "--config-file-name",
    alias: "-cf",
    type: "string",
    defaultValue: DEFAULT_CONSTANTS.CONFIG_FILE_NAME,
    writeToConfig: false,
  },
  nexusLogin: {
    _params: ["--nexus-login", "-nl"],
    name: "nexus-login",
    describe: "Nexus login",
    option: "--nexus-login",
    alias: "-nl",
    type: "string",
    writeToConfig: true,
  },
  nexusPassword: {
    _params: ["--nexus-password", "-np"],
    name: "nexus-password",
    describe: "Nexus password",
    option: "--nexus-password",
    alias: "-np",
    type: "string",
    writeToConfig: true,
  },
  configFileTemplate: {
    onlyFromConfig: true,
    name: "config-file-template",
    describe: "Config file template",
    type: "string",
    defaultValue: DEFAULT_CONSTANTS.CONFIG_FILE_TEMPLATE,
  },
  npmrcTemplate: {
    onlyFromConfig: true,
    name: "npmrc-template",
    describe: ".npmrc template",
    type: "string",
    defaultValue: DEFAULT_CONSTANTS.NPMRC_TEMPLATE,
  },
  token: {
    name: "token",
    describe: "Token",
    option: "--token",
    alias: "-t",
    type: "string",
    writeToConfig: true,
  },
  proxyUrl: {
    name: "proxy-url",
    describe: "Proxy url",
    option: "--proxy-url",
    alias: "-pu",
    type: "string",
    writeToConfig: true,
  },
};

module.exports.calculatedOptions = (definedValues = {}) => {
  return {
    npmrcToken: Buffer.from(
      `${definedValues.nexusLogin}:${definedValues.nexusPassword}`
    ).toString("base64"),
  };
};
