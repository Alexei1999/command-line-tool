const { promisifiedSpawn, promisifiedExec } = require("../utils/cmd-utils");
const { USE_SPAWN } = require("../config");

const getConfigurableLib = ({ useSpawn = USE_SPAWN }) => ({
  launchCommand: useSpawn ? promisifiedSpawn : promisifiedExec,
});

module.exports.getConfigurableLib = getConfigurableLib;
