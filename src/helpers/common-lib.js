const { USE_SPAWN } = require("../config");

const { parseArgsLib } = require("./parse-args-lib.js");
const { logErrorContext } = require("../utils/functional-utils");

const { pipeLine } = require("../utils/functional-utils");
const { promisifiedSpawn, promisifiedExec } = require("../utils/cmd-utils");

const commonLib = {
  launchCommand: USE_SPAWN ? promisifiedSpawn : promisifiedExec,
  parseFileTemplate(template, args) {
    if (!template) {
      throw new Error(`Config file template is not defined: ${template}`);
    }

    let modifiedTemplate = template;

    Object.entries(args).forEach(([key, value]) => {
      modifiedTemplate = modifiedTemplate.replace(`<${key}>`, value);
    });

    return modifiedTemplate;
  },
  getOptionValueByType: (option) => {
    if (!option) {
      throw new Error(`Option ${option} is required`);
    }

    if (option.onlyFromConfig) {
      return null;
    }

    switch (option.type) {
      case "string":
        return pipeLine(
          parseArgsLib.getOption(option._params),
          parseArgsLib.extractValue
        );
      case "boolean":
        return pipeLine(
          parseArgsLib.getOption(option._params),
          parseArgsLib.extractPresence
        );
      default:
        throw new Error(`Option ${option} is not valid`);
    }
  },
  async launchBlock(callback, errorCallbackOrConfig, config) {
    const {
      name,
      errorName,
      fatal = true,
      ...errorDetails
    } = typeof errorCallbackOrConfig === "function"
      ? config
      : errorCallbackOrConfig;

    name && console.log(name);
    try {
      return await callback();
    } catch (e) {
      errorName && console.error(errorName);
      name && console.error(`${name}: failed`);

      name && logErrorContext(name, errorDetails, e);

      fatal && process.exit(1);

      if (typeof errorCallbackOrConfig === "function") {
        return await errorCallbackOrConfig();
      }
    }
    name && console.log(`${name}: finished`);
  },
};

module.exports.commonLib = commonLib;
