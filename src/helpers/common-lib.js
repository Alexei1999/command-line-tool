import { logErrorContext } from "../utils/functional-utils";

import { pipeLine } from "../utils/functional-utils";

import { parseArgsLib } from "./parse-args-lib";

const commonLib = {
  parseFileTemplate(template, args) {
    if (!template) {
      throw new Error(`Template file is not defined: ${template}`);
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
      const result = await callback();

      name && console.log(`${name}: finished`);
      return result;
    } catch (e) {
      errorName && console.error(errorName);
      name && console.error(`${name}: failed`);

      name &&
        logErrorContext(
          name,
          fatal
            ? errorDetails
            : {
                fatal: false,
                ...errorDetails,
              },
          e
        );

      if (fatal) {
        throw e;
      }

      if (typeof errorCallbackOrConfig === "function") {
        return await errorCallbackOrConfig();
      }
    }
  },
};

export { commonLib };
