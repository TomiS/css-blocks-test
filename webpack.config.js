/* eslint-disable */
var path = require('path');
var webpack = require('webpack');
var babelSettings = require('./babelSettings');
var MiniCssExtractPlugin = require('mini-css-extract-plugin');
var FlowWebpackPlugin = require('flow-webpack-plugin');

var CssBlocks = require('@css-blocks/jsx');
var CssBlocksPlugin = require('@css-blocks/webpack').CssBlocksPlugin;

var rootDir = __dirname;

var nodeEnv = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';

var clientEntry = path.resolve(path.join(rootDir, 'client/main.js'));

var rewriterInstance = new CssBlocks.Rewriter();
var analyzerInstance = new CssBlocks.Analyzer(clientEntry, {
  baseDir: __dirname,
  types: 'flow',
});

var browserlist = ['since 2016', 'ie >= 11', 'not QQAndroid > 0', 'not Baidu > 0'];

var config = {
  context: path.resolve(rootDir),
  target: 'web',
  resolve: {
    modules: [path.resolve(rootDir, 'client'), 'node_modules'],
    mainFields: ['browser', 'main'],
    extensions: ['.js', '.jsx', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: babelSettings,
        include: [path.join(rootDir, 'client')],
      },
      {
        loader: require.resolve('@css-blocks/webpack/dist/src/loader'),
        options: {
          analyzer: analyzerInstance,
          rewriter: rewriterInstance,
        },
      },
    ],
  },
  plugins: [
    /*
    new webpack.DefinePlugin({
      // React uses this for deciding if it works in prod mode or not
      'process.env.NODE_ENV': JSON.stringify(nodeEnv),
    }),
    */
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(), // This enables HMR to show component names in console
    new webpack.DefinePlugin({
      __PRODUCTION__: false,
      __DEVELOPMENT__: true,
      __DEVTOOLS__: true,
    }),
    new FlowWebpackPlugin({ printFlowOutput: true, flowArgs: ['--show-all-errors', '--color=always'] }),
  ],
  output: {
    path: path.join(rootDir, 'build'),
    filename: '[name].js', // e.g. commonchuncks uses this same output so filename must be dynamic
    publicPath: '/build/',
    chunkFilename: '[name].[chunkhash].js', // chunkhash only changes if the content of the chunk changes
  },
  mode: 'development',
  entry: clientEntry,
  devtool: 'cheap-module-source-map',
  devServer: {
    port: 3001,
    hot: true,
    inline: true,
    historyApiFallback: true,
  },
};

module.exports = config;
