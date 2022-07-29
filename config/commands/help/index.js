const { man } = require("./man");
const { help: _help } = require("./help");

const help = {
  man,
  help: _help,
};

module.exports.help = help;
