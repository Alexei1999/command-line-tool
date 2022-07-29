const path = require("path");
const fs = require("fs");

const { options } = require("../options");

const runRepoCommands = {
  downloadRepo: {
    default: true,
    name: "download-repo",
    label: "Download repo",
    description: "Download repo",
    requiredOptions: [options.repoUrl.name],
    contextPath: "path",
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
  },
  rewriteFiles: {
    default: true,
    name: "rewrite-files",
    label: "Rewrite files",
    description: "Rewrite files",
    handler: async (
      {
        values,
        ctx: {
          [runRepoCommands.downloadRepo.name]: { path: repoPath },
        },
      },
      { launchBlock, parseFileTemplate }
    ) => {
      if (!repoPath) {
        throw new Error("Repo path is required");
      }

      await launchBlock(
        () => {
          const configFile = parseFileTemplate(
            values.configFileTemplate,
            values
          );
          const filePath = path.resolve(repoPath, `./${values.configFileName}`);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(path.resolve(filePath));
          }

          fs.writeFileSync(filePath, configFile);
        },
        {
          name: "Rewriting config file",
          "Config file name": values.configFileName,
          "Config file template": values.configFileTemplate,
        }
      );

      await launchBlock(
        () => {
          const configFile = parseFileTemplate(values.npmrcTemplate, values);
          const filePath = path.resolve(repoPath, `./.npmrc`);

          if (fs.existsSync(filePath)) {
            fs.unlinkSync(path.resolve(filePath));
          }

          fs.writeFileSync(filePath, configFile);
        },
        {
          name: "Rewriting .npmrc file",
          "Npmrc file name": ".npmrc",
          "Npmrc file template": values.npmrcTemplate,
        }
      );
    },
  },
  runProject: {
    default: true,
    name: "run-project",
    description: "Run project",
    requiredOptions: [
      options.nexusLogin.name,
      options.nexusPassword.name,
      options.token.name,
      options.proxyUrl.name,
    ],
    handler: async (
      {
        ctx: {
          [runRepoCommands.downloadRepo.name]: { path },
        },
      },
      { launchCommand, launchBlock }
    ) => {
      await launchBlock(
        async () => {
          await launchCommand(`npm install --legacy-peer-deps`, {
            cwd: path,
          });
        },
        {
          name: "Installing npm",
          "Folder path": path,
        }
      );

      await launchBlock(
        async () => {
          await launchCommand(`npm run start:dev`, {
            cwd: path,
          });
        },
        {
          name: "Running npm",
          "Folder path": path,
        }
      );
    },
  },
};

module.exports.runRepoCommands = runRepoCommands;
