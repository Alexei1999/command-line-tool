const util = require("util");

const child_process = require("child_process");

const spawn = child_process.spawn;
const exec = util.promisify(child_process.exec);

const commandOptions = {
  npm: () => (/^win/.test(process.platform) ? "npm.cmd" : "npm"),
};

module.exports.promisifiedSpawn = function promisifiedSpawn(input, options) {
  const commandPosition = input.indexOf(" ");
  const command = input.substring(0, commandPosition);
  const args = input.substring(commandPosition + 1).split(" ");

  const defaultOptions = {
    ...options,
  };

  const targetCommand = commandOptions[command]?.() || command;

  return new Promise((resolve, reject) => {
    console.log(input, options);
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
};

module.exports.promisifiedExec = function promisifiedExec(input, options) {
  console.log(input, options);
  return exec(input, options);
};
