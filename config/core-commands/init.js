const init = {
  description: "Run initialization commands.",
  core: true,
  handle: async (
    commonValues,
    helpers,
    { launchCommands, checkNotEnoughOptions }
  ) => {
    const { targetCommands, ctx: context, safeArgValues } = commonValues;

    const beforeInitCommands = Object.values(targetCommands).filter(
      (command) => command.beforeInitilize
    );

    if (checkNotEnoughOptions(beforeInitCommands, safeArgValues)) {
      return process.exit(1);
    }

    await launchCommands(beforeInitCommands, context, commonValues, helpers);
  },
};

module.exports.init = init;
