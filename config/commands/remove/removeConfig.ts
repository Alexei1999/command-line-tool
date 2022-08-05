import { resolve } from "path";
import { unlinkSync } from "fs";

import { options } from "../../options";

const removeConfig = {
  name: "remove-config",
  label: "Remove config",
  description: "Remove config",
  allowedCommands: [],
  command: ["remove", "remove-config", "rc"],
  handle: async ({ safeArgValues, env: { root } }, { launchBlock }) => {
    const targetPath = resolve(root, safeArgValues.configPath);

    await launchBlock(
      () => {
        unlinkSync(targetPath);
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

export { removeConfig };
