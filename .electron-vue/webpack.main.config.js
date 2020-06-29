'use strict'

process.env.BABEL_ENV = 'main'

const path = require('path')
const { dependencies } = require('../package.json')
const webpack = require('webpack')

const VueLoaderPlugin = require('vue-loader/lib/plugin')

const BabiliWebpackPlugin = require('babili-webpack-plugin')

const chalk = require('chalk')

console.log(chalk.keyword('orange').bold('→ .electron-vue/webpack.main.config.js'))

let rootPath = path.join(__dirname, '..')

// remove electron dependencies when web only ?

let whiteListedModules = []

let mainConfig = {
  mode: 'development',
  entry: {
    main: path.join(rootPath, 'src/vue/main/index.js')
  },
  externals: [
    ...Object.keys(dependencies || {}).filter(d => !whiteListedModules.includes(d))
  ],
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.js$/,
        enforce: 'pre',
        exclude: /node_modules/,
        use: {
          loader: 'eslint-loader',
          options: {
            formatter: require('eslint-friendly-formatter')
          }
        }
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.node$/,
        use: 'node-loader'
      }
    ]
  },
  node: {
    __dirname: process.env.NODE_ENV !== 'production',
    __filename: process.env.NODE_ENV !== 'production'
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: path.join(rootPath, 'dist/electron')
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.LoaderOptionsPlugin({ options: {} }),
    new VueLoaderPlugin(),
  ],
  resolve: {
    extensions: ['.js', '.json', '.node', '.vue'],
    alias: {
      vue$: 'vue/dist/vue.esm.js', // MAY BE USEFULL WHEN PROPERLY SETUP
    }
  },
  target: 'electron-main',
}

/**
 * Adjust mainConfig for development settings
 */
if (process.env.NODE_ENV !== 'production') {
  mainConfig.mode = 'production'
  mainConfig.plugins.push(
    new webpack.DefinePlugin({
      '__static': `"${path.join(rootPath, 'static').replace(/\\/g, '\\\\')}"`
    })
  )
  mainConfig.plugins.push(
    new webpack.DefinePlugin({
      '__lib': `"${path.join(rootPath, 'lib').replace(/\\/g, '\\\\')}"`
    })
  )
}

/**
 * Adjust mainConfig for production settings
 */
if (process.env.NODE_ENV === 'production') {
  mainConfig.plugins.push(
    new BabiliWebpackPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    })
  )
}

module.exports = mainConfig
