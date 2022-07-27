const path = require("path");
const fs = require("fs");

const cloneRepoCommands = {
  "clone-repo": {
    default: true,
    beforeInitilize: false,
    name: "clone-repo",
    describe: "Clone repo",
    handler: async (
      { values, env: { root } },
      { launchCommand, launchBlock }
    ) => {
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
            name: "Clone repo",
            "Repo ssh url": values.repoUrl,
            "Folder path": folderPath,
            "Root path": root,
          }
        );
      }

      await launchBlock(
        async () => {
          await launchCommand(`git pull`, {
            cwd: folderPath,
          });
        },
        {
          name: "Pull repo",
          "Folder path": folderPath,
        }
      );

      console.log(`Repo is pulled`);
    },
  },
};

module.exports.cloneRepoCommands = cloneRepoCommands;
