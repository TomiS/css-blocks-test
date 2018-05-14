/* eslint-disable */
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
    // Prevent importing full library
    [
      'transform-imports',
      {
        'react-bootstrap': {
          transform: 'react-bootstrap/lib/${member}',
          preventFullImport: true,
        },
        lodash: {
          transform: 'lodash/${member}',
          preventFullImport: true,
        },
      },
    ],
  ],
  env: {
    development: {
      plugins: [
        // Transform flowtypes to propTypes to enable runtime type checking (in dev).
        // This is specifically necessary as long as not all components are flowtyped
        // NOTICE! This breaks react-intl so it cannot be used at the same time
        'flow-react-proptypes',
      ],
    },
  },
  cacheDirectory: '.babelCache',
};
module.exports = babelSettings;
