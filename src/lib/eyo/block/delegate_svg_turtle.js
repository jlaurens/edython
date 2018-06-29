/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Math module blocks for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.DelegateSvg.Turtle')

goog.require('eYo.DelegateSvg.Stmt')

goog.require('eYo.DelegateSvg.List')
goog.require('eYo.DelegateSvg.Primary')

goog.require('eYo.Tooltip')
goog.require('eYo.FlyoutCategory')

/**
 * Class for a DelegateSvg, import turtle block.
 * A unique block for each module to ease forthcoming management.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('turtle__import_stmt', {
  xml: {
    tag: 'turtle__import',
  },
  fields: {
    label: {
      value: 'import',
      css: 'builtin'
    },
    turtle: {
      value: 'turtle'
    }
  }
})

/**
 * Class for a DelegateSvg, call block.
 * As call is already a reserved message in javascript,
 * we use call_expr instead.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */

 eYo.DelegateSvg.Expr.module__call_expr.makeSubclass('turtle__call_expr', {
  data: {
    variant: {
      all: ['nameMotion', 'nameState', 'namePen', 'nameEvent', 'nameSpecial', 'nameScreen', 'nameAnimation', 'nameInput', 'nameSettings', 'nameScreenOnly', 'namePublic'],
      noUndo: true,
      xml: false,  
    },
    nameMotion: {
      all: ['forward', 'fd', 'back', 'backward', 'bk', 'right', 'rt', 'left', 'lt', 'goto', 'setpos', 'setposition', 'setx', 'sety', 'setheading', 'seth', 'home', 'circle', 'dot', 'stamp', 'clearstamp', 'clearstamps', 'undo', 'speed', 'position', 'pos', 'towards', 'xcor', 'ycor', 'heading', 'distance', 'degrees', 'radians'],
      noUndo: true,
      xml: false,
      didChange: /** @suppress {globalThis} */ function () {
        this.data.variant.set('nameMotion')
      }
    },
    namePen: {
      all: ['pendown', 'pd', 'down', 'penup', 'pu', 'up', 'pensize', 'width', 'pensize', 'pen', 'isdown', 'pencolor', 'fillcolor', 'color', 'filling', 'begin_fill', 'end_fill', 'reset', 'clear', 'write'],
      noUndo: true,
      xml: false,
      didChange: /** @suppress {globalThis} */ function () {
        this.data.variant.set('namePen')
      }
    },
    nameState: {
      all: ['hideturtle', 'ht', 'showturtle', 'st', 'shape', 'resizemode', 'shapesize', 'turtlesize', 'shearfactor', 'tilt', 'settiltangle', 'shapetransform', 'get_shapepoly'],
      noUndo: true,
      xml: false,
      didChange: /** @suppress {globalThis} */ function () {
        this.data.variant.set('nameState')
      }
    },
    nameEvent: {
      all: ['onclick', 'onrelease', 'ondrag', 'listen', 'onkey', 'onkeyrelease', 'onkeypress', 'onclick', 'ontimer', 'mainloop', 'done'],
      noUndo: true,
      xml: false,
      didChange: /** @suppress {globalThis} */ function () {
        this.data.variant.set('nameEvent')
      }
    },
    nameSpecial: {
      all: ['begin_poly', 'end_poly', 'get_poly', 'clone', 'getturtle', 'getpen', 'getscreen', 'setundobuffer', 'undobufferentries'],
      noUndo: true,
      xml: false,
      didChange: /** @suppress {globalThis} */ function () {
        this.data.variant.set('nameSpecial')
      }
    },
    nameScreen: {
      all: ['bgcolor', 'bgpic', 'clear', 'clearscreen', 'reset', 'resetscreen', 'screensize', 'setworldcoordinates'],
      noUndo: true,
      xml: false,
      didChange: /** @suppress {globalThis} */ function () {
        this.data.variant.set('nameScreen')
      }
    },
    nameAnimation: {
      all: ['delay', 'tracer', 'update'],
      noUndo: true,
      xml: false,
      didChange: /** @suppress {globalThis} */ function () {
        this.data.variant.set('nameAnimation')
      }
    },
    nameInput: {
      all: ['textinput', 'numinput'],
      noUndo: true,
      xml: false,
      didChange: /** @suppress {globalThis} */ function () {
        this.data.variant.set('nameInput')
      }
    },
    nameSettings: {
      all: ['mode', 'colormode', 'getcanvas', 'getshapes', 'register_shape', 'addshape', 'turtles', 'window_height', 'window_width'],
      noUndo: true,
      xml: false,
      didChange: /** @suppress {globalThis} */ function () {
        this.data.variant.set('nameSettings')
      }
    },
    nameScreenOnly: {
      all: ['bye', 'exitonclick', 'setup', 'title'],
      noUndo: true,
      xml: false,
      didChange: /** @suppress {globalThis} */ function () {
        this.data.variant.set('nameScreenOnly')
      }
    },
    namePublic: {
      all: ['RawTurtle', 'RawPen', 'Turtle', 'TurtleScreen', 'Screen', 'Shape', 'addcomponent', 'Vec2D'],
      noUndo: true,
      xml: false,
      didChange: /** @suppress {globalThis} */ function () {
        this.data.variant.set('namePublic')
      }
    },
    name: {
      init: /** @suppress {globalThis} */ function () {
        this.set('sqrt')
        this.isFinite = true
      },
      synchronize: true,
      validate: false,
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        var variants = this.data.variant.getAll()
        for (var i = 0; i < variants.count; i++) {
          this.data[variants[i]].set(newValue)
        }
        var d = this.data.ary
        var zaries = [
          'begin_fill',
          'begin_poly',
          'clear',
          'clone',
          'end_fill',
          'end_poly',
          'filling',
          'get_poly',
          'get_shapepoly',
          'getscreen',
          'getturtle',
          'reset',
          'stamp',
          'undo',
          'undobufferentries',
          'color',
          'hideturtle',
          'isdown',
          'isvisible',
          'pendown',
          'penup',
          'showturtle',
          'heading',
          'home',
          'pos',
          'radians',
          'xcor',
          'ycor',
          'begin_fill',
          'begin_poly',
          'clear',
          'clone',
          'end_fill',
          'end_poly',
          'filling',
          'get_poly',
          'get_shapepoly',
          'getscreen',
          'getturtle',
          'reset',
          'stamp',
          'undo',
          'undobufferentries',
          'color',
          'hideturtle',
          'isdown',
          'isvisible',
          'pendown',
          'penup',
          'showturtle',
          'heading',
          'home',
          'pos',
          'radians',
          'xcor',
          'ycor',
          'begin_fill',
          'begin_poly',
          'clear',
          'clone',
          'end_fill',
          'end_poly',
          'filling',
          'get_poly',
          'get_shapepoly',
          'getscreen',
          'getturtle',
          'reset',
          'stamp',
          'undo',
          'undobufferentries',
          'color',
          'hideturtle',
          'isdown',
          'isvisible',
          'pendown',
          'penup',
          'showturtle',
          'heading',
          'home',
          'pos',
          'radians',
          'xcor',
          'ycor',
          'adjustScrolls',
          'focus_force',
          'destroy',
          'focus_displayof',
          'focus_get',
          'focus_lastfor',
          'focus_set',
          'grab_current',
          'grab_release',
          'grab_set',
          'grab_set_global',
          'grab_status',
          'grid_size',
          'image_names',
          'image_types',
          'keys',
          'option_clear',
          'pack_slaves',
          'place_slaves',
          'quit',
          'tk_bisque',
          'tk_focusFollowsMouse',
          'tk_focusNext',
          'tk_focusPrev',
          'update',
          'update_idletasks',
          'winfo_cells',
          'winfo_children',
          'winfo_class',
          'winfo_colormapfull',
          'winfo_depth',
          'winfo_exists',
          'winfo_geometry',
          'winfo_height',
          'winfo_id',
          'winfo_ismapped',
          'winfo_manager',
          'winfo_name',
          'winfo_parent',
          'winfo_pointerx',
          'winfo_pointerxy',
          'winfo_pointery',
          'winfo_reqheight',
          'winfo_reqwidth',
          'winfo_rootx',
          'winfo_rooty',
          'winfo_screen',
          'winfo_screencells',
          'winfo_screendepth',
          'winfo_screenheight',
          'winfo_screenmmheight',
          'winfo_screenmmwidth',
          'winfo_screenvisual',
          'winfo_screenwidth',
          'winfo_server',
          'winfo_toplevel',
          'winfo_viewable',
          'winfo_visual',
          'winfo_visualid',
          'winfo_vrootheight',
          'winfo_vrootwidth',
          'winfo_vrootx',
          'winfo_vrooty',
          'winfo_width',
          'winfo_x',
          'winfo_y',
          'pack_forget',
          'pack_info',
          'place_forget',
          'place_info',
          'grid_forget',
          'grid_info',
          'grid_remove',
          'begin_fill',
          'begin_poly',
          'clear',
          'clone',
          'end_fill',
          'end_poly',
          'filling',
          'get_poly',
          'get_shapepoly',
          'getscreen',
          'getturtle',
          'reset',
          'stamp',
          'undo',
          'undobufferentries',
          'color',
          'hideturtle',
          'isdown',
          'isvisible',
          'pendown',
          'penup',
          'showturtle',
          'heading',
          'home',
          'pos',
          'radians',
          'xcor',
          'ycor',
          'clear',
          'getcanvas',
          'getshapes',
          'reset',
          'turtles',
          'update',
          'window_height',
          'window_width',
          'mainloop',
          'Screen',
          'begin_fill',
          'begin_poly',
          'bye',
          'clear',
          'clearscreen',
          'clone',
          'color',
          'down',
          'end_fill',
          'end_poly',
          'exitonclick',
          'filling',
          'get_poly',
          'get_shapepoly',
          'getcanvas',
          'getpen',
          'getscreen',
          'getshapes',
          'getturtle',
          'heading',
          'hideturtle',
          'home',
          'ht',
          'isdown',
          'isvisible',
          'mainloop',
          'pd',
          'pendown',
          'penup',
          'pos',
          'position',
          'pu',
          'radians',
          'reset',
          'resetscreen',
          'showturtle',
          'st',
          'stamp',
          'turtles',
          'undo',
          'undobufferentries',
          'up',
          'update',
          'window_height',
          'window_width',
          'xcor',
          'ycor'
        ]
        var unaries = [
          'selection_get',
          'back',
          'backward',
          'bk',
          'clearstamp',
          'fd',
          'forward',
          'left',
          'lt',
          'right',
          'rt',
          'seth',
          'setheading',
          'settiltangle',
          'setundobuffer',
          'setx',
          'sety',
          'tilt',
          'title',
        ]
        var binaries = [
        ]
        var ternaries = [
        ]
        var quadaries = [
          'bgcolor',
          'color',
          'fillcolor',
          'pencolor'
        ]
        var pentaries = [
        ]
        var n_aries = [
          'with_traceback',
          'count',
          'index'
        ]
        this.data.isOptionalUnary.set(false)
        if (n_aries.indexOf(newValue) >= 0) {
          d.set(d.N_ARY)
        } else if (pentaries.indexOf(newValue) >= 0) {
          d.set(d.PENTARY)
        } else if (quadaries.indexOf(newValue) >= 0) {
          d.set(d.QUADARY)
        } else if (ternaries.indexOf(newValue) >= 0) {
          d.set(d.TERNARY)
        } else if (binaries.indexOf(newValue) >= 0) {
          d.set(d.BINARY)
        } else if (unaries.indexOf(newValue) >= 0) {
          d.set(d.UNARY)
        } else if (zunaries.indexOf(newValue) >= 0) {
          d.set(d.UNARY)
          this.data.isOptionalUnary.set(true)
        } else if (zaries.indexOf(newValue) >= 0) {
          d.set(d.Z_ARY)
          this.data.isOptionalUnary.set(true)
        } else {
          d.set(d.N_ARY)
        }
      },
      consolidate: /** @suppress {globalThis} */ function () {
        this.didChange(undefined, this.get())
      }
    }
  },
  fields: {
    module: {
      value: 'turtle',
      validate: false,
      endEditing: false
    }
  },
  output: {
    check: [eYo.T3.Expr.turtle__call_expr, eYo.T3.Expr.call_expr]
  }
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Expr.turtle__call_expr.populateMenu = function (block, mgr) {
  var eyo = block.eyo
  var current_variant = eyo.data.variant.get()
  var current_name = eyo.data.name.get()
  var data = eyo.data[current_variant]
  var names = data.getAll()
  var F = function (i) {
    var name = names[i]
    if (name !== current_name) {
      var content =
      goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
        'turtle.' + name + '(...)'
      )
      var menuItem = new eYo.MenuItem(content, function () {
        eyo.data.name.set(name)
      })
      mgr.addChild(menuItem, true)
    }
  }
  for (var i = 0; i < names.length; i++) {
    F(i)
  }
  mgr.shouldSeparate()
  var variants = eyo.data.variant.getAll()
  for (var i = 0; i < variants.length; i++) {
    var variant = variants[i]
    if (variant !== current_variant) {
      var content = {
        nameMotion: 'Mouvement',
        nameState: 'État',
        namePen: 'Crayon',
        nameEvent: 'Évènement',
        nameSpecial: 'Spécial',
        nameScreen: 'Écran',
        nameAnimation: 'Animation',
        nameInput: 'Saisis',
        nameSettings: 'Réglages',
        nameScreenOnly: 'Écran',
        namePublic: 'Public',
      } [variant]
      var menuItem = new eYo.MenuItem(content, function () {
        eyo.data.variant.set(variant)
      })
      mgr.addChild(menuItem, true)
    }
  }
  mgr.shouldSeparate()
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Expr.turtle__call_expr.prototype.populateContextMenuFirst_ = function (block, mgr) {
  eYo.DelegateSvg.Expr.turtle__call_expr.populateMenu.call(this, block, mgr)
  return eYo.DelegateSvg.Expr.base_call_expr.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

/**
 * Class for a DelegateSvg, call statement block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('turtle__call_stmt', {
  link: eYo.T3.Expr.turtle__call_expr
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Stmt.turtle__call_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  eYo.DelegateSvg.Expr.turtle__call_expr.populateMenu.call(this, block, mgr)
  return eYo.DelegateSvg.Stmt.turtle__call_stmt.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Expr.turtle__call_expr.populateMenu = function (block, mgr) {
  var eyo = block.eyo
  var current_name = eyo.data.name.get()
  var names = eyo.data.name.getAll()
  var F = function (i) {
    var name = names[i]
    if (name !== current_name) {
      var content =
      goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
        'turtle.' + name
      )
      var menuItem = new eYo.MenuItem(content, function () {
        eyo.data.name.set(name)
      })
      mgr.addChild(menuItem, true)
    }
  }
  for (var i = 0; i < names.length; i++) {
    F(i)
  }
  mgr.shouldSeparate()
}

var F = function (name, title) {
  var key = 'turtle__'+name
  title && (eYo.Tooltip.Title[key] = title)
  return {
    type: eYo.T3.Expr.turtle__call_expr,
    data: name,
    title: key
  }
}
eYo.FlyoutCategory.turtle__module = [
  eYo.T3.Stmt.turtle__import_stmt,
  {
    type: eYo.T3.Expr.turtle__call_expr,
    data: 'setConfig',
    title: 'turtle__eyo_config',
    slots: {
      n_ary: {
        slots: {
          'O': {
            type: eYo.T3.Expr.term,
            slots: {
              definition: {
                type: eYo.T3.Expr.slicing,
                data: 'document',
                
              }
            }
          },
          'f': ,
          'z': ,
        }
      }
    }
  }

]

goog.mixin(eYo.Tooltip.Title, {
  turtle__import_stmt: 'Importer le module turtle',
})

eYo.DelegateSvg.Turtle.T3s = [
  eYo.T3.Stmt.turtle__import_stmt,
  eYo.T3.Expr.turtle__call_expr,
  eYo.T3.Stmt.turtle__call_stmt,
  eYo.T3.Expr.turtle__const
]
