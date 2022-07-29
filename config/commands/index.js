const { runRepoCommands } = require("./run-repo");
const { helpCommands } = require("./help");
const { configCommands } = require("./config");
const { removeCommands } = require("./remove");

const commands = {
  ...helpCommands,
  ...runRepoCommands,
  ...configCommands,
  ...removeCommands,
};

module.exports.commands = commands;
