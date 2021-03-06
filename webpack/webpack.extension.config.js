const HtmlWebpackPlugin = require("html-webpack-plugin");
const CspHtmlWebpackPlugin = require("csp-html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");

const root = `${__dirname}/..`;

const isExtension = process.env.BUILD_ENV !== "electron";

const inOutConfig = isExtension
  ? {
      entry: {
        background: `${root}/src/extension/background.ts`,
        devtools: `${root}/src/extension/devtools.ts`,
        content_script: `${root}/src/extension/content_script.ts`,
        "prism-panel": `${root}/src/panel/prism.ts`,
        panel: `${root}/src/panel/panel.tsx`,
      },
      output: {
        path: `${root}/dist/extension`,
        devtoolModuleFilenameTemplate: (info) =>
          `urql-devtools:///${info.resourcePath}`,
      },
    }
  : {
      entry: {
        "prism-panel": `${root}/src/panel/prism.ts`,
        panel: `${root}/src/panel/panel.tsx`,
      },
      output: {
        path: `${root}/dist/electron/shell`,
        devtoolModuleFilenameTemplate: (info) =>
          `urql-devtools:///${info.resourcePath}`,
      },
    };

module.exports = {
  ...inOutConfig,
  devtool: "source-map",
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  optimization: {
    minimizer: [
      new TerserPlugin({
        test: /\.js(\?.*)?$/i,
        parallel: true,
        sourceMap: true,
        terserOptions: {
          output: {
            ascii_only: true, // Required for codemirror
            comments: false,
          },
        },
      }),
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".mjs", ".js", ".jsx"],
  },
  externals: isExtension
    ? undefined
    : {
        electron: "commonjs2 electron",
      },
  node: false,
  module: {
    rules: [
      {
        test: /\.*tsx?$/,
        loader: "babel-loader",
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
      "process.env.BUILD_ENV": JSON.stringify(process.env.BUILD_ENV),
      "process.env.PKG_VERSION": JSON.stringify(
        require("../package.json").version
      ),
    }),
    new webpack.ContextReplacementPlugin(
      /graphql-language-service-interface[\/\\]dist/,
      /\.js$/
    ),
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ["**/*"],
      cleanAfterEveryBuildPatterns: ["!*", "!*/**"],
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "src/assets/", to: "assets/" },
        isExtension && {
          from: "src/extension/manifest.json",
          transform: function (content) {
            return Buffer.from(
              JSON.stringify(
                {
                  ...JSON.parse(content.toString()),
                  version: process.env.npm_package_version,
                },
                null,
                2
              )
            );
          },
        },
      ].filter(Boolean),
    }),
    isExtension && new webpack.IgnorePlugin(/electron/),
    isExtension &&
      new HtmlWebpackPlugin({
        template: `${root}/src/extension/devtools.html`,
        filename: "devtools.html",
        chunks: ["devtools"],
      }),
    new HtmlWebpackPlugin({
      template: `${root}/src/panel/panel.html`,
      filename: "panel.html",
      chunks: ["prism-panel", "panel"],
    }),
    new CspHtmlWebpackPlugin({
      "default-src": "'self'",
      "script-src": "'self'",
      "style-src": "'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src": "'self' https://fonts.gstatic.com",
      "img-src": "'self' data:",
    }),
  ].filter(Boolean),
};
