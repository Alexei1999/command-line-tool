const { runRepoCommands } = require("./run-repo");
const { commonCommands } = require("./common");
const { configCommands } = require("./config");
const { removeCommands } = require("./remove");

const commands = {
  ...commonCommands,
  ...runRepoCommands,
  ...configCommands,
  ...removeCommands,
};

module.exports.commands = commands;
