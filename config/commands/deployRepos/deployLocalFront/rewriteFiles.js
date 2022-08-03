import { resolve } from "path";
import { existsSync, unlinkSync, writeFileSync } from "fs";

import { downloadRepo } from "./downloadRepo";

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
        const filePath = resolve(repoPath, `./${values.configFileName}`);
        if (existsSync(filePath)) {
          unlinkSync(resolve(filePath));
        }

        writeFileSync(filePath, configFile);
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
        const filePath = resolve(repoPath, `./.npmrc`);

        if (existsSync(filePath)) {
          unlinkSync(resolve(filePath));
        }

        writeFileSync(filePath, configFile);
      },
      {
        name: "Rewriting .npmrc file",
        "Npmrc file name": ".npmrc",
        "Npmrc file template": values.npmrcTemplate,
      }
    );
  },
};

export { rewriteFiles };
