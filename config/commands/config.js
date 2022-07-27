const path = require("path");
const fs = require("fs");

const configCommands = {
  readConfig: {
    contextPath: "config",
    globalContext: true,
    beforeInitilize: true,
    name: "read config",
    describe: "Read config",
    default: true,
    handler: async ({ safeArgValues }, { logErrorContext, launchBlock }) => {
      if (!safeArgValues.configPath) {
        console.error("Config path is required");
        logErrorContext("Config path", {
          "Config path": safeArgValues.configPath,
        });

        process.exit(1);
      }

      if (safeArgValues.withoutConfig) {
        return null;
      }

      const targetPath = path.resolve(__dirname, safeArgValues.configPath);

      const initConfigContent = await launchBlock(
        async () => {
          return fs.readFileSync(targetPath, "utf8");
        },
        async () => null,
        {
          name: "Read config",
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
          name: "Parse config",
          fatal: false,
          "Parsed content": initConfigContent,
        }
      );
    },
  },
  writeConfig: {
    contextVariable: "config",
    name: "write config",
    describe: "Write config",
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
          name: "Write config",
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
