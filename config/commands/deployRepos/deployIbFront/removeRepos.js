const path = require("path");
const fs = require("fs");

const { options } = require("./options/index");

const removeRepos = {
  name: "remove-repos",
  label: "Remove repos",
  description: "Remove repos",
  allowedCommands: [],
  requiredOptions: [options.repoUrl.name],
  command: ["remove", "remove-repos", "rr"],
  exitAfterExecute: true,
  filter: async ({ values }, { hasCommand }) => {
    if (values.removeRepos) {
      return true;
    }
    if (hasCommand(removeRepos.command)) {
      return true;
    }

    return false;
  },
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
        "Folder path": folderPath,
      }
    );
  },
};

module.exports.removeRepos = removeRepos;
