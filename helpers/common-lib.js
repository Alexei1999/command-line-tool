const spawn = require("child_process").spawn;

const { parseArgsLib } = require("./parse-args-lib.js");

const commonLib = {
  promisifiedSpawn(input, options) {
    const commandPosition = input.indexOf(" ");
    const command = input.substring(0, commandPosition);
    const args = input.substring(commandPosition + 1).split(" ");

    const commandOptions = {
      npm: () => (/^win/.test(process.platform) ? "npm.cmd" : "npm"),
    };
    const defaultOptions = {
      ...options,
    };

    const targetCommand = commandOptions[command]?.() || command;

    return new Promise((resolve, reject) => {
      const process = spawn(targetCommand, args, defaultOptions);

      process.stdout?.on("data", (data) => {
        console.log(data.toString());
      });

      process.stderr?.on("data", (data) => {
        console.error(data.toString());
      });

      process.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(code);
        }
      });

      process.on("error", (err) => {
        reject(err);
      });

      process.on("exit", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(code);
        }
      });

      process.on("SIGINT", () => {
        process.kill("SIGINT");
      });

      process.on("SIGTERM", () => {
        process.kill("SIGTERM");
      });

      process.on("SIGUSR1", () => {
        process.kill("SIGUSR1");
      });

      process.on("SIGUSR2", () => {
        process.kill("SIGUSR2");
      });

      process.on("uncaughtException", (err) => {
        reject(err);
      });

      process.on("unhandledRejection", (err) => {
        reject(err);
      });

      process.on("warning", (err) => {
        reject(err);
      });
    });
  },
  parseFileTemplate(template, args) {
    if (!template) {
      throw new Error(`Config file template is not defined: ${template}`);
    }

    let modifiedTemplate = template;

    Object.entries(args).forEach(([key, value]) => {
      modifiedTemplate = modifiedTemplate.replace(`<${key}>`, value);
    });

    return modifiedTemplate;
  },
  pipeLine(...args) {
    return args.reduce((acc, arg) => {
      if (typeof arg !== "function") {
        return arg;
      }

      return arg(acc);
    }, undefined);
  },
  logErrorContext(name, context, error) {
    if (!name) {
      throw new Error("Context name is required");
    }

    console.groupCollapsed(`Error context`);

    console.log("Name: ", name);

    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        console.log(`${key}: ${value}`);
      });
    }

    error && console.error(error);
    console.groupEnd();
  },
  getOptionValuesFromArgs: (option) => {
    if (!option) {
      throw new Error(`Option ${option} is required`);
    }

    if (option.onlyFromConfig) {
      return null;
    }

    switch (option.type) {
      case "string":
        return commonLib.pipeLine(
          parseArgsLib.getOption(option._params),
          parseArgsLib.extractValue
        );
      case "boolean":
        return commonLib.pipeLine(
          parseArgsLib.getOption(option._params),
          parseArgsLib.hasOption
        );
      default:
        throw new Error(`Option ${option} is not valid`);
    }
  },
};

module.exports.commonLib = commonLib;