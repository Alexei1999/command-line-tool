import { deployRepos } from "./deployRepos/index";
import { help } from "./help/index";
import { config } from "./config/index";
import { remove } from "./remove/index";

const commands = {
  ...help,
  ...deployRepos,
  ...config,
  ...remove,
};

export { commands };
