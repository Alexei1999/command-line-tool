const { promisifiedSpawn, promisifiedExec } = require("../utils/cmd-utils");

const getConfigurableLib = ({}, args) => ({
  execCommand: !args.useExec ? promisifiedSpawn : promisifiedExec,
});

module.exports.getConfigurableLib = getConfigurableLib;
