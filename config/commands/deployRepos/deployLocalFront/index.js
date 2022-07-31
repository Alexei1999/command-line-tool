const { downloadRepo } = require("./downloadRepo");
const { rewriteFiles } = require("./rewriteFiles");
const { runProject } = require("./runProject");
const { removeRepo } = require("./removeRepo");

const { writeConfig } = require("../../config/writeConfig");
const { readConfig } = require("../../config/readConfig");

const { options, calculatedOptions } = require("./options");

const deployLocalFront = {
  default: true,
  name: "deploy-local-front",
  label: "Deploy local front",
  description: "Deploy local front",
  allowedCommands: [writeConfig.name, readConfig.name],
  options,
  calculatedOptions,
  handle: {
    removeRepo,
    downloadRepo,
    rewriteFiles,
    runProject,
  },
};

module.exports.deployLocalFront = deployLocalFront;
