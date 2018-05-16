'use strict'

process.env.BABEL_ENV = 'renderer'

const path = require('path')
const { dependencies } = require('../package.json')
const webpack = require('webpack')

const BabiliWebpackPlugin = require('babili-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

/**
 * List of node_modules to include in webpack bundle
 *
 * Required for specific packages like Vue UI libraries
 * that provide pure *.vue files that need compiling
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/webpack-configurations.html#white-listing-externals
 */
let whiteListedModules = ['vue']

let rendererConfig = {
  devtool: '#cheap-module-eval-source-map',
  entry: {
    renderer: path.join(__dirname, '../src/renderer/main.js')
  },
  externals: [
    ...Object.keys(dependencies || {}).filter(d => !whiteListedModules.includes(d))
  ],
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
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader'
        })
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
        exclude: /node_modules/
      },
      {
        test: /\.node$/,
        use: 'node-loader'
      },
      {
        test: /\.vue$/,
        use: {
          loader: 'vue-loader',
          options: {
            extractCSS: process.env.NODE_ENV === 'production',
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
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader'
        })
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
      }
    ]
  },
  node: {
    __dirname: process.env.NODE_ENV !== 'production',
    __filename: process.env.NODE_ENV !== 'production'
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
      nodeModules: process.env.NODE_ENV !== 'production'
        ? path.resolve(__dirname, '../node_modules')
        : false,
      full_debug: process.env.NODE_ENV === 'production'? false: true,// NOT IN PRODUCTION
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new CopyWebpackPlugin([
      { from: path.resolve(__dirname, '../src/lib/xregexp-all/xregexp-all.js'),
      to: path.resolve(__dirname, '../dist/electron/lib/xregexp-all.js')
    }], {debug: 'debug'})
  ],
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '../dist/electron')
  },
  resolve: {
    alias: {
      '@': path.join(__dirname, '../src/renderer'),
      'vue$': 'vue/dist/vue.esm.js',
      'blockly': path.resolve(__dirname, '../src/lib/blockly/'),
      'eyo': path.resolve(__dirname, '../src/lib/eyo/'),
      'assets': path.resolve(__dirname, '../static/')
    },
    extensions: ['.js', '.vue', '.json', '.css', '.node']
  },
  target: 'electron-renderer'
}

/**
 * Adjust for debugging. The necessary blockly file is included
 * the necessary goog files as well.
 * The process is not fully automatized.
 */
if (process.env.EYO_BUILD_MODE === 'debug') {
  rendererConfig.plugins.push(new CopyWebpackPlugin([
    { from: path.resolve(__dirname, '../src/lib/closure-library/closure/goog/'),
    to: path.resolve(__dirname, '../dist/electron/lib/closure-library/closure/goog/')
  }], {debug: 'debug'}))
  rendererConfig.plugins.push(new CopyWebpackPlugin([
    { from: path.resolve(__dirname, '../src/lib/blockly/'),
    to: path.resolve(__dirname, '../dist/electron/lib/blockly/')
  }], {debug: 'debug'}))
  rendererConfig.plugins.push(new CopyWebpackPlugin([
    { from: path.resolve(__dirname, '../src/lib/blockly/msg/js/fr.js'),
    to: path.resolve(__dirname, '../dist/electron/lib/blockly/msg/js/fr.js')
  }], {debug: 'debug'}))
  rendererConfig.plugins.push(new CopyWebpackPlugin([
    { from: path.resolve(__dirname, '../src/lib/eyo/'),
    to: path.resolve(__dirname, '../dist/electron/lib/eyo/')
  }], {debug: 'debug'}))
  var copyFileList = function (from, what) {
    console.log('EYO DEBUG MODE: Copying from '+from+' files:', what.length)
    for (var i = 0; i < what.length; i++) {
     var requirement = what[i]
     rendererConfig.plugins.push(new CopyWebpackPlugin([
         { from: path.resolve(__dirname, '../src/lib/'+from+requirement),
         to: path.resolve(__dirname, '../dist/electron/lib/'+from+requirement)
       }], {debug: 'debug'})
     )
    }
  }
  var closure_requirements = [
    'base.js',
    'a11y/aria/aria.js',
    'a11y/aria/attributes.js',
    'a11y/aria/datatables.js',
    'a11y/aria/roles.js',
    'array/array.js',
    'asserts/asserts.js',
    'async/freelist.js',
    'async/nexttick.js',
    'async/run.js',
    'async/workqueue.js',
    'color/color.js',
    'color/names.js',
    'date/date.js',
    'date/datelike.js',
    'date/daterange.js',
    'debug/debug.js',
    'debug/entrypointregistry.js',
    'debug/error.js',
    'debug/errorcontext.js',
    'debug/logbuffer.js',
    'debug/logger.js',
    'debug/logrecord.js',
    'disposable/disposable.js',
    'disposable/idisposable.js',
    'dom/animationframe/animationframe.js',
    'dom/animationframe/polyfill.js',
    'dom/asserts.js',
    'dom/browserfeature.js',
    'dom/classlist.js',
    'dom/dom.js',
    'dom/htmlelement.js',
    'dom/iframe.js',
    'dom/nodeiterator.js',
    'dom/nodetype.js',
    'dom/safe.js',
    'dom/tagiterator.js',
    'dom/tagname.js',
    'dom/tags.js',
    'dom/vendor.js',
    'events/browserevent.js',
    'events/browserfeature.js',
    'events/event.js',
    'events/eventhandler.js',
    'events/eventid.js',
    'events/events.js',
    'events/eventtarget.js',
    'events/eventtype.js',
    'events/focushandler.js',
    'events/keycodes.js',
    'events/keyhandler.js',
    'events/listenable.js',
    'events/listener.js',
    'events/listenermap.js',
    'fs/url.js',
    'functions/functions.js',
    'fx/dragger.js',
    'fx/transition.js',
    'html/safehtml.js',
    'html/safescript.js',
    'html/safestyle.js',
    'html/safestylesheet.js',
    'html/safeurl.js',
    'html/trustedresourceurl.js',
    'html/uncheckedconversions.js',
    'i18n/bidi.js',
    'i18n/datetimeformat.js',
    'i18n/datetimepatterns.js',
    'i18n/datetimesymbols.js',
    'i18n/timezone.js',
    'iter/iter.js',
    'labs/useragent/browser.js',
    'labs/useragent/engine.js',
    'labs/useragent/platform.js',
    'labs/useragent/util.js',
    'log/log.js',
    'math/box.js',
    'math/coordinate.js',
    'math/irect.js',
    'math/math.js',
    'math/rect.js',
    'math/size.js',
    'object/object.js',
    'positioning/abstractposition.js',
    'positioning/anchoredposition.js',
    'positioning/anchoredviewportposition.js',
    'positioning/clientposition.js',
    'positioning/menuanchoredposition.js',
    'positioning/positioning.js',
    'positioning/viewportclientposition.js',
    'promise/promise.js',
    'promise/resolver.js',
    'promise/thenable.js',
    'reflect/reflect.js',
    'string/const.js',
    'string/string.js',
    'string/stringbuffer.js',
    'string/typedstring.js',
    'structs/map.js',
    'structs/structs.js',
    'structs/trie.js',
    'style/bidi.js',
    'style/style.js',
    'timer/timer.js',
    'ui/colorpalette.js',
    'ui/colorpicker.js',
    'ui/component.js',
    'ui/container.js',
    'ui/containerrenderer.js',
    'ui/control.js',
    'ui/controlcontent.js',
    'ui/controlrenderer.js',
    'ui/datepicker.js',
    'ui/datepickerrenderer.js',
    'ui/defaultdatepickerrenderer.js',
    'ui/idgenerator.js',
    'ui/menu.js',
    'ui/menuheader.js',
    'ui/menuheaderrenderer.js',
    'ui/menuitem.js',
    'ui/menuitemrenderer.js',
    'ui/menurenderer.js',
    'ui/menuseparator.js',
    'ui/menuseparatorrenderer.js',
    'ui/modalariavisibilityhelper.js',
    'ui/palette.js',
    'ui/paletterenderer.js',
    'ui/popupbase.js',
    'ui/popupmenu.js',
    'ui/registry.js',
    'ui/selectionmodel.js',
    'ui/separator.js',
    'ui/submenu.js',
    'ui/submenurenderer.js',
    'ui/tree/basenode.js',
    'ui/tree/treecontrol.js',
    'ui/tree/treenode.js',
    'ui/tree/typeahead.js',
    'useragent/platform.js',
    'useragent/product.js',
    'useragent/product_isversion.js',
    'useragent/useragent.js',
  ]
  var closure_requirements = [
    'structs/map.js',
    'base.js',
    'ui/modalpopup.js',
    'ui/dialog.js',
    'ui/submenu.js',
    'ui/popupmenu.js',
  ]
  //copyFileList('closure-library/closure/goog/', closure_requirements)
  var eyo_requirements = [
    'block/consolidator.js',
    'block/delegate.js',
    'block/delegate_svg.js',
    'block/delegate_svg_argument.js',
    'block/delegate_svg_assignment.js',
    'block/delegate_svg_comp.js',
    'block/delegate_svg_control.js',
    'block/delegate_svg_expr.js',
    'block/delegate_svg_final.js',
    'block/delegate_svg_group.js',
    'block/delegate_svg_import.js',
    'block/delegate_svg_lambda.js',
    'block/delegate_svg_list.js',
    'block/delegate_svg_literal.js',
    'block/delegate_svg_math.js',
    'block/delegate_svg_operator.js',
    'block/delegate_svg_primary.js',
    'block/delegate_svg_print.js',
    'block/delegate_svg_proc.js',
    'block/delegate_svg_stmt.js',
    'block/delegate_svg_term.js',
    'block/delegate_svg_try.js',
    'block/delegate_svg_yield.js',
    'block/development.js',
    'block/draw.js',
    'block/helper.js',
    'block/python.js',
    'block/tile.js',
    'block/xml.js',
    'blockly/block.js',
    'blockly/block_svg.js',
    'blockly/bugfix.js',
    'blockly/events.js',
    'blockly/fake_blockly_provider.js',
    'blockly/field_label.js',
    'blockly/field_textinput.js',
    'blockly/input.js',
    'blockly/rendered_connection.js',
    'blockly/workspace.js',
    'blockly/workspace_svg.js',
    'closure-library/menu.js',
    'closure-library/menuitem.js',
    'closure-library/menuitemrenderer.js',
    'closure-library/menurenderer.js',
    'closure-library/popupmenu.js',
    'closure-library/submenu.js',
    'closure-library/submenurenderer.js',
    'core/T3.js',
    'core/T3_all.js',
    'core/const.js',
    'core/data-test.js',
    'core/data.js',
    'core/do.js',
    'core/eyo.js',
    'core/fake_eyo_provider.js',
    'core/ui.js',
    'debugging.js',
    'msg/js/base.js',
    'workspace/key_handler.js',
    'workspace/menu_manager.js',
  ]
  //copyFileList('eyo/', eyo_requirements)
}

/**
 * Adjust rendererConfig for development settings
 */
if (process.env.NODE_ENV !== 'production') {
  rendererConfig.plugins.push(
    new webpack.DefinePlugin({
      '__static': `"${path.join(__dirname, '../static').replace(/\\/g, '\\\\')}"`
    })
  )
}

/**
 * Adjust rendererConfig for production settings
 */
if (process.env.NODE_ENV === 'production') {
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
      minimize: true
    })
  )
}

module.exports = rendererConfig
