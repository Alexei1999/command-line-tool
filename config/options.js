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
    name: "branch",
    description: "Branch name",
    option: "--branch",
    alias: "-b",
    type: "string",
    defaultValue: DEFAULT_CONSTANTS.BRANCH,
    writeToConfig: false,
  },
  repoUrl: {
    name: "repoUrl",
    description: "Repo URL",
    option: "--repo-url",
    alias: "-ru",
    type: "string",
    writeToConfig: true,
    defaultValue: DEFAULT_CONSTANTS.REPO_URL,
  },
  configPath: {
    name: "config-path",
    description: "Config path",
    option: "--config-path",
    alias: "-cp",
    type: "string",
    defaultValue: DEFAULT_CONSTANTS.CONFIG_PATH,
  },
  configFileName: {
    name: "config-file-name",
    description: "Config file name",
    option: "--config-file-name",
    alias: "-cf",
    type: "string",
    defaultValue: DEFAULT_CONSTANTS.CONFIG_FILE_NAME,
    writeToConfig: false,
  },
  nexusLogin: {
    name: "nexus-login",
    description: "Nexus login",
    option: "--nexus-login",
    alias: "-nl",
    type: "string",
    writeToConfig: true,
  },
  nexusPassword: {
    name: "nexus-password",
    description: "Nexus password",
    option: "--nexus-password",
    alias: "-np",
    type: "string",
    writeToConfig: true,
  },
  configFileTemplate: {
    onlyFromConfig: true,
    name: "config-file-template",
    description: "Config file template",
    type: "string",
    defaultValue: DEFAULT_CONSTANTS.CONFIG_FILE_TEMPLATE,
  },
  npmrcTemplate: {
    onlyFromConfig: true,
    name: "npmrc-template",
    description: ".npmrc template",
    type: "string",
    defaultValue: DEFAULT_CONSTANTS.NPMRC_TEMPLATE,
  },
  token: {
    name: "token",
    description: "Token",
    option: "--token",
    alias: "-t",
    type: "string",
    writeToConfig: true,
  },
  proxyUrl: {
    name: "proxy-url",
    description: "Proxy url",
    option: "--proxy-url",
    alias: "-pu",
    type: "string",
    writeToConfig: true,
  },
  useExec: {
    name: "use-exec",
    description: "Use exec",
    fullDescription:
      "Use spawn or exec for executing commands. The difference is that spawn prints the output live, but throws an non-readable error.",
    option: "--use-exec",
    alias: "-ue",
    type: "boolean",
  },
};

module.exports.calculatedOptions = (definedValues = {}) => {
  return {
    npmrcToken: Buffer.from(
      `${definedValues.nexusLogin}:${definedValues.nexusPassword}`
    ).toString("base64"),
  };
};
