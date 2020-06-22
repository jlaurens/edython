const path = require('path')
const webpack = require('webpack')

const CopyWebpackPlugin = require('copy-webpack-plugin')
const CssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

var ConfigEyo = function (target, dist, env) {
  this.options = {
    web: {
      no_tippy: false,
      brython_debug: false,
      no_brython_sources: true,
      no_edython: false,
      no_xregexp: false,
      no_brython: false,
      no_resources: false,
      no_polyfills: false,
    },
    renderer: {
      no_tippy: false,
      brython_debug: false,
      no_brython_sources: true,
      no_edython: false,
      no_xregexp: false,
      no_brython: false,
      no_resources: false,
      no_polyfills: false,
    },
    test: {
      no_tippy: false,
      brython_debug: false,
      no_brython_sources: true,
      no_edython: false,
      no_xregexp: false,
      no_brython: false,
      no_resources: false,
      no_polyfills: false,
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
  this.distStaticPath = path.join(this.distPath, 'static')
  this.distLibPath = path.join(this.distPath, 'lib')
  this.staticPath = path.join(this.rootPath, 'static')
  this.srcPath = path.join(this.rootPath, 'src')
  this.fontPath = path.join(this.srcPath, 'font')
  this.jsPath = path.join(this.srcPath, 'js')
  this.vuePath = path.join(this.srcPath, 'vue')
  this.rendererPath = path.join(this.vuePath, 'renderer')
  this.langPath = path.join(this.rendererPath, 'lang')
  this.envPath = path.join(this.rendererPath, 'env', this.env)
  this.componentsPath = path.join(this.rendererPath, 'components')
  this.utilPath = path.join(this.componentsPath, 'Util')
  this.iconPath = path.join(this.componentsPath, 'Icon')
  console.log('\neyo.config.js:\n==============')
  console.log('this.rootPath:', this.rootPath)
  console.log('this.distPath :', this.distPath)
  console.log('this.staticPath :', this.staticPath)
  console.log('this.srcPath :', this.srcPath)
  console.log('this.jsPath :', this.jsPath)
  console.log('this.vuePath :', this.vuePath)
  console.log('this.rendererPath :', this.rendererPath)
  console.log('this.langPath :', this.langPath)
  console.log('this.envPath :', this.envPath)
  console.log('this.componentsPath :', this.componentsPath)
  console.log('this.utilPath :', this.utilPath)
  console.log('this.iconPath :', this.iconPath)
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
  config.entry[this.env] = this.envPath
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
      // {
      //   test: /\.(xml)$/,
      //   use: path.resolve(this.jsPath, 'loaders', 'eyo-loader.js')
      // },
      {
        test: /\.eyox$/,
        use: [
          'raw-loader',
          // path.resolve(this.jsPath, 'loaders', 'eyo-loader.js')
        ]
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
        resourceQuery: /blockType=i18n/,
        loader: '@kazupon/vue-i18n-loader'
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
      (() => {
        var model = {
          test: /\.js$/,
          use: 'babel-loader',
          exclude: /node_modules/
        }
        if (this.env === 'web') {
          model.include = [ path.join(this.srcPath, 'renderer') ]
        }
        return model
      }) (),
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
    new CssExtractPlugin('styles.css'),
    new HtmlWebpackPlugin(
      {
        filename: 'index.html',
        template: path.join(this.vuePath, 'index.ejs'),
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
      'vue$': path.join('vue', 'dist', 'vue.esm.js'),
      '@eyo': path.join(this.jsPath, 'lib', 'eyo'),
      '@root': this.rootPath,
      '@src': this.srcPath,
      '@js': this.jsPath,
      '@static': this.staticPath,
      '@lang': this.langPath,
      '@env': this.envPath,
      '@': this.rendererPath,
      '@@': this.componentsPath,
      // '@@@@': path.resolve(this.rootPath, 'static/')
    },
    extensions: ['.js', '.vue', '.json', '.css', '.node', '.txt', '.xml', '.eyo', '.py']
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
  // this.enablePolyFills(config)
  return config
}


ConfigEyo.prototype.enablePolyFills = function (config) {
  if (this.options.no_polyfills) {
    return
  }
  config.plugins.push(
    new CopyWebpackPlugin([
      {
        context: this.srcPath,
        from: 'lib/polyfills/Array/some.js',
        to: path.join(this.distLibPath, 'polyfills/Array/some.js')
      }
    ], {debug: 'debug'})
  )
}

ConfigEyo.prototype.enableXRegExp = function (config) {
  if (this.options.no_xregexp) {
    return
  }
  config.plugins.push(
    new CopyWebpackPlugin({
      patterns: [
        {
          context: this.srcPath,
          from: 'lib/xregexp-all/xregexp-all.js',
          to: path.join(this.distLibPath, 'xregexp-all.js')
        },
      ],
    }, {debug: 'debug'})// <-- lost when upgrading to webpack 4
  )
}

ConfigEyo.prototype.enableBrython = function (config) {
  if (this.options.no_brython) {
    return
  }
  config.plugins.push(
    new CopyWebpackPlugin({
      patterns: [
        {
          context: path.join(this.srcPath, 'lib/brython/www/src/'),
          from: '**/*',
          to: path.join(this.distPath, 'src'),
          toType: 'dir',
        },
        {
          context: path.join(this.srcPath, 'lib/site-packages/'),
          from: '**/*',
          to: path.join(this.distPath, 'src/Lib/'),
          toType: 'dir',
        },
        {
          context: path.join(this.srcPath, 'lib/site-packages/'),
          from: 'consoleJL.py',
          to: path.join(this.distPath, 'consoleJL.py')
        }
      ]}, {debug: 'debug'}
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
  config.plugins.push(
    new CopyWebpackPlugin({
      patterns: [
        {
          context: path.join(this.srcPath, 'lib/brython/www/'),
          from: 'src/**/*',
          to: this.distPath,
          toType: 'dir',
        }
      ]}, {debug: 'debug'}
    )
  )
}

ConfigEyo.prototype.enableEdython = function (config) {
  if (this.options.no_edython) {
    return
  }
  config.plugins.push(
    new CopyWebpackPlugin({
      patterns: [
        { from: path.join(this.rootPath, 'build/base/edython.js'),
          to: path.join(this.distLibPath, 'edython.js')
        },
        { from: path.join(this.srcPath, 'lib/eyo/css/eyo.css'),
          to: path.join(this.distLibPath, 'edython.css')
        }
      ]}, {debug: 'debug'}
    )
  )
}

ConfigEyo.prototype.enableTippy = function (config) {
  if (this.options.no_tippy) {
    return
  }
  config.plugins.push(
    new CopyWebpackPlugin({
      patterns: [
        { from: path.join(this.rootPath, 'node_modules/tippy.js/dist/tippy.umd.min.js'),
          to: path.join(this.distLibPath, 'tippy.umd.min.js')
        },
        { from: path.join(this.rootPath, 'node_modules/tippy.js/dist/tippy.css'),
          to: path.join(this.distLibPath, 'tippy.css')
        }
      ]}, {debug: 'debug'}
    )
  )
}

ConfigEyo.prototype.enableResources = function (config) {
  if (this.options.no_resources) {
    return
  }
  config.plugins.push(
    new CopyWebpackPlugin({
      patterns: [
        {
          context: path.join(this.srcPath, 'lib/eyo/'),
          from: path.join(this.srcPath, '**/*'),
          to: this.distStaticPath,
          toType: 'dir',
        },
        {
          context: this.fontPath,
          from: '*.woff',
          to: this.distStaticPath,
          toType: 'file',
        },
        {
          context: path.join(this.rootPath, 'gfx'),
          from: 'icon.svg',
          to: this.distStaticPath,
          toType: 'dir',
        },
        {
          context: path.join(this.rootPath, 'gfx'),
          from: 'icon_light.svg',
          to: this.distStaticPath,
          toType: 'dir',
        },
        {
          context: path.join(this.rootPath, 'src/lib/eyo/'),
          from: 'web_workers',
          to: this.distPath,
          toType: 'dir',
        },
      ]},
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