const { promisifiedSpawn, promisifiedExec } = require("../utils/cmd-utils");

const getConfigurableLib = ({}, args) => ({
  launchCommand: !args.useExec ? promisifiedSpawn : promisifiedExec,
});

module.exports.getConfigurableLib = getConfigurableLib;
