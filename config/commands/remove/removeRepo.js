const path = require("path");
const fs = require("fs");

const { options } = require("../../options");

const removeRepo = {
  name: "remove-repo",
  label: "Remove repo",
  description: "Remove repo",
  allowedCommands: [],
  requiredOptions: [options.repoUrl.name],
  command: ["remove", "remove-repo", "rr"],
  handle: async ({ values, env: { root } }, { launchBlock }) => {
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
};

module.exports.removeRepo = removeRepo;
