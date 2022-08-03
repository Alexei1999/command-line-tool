const DEFAULT_CONSTANTS = {
  CONFIG_PATH: "config.json",
};

export const options = {
  configPath: {
    name: "config-path",
    description: "Config path",
    option: "--config-path",
    alias: "-cp",
    type: "string",
    defaultValue: DEFAULT_CONSTANTS.CONFIG_PATH,
  },
  useExec: {
    name: "use-exec",
    description: "Use exec",
    fullDescription:
      "Use spawn or exec for executing commands. The difference is that spawn prints the output live, but throws an non-readable error.",
    option: "--u  se-exec",
    alias: "-ue",
    type: "boolean",
  },
};
