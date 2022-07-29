const path = require("path");
const fs = require("fs");

const { downloadRepo } = require("./downloadRepo");

const rewriteFiles = {
  name: "rewrite-files",
  handle: async (
    {
      values,
      ctx: {
        [downloadRepo.name]: { path: repoPath },
      },
    },
    { launchBlock, parseFileTemplate }
  ) => {
    if (!repoPath) {
      throw new Error("Repo path is required");
    }

    await launchBlock(
      () => {
        const configFile = parseFileTemplate(values.configFileTemplate, values);
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
};

module.exports.rewriteFiles = rewriteFiles;
