const path = require("path");
const fs = require("fs");

const { options } = require("../../options");

const removeConfig = {
  name: "remove-config",
  label: "Remove config",
  description: "Remove config",
  allowedCommands: [],
  requiredOptions: [options.repoUrl.name],
  command: ["remove", "remove-config", "rc"],
  handle: async ({ safeArgValues, env: { root } }, { launchBlock }) => {
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
};

module.exports.removeConfig = removeConfig;
