const { DEFAULT_CONSTANTS } = require("./constants.js");

module.exports.options = {
  option2: {
    name: "option2",
    describe: "Option 2",
    option: "--option2",
    alias: "-o2",
    type: "string",
    defaultValue: DEFAULT_CONSTANTS.TEMPLATE,
    writeToConfig: true,
    onlyFromConfig: true,
  },
  repoUrl: {
    name: "repoUrl",
    describe: "Repo URL",
    option: "--repo-url",
    alias: "-ru",
    type: "string",
    required: true,
    writeToConfig: true,
  },
  configPath: {
    name: "configPath",
    describe: "Config path",
    option: "--config-path",
    alias: "-cp",
    type: "string",
    required: true,
    writeToConfig: true,
    defaultValue: DEFAULT_CONSTANTS.CONFIG_PATH,
  },
};

module.exports.calculatedOptions = (definedValues) => {
  return {
    calcOption: Buffer.from(
      `${definedValues.option1}:${definedValues.option2}`
    ).toString("base64"),
  };
};
