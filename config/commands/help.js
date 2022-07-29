const helpCommands = {
  man: {
    beforeInitilize: true,
    name: "man",
    label: "Man",
    description: "Show help about command",
    command: "man",
    allowedCommands: [],
    exitAfterExecute: true,
    handle: async (
      { commands: _commands, options: _options },
      { getOption }
    ) => {
      const { notFound, emptyValue, value } = getOption("man", {
        anyValue: true,
      });

      if (notFound) {
        throw new Error(`Command man is not found`);
      }

      if (emptyValue) {
        throw new Error(`Value ${value} is not valid`);
      }

      console.log(`----- ${value} -----`);
      console.log("\n");

      const commands = Object.values(_commands).filter(
        (command) =>
          value === command.id ||
          value === command.command ||
          command.command?.includes(value) ||
          value === command.option ||
          value === command.name
      );

      if (commands.length) {
        console.log(`--- commands ---`);

        commands.forEach((command) => {
          const { name, description, handle, ...rest } = command;
          Object.entries({
            name,
            description,
          }).forEach(([_, value]) => {
            console.log(`${value}`);
          });
          Object.entries({
            handle: Boolean(handle),
            ...rest,
          }).forEach(([key, value]) => {
            console.log(`${key}: ${value}`);
          });

          console.log("\n");
        });
      }

      console.log("\n");

      const options = Object.entries(_options).filter(
        (option) =>
          value === option.option ||
          value === option.alias ||
          value === option.name ||
          value === option.id
      );

      if (options.length) {
        console.log(`--- options ---`);

        options.forEach((option) => {
          const { name, description, fullDescription, ...rest } = option;
          Object.entries({
            name,
            description,
            fullDescription,
          }).forEach(([_, value]) => {
            console.log(`${value}`);
          });
          Object.entries(rest).forEach(([key, value]) => {
            console.log(`${key}: ${value}`);
          });

          console.log("\n");
        });
      }

      if (!commands.length && !options.length) {
        console.error(`Command "${value}" is not found`);
      }
    },
  },
  help: {
    beforeInitilize: true,
    name: "help",
    label: "Help",
    description: "Show help",
    command: "help",
    option: "--help",
    exitAfterExecute: true,
    handle: async ({ options, commands, calculatedOptions, env }) => {
      const optionsTable = Object.entries(options).reduce(
        (acc, [id, option]) => {
          acc[id] = {
            command: option.onlyFromConfig
              ? "config file"
              : `${option.option}${option.alias ? `, ${option.alias}` : ""}`,
            type: option.type,
            description: `${option.description}`,
            "default value": option.defaultValue !== undefined,
            required: Boolean(option.required),
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
              command: `${option.command.join?.(", ") || option.command}${
                option.option ? `, ${option.option}` : ""
              }`,
            }),
            description: `${option.description}`,
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
      options &&
        Object.entries(options).forEach(([key, option]) => {
          if (option.defaultValue?.length > 50) {
            console.log(`--- ${key} ---`);
            console.log(`${option.defaultValue}`);
            return;
          }

          console.log(`${key}: ${option.defaultValue}`);
        });

      console.log("\n");
      console.log("----- Environment variables  -----");
      env &&
        Object.entries(env).forEach(([key, value]) => {
          if (value?.length > 50) {
            console.log(`--- ${key} ---`);
            console.log(`${value}`);
            return;
          }

          console.log(`${key}: ${value}`);
        });
    },
  },
};

module.exports.helpCommands = helpCommands;
