import { options } from "./options/index";

import { downloadRepo } from "./downloadRepo";

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
    { execCommand, launchBlock }
  ) => {
    await launchBlock(
      async () => {
        await execCommand(`npm install --legacy-peer-deps`, {
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
        await execCommand(`npm run start:dev`, {
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

export { runProject };
