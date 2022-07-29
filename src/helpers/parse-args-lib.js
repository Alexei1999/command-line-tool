const args = process.argv.slice(2);

const parseArgsLib = {
  extractValue(config) {
    if (!config) {
      throw new Error(`Config ${config} is required`);
    }

    const { value } = config;

    return value;
  },
  extractPresence(config) {
    if (!config) {
      throw new Error(`Argument ${config} is required`);
    }

    const { notFound } = config;

    return !notFound;
  },
  hasCommand(targetCommand) {
    if (!targetCommand) {
      throw new Error(`Command ${targetCommand} is required`);
    }

    return args.includes(targetCommand);
  },
  getOption(inputArgsOrArg, { defaultValue, anyValue = false } = {}) {
    if (!inputArgsOrArg) {
      throw new Error(`Argument ${inputArgsOrArg} is required`);
    }

    const arrayFindIndexHandler = (a) => {
      return inputArgsOrArg.some((target) => a.startsWith(target));
    };
    const singleFindIndexHandler = (a) => {
      return a.startsWith(inputArgsOrArg);
    };

    const index = args.findIndex(
      Array.isArray(inputArgsOrArg)
        ? arrayFindIndexHandler
        : singleFindIndexHandler
    );

    const isArgumentNotFound = index === -1;
    const isValueNotFound =
      index === -1 ||
      !args[index + 1] ||
      (!anyValue && args[index + 1].startsWith("-"));
    const isUsedDefaultValue = isValueNotFound && defaultValue;
    const value = isUsedDefaultValue
      ? defaultValue
      : isValueNotFound
      ? undefined
      : args[index + 1];

    return {
      notFound: isArgumentNotFound,
      emptyValue: isValueNotFound,
      value: value,
      usedDefault: isUsedDefaultValue,
    };
  },
};

module.exports.parseArgsLib = parseArgsLib;
