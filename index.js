const fs = require("fs");
const path = require("path");

const { options } = require("./config/options");
const { getCalculatedOptions } = require("./config/options");

const { parseArgsLib } = require("./helpers/parse-args-lib.js");
const { commonLib } = require("./helpers/common-lib.js");
const { commands } = require("./config/commands");

const context = {};

const processedOptions = Object.fromEntries(
  Object.entries(options).map(([key, value]) => [
    key,
    {
      ...value,
      _params:
        value.option && value.alias
          ? [value.option, value.alias]
          : value.option || value.alias,
    },
  ])
);

const parsedArgs = Object.fromEntries(
  Object.entries(processedOptions)
    .filter(([_, option]) => !option.onlyFromConfig)
    .map(([id, option]) => {
      if (!option._params || option._params.length === 0) {
        throw new Error(`Option ${id} has no params`);
      }

      const parseConfig = parseArgsLib.getOption(option._params);
      const argValue = commonLib.getOptionValuesFromArgs(option);

      return [
        id,
        {
          config: parseConfig,
          value: argValue,
        },
      ];
    })
);

(async () => {
  const safedParsedArgs = Object.fromEntries(
    Object.entries(parsedArgs)
      .filter(([id]) => Boolean(processedOptions[id].defaultValue))
      .map(([id, option]) => {
        if (!parsedArgs[id]) {
          throw new Error(`Option ${id} is not defined`);
        }

        return [id, option.value || processedOptions[id].defaultValue];
      })
  );

  for (let command of Object.values(commands).filter(
    (command) => command.beforeInitilize
  )) {
    if (!command.default && !command.command && !command.option) {
      throw new Error(`Command ${command.name} has no command or option`);
    }

    if (
      command.default ||
      parseArgsLib.hasCommand(command.command) ||
      parseArgsLib.hasOption(parseArgsLib.getOption(command.option))
    ) {
      const result = await command.handler(
        { parsedArgs, processedOptions, safedParsedArgs },
        context
      );
      if (command.contextVariable) {
        context[command.contextVariable] = result;
      }

      if (command.exitAfterExecute) {
        return process.exit(0);
      }
    }
  }

  const targetOptionValues = Object.fromEntries(
    Object.entries(processedOptions).map(([id, option]) => {
      if (option.onlyFromConfig) {
        return [id, config?.[id] || option.defaultValue];
      }

      return [id, parsedArgs[id].value || config?.[id] || option.defaultValue];
    })
  );

  const targetVariables = {
    ...targetOptionValues,
    ...getCalculatedOptions(targetOptionValues),
  };

  Object.entries(targetVariables).forEach(([id, targetValue]) => {
    if (processedOptions[id]?.required && !targetValue) {
      console.error(`${processedOptions[id].name} [${id}] is required`);
      commonLib.logErrorContext(processedOptions[id].name, {
        "Command line argument": option[id]?.onlyFromConfig
          ? "only from config"
          : parsedArgs[id].parseConfig.arg,
        "Config file": config?.[id],
        "Default value": processedOptions[id].defaultValue,
      });
    }
  });

  const isMissingRequiredFields = Object.entries(processedOptions).some(
    ([id, option]) => {
      return option.required && !targetVariables[id];
    }
  );
  if (isMissingRequiredFields) {
    return process.exit(1);
  }

  for (let command of Object.values(commands).filter(
    (command) => !command.beforeInitilize
  )) {
    if (!command.default && !command.command && !command.option) {
      throw new Error(`Command ${command.name} has no command or option`);
    }

    if (
      command.default ||
      parseArgsLib.hasCommand(command.command) ||
      parseArgsLib.hasOption(parseArgsLib.getOption(command.option))
    ) {
      const result = await command.handler(
        { values: targetVariables, parsedArgs },
        context
      );
      if (command.contextVariable) {
        context[command.contextVariable] = result;
      }
      if (command.exitAfterExecute) {
        return process.exit(0);
      }
    }
  }

  return process.exit(0);
})();
