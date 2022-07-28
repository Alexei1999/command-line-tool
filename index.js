const { options } = require("./config/options");
const { variables } = require("./config/variables");
const { calculatedOptions } = require("./config/options");
const { commands } = require("./config/commands/index");

const { commandLineTool } = require("./src/index");

commandLineTool(
  {
    commands,
    options,
    calculatedOptions,
    variables,
  }
);
