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
  hasCommand(targetCommandOrCommands) {
    if (!targetCommandOrCommands) {
      throw new Error(`Command ${targetCommandOrCommands} is required`);
    }

    if (Array.isArray(targetCommandOrCommands)) {
      return targetCommandOrCommands.some((command) => args.includes(command));
    }

    return args.includes(targetCommandOrCommands);
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
