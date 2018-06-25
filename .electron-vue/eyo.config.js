const path = require('path')
const webpack = require('webpack')

const CopyWebpackPlugin = require('copy-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

var ConfigEyo = function (target, dist, env) {
  this.options = {
    web: {
      no_tippy: false,
      brython_debug: false,
      no_brython_sources: false,
      no_edython: false,
      no_xregexp: false,
      no_brython: false,
      no_resources: false,
    },
    renderer: {
      no_tippy: false,
      brython_debug: false,
      no_brython_sources: false,
      no_edython: false,
      no_xregexp: false,
      no_brython: false,
      no_resources: false,
    },
    test: {
      no_tippy: false,
      brython_debug: false,
      brython_sources: false,
      no_edython: false,
      no_xregexp: false,
      no_brython: false,
      no_resources: false,
    }   
  } [env]
  if (!this.options) {
    console.log('BAD ENV KEY')
    exit(-1)
  }
  this.target = target
  this.dist = dist
  this.env = env
  this.rootPath = path.resolve(__dirname, '..')
  this.distPath = path.join(this.rootPath, 'dist', dist)
  this.srcPath = path.join(this.rootPath, 'src')
}

ConfigEyo.prototype.getConfig = function () {
  var config = {}
  config.target = this.target
  config.output = {
    filename: '[name].js',
    path: this.distPath
  }
  config.devtool = '#cheap-module-eval-source-map'
  config.entry = {}
  config.entry[this.env] = path.join(this.srcPath, 'renderer', 'main.js')
  config.module = {
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
        use: [ 'style-loader', 'css-loader' ]
      },
      {
        test: /\.html$/,
        use: 'vue-html-loader'
      },
      {
        test: /\.(xml|txt|md)$/,
        use: 'raw-loader'
      },
      {
        test: /\.vue$/,
        use: {
          loader: 'vue-loader',
          options: {
            extractCSS: this.env === 'web' || process.env.NODE_ENV === 'production',
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
            name: 'imgs/[name]--[folder].[ext]'
          }
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'media/[name]--[folder].[ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        use: {
          loader: 'url-loader',
          query: {
            limit: 10000,
            name: 'fonts/[name]--[folder].[ext]'
          }
        }
      },
      function () {
        var model = {
          test: /\.js$/,
          use: 'babel-loader',
          exclude: /node_modules/
        }
        if (this.env === 'web') {
          model.include = [ path.join(this.srcPath, 'renderer') ]
        }
        return model
      } (),
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        use: {
          loader: 'url-loader',
          query: {
            limit: 10000,
            name: 'imgs/[name]--[folder].[ext]'
          }
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'media/[name]--[folder].[ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        use: {
          loader: 'url-loader',
          query: {
            limit: 10000,
            name: 'fonts/[name]--[folder].[ext]'
          }
        }
      },
    ]
  }
  if (this.env === 'renderer') {
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader'
    })
  }
  config.plugins = [
    new ExtractTextPlugin('styles.css'),
    new HtmlWebpackPlugin(
      {
        filename: 'index.html',
        template: path.join(this.srcPath, 'index.ejs'),
        minify: {
          collapseWhitespace: false,// otherwise python code would not survive?
          removeAttributeQuotes: true,
          removeComments: true
        },
        nodeModules: this.env !== 'web' && process.env.NODE_ENV !== 'production'
          ? path.join(this.rootPath, 'node_modules')
          : false,
        no_tippy: this.options.no_tippy,
        no_edython: this.options.no_edython,
        no_xregexp: this.options.no_xregexp,
        no_brython: this.options.no_brython,
        no_brython_sources: this.options.no_brython_sources,
        brython_debug: this.options.brython_debug,
      }
    ),
    // new webpack.DefinePlugin(
    //   {
    //     'process.env.IS_WEB': 'true'
    //   }
    // ),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ]
  config.resolve = {
    alias: {
      '@': path.join(this.srcPath, 'renderer'),
      'vue$': path.join('vue', 'dist', 'vue.esm.js'),
      'blockly': path.join(this.srcPath, 'lib', 'blockly/'),
      'eyo': path.join(this.srcPath, 'lib', 'eyo'),
      '@static': path.resolve(this.srcPath, '../static/'),
      // '@@@@': path.resolve(this.rootPath, 'static/')
    },
    extensions: ['.js', '.vue', '.json', '.css', '.node', '.txt', '.xml']
  }
  config.node = this.env === 'web' ? { // web
    fs: 'empty'
  } : {
    __dirname: process.env.NODE_ENV !== 'production',
    __filename: process.env.NODE_ENV !== 'production'
  }
  if (this.env !== 'web' && process.env.NODE_ENV !== 'production') {
    config.plugins.push(
      new webpack.DefinePlugin({
        '__static': `"${path.join(__dirname, '../static').replace(/\\/g, '\\\\')}"`
      })
    )
  }
  this.enableXRegExp(config)
  this.enableBrython(config)
  this.enableBrythonSources(config)
  this.enableEdython(config)
  this.enableTippy(config)
  this.enableResources(config)
  return config
}


ConfigEyo.prototype.enablePolyFills = function (config) {
  if (this.options.no_polyfills) {
    return
  }
  config.plugins.push(
    new CopyWebpackPlugin([
      {
        from: path.join(this.srcPath, 'lib/polyfills/Array/some.js'),
        to: path.join(this.distPath, 'lib/polyfills/Array/some.js')
      }
    ], {debug: 'debug'})
  )
}

ConfigEyo.prototype.enableXRegExp = function (config) {
  if (this.options.no_xregexp) {
    return
  }
  config.plugins.push(
    new CopyWebpackPlugin([
      {
        from: path.join(this.srcPath, 'lib/xregexp-all/xregexp-all.js'),
        to: path.join(this.distPath, 'lib/xregexp-all.js')
      }
    ], {debug: 'debug'})
  )
}

ConfigEyo.prototype.enableBrython = function (config) {
  if (this.options.no_brython) {
    return
  }
  config.plugins.push(
    new CopyWebpackPlugin(
      [
        {
          from: path.join(this.srcPath, 'lib/brython/www/src/**'),
          to: path.join(this.distPath, '[1]'),
          test: /^.*\/src\/lib\/brython\/www\/(src\/.+)$/,
        },
        {
          from: path.join(this.srcPath, 'lib/site-packages/**'),
          to: path.join(this.distPath, 'src/Lib/[1]'),
          test: /..\/src\/lib(\/.+\.py)$/,
        },
        {
          from: path.join(this.srcPath, 'lib/site-packages/console.py'),
          to: path.join(this.distPath, 'console.py')
        }
      ], {debug: 'debug'}
    )
  )
}

ConfigEyo.prototype.enableBrythonSources = function (config) {
  if (this.options.no_brython_sources) {
    return
  }
  /**
   * this one is for embedding brython sources
   */
}

ConfigEyo.prototype.enableEdython = function (config) {
  if (this.options.no_edython) {
    return
  }
  config.plugins.push(
    new CopyWebpackPlugin(
      [
        { from: path.join(this.rootPath, 'build/base/edython.js'),
          to: path.join(this.distPath, 'lib/edython.js')
        },
        { from: path.join(this.srcPath, 'lib/eyo/css/eyo.css'),
          to: path.join(this.distPath, 'lib/edython.css')
        }
      ],
      {
        debug: 'debug'
      }
    )
  )
}

ConfigEyo.prototype.enableTippy = function (config) {
  if (this.options.no_tippy) {
    return
  }
  config.plugins.push(
    new CopyWebpackPlugin(
      [
        { from: path.join(this.rootPath, 'node_modules/tippy.js/dist/tippy.min.js'),
          to: path.join(this.distPath, 'lib/tippy.min.js')
        },
        { from: path.join(this.rootPath, 'node_modules/tippy.js/dist/tippy.css'),
          to: path.join(this.distPath, 'lib/tippy.css')
        }
      ],
      {
        debug: 'debug'
      }
    )
  )
}

ConfigEyo.prototype.enableResources = function (config) {
  if (this.options.no_resources) {
    return
  }
  config.plugins.push(
    new CopyWebpackPlugin(
      [
        {
          from: path.join(this.srcPath, 'lib/blockly/media/**'),
          to: path.join(this.distPath, 'static[1]'),
          test: /..\/src\/lib\/blockly(\/media\/.+)$/,
        },
        {
          from: path.join(this.rootPath, 'font/*.woff'),
          to: path.join(this.distPath, 'static/')
        },
        {
          from: path.join(this.rootPath, 'gfx/icon.svg'),
          to: path.join(this.distPath, 'static/icon.svg')
        }
      ],
      {
        debug: 'debug'
      }
    )
  )
}

ConfigEyo.get = function(target, dist, env) {
  var eyo = new ConfigEyo(target, dist, env)
  return eyo.getConfig()
}

module.exports = ConfigEyo