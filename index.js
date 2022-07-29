const { options } = require("./config/options");
const { variables } = require("./config/variables");
const { calculatedOptions } = require("./config/options");
const { commands } = require("./config/commands/index");
const { coreCommands } = require("./config/commands/core-commands");

const { commandLineTool } = require("./src/index");

commandLineTool({
  coreCommands,
  commands,
  options,
  calculatedOptions,
  variables,
});
