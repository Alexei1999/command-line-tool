const path = require("path");
const fs = require("fs");

const { options } = require("../options");

const removeCommands = {
  removeConfig: {
    name: "remove-config",
    label: "Remove config",
    description: "Remove config",
    allowedCommands: [],
    requiredOptions: [options.repoUrl.name],
    command: ["remove", "remove-config", "rc"],
    handler: async ({ safeArgValues, env: { root } }, { launchBlock }) => {
      const targetPath = path.resolve(root, safeArgValues.configPath);

      await launchBlock(
        () => {
          fs.unlinkSync(targetPath);
        },
        {
          name: "Unlink config",
          fatal: false,
          "Config path": safeArgValues.configPath,
          "Resolved path for config file": targetPath,
        }
      );
    },
  },
  removeRepo: {
    name: "remove-repo",
    label: "Remove repo",
    description: "Remove repo",
    allowedCommands: [],
    requiredOptions: [options.repoUrl.name],
    command: ["remove", "remove-repo", "rr"],
    handler: async ({ values, env: { root } }, { launchBlock }) => {
      const folderName = values.repoUrl.split("/").pop().replace(".git", "");
      const folderPath = path.resolve(root, folderName);

      await launchBlock(
        () => {
          fs.rmdirSync(folderPath, { recursive: true, force: true });
        },
        {
          fatal: false,
          name: "Unlink repo",
          "Folder path": path,
        }
      );
    },
  },
};

module.exports.removeCommands = removeCommands;
