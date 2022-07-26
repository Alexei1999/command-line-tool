const { DEFAULT_CONSTANTS } = require("./constants.js");

module.exports.options = {
  option1: {
    name: "option1",
    describe: "Option 1",
    option: "--option1",
    alias: "-o1",
    type: "boolean",
    required: true,
  },
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
  repoSshUrl: {
    name: "repoSshUrl",
    describe: "Repo SSH URL",
    option: "--repo-ssh-url",
    alias: "-rs",
    type: "string",
    required: true,
    writeToConfig: true,
  },
};

module.exports.getCalculatedOptions = (definedValues) => {
  return {
    calcOption: Buffer.from(
      `${definedValues.option1}:${definedValues.option2}`
    ).toString("base64"),
  };
};
