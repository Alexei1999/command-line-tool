const path = require("path");
const fs = require("fs");

const { options } = require("../../../options");

const downloadRepo = {
  requiredOptions: [options.repoUrl.name],
  contextPath: "path",
  name: "download-repo",
  handle: async ({ values, env: { root } }, { launchCommand, launchBlock }) => {
    const folderName = values.repoUrl.split("/").pop().replace(".git", "");
    const folderPath = path.resolve(root, folderName);

    if (fs.existsSync(folderPath)) {
      console.log(`Folder ${folderPath} is already exists`);
    } else {
      await launchBlock(
        async () => {
          await launchCommand(`git clone ${values.repoUrl}`, {
            cwd: root,
          });
        },
        {
          name: "Cloning repo",
          "Repo ssh url": values.repoUrl,
          "Folder path": folderPath,
          "Root path": root,
        }
      );
    }

    await launchBlock(
      async () => {
        await launchCommand(`git checkout ${values.branch}`, {
          cwd: folderPath,
        });
      },
      {
        name: "Branch checkout",
        Branch: values.branch,
      }
    );

    await launchBlock(
      async () => {
        await launchCommand(`git pull`, {
          cwd: folderPath,
        });
      },
      {
        name: "Pulling repo",
        "Folder path": folderPath,
        fatal: false,
      }
    );

    return folderPath;
  },
};

module.exports.downloadRepo = downloadRepo;
