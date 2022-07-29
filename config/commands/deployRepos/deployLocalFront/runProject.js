const { options } = require("../../../options");

const { downloadRepo } = require("./downloadRepo");

const runProject = {
  name: "run-project",
  requiredOptions: [
    options.nexusLogin.name,
    options.nexusPassword.name,
    options.token.name,
    options.proxyUrl.name,
  ],
  handle: async (
    {
      ctx: {
        [downloadRepo.name]: { path },
      },
    },
    { launchCommand, launchBlock }
  ) => {
    await launchBlock(
      async () => {
        await launchCommand(`npm install --legacy-peer-deps`, {
          cwd: path,
        });
      },
      {
        name: "Installing npm",
        "Folder path": path,
      }
    );

    await launchBlock(
      async () => {
        await launchCommand(`npm run start:dev`, {
          cwd: path,
        });
      },
      {
        name: "Running npm",
        "Folder path": path,
      }
    );
  },
};

module.exports.runProject = runProject;
