var exports = {
  options_: {
    web: {
      no_tippy: false,
      brython_debug: true,
      no_edython: false,
      no_xregexp: false,
      no_brython: false,
    },
    renderer: {
      no_tippy: false,
      brython_debug: false,
      no_edython: false,
      no_xregexp: false,
      no_brython: false,
    },
    test: {
      no_tippy: false,
      brython_debug: false,
      no_edython: false,
      no_xregexp: false,
      no_brython: false,
    }
  }
}

exports.xregex_all = function (plugins, where) {
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

exports.brython_sources = function (plugins, where) {
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

exports.edython = function (plugins, where) {
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

exports.tippy = function (plugins, where) {
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

exports.resources = function (plugins, where) {
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

exports.init = function (key) {
  exports.options = exports.options_[key]
}

module.exports = exports
