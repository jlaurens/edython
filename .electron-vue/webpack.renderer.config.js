'use strict'

process.env.BABEL_ENV = 'renderer'
process.env.IS_WEB = false

const path = require('path')
const webpack = require('webpack')
const { dependencies } = require('../package.json')

const BabiliWebpackPlugin = require('babili-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const eYoConfig = require('./eyo.config.js')

/**
 * List of node_modules to include in webpack bundle
 *
 * Required for specific packages like Vue UI libraries
 * that provide pure *.vue files that need compiling
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/webpack-configurations.html#white-listing-externals
 */
let whiteListedModules = ['vue']

let rendererConfig = eYoConfig.get('electron-renderer', 'electron', process.env.BABEL_ENV)

rendererConfig.mode = 'development'

rendererConfig.output.libraryTarget = 'commonjs2'
rendererConfig.externals = [
  ...Object.keys(dependencies || {}).filter(d => !whiteListedModules.includes(d))
]


/**
 * Adjust rendererConfig for production settings
 */
if (process.env.NODE_ENV === 'production') {
  rendererConfig.mode = 'production'
  rendererConfig.devtool = ''

  rendererConfig.plugins.push(
    new BabiliWebpackPlugin(),
    new CopyWebpackPlugin([
      {
        from: path.join(__dirname, '../static'),
        to: path.join(__dirname, '../dist/electron/static'),
        ignore: ['.*']
      }
    ]),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      options: {},// https://github.com/webpack/webpack/issues/6556
    })
  )
}

module.exports = rendererConfig
