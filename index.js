const { options } = require("./config/options");
const { calculatedOptions } = require("./config/options");
const { commands } = require("./config/commands");

const { commandLineTool } = require("./src/index");

commandLineTool({
  commands,
  options,
  calculatedOptions,
});
