const path = require("path");
const fs = require("fs");

const readConfig = {
  contextPath: "config",
  globalContext: true,
  beforeInitilize: true,
  name: "read-config",
  label: "Read config",
  description: "Read config",
  default: true,
  handle: async (
    { safeArgValues, env: { root } },
    { logErrorContext, launchBlock }
  ) => {
    if (!safeArgValues.configPath) {
      console.error("Config path is required");
      logErrorContext("Config path", {
        "Config path": safeArgValues.configPath,
      });

      throw new Error("Config path is required");
    }

    if (safeArgValues.withoutConfig) {
      return null;
    }

    const targetPath = path.resolve(root, safeArgValues.configPath);

    const initConfigContent = await launchBlock(
      async () => {
        return fs.readFileSync(targetPath, "utf8");
      },
      async () => null,
      {
        name: "Reading config",
        fatal: false,
        "Config path": safeArgValues.configPath,
        "Resolved path for config file": targetPath,
      }
    );

    return await launchBlock(
      async () => {
        return JSON.parse(initConfigContent);
      },
      async () => null,
      {
        name: "Parsing config",
        fatal: false,
        "Parsed content": initConfigContent,
      }
    );
  },
};

module.exports.readConfig = readConfig;
