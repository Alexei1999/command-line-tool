const path = require("path");
const fs = require("fs");

const configCommands = {
  readConfig: {
    contextPath: "config",
    globalContext: true,
    beforeInitilize: true,
    name: "read-config",
    label: "Read config",
    description: "Read config",
    default: true,
    handler: async (
      { safeArgValues, env: { root } },
      { logErrorContext, launchBlock }
    ) => {
      if (!safeArgValues.configPath) {
        console.error("Config path is required");
        logErrorContext("Config path", {
          "Config path": safeArgValues.configPath,
        });

        throw new Error("Config path is required");
      }

      if (safeArgValues.withoutConfig) {
        return null;
      }

      const targetPath = path.resolve(root, safeArgValues.configPath);

      const initConfigContent = await launchBlock(
        async () => {
          return fs.readFileSync(targetPath, "utf8");
        },
        async () => null,
        {
          name: "Reading config",
          fatal: false,
          "Config path": safeArgValues.configPath,
          "Resolved path for config file": targetPath,
        }
      );

      return await launchBlock(
        async () => {
          return JSON.parse(initConfigContent);
        },
        async () => null,
        {
          name: "Parsing config",
          fatal: false,
          "Parsed content": initConfigContent,
        }
      );
    },
  },
  writeConfig: {
    contextVariable: "config",
    name: "write-config",
    description: "Write config",
    default: true,
    handler: async ({ options, values, env: { root } }, { launchBlock }) => {
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
  },
};

module.exports.configCommands = configCommands;
