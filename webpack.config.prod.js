const path = require("path");
const CleanPlugin = require("clean-webpack-plugin");

module.exports = {
  mode: "production",
  // root entry path of the project, tell webpack where to start from
  entry: "./src/app.ts",
  // direct webpack output name and path
  output: {
    filename: "bundle.js", // single javascript file that would be produced in the end
    path: path.resolve(__dirname, "dist"),
  },
  // how to deal with all the files; add rules for specific file extensions; applied per file extension
  module: {
    rules: [
      {
        test: /\.ts$/, // any file ends with .ts should be handled with this rule
        use: "ts-loader", // what webpack should do with this files, tells webpack to deal with typescript files using ts-loader
        exclude: /node_modules/,
      },
    ],
  },
  // which file extensions to add to file imports, to bundle those imported files together
  resolve: {
    extensions: [".ts", ".js"], // look for both .ts and .js files
  },
  // extra extensions; applied to all workflow
  plugins: [
    new CleanPlugin.CleanWebpackPlugin(), // before the bundle.js is written/outputed, it would clean everythign in there
  ],
};
