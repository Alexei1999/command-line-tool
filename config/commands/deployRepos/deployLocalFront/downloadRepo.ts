import path from "path";
import fs from "fs";

import { options } from "./options/index";

export const downloadRepo = {
  requiredOptions: [options.repoUrl.name],
  contextPath: "path",
  name: "download-repo",
  handle: async ({ values, env: { root } }, { execCommand, launchBlock }) => {
    const folderName = values.repoUrl.split("/").pop().replace(".git", "");
    const folderPath = path.resolve(root, folderName);

    if (fs.existsSync(folderPath)) {
      console.log(`Folder ${folderPath} is already exists`);
    } else {
      await launchBlock(
        async () => {
          await execCommand(`git clone ${values.repoUrl}`, {
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
        await execCommand(`git checkout ${values.branch}`, {
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
        await execCommand(`git pull`, {
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
