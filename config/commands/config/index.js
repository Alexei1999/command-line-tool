const { readConfig } = require("./readConfig");
const { writeConfig } = require("./writeConfig");

const config = {
  readConfig,
  writeConfig,
};

module.exports.config = config;
