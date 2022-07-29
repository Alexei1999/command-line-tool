const main = {
  description: "Run main commands.",
  core: true,
  handle: async (
    commonValues,
    helpers,
    { processCommand, checkNotEnoughOptions }
  ) => {
    const {
      targetCommands,
      options,
      ctx: context,
      argValues,
      calculatedOptions,
    } = commonValues;

    const targetOptionValues = Object.fromEntries(
      Object.entries(options).map(([id, option]) => {
        if (option.onlyFromConfig) {
          return [id, context?.config?.[id] || option.defaultValue];
        }

        return [
          id,
          argValues[id] || context?.config?.[id] || option.defaultValue,
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

    const mainCommands = Object.values(targetCommands).filter(
      (command) => !command.beforeInitilize
    );

    if (checkNotEnoughOptions(mainCommands, targetVariables)) {
      return process.exit(1);
    }

    for (let command of mainCommands) {
      await processCommand(command, context, targetValues, helpers);
    }
  },
};

module.exports.main = main;
