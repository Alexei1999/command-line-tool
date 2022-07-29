const man = {
  beforeInitilize: true,
  name: "man",
  label: "Man",
  description: "Show help about command",
  command: "man",
  allowedCommands: [],
  exitAfterExecute: true,
  handle: async ({ commands: _commands, options: _options }, { getOption }) => {
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
};

module.exports.man = man;
