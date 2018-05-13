'use strict'

process.env.BABEL_ENV = 'web'

const path = require('path')
const webpack = require('webpack')

const BabiliWebpackPlugin = require('babili-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

let webConfig = {
  devtool: '#cheap-module-eval-source-map',
  entry: {
    web: path.join(__dirname, '../src/renderer/main.js')
  },
  module: {
    rules: [
      {
        test: /\.(js|vue)$/,
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
        test: /\.css$/,
        use: 'raw-loader'
      },
      {
        test: /\.xml$/,
        use: 'raw-loader'
      },
      {
        test: /\.html$/,
        use: 'vue-html-loader'
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
        include: [ path.resolve(__dirname, '../src/renderer') ],
        exclude: /node_modules/
      },
      {
        test: /\.vue$/,
        use: {
          loader: 'vue-loader',
          options: {
            extractCSS: true,
            loaders: {
              sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax=1',
              scss: 'vue-style-loader!css-loader!sass-loader'
            }
          }
        }
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        use: {
          loader: 'url-loader',
          query: {
            limit: 10000,
            name: 'imgs/[name].[ext]'
          }
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        use: {
          loader: 'url-loader',
          query: {
            limit: 10000,
            name: 'fonts/[name].[ext]'
          }
        }
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin('styles.css'),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, '../src/index.ejs'),
      minify: {
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        removeComments: true
      },
      nodeModules: false
    }),
    new webpack.DefinePlugin({
      'process.env.IS_WEB': 'true'
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new CopyWebpackPlugin([
      { from: path.resolve(__dirname, '../src/lib/blockly/blockly_accessible_compressed.js'),
      to: path.resolve(__dirname, '../dist/web/lib/blockly/blockly_accessible_compressed.js')
    }], {debug: 'debug'}),
    new CopyWebpackPlugin([
      { from: path.resolve(__dirname, '../src/lib/blockly/blockly_compressed.js'),
      to: path.resolve(__dirname, '../dist/web/lib/blockly/blockly_compressed.js')
    }], {debug: 'debug'}),
    new CopyWebpackPlugin([
      { from: path.resolve(__dirname, '../src/lib/eyo/edy_compressed.js'),
      to: path.resolve(__dirname, '../dist/web/lib/eyo/edy_compressed.js')
    }], {debug: 'debug'})
  ],
  output: {
    filename: '[name].js',
    path: path.join(__dirname, '../dist/web')
  },
  resolve: {
    alias: {
      '@': path.join(__dirname, '../src/renderer'),
      'vue$': 'vue/dist/vue.esm.js',
      'blockly': path.resolve(__dirname, '../src/lib/blockly/'),
      'eyo': path.resolve(__dirname, '../src/lib/eyo/'),
      'assets': path.resolve(__dirname, '../static/') 
    },
    extensions: ['.js', '.vue', '.json', '.css']
  },
  target: 'web'
}

/**
 * Adjust webConfig for production settings
 */
if (process.env.NODE_ENV === 'production') {
  webConfig.devtool = ''

  webConfig.plugins.push(
    new BabiliWebpackPlugin(),
    new CopyWebpackPlugin([
      {
        from: path.join(__dirname, '../static'),
        to: path.join(__dirname, '../dist/web/static'),
        ignore: ['.*']
      }
    ]),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  )
}

module.exports = webConfig
