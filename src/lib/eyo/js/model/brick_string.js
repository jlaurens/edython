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

eYo.require('brick')

eYo.require('msg')

eYo.require('stmt')
eYo.require('tooltip')

eYo.require('library')
eYo.provide('brick.string')

/**
 * Populate the context menu for the given brick.
 * @param {eYo.brick.BaseC9r} brick The brick.
 * @param {eYo.MenuManager} mngr mngr.menu is the menu to populate.
 * @private
 */

;(function () {

  var F = (name, title, holder = 'formatter') => {
    var key = 'string__'+name
    title && (eYo.tooltip.TITLE[key] = title)
    return {
      type: eYo.t3.expr.call_expr,
      name_p: name,
      holder_p: holder,
      dotted_p: 1,
      title: key
    }
  }
  var F_k = (name, title) => {
    var key = 'string__'+name
    title && (eYo.tooltip.TITLE[key] = title)
    return {
      type: eYo.t3.expr.identifier,
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
eYo.library.DATA.Basic_string__module = [
  {
    type: eYo.t3.stmt.import_stmt,
    variant_p: eYo.key.FROM_MODULE_IMPORT_STAR,
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
    type: eYo.t3.stmt.assignment_stmt,
    value_s: {
      slots: {
        O: {
          type: eYo.t3.expr.call_expr,
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
    title && (eYo.tooltip.TITLE[key] = title)
    return {
      type: eYo.t3.expr.call_expr,
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
    title && (eYo.tooltip.TITLE[key] = title)
    return {
      type: eYo.t3.expr.attributeref,
      data: {
        name: name,
        holder: 'string',
        dotted: 1
      },
      title: key
    }
  }

eYo.library.DATA.String__module = [
  {
    type: eYo.t3.stmt.import_stmt,
    variant_p: eYo.key.IMPORT,
    import_module_s: {
      slots: {
        O: {
          type: eYo.t3.expr.identifier,
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
    type: eYo.t3.stmt.assignment_stmt,
    value_s: {
      slots: {
        O: {
          type: eYo.t3.expr.call_expr,
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

eYo.do.mixin(eYo.tooltip.TITLE, {
  string__import_stmt: 'Importer le module string.',
})
