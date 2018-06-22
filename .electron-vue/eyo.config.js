const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

var X = module.exports = {
  options_: {
    web: {
      no_tippy: false,
      brython_debug: false,
      no_brython_sources: false,
      no_edython: false,
      no_xregexp: false,
      no_brython: false,
    },
    renderer: {
      no_tippy: false,
      brython_debug: false,
      no_brython_sources: false,
      no_edython: false,
      no_xregexp: false,
      no_brython: false,
    },
    test: {
      no_tippy: false,
      brython_debug: false,
      brython_sources: false,
      no_edython: false,
      no_xregexp: false,
      no_brython: false,
    }
  }
}

X.xregexp_all = function (plugins, where) {
  if (X.options.no_xregexp) {
    return
  }
  /**
   * xregexp
   */
  plugins.push(
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../src/lib/xregexp-all/xregexp-all.js'),
        to: path.resolve(__dirname, '../dist/'+where+'/lib/xregexp-all.js')
      }
    ], {debug: 'debug'})
  )
}

X.brython_sources = function (plugins, where) {
  if (X.options.no_brython_sources) {
    return
  }
  /**
   * this one is for embedding brython sources
   */
  plugins.push(
    new CopyWebpackPlugin(
      [
        {
          from: path.resolve(__dirname, '../src/lib/brython/www/src/**'),
          to: path.resolve(__dirname, '../dist/'+where+'/[1]'),
          test: /^.*\/src\/lib\/brython\/www\/(src\/.+)$/,
        },
        {
          from: path.resolve(__dirname, '../src/lib/site-packages/**'),
          to: path.resolve(__dirname, '../dist/'+where+'/src/Lib[1]'),
          test: /..\/src\/lib(\/.+\.py)$/,
        },
        {
          from: path.resolve(__dirname, '../src/lib/site-packages/console.py'),
          to: path.resolve(__dirname, '../dist/'+where+'/console.py'),
        }
      ], {debug: 'debug'}
    )
  )
}

X.edython = function (plugins, where) {
  if (X.options.no_edython) {
    return
  }
  /**
   * this one is for embedding edython (and embedded blockly/closure) sources
   */
  plugins.push(
    new CopyWebpackPlugin(
      [
        { from: path.resolve(__dirname, '../build/base/edython.js'),
          to: path.resolve(__dirname, '../dist/'+where+'/lib/edython.js')
        },
        { from: path.resolve(__dirname, '../src/lib/eyo/css/eyo.css'),
          to: path.resolve(__dirname, '../dist/'+where+'/lib/edython.css')
        }
      ],
      {
        debug: 'debug'
      }
    )
  )
}

X.tippy = function (plugins, where) {
  if (X.options.no_tippy) {
    return
  }
  /**
   * this one is for embedding tippy, for direct access
   */
  plugins.push(
    new CopyWebpackPlugin(
      [
        { from: path.resolve(__dirname, '../node_modules/tippy.js/dist/tippy.min.js'),
          to: path.resolve(__dirname, '../dist/'+where+'/lib/tippy.min.js')
        },
        { from: path.resolve(__dirname, '../node_modules/tippy.js/dist/tippy.css'),
          to: path.resolve(__dirname, '../dist/'+where+'/lib/tippy.css')
        }
      ],
      {
        debug: 'debug'
      }
    )
  )
}

X.resources = function (plugins, where) {
  if (X.options.no_resources) {
    return
  }
  plugins.push(
    new CopyWebpackPlugin(
      [
        {
          from: path.resolve(__dirname, '../src/lib/blockly/media/**'),
          to: path.resolve(__dirname, '../dist/'+where+'/static[1]'),
          test: /..\/src\/lib\/blockly(\/media\/.+)$/,
        },
        {
          from: path.resolve(__dirname, '../font/*.woff'),
          to: path.resolve(__dirname, '../dist/'+where+'/static/')
        },
        {
          from: path.resolve(__dirname, '../gfx/icon.svg'),
          to: path.resolve(__dirname, '../dist/'+where+'/static/icon.svg')
        }
      ],
      {
        debug: 'debug'
      }
    )
  )
}

X.init = function (key) {
  X.options = X.options_[key]
}

