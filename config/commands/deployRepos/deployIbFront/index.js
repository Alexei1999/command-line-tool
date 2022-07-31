const { runProjects } = require("./runProjects");
const { installProjects } = require("./installProjects");
const { rewriteFiles } = require("./rewriteFiles");
const { downloadRepos } = require("./downloadRepos");
const { removeRepos } = require("./removeRepos");

const { writeConfig } = require("../../config/writeConfig");
const { readConfig } = require("../../config/readConfig");

const { options, calculatedOptions } = require("./options");

const deployIbFront = {
  name: "deploy-ib-front",
  label: "Deploy IB front",
  description: "Deploy IB front",
  runAsync: true,
  allowedCommands: [writeConfig.name, readConfig.name],
  options,
  calculatedOptions,
  handle: {
    removeRepos,
    downloadRepos,
    installProjects,
    runProjects,
  },
};

module.exports.deployIbFront = deployIbFront;
