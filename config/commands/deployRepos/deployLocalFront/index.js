const { downloadRepo } = require("./downloadRepo");
const { rewriteFiles } = require("./rewriteFiles");
const { runProject } = require("./runProject");

const deployLocalFront = {
  default: true,
  name: "deploy-local-front",
  label: "Deploy local front",
  description: "Deploy local front",
  allowedCommands: ["write-config", "read-config"],
  handle: {
    downloadRepo,
    rewriteFiles,
    runProject,
  },
};

module.exports.deployLocalFront = deployLocalFront;
