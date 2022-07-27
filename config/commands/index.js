const { cloneRepoCommands } = require("./clone-repo");
const { commonCommands } = require("./common");
const { configCommands } = require("./config");

const commands = {
  ...cloneRepoCommands,
  ...commonCommands,
  ...configCommands,
};

module.exports.commands = commands;
