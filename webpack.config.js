const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlInlineScriptPlugin = require("html-inline-script-webpack-plugin");

module.exports = (env, argv) => ({
  mode: argv.mode === "production" ? "production" : "development",
  devtool: argv.mode === "production" ? false : "inline-source-map",
  entry: {
    ui: "./src/ui.tsx",
    code: "./src/code.ts",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js"],
    alias: { "@": path.resolve(__dirname, "./") },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(css|scss)$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
              modules: {
                localIdentName: "[local]_[hash:base64:5]",
                auto: /\.module\.\w+$/i,
              },
            },
          },
          "sass-loader",
        ],
      },
      // Allows you to use "<%= require('./file.svg') %>" in your HTML code to get a data URI
      // { test: /\.(png|jpg|gif|webp|svg|zip)$/, loader: [{ loader: 'url-loader' }] }
      {
        test: /.svg$/,
        use: "@svgr/webpack",
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      global: {}, // Fix missing symbol error when running in developer VM
    }),
    new HtmlWebpackPlugin({
      inject: "body",
      template: "./src/ui.html",
      filename: "ui.html",
      chunks: ["ui"],
    }),
    new HtmlInlineScriptPlugin({
      htmlMatchPattern: [/ui.html/],
      scriptMatchPattern: [/.js$/],
    }),
  ],
  output: {
    filename: (pathData) => {
      return pathData.chunk.name === "code"
        ? "code.js"
        : "[name].[contenthash].js";
    },
    path: path.resolve(__dirname, "dist"), // Compile into a folder called "dist"
    // Clean the output directory before emit.
    clean: true,
  },
});
