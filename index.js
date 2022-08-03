import { options } from "./config/options";
import { variables } from "./config/variables";
import { commands } from "./config/commands/index";

import { coreCommands } from "./config/core-commands/index";

import { commandLineTool } from "./src/index";

commandLineTool({
  coreCommands,
  commands,
  options,
  variables,
});
