const expandCommands = (commands, parents = [], root = true) => {
  let addedElements = 0;

  const commandsToProcess = Array.isArray(commands)
    ? [...commands]
    : Object.entries(commands);

  commandsToProcess.forEach(([id, command], i) => {
    if (!command?.handle || typeof command.handle !== "object") {
      return;
    }

    const entries = Object.entries(command.handle);
    const names = entries.map(([_, command]) => command.name);

    const addedSubCommands = entries.map(([subId, subCommand]) => {
      const nextCommands = [
        ...(command.allowedCommands || []),
        ...(subCommand.allowedCommands || []),
        ...names,
      ];

      return [
        subId,
        {
          ...command,
          ...subCommand,
          allowedCommands: nextCommands,
        },
      ];
    });

    const items = expandCommands(addedSubCommands, [...parents, id], false);

    commandsToProcess.splice(i + addedElements, 1, ...items);
    addedElements += items.length;
  });

  if (root) {
    return Object.fromEntries(commandsToProcess);
  }

  return commandsToProcess;
};

module.exports.expandCommands = expandCommands;
