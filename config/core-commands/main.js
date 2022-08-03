const main = {
  description: "Run main commands.",
  core: true,
  handle: async (
    commonValues,
    helpers,
    { launchCommands, checkNotEnoughOptions }
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

    await launchCommands(mainCommands, context, targetValues, helpers);
  },
};

export { main };
