import { setValueByPath } from "./functional-utils";

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

const launchCommand = async function launchCommand(
  command,
  context,
  values,
  helpers,
  promisesStack,
  options = {}
) {
  if (typeof command.filter === "function") {
    const result = await command.filter(values, helpers, options);

    if (!result) {
      return;
    }
  }

  const handler = command.handle(values, helpers, options).catch((e) => {
    if (command.skipError) {
      return;
    }

    throw e;
  });

  function handleResult(result) {
    console.log(`${command.label || command.name || command.id}: done`);

    contextSetter(command, context, result);

    if (command.exitAfterExecute) {
      return process.exit(0);
    }
  }

  if (command.runAsync) {
    promisesStack.push(handler.then(handleResult));

    return;
  }

  handleResult(await handler);
};

const launchCommands = async function launchCommands(
  commands,
  context,
  values,
  helpers,
  options
) {
  const promisesStack = [];

  for (let command of Object.values(commands)) {
    await launchCommand(
      command,
      context,
      values,
      helpers,
      promisesStack,
      options
    );
  }

  await Promise.all(promisesStack);
};

export { contextSetter, launchCommand, launchCommands };
