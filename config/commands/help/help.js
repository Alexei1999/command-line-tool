const help = {
  beforeInitilize: true,
  name: "help",
  label: "Help",
  description: "Show help",
  command: "help",
  option: "--help",
  exitAfterExecute: true,
  handle: async ({ options, commands, calculatedOptions, env }) => {
    const optionsTable = Object.entries(options).reduce((acc, [id, option]) => {
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
    }, {});

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
};

export { help };
