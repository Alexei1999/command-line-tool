import { downloadRepo } from "./downloadRepo";
import { rewriteFiles } from "./rewriteFiles";
import { runProject } from "./runProject";
import { removeRepo } from "./removeRepo";

import { writeConfig } from "../../config/writeConfig";
import { readConfig } from "../../config/readConfig";

import { options, calculatedOptions } from "./options";

const deployLocalFront = {
  default: true,
  name: "deploy-local-front",
  label: "Deploy local front",
  description: "Deploy local front",
  allowedCommands: [writeConfig.name, readConfig.name],
  options,
  calculatedOptions,
  handle: {
    removeRepo,
    downloadRepo,
    rewriteFiles,
    runProject,
  },
};

export { deployLocalFront };
