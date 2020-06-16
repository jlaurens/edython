'use strict'

process.env.BABEL_ENV = 'web'
process.env.IS_WEB = true

const path = require('path')
const webpack = require('webpack')

const BabiliWebpackPlugin = require('babili-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const eYoConfig = require('./eyo.config.js')

let webConfig = eYoConfig.get('web', 'web', process.env.BABEL_ENV)

/**
 * Adjust webConfig for production settings
 */
if (process.env.NODE_ENV === 'production') {
  webConfig.mode = 'production'
  
  webConfig.devtool = ''

  webConfig.plugins.push(
    new BabiliWebpackPlugin(),
    new CopyWebpackPlugin(
      [
        {
          from: path.join(__dirname, '../static'),
          to: path.join(__dirname, '../dist/web/static'),
          ignore: ['.*']
        }
      ]
    ),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    }),
    new webpack.LoaderOptionsPlugin(
      {
        minimize: false,
        options: {}, // https://github.com/webpack/webpack/issues/6556
      }
    // ),
    // new webpack.optimize.UglifyJsPlugin(
    //   { // JL true
    //     compress: false,
    //     mangle: false,
    //   }
    )
  )
}

module.exports = webConfig
