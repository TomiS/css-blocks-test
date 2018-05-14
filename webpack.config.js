/* eslint-disable */
var path = require('path');
var webpack = require('webpack');
var FlowWebpackPlugin = require('flow-webpack-plugin');

var rootDir = __dirname;

var nodeEnv = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';

var clientEntry = path.resolve(path.join(rootDir, 'client/main.js'));

const jsxCompilationOptions = {
  compilationOptions: {},
  types: "flow",
  aliases: {},
  optimization: {
    rewriteIdents: true,
    mergeDeclarations: true,
    removeUnusedStyles: true,
    conflictResolution: true,
    enabled: false,
  },
};

var CssBlocks = require('@css-blocks/jsx');
var CssBlocksPlugin = require('@css-blocks/webpack').CssBlocksPlugin;
var CssBlockRewriter = new CssBlocks.Rewriter();
var CssBlockAnalyzer = new CssBlocks.Analyzer(clientEntry, jsxCompilationOptions);


var babelSettings = {
  presets: [
    ['es2015', { modules: false }], // webpack understands the native import syntax, and uses it for tree shaking
    'stage-2', // stage 2 contains 'draft' level stuff that most likely will be in official ES release
    'react',
    'flow',
  ],
  plugins: [
    'react-hot-loader/babel',
    // For some reason, D3 does not resolve without this
    'transform-export-default-name',
    // Enable dynamic import() for code splitting
    'syntax-dynamic-import',
  ],
  cacheDirectory: '.babelCache',
};



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
    strictExportPresence: true,
    rules: [
      {
        test: /\.js$/,
        include: [path.join(rootDir, 'client')],
        use: [
          {
            loader: require.resolve('babel-loader'),
            options: babelSettings
          },
          // Run the css-blocks plugin in its own dedicated loader because the react-app preset
          // steps on our transforms' feet. This way, we are guaranteed a clean pass before any
          // other transforms are done.
          {
            loader: require.resolve('babel-loader'),
            options: {
              presets: [
                'react',
              ],
              plugins: [
                require("@css-blocks/jsx/dist/src/transformer/babel").makePlugin({ rewriter: CssBlockRewriter }),
              ],
              cacheDirectory: '.babelCache',
              compact: true,
            }
          },
          // The JSX Webpack Loader halts loader execution until after all blocks have
          // been compiled and template analyses has been run. StyleMapping data stored
          // in shared `rewriter` object.
          {
            loader: require.resolve("@css-blocks/webpack/dist/src/loader"),
            options: {
              analyzer: CssBlockAnalyzer,
              rewriter: CssBlockRewriter
            }
          },
        ]
      }
    ],
  },
  plugins: [
    new CssBlocksPlugin({
       analyzer: CssBlockAnalyzer,
       outputCssFile: "blocks.css",
       name: "css-blocks",
       compilationOptions: jsxCompilationOptions.compilationOptions,
       optimization: jsxCompilationOptions.optimization
    }),
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
  entry: [clientEntry],
  devtool: 'cheap-module-source-map',
  devServer: {
    port: 3001,
    hot: true,
    inline: true,
    historyApiFallback: true,
  },
};

module.exports = config;
