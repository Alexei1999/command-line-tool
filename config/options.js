const { DEFAULT_CONSTANTS } = require("./constants.js");

module.exports.options = {
  option1: {
    name: "option1",
    describe: "Option 1",
    option: "--option1",
    alias: "-o1",
    type: "string",
  },
  repoUrl: {
    name: "repoUrl",
    describe: "Repo URL",
    option: "--repo-url",
    alias: "-ru",
    type: "string",
    required: true,
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
};

module.exports.calculatedOptions = (definedValues = {}) => {
  return {
    calcOption: Buffer.from(
      `${definedValues.option1}:${definedValues.option2}`
    ).toString("base64"),
  };
};
