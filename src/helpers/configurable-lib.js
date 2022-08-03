import { promisifiedSpawn, promisifiedExec } from "../utils/cmd-utils";

const getConfigurableLib = ({}, args) => ({
  execCommand: !args.useExec ? promisifiedSpawn : promisifiedExec,
});

export { getConfigurableLib };
