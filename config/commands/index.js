const { deployRepos } = require("./deployRepos/index");
const { help } = require("./help/index");
const { config } = require("./config/index");
const { remove } = require("./remove/index");

const commands = {
  ...help,
  ...deployRepos,
  ...config,
  ...remove,
};

module.exports.commands = commands;
