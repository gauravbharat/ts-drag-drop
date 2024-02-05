const path = require("path");

module.exports = {
  mode: "development",
  // root entry path of the project, tell webpack where to start from
  entry: "./src/app.ts",
  // dev build configuration for webpack-dev-server
  devServer: {
    static: [
      {
        directory: path.join(__dirname),
      },
    ],
  },
  // direct webpack output name and path
  output: {
    filename: "bundle.js", // single javascript file that would be produced in the end
    path: path.resolve(__dirname, "dist"),
    publicPath: "/dist/", // webpack-dev-server to load bundle temporarily on local dev server memory
  },
  // set sourceMap = true in tsconfig.json to help in debug
  devtool: "inline-source-map",
  // how to deal with all the files; add rules for specific file extensions
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
};
