const init = {
  description: "Run initialization commands.",
  core: true,
  handle: async (
    commonValues,
    helpers,
    { processCommand, checkNotEnoughOptions }
  ) => {
    const { targetCommands, ctx: context, safeArgValues } = commonValues;

    const beforeInitCommands = Object.values(targetCommands).filter(
      (command) => command.beforeInitilize
    );

    if (checkNotEnoughOptions(beforeInitCommands, safeArgValues)) {
      return process.exit(1);
    }

    for (let command of beforeInitCommands) {
      await processCommand(command, context, commonValues, helpers);
    }
  },
};

module.exports.init = init;
