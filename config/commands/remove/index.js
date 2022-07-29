const { removeConfig } = require("./removeConfig");
const { removeRepo } = require("./removeRepo");

const remove = {
  removeConfig,
  removeRepo,
};

module.exports.remove = remove;
