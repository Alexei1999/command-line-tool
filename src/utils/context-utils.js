const { setValueByPath } = require("./functional-utils");

const contextSetter = function contextSetter(command, context, data) {
  if (!command?.contextPath) {
    return;
  }

  if (!command.globalContext && !context[command.name]) {
    context[command.name] = {};
  }

  setValueByPath(
    command.contextPath,
    command.globalContext ? context : context[command.name],
    data
  );

  console.log(
    `${command.name}: context setted to (context${
      command.globalContext ? "" : `[${command.name}]`
    }, ${command.contextPath})`
  );
};

const processCommand = async function launchCommand(
  command,
  context,
  values,
  helpers,
  options = {}
) {
  const result = await command.handle(values, helpers, options).catch((e) => {
    if (command.skipError) {
      return;
    }

    throw e;
  });

  console.log(`${command.label} is done`);

  contextSetter(command, context, result);

  if (command.exitAfterExecute) {
    return process.exit(0);
  }
};

module.exports = {
  contextSetter,
  processCommand,
};
