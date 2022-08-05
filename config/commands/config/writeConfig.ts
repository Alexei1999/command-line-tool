import { resolve } from "path";
import { existsSync, unlinkSync, writeFileSync } from "fs";

const writeConfig = {
  contextVariable: "config",
  name: "write-config",
  description: "Write config",
  default: true,
  handle: async ({ options, values, env: { root } }, { launchBlock }) => {
    const writeConfig = Object.entries(options)
      .filter(([_, option]) => option.writeToConfig)
      .reduce((acc, [id]) => {
        acc[id] = values[id];

        return acc;
      }, {});

    if (!values.configPath) {
      throw new Error(`Config path is required`);
    }

    const targetPath = resolve(root, values.configPath);

    if (existsSync(targetPath)) {
      unlinkSync(targetPath);
    }

    await launchBlock(
      async () => {
        writeFileSync(targetPath, JSON.stringify(writeConfig, null, 2));
      },
      () => null,
      {
        name: "Writing config",
        fatal: false,
        "Config path": values.configPath,
        "Resolved path for config file": targetPath,
      }
    );

    console.log(`Config file ${targetPath} is created`);
  },
};

export { writeConfig };
