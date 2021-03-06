const webpack = require('webpack');
const path = require('path');
const { CheckerPlugin } = require('awesome-typescript-loader')
const isProdBuild = process.env.NODE_ENV === 'PRODUCTION';
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpackRxjsExternals = require( 'webpack-rxjs-externals');

module.exports = {

  entry: [
    './src/index',
  ],

  output: {
    path: path.join(__dirname, 'dist'),
    filename: isProdBuild ? 'redux-package.min.js' : 'redux-package.js',
    library: 'ReduxPackage',
    libraryTarget: 'umd',
  },
  // Currently we need to add '.ts' to the resolve.extensions array.
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  externals: [
    webpackRxjsExternals(),
    'redux-observable',
    'redux'
  ],

  // Source maps support ('inline-source-map' also works)
 // devtool: 'source-map',

  // Add the loader for .ts files.
  module: {
    loaders: [

      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader',
        exclude: [/node_modules/],
//        include: ['src/*.ts']
      }
    ]
  },

  plugins: isProdBuild ? [
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        screw_ie8: true,
        warnings: false,
      },
    }),
//    new CheckerPlugin(),

  ]: [
//    new CheckerPlugin()

  ]
};


/*
 new CopyWebpackPlugin([ // An attempt at working around problem
 {from: 'src/action.interface.ts'},
 {from: 'src/state.interface.ts'}
 ])

 */