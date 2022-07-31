const { parseArgsLib } = require("../helpers/parse-args-lib.js");
const { commonLib } = require("../helpers/common-lib.js");
const { getConfigurableLib } = require("../helpers/configurable-lib.js");
const { logErrorContext } = require("../utils/functional-utils.js");
const { launchCommand, launchCommands } = require("../utils/context-utils.js");

const { expandCommands } = require("../utils/expand-commands.js");

const initVariables = ({
  commands = {},
  options: commonOptions = {},
  calculatedOptions: commonCalculatedOptions = () => ({}),
  variables = {},
}) => {
  const context = {};

  const processedCommands = Object.fromEntries(
    Object.entries(commands).map(([key, value]) => [
      key,
      {
        ...value,
        id: key,
      },
    ])
  );

  const filteredCommands = Object.fromEntries(
    Object.entries(expandCommands(processedCommands)).filter(([_, command]) => {
      if (!command.default && !command.command && !command.option) {
        throw new Error(`Command ${command.name} has no command or option`);
      }

      return (
        command.default ||
        (command.command && Array.isArray(command.command)
          ? command.command.some(parseArgsLib.hasCommand)
          : parseArgsLib.hasCommand(command.command)) ||
        (command.option &&
          parseArgsLib.extractPresence(parseArgsLib.getOption(command.option)))
      );
    })
  );

  console.log(filteredCommands);

  const nonAlternateCommand = Object.values(filteredCommands).find((command) =>
    Array.isArray(command.allowedCommands)
  );

  const targetCommands =
    nonAlternateCommand && Array.isArray(nonAlternateCommand.allowedCommands)
      ? Object.fromEntries(
          Object.entries(filteredCommands).filter(([_, command]) => {
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
      : filteredCommands;

  const bundledOptions = {
    ...commonOptions,
    ...Object.values(targetCommands).reduce((acc, command) => {
      if (command.options) {
        return {
          ...acc,
          ...command.options,
        };
      }

      return acc;
    }, {}),
  };

  const processedOptions = Object.fromEntries(
    Object.entries(bundledOptions).map(([key, value]) => [
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

  const calculatedOptions = (values) => ({
    ...commonCalculatedOptions(values),
    ...Object.values(targetCommands).reduce((acc, command) => {
      if (command.calculatedOptions) {
        return {
          ...acc,
          ...command.calculatedOptions(values),
        };
      }

      return acc;
    }),
  });

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

  const helpers = {
    ...commonLib,
    ...parseArgsLib,
    logErrorContext,
    setContextValue: (path, value) => setValueByPath(path, context, value),
    ...getConfigurableLib({}, safeParsedArgs),
  };

  const commonValues = {
    options: processedOptions,
    calculatedOptions,
    commands: processedCommands,
    targetCommands,
    argValues: parsedArgs,
    safeArgValues: safeParsedArgs,
    env: variables,
    ctx: context,
  };

  const commanderHelpers = {
    checkNotEnoughOptions,
    launchCommand,
    launchCommands,
  };

  return {
    context,
    helpers,
    commonValues,
    commanderHelpers,
  };
};

module.exports.initVariables = initVariables;
