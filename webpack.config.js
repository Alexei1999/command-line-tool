import * as url from "url";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

export default {
  target: "node",
  entry: "./index.js",
  output: {
    path: __dirname,
    filename: "script.js",
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
};
