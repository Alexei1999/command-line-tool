const path = require("path");
const fs = require("fs");

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

    const targetPath = path.resolve(root, values.configPath);

    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }

    await launchBlock(
      async () => {
        fs.writeFileSync(targetPath, JSON.stringify(writeConfig, null, 2));
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

module.exports.writeConfig = writeConfig;
