const expandCommands = (commandsList) => {
  if (!Array.isArray(commandsList)) {
    return Object.fromEntries(expandCommands(Object.entries(commandsList)));
  }

  let indexOffset = 0;
  let currentCommands = commandsList;

  for (let i = 0; i + indexOffset < currentCommands.length; i++) {
    const j = i + indexOffset;

    const [id, command] = currentCommands[j];

    if (!command.commandsPath) {
      command.commandsPath = [];
    }

    command.commandsPath = [...command.commandsPath, id];

    if (!command?.handle || typeof command.handle !== "object") {
      continue;
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

    const processedCommands = expandCommands(addedSubCommands);
    currentCommands = [
      ...currentCommands.slice(0, j + indexOffset),
      ...processedCommands,
      ...currentCommands.slice(j + indexOffset + 1),
    ];

    indexOffset += addedSubCommands.length - 1;
  }

  return currentCommands;
};

const _expandCommands = expandCommands;
export { _expandCommands as expandCommands };
