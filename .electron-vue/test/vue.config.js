'use strict'

let path = require('path')

let chalk = require('chalk')

console.log(chalk.keyword('orange').bold('→ .electron-vue/test/vue.config.js'))

let rootPath = path.join(__dirname, '../..')

let VueLoaderPlugin = require('vue-loader/lib/plugin')

let config = {
  mode: 'none',
  entry: path.resolve(rootPath, '.electron-vue/test/index.js'),
  output: {
    path: path.resolve(rootPath, '.electron-vue/test/dist'),
    publicPath: '/dist/',
    filename: 'test-vue.js'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.scss$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'sass-loader'
        ]
      },
    ]
  },
  plugins: [
    // make sure to include the plugin!
    new VueLoaderPlugin()
  ],
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    },
    extensions: ['.vue']
  },
}

module.exports = config