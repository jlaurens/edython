/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview string module bricks for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.require('eYo.Brick')

goog.require('eYo.Msg')

goog.require('eYo.Stmt')
goog.require('eYo.Tooltip')

goog.require('eYo.Library')
goog.provide('eYo.Brick.String')

/**
 * Populate the context menu for the given brick.
 * @param {!eYo.Brick.Dflt} brick The brick.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */

;(function () {

  var F = (name, title, holder = 'formatter') => {
    var key = 'string__'+name
    title && (eYo.Tooltip.Title[key] = title)
    return {
      type: eYo.T3.Expr.call_expr,
      name_p: name,
      holder_p: holder,
      dotted_p: 1,
      title: key
    }
  }
  var F_k = (name, title) => {
    var key = 'string__'+name
    title && (eYo.Tooltip.Title[key] = title)
    return {
      type: eYo.T3.Expr.identifier,
      name_p: name,
      holder_p: 'string',
      dotted_p: 0,
      title: key
    }
  }
/*
    'ascii_letters': 0,
    'ascii_lowercase': 1,
    'ascii_uppercase': 2,
    digits: 3,
    hexdigits: 4,
    octdigits: 5,
    punctuation: 6,
    printable: 7,
    whitespace: 8,
    'Formatter': 9,
    format: 10,
    vformat: 11,
    parse: 12,
    'get_field': 13,
    'get_value': 14,
    'check_unused_args': 15,
    'format_field': 16,
    'convert_field': 17,
    'Template': 18,
    substitute: 19,
    'safe_substitute': 20,
    template: 21,
    'capwords': 22
  */
eYo.Library.basic_string__module = [
  {
    type: eYo.T3.Stmt.import_stmt,
    variant_p: eYo.Key.FROM_MODULE_IMPORT_STAR,
    from_p: 'string',
    title: 'string__import_stmt'
  },
  F_k('ascii_letters', '\'ascii_lowercase\' et \'ascii_uppercase\' concaténées.'),
  F_k('ascii_lowercase', '\'abcdefghijklmnopqrstuvwxyz\''),
  F_k('ascii_uppercase', '\'ABCDEFGHIJKLMNOPQRSTUVWXYZ\''),
  F_k('hexdigits', '\'0123456789abcdefABCDEF\''),
  F_k('octdigits', '\'01234567\''),
  F_k('punctuation', 'Une chaîne composée des caractères de ponctuation'),
  F_k('printable', 'Une chaîne composée des caractères imprimables'),
  F_k('whitespace', 'Une chaîne composée des caractères d\'espacement'),
  {
    type: eYo.T3.Stmt.assignment_stmt,
    value_s: {
      slots: {
        O: {
          type: eYo.T3.Expr.call_expr,
          name_p: 'Formatter',
          holder_p: 'string',
          dotted_p: 0
        }
      },
    },
    title: 'string__assigned_from_formatter'
  },
  F('format', ''),
  F('vformat', ''),
  F('parse', ''),
  F('get_field', ''),
  F('get_value', ''),
  F('check_unused_args', ''),
  F('format_field', ''),
  F('convert_field', '')
]

  var F = (name, title) => {
    var key = 'string__'+name
    title && (eYo.Tooltip.Title[key] = title)
    return {
      type: eYo.T3.Expr.call_expr,
      data: {
        name: name,
        holder: 'string',
        dotted: 1
      },
      title: key
    }
  }
  var F_k = (name, title) => {
    var key = 'string__'+name
    title && (eYo.Tooltip.Title[key] = title)
    return {
      type: eYo.T3.Expr.attributeref,
      data: {
        name: name,
        holder: 'string',
        dotted: 1
      },
      title: key
    }
  }

eYo.Library.string__module = [
  {
    type: eYo.T3.Stmt.import_stmt,
    variant_p: eYo.Key.IMPORT,
    import_module_s: {
      slots: {
        O: {
          type: eYo.T3.Expr.identifier,
          name_p: 'string'
        }
      }
    },
    title: 'string__import_stmt'
  },
  F_k('ascii_letters', '\'ascii_lowercase\' et \'ascii_uppercase\' concaténées.'),
  F_k('ascii_lowercase', '\'abcdefghijklmnopqrstuvwxyz\''),
  F_k('ascii_uppercase', '\'ABCDEFGHIJKLMNOPQRSTUVWXYZ\''),
  F_k('hexdigits', '0123456789abcdefABCDEF\''),
  F_k('octdigits', '01234567\''),
  F_k('punctuation', 'Une chaîne composée des caractères de ponctuation'),
  F_k('printable', 'Une chaîne composée des caractères imprimables'),
  F_k('whitespace', 'Une chaîne composée des caractères d\'espacement'),
  {
    type: eYo.T3.Stmt.assignment_stmt,
    value_s: {
      slots: {
        O: {
          type: eYo.T3.Expr.call_expr,
          name_p: 'Formatter',
          holder_p: 'string',
          dotted_p: 1
        }
      },
    },
    title: 'string__assigned_from_formatter'
  },
  F('format', ''),
  F('vformat', ''),
  F('parse', ''),
  F('get_field', ''),
  F('get_value', ''),
  F('check_unused_args', ''),
  F('format_field', ''),
  F('convert_field', '')
]

})()

goog.mixin(eYo.Tooltip.Title, {
  string__import_stmt: 'Importer le module string.',
})

eYo.Brick.String.T3s = [
  eYo.T3.Expr.string__const
]
