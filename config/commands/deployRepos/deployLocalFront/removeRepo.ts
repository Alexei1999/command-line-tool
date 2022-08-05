import { resolve } from "path";
import { rmdirSync } from "fs";

import { options } from "./options/index";

const removeRepo = {
  name: "remove-repo",
  label: "Remove repo",
  description: "Remove repo",
  allowedCommands: [],
  requiredOptions: [options.repoUrl.name],
  command: ["remove", "remove-repo", "rr"],
  exitAfterExecute: true,
  filter: async ({ values }, { hasCommand }) => {
    if (values.removeRepo) {
      return true;
    }
    if (hasCommand(removeRepo.command)) {
      return true;
    }

    return false;
  },
  handle: async ({ values, env: { root } }, { launchBlock }) => {
    const folderName = values.repoUrl.split("/").pop().replace(".git", "");
    const folderPath = resolve(root, folderName);

    await launchBlock(
      () => {
        rmdirSync(folderPath, { recursive: true, force: true });
      },
      {
        fatal: false,
        name: "Unlink repo",
        "Folder path": folderPath,
      }
    );
  },
};

export { removeRepo };
