const { parseArgsLib } = require("./parse-args-lib.js");
const { commonLib } = require("./common-lib.js");

const { logErrorContext } = require("../utils/functional-utils");
const { contextSetter } = require("../utils/context-utils");

module.exports.core = async ({
  commands = {},
  options = {},
  calculatedOptions = {},
  variables = {},
}) => {
  const processedOptions = Object.fromEntries(
    Object.entries(options).map(([key, value]) => [
      key,
      {
        ...value,
        id: key,
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

        return [id, commonLib.getOptionValueByType(option)];
      })
  );

  const safeParsedArgs = Object.fromEntries(
    Object.entries(parsedArgs).map(([id, value]) => {
      if (!processedOptions[id]) {
        throw new Error(`Option ${id} is not defined`);
      }

      return [id, value || processedOptions[id].defaultValue];
    })
  );

  const context = {};

  const helpers = {
    ...commonLib,
    ...parseArgsLib,
    logErrorContext,
  };

  for (let command of Object.values(commands).filter(
    (command) => command.beforeInitilize
  )) {
    if (!command.default && !command.command && !command.option) {
      throw new Error(`Command ${command.name} has no command or option`);
    }

    if (
      command.default ||
      parseArgsLib.hasCommand(command.command) ||
      parseArgsLib.extractPresence(parseArgsLib.getOption(command.option))
    ) {
      const result = await command.handler(
        {
          options: processedOptions,
          commands,
          argValues: parsedArgs,
          safeArgValues: safeParsedArgs,
          calculatedOptions,
          env: variables,
          context,
        },
        helpers
      );
      contextSetter(command, context, result);

      if (command.exitAfterExecute) {
        return process.exit(0);
      }
    }
  }

  const targetOptionValues = Object.fromEntries(
    Object.entries(processedOptions).map(([id, option]) => {
      if (option.onlyFromConfig) {
        return [id, context?.config?.[id] || option.defaultValue];
      }

      return [
        id,
        parsedArgs[id] || context?.config?.[id] || option.defaultValue,
      ];
    })
  );

  const targetVariables = {
    ...targetOptionValues,
    ...calculatedOptions(targetOptionValues),
  };

  Object.entries(targetVariables).forEach(([id, targetValue]) => {
    if (processedOptions[id]?.required && !targetValue) {
      console.error(`${processedOptions[id].name} [${id}] is required`);
      logErrorContext(processedOptions[id].name, {
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
      parseArgsLib.extractPresence(parseArgsLib.getOption(command.option))
    ) {
      const result = await command.handler(
        {
          values: targetVariables,
          parsedArgs,
          commands,
          options: processedOptions,
          safeParsedArgs,
          calculatedOptions,
          env: variables,
          context,
        },
        helpers
      );
      contextSetter(command, context, result);

      if (command.exitAfterExecute) {
        return process.exit(0);
      }
    }
  }

  console.log("Process completed successfully");
  return process.exit(0);
};
