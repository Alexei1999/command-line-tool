const { initVariables } = require("../helpers/init-variables.js");

const { processCommand } = require("../utils/context-utils");

/**
 * Parse command line arguments and run the commands.
 * @param {Object} options - Options object.
 * @param {Object} options.coreCommands - Core commands object.
 * @param {Object} options.commands - Commands object.
 * @param {Object} options.options - Options object.
 * @param {Function} options.calculatedOptions - Calculated options object.
 * @param {Object} options.variables - Variables object.
 *
 * @param {Object} configs - Config object.
 */
module.exports.core = async ({
  coreCommands = {},
  commands = {},
  options = {},
  calculatedOptions = () => ({}),
  variables = {},
} = {}) => {
  try {
    const { helpers, commonValues, context, commanderHelpers } = initVariables({
      commands,
      options,
      calculatedOptions,
      variables,
    });

    for (let command of Object.values(coreCommands)) {
      await processCommand(
        command,
        context,
        commonValues,
        helpers,
        commanderHelpers
      );
    }

    console.log("Process completed successfully");
    return process.exit(0);
  } catch (e) {
    console.error(e);
    return process.exit(1);
  }
};
