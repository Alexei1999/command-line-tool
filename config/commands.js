const { commonLib } = require("../helpers/common-lib");

module.exports.commands = {
  help: {
    beforeInitilize: true,
    name: "help",
    describe: "Show help",
    command: "help",
    option: "--help",
    handler: async () => {
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

      console.log("Options");
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

      console.log("Commands");
      console.table(commandsTable);

      console.log("Default values");
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
    command: undefined,
    option: undefined,
    exitAfterExecute: true,
    handler: async ({ values }) => {
      const folderName = values.repoSshUrl.split("/").pop().replace(".git", "");

      const folderPath = path.resolve(__dirname, "./", folderName);

      console.log(`Cloning ${values.repoSshUrl} to ${folderPath}`);
      if (fs.existsSync(folderPath)) {
        console.log(`Folder ${folderPath} is already exists`);
      } else {
        try {
          await commonLib.promisifiedSpawn(`git clone ${values.repoSshUrl}`);
        } catch (e) {
          console.error(`Failed to clone ${values.repoSshUrl}`);

          commonLib.logErrorContext(
            "Clone repo",
            {
              "Repo ssh url": values.repoSshUrl,
            },
            e
          );

          process.exit(1);
        }
        console.log(`Repo ${values.repoSshUrl} is cloned`);
      }

      console.log(`Pulling the repository`);
      try {
        await commonLib.promisifiedSpawn(`git pull`, {
          cwd: folderPath,
        });
      } catch (e) {
        console.error(`Failed to pull`);

        commonLib.logErrorContext("Pull", {}, e);

        process.exit(1);
      }
      console.log(`Repo is pulled`);

      console.log(`Running`);
      try {
        await commonLib.promisifiedSpawn(`npm run start`, {
          cwd: folderPath,
        });
      } catch (e) {
        console.error(`Failed to start`);

        commonLib.logErrorContext("Start", {}, e);

        process.exit(1);
      }
      console.log(`Process is ended`);
    },
  },
  readConfig: {
    contextVariable: "config",
    beforeInitilize: true,
    name: "readConfig",
    default: true,
    handler: async ({ safedParsedArgs }) => {
      if (!safedParsedArgs.configPath) {
        console.error("Config path is required");
        commonLib.logErrorContext("Config path", {
          "Config path": safedParsedArgs?.configPath,
        });

        process.exit(1);
      }

      if (safedParsedArgs?.withoutConfig) {
        return null;
      }

      const targetPath = path.resolve(__dirname, safedParsedArgs?.configPath);

      let initConfigContent = null;
      try {
        initConfigContent = fs.readFileSync(targetPath, "utf8");
      } catch (e) {
        console.log(`Config file ${safedParsedArgs?.configPath} is not found`);

        commonLib.logErrorContext(
          "Read config",
          {
            "Config path": safedParsedArgs?.configPath,
            "Resolved path for config file": targetPath,
          },
          e
        );

        return null;
      }

      try {
        return JSON.parse(initConfigContent);
      } catch (e) {
        console.error(`Config file ${targetPath} is not valid`);

        commonLib.logErrorContext(
          "Parse config",
          {
            "Parsed content": initConfigContent,
          },
          e
        );

        return null;
      }
    },
  },
  writeConfig: {
    handler: async ({ processedOptions }) => {
      const writeConfig = Object.entries(processedOptions)
        .filter(([_, option]) => option.writeToConfig)
        .reduce((acc, [id]) => {
          acc[id] = targetVariables[id];

          return acc;
        }, {});

      if (!safedParsedArgs.configPath) {
        throw new Error(`Config path is required`);
      }

      const targetPath = path.resolve(__dirname, safedParsedArgs.configPath);

      try {
        if (fs.existsSync(targetPath)) {
          fs.unlinkSync(targetPath);
        }

        fs.writeFileSync(targetPath, JSON.stringify(writeConfig, null, 2));
      } catch (e) {
        console.error(`Config file ${targetPath} is not valid`);

        commonLib.logErrorContext(
          "Write config",
          {
            "Config path": safedParsedArgs.configPath,
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
