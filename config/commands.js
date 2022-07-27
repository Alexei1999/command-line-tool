const path = require("path");
const fs = require("fs");

const commands = {
  help: {
    beforeInitilize: true,
    name: "help",
    describe: "Show help",
    command: "help",
    option: "--help",
    handler: async ({ options, calculatedOptions }) => {
      const optionsTable = Object.entries(options).reduce(
        (acc, [id, option]) => {
          acc[id] = {
            command: option.onlyFromConfig
              ? "config file"
              : `${option.option}${option.alias ? `, ${option.alias}` : ""}`,
            type: option.type,
            describe: `${option.describe}`,
            "has default value": option.defaultValue !== undefined,
          };

          return acc;
        },
        {}
      );

      console.log("----- Options -----");
      console.table(optionsTable);

      const commandsTable = Object.entries(commands).reduce(
        (acc, [id, option]) => {
          acc[id] = {
            ...((option.command || option.option) && {
              command: `${option.command}${
                option.option ? `, ${option.option}` : ""
              }`,
            }),
            describe: `${option.describe}`,
            default: Boolean(option.default),
          };

          return acc;
        },
        {}
      );

      console.log("\n");
      console.log("----- Commands -----");
      console.table(commandsTable);

      try {
        const calculatedTable = Object.entries(calculatedOptions()).reduce(
          (acc, [id, value]) => {
            acc[id] = {
              "value type": typeof value,
            };

            return acc;
          },
          {}
        );

        console.log("\n");
        console.log("----- Calculated options -----");
        console.table(calculatedTable);
      } catch (error) {
        console.error("Can't show calculated options");
        console.error(error);
      }

      console.log("\n");
      console.log("----- Default values  -----");
      Object.entries(options).forEach(([key, option]) => {
        if (option.defaultValue?.length > 50) {
          console.log(`--- ${key} ---`);
          console.log(`${option.defaultValue}`);
          return;
        }

        console.log(`${key}: ${option.defaultValue}`);
      });
    },
    exitAfterExecute: true,
  },
  run: {
    default: true,
    beforeInitilize: false,
    name: "run",
    describe: "Run script",
    handler: async ({ values }, { launchCommand, launchBlock }) => {
      const folderName = values.repoUrl.split("/").pop().replace(".git", "");

      const rootPath = path.resolve(__dirname, "..");
      const folderPath = path.resolve(rootPath, folderName);

      if (fs.existsSync(folderPath)) {
        console.log(`Folder ${folderPath} is already exists`);
      } else {
        await launchBlock(
          async () => {
            await launchCommand(`git clone ${values.repoUrl}`, {
              cwd: rootPath,
            });
          },
          {
            name: "Clone repo",
            "Repo ssh url": values.repoUrl,
            "Folder path": folderPath,
            "Root path": rootPath,
          }
        );
      }

      await launchBlock(
        async () => {
          await launchCommand(`git pull`, {
            cwd: folderPath,
          });
        },
        {
          name: "Pull repo",
          "Folder path": folderPath,
        }
      );

      console.log(`Repo is pulled`);
    },
  },
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
    handler: async ({ options, values }) => {
      const writeConfig = Object.entries(options)
        .filter(([_, option]) => option.writeToConfig)
        .reduce((acc, [id]) => {
          acc[id] = values[id];

          return acc;
        }, {});

      if (!values.configPath) {
        throw new Error(`Config path is required`);
      }

      const targetPath = path.resolve(__dirname, "../", values.configPath);

      try {
        if (fs.existsSync(targetPath)) {
          fs.unlinkSync(targetPath);
        }

        fs.writeFileSync(targetPath, JSON.stringify(writeConfig, null, 2));
      } catch (e) {
        console.error(`Config file ${targetPath} is not valid`);

        logErrorContext(
          "Write config",
          {
            "Config path": values.configPath,
            "Resolved path for config file": targetPath,
          },
          e
        );

        return null;
      }

      console.log(`Config file ${targetPath} is created`);
    },
  },
};

module.exports.commands = commands;
