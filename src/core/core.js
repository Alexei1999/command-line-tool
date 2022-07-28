const { parseArgsLib } = require("../helpers/parse-args-lib.js");
const { commonLib } = require("../helpers/common-lib.js");
const { getConfigurableLib } = require("../helpers/configurable-lib.js");

const { logErrorContext } = require("../utils/functional-utils");
const { processCommand } = require("../utils/context-utils");

const { setValueByPath } = require("../utils/functional-utils");

/**
 * Parse command line arguments and run the commands.
 * @param {Object} options - Options object.
 * @param {Object} options.commands - Commands object.
 * @param {Object} options.options - Options object.
 * @param {Function} options.calculatedOptions - Calculated options object.
 * @param {Object} options.variables - Variables object.
 *
 * @param {Object} configs - Config object.
 */
module.exports.core = async ({
  commands = {},
  options = {},
  calculatedOptions = () => ({}),
  variables = {},
} = {}) => {
  try {
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

    const processedCommands = Object.fromEntries(
      Object.entries(commands)
        .filter(([_, command]) => {
          if (!command.default && !command.command && !command.option) {
            throw new Error(`Command ${command.name} has no command or option`);
          }

          return (
            command.default ||
            (command.command && Array.isArray(command.command)
              ? command.command.some(parseArgsLib.hasCommand)
              : parseArgsLib.hasCommand(command.command)) ||
            (command.option &&
              parseArgsLib.extractPresence(
                parseArgsLib.getOption(command.option)
              ))
          );
        })
        .map(([key, value]) => [
          key,
          {
            ...value,
            id: key,
          },
        ])
    );

    const nonAlternateCommand = Object.values(processedCommands).find(
      (command) => Array.isArray(command.allowedCommands)
    );

    const targetCommands =
      nonAlternateCommand && Array.isArray(nonAlternateCommand.allowedCommands)
        ? Object.fromEntries(
            Object.entries(processedCommands).filter(([_, command]) => {
              if (
                nonAlternateCommand.allowedCommands.includes(command.id) ||
                nonAlternateCommand.allowedCommands.includes(command.name)
              ) {
                return true;
              }

              const leftCommands = Array.isArray(command.command)
                ? command.command
                : [command.command];
              const rightCommands = Array.isArray(nonAlternateCommand.command)
                ? nonAlternateCommand.command
                : [nonAlternateCommand.command];
              const equalCommands =
                command.command &&
                nonAlternateCommand.command &&
                leftCommands.some((leftCommand) =>
                  rightCommands.includes(leftCommand)
                );

              const leftOptions = Array.isArray(command.option)
                ? command.option
                : [command.option];
              const rightOptions = Array.isArray(nonAlternateCommand.option)
                ? nonAlternateCommand.option
                : [nonAlternateCommand.option];
              const equalOptions =
                command.option &&
                nonAlternateCommand.option &&
                leftOptions.some((leftOption) =>
                  rightOptions.includes(leftOption)
                );

              if (equalCommands || equalOptions) {
                return true;
              }

              return false;
            })
          )
        : processedCommands;

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
      setContextValue: (path, value) => setValueByPath(path, context, value),
      ...getConfigurableLib({}, safeParsedArgs),
    };

    const commonValues = {
      options,
      commands,
      targetCommands,
      argValues: parsedArgs,
      safeArgValues: safeParsedArgs,
      calculatedOptions,
      env: variables,
      context,
    };

    const checkNotEnoughOptions = (commands, variables) => {
      const requiredOptions = commands
        .filter((command) => Array.isArray(command.requiredOptions))
        .flatMap((command) => command.requiredOptions);

      let notFoundOptions = false;
      Object.entries(variables)
        .filter(([id]) => {
          return (
            processedOptions[id]?.required ||
            requiredOptions.includes(id) ||
            requiredOptions.includes(processedOptions[id]?.name)
          );
        })
        .forEach(([id, targetValue]) => {
          if (targetValue !== undefined && targetValue !== null) {
            return;
          }

          console.error(`${processedOptions[id].name} [${id}] is required`);
          logErrorContext(processedOptions[id].name, {
            "Command line argument": processedOptions[id]?.onlyFromConfig
              ? "only from config"
              : parsedArgs[id]?.parseConfig?.arg,
            "Config file": context?.config?.[id],
            "Default value": processedOptions?.[id].defaultValue,
          });

          notFoundOptions = true;
        });

      return notFoundOptions;
    };

    const beforeInitCommands = Object.values(targetCommands).filter(
      (command) => command.beforeInitilize
    );

    if (checkNotEnoughOptions(beforeInitCommands, safeParsedArgs)) {
      return process.exit(1);
    }

    for (let command of beforeInitCommands) {
      await processCommand(command, context, commonValues, helpers);
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

    const targetValues = {
      values: targetVariables,
      ...commonValues,
    };

    const afterInitCommands = Object.values(targetCommands).filter(
      (command) => !command.beforeInitilize
    );

    if (checkNotEnoughOptions(afterInitCommands, targetVariables)) {
      return process.exit(1);
    }

    for (let command of afterInitCommands) {
      await processCommand(command, context, targetValues, helpers);
    }

    console.log("Process completed successfully");
    return process.exit(0);
  } catch (e) {
    console.error(e);
    return process.exit(1);
  }
};
