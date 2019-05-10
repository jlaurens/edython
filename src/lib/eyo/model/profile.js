/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Type of string.
 * This is one of the most important piece of code,
 * because it has to do with the nature of connection.
 * It also has to do with the nature of identifiers,
 * which conditions the possible actions.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.T3.Profile')

goog.require('eYo.XRE')
goog.require('eYo.T3')
goog.require('eYo.Model')
goog.require('eYo.Do')

eYo.Do.readOnlyMixin(
  eYo.T3.Expr,
  {
    reserved_identifier: '.reserved identifier',
    reserved_keyword: '.reserved keyword',
    builtin__name: '.builtin name',
    custom_literal: '.custom literal',
    known_identifier: '.known identifier',
    custom_identifier: '.custom identifier',
    custom_dotted_name: '.custom dotted name',
    custom_parent_module: '.custom parent module',
    const: '.const',
    unset: '.unset',
    error: '.error',
    bininteger: '.bininteger',
    octinteger: '.octinteger',
    decinteger: '.decinteger',
    hexinteger: '.hexinteger',
    singleQuoted: '.single quoted',
    doubleQuoted: '.double quoted'
  }
)

eYo.Do.readOnlyMixin(
  eYo.T3.Stmt,
  {
    control: '.control statement'
  }
)

/**
 * Get the profile for that identifier,
 * create one on the first call if the module knows it.
 * @param {*} identifier
 */
eYo.Model.Module.prototype.getProfile = function(identifier) {
  var ans = this.profiles[identifier]
  if (ans) {
    return ans
  }
  var item = this.getItem(identifier)
  if (item) {
    ans = new eYo.T3.Profile(this, {
      raw: eYo.T3.Expr.known_identifier,
      expr: eYo.T3.Expr.identifier,
      name: identifier,
      item: item
    })
    this.profiles[identifier] = ans
    return ans
  }
  return eYo.T3.Profile.void
}

/**
 * The profile of identifiers.
 * `model` is one of
 * `{methods: *dict of methods*, properties: *dict of properties*}`
 * or simply a dict of properties.
 * When a dictionary has not a `methods` key,
 * it is considered a properties dictionary.
 * @param {?eYo.T3.Profiles} owner  a dictionary
 * @param {*} model  a dictionary
 * @constructor
 */
eYo.T3.Profile = function (owner, model) {
  this.owner = owner
  var m = {
    isVoid: false,
    isUnset: false,
    raw: eYo.T3.Expr.unset,
    expr: eYo.T3.Expr.unset,
    stmt: eYo.T3.Expr.unset,
    prefixDots: undefined,
    base: undefined,
    name: undefined,
    module: undefined,
    holder: undefined,
    item: undefined,
    type: undefined,
    prefixDots: undefined
  }
  if (model) {
    var methods = model.methods
    var properties = model.properties || (!methods && model)
    goog.mixin(m, properties)
    var key, value
    var f = (key) => {
      value = m[key]
      if (goog.isString(value)) {
        Object.defineProperty(
          this,
          key,
          {
            value: value
          }
        )
      } else if (goog.isFunction(value)) {
        Object.defineProperty(
          this,
          key,
          {
            get: value
          }
        )
      }
      delete m[key]
    }
    f('raw')
    f('expr')
    f('stmt')
    f('type')
    var f = (key) => {
      value = m[key]
      Object.defineProperty(
        this,
        key,
        {
          value: goog.isString(value) ? value : undefined
        }
      )
      delete m[key]
    }
    f('base')
    f('name')
    f('holder')
    f('module')
    key = 'item'
    if ((value = m[key])) {
      Object.defineProperty(
        this,
        key,
        {
          value: value
        }
      )
      delete m[key]
    }
    Object.defineProperty(
      this,
      'model',
      {
        get () {
          console.error('FORBIDDEN access to `model` property.')
          return this.item
        }
      }
    )
    for (key in m) {
      var value = m[key]
      if (goog.isFunction(value)) {
        Object.defineProperty(
          this,
          key,
          {
            get: value
          }
        )
      } else {
        Object.defineProperty(
          this,
          key,
          {
            value: value
          }
        )
      }
    }
  } else {
    eYo.Do.readOnlyMixin(this, m)
  }
}

/**
 * The profile of identifiers.
 * Based on a default profile.
 * Mainly for dotted names.
 * @param {?eYo.T3.Profiles} owner  a dictionary
 * @param {!eYo.T3.Profile} profile  another profile
 * @param {*} model  a dictionary of properties
 * @constructor
 */
eYo.T3.Profile.Dotted = function (owner, profile, model) {
  eYo.T3.Profile.Base.superClass_.constructor.call(this, owner)
  this.profile = profile
  if (model) {
    var key, value
    for (key in model) {
      var value = model[key]
      Object.defineProperty(
        this,
        key,
        goog.isFunction(value)
        ? {
          get: value
        }
        : {
          value: value
        }
      )
    }
  }
}

Object.defineProperties(
  eYo.T3.Profile.Dotted.prototype,
  {
    isVoid: { get() { return this.profile.isVoid } },
    isUnset: { get () { return this.profile.isUnset } },
    raw: { get () { return this.profile.raw } },
    expr: { get () { return this.profile.expr } },
    stmt: { get () { return this.profile.stmt } },
    name: { get () { return this.profile.name } },
    item: { get () { return this.profile.item } },
    type: { get () { return this.profile.type } }
  }
)
/**
 * Basic readonly profile properties
 */
/*
eYo.T3.Profile.prototype.isUnset = False
eYo.T3.Profile.prototype.isVoid = False
eYo.T3.Profile.prototype.raw = undefined
eYo.T3.Profile.prototype.expr = undefined
eYo.T3.Profile.prototype.stmt = undefined
eYo.T3.Profile.prototype.name = undefined
eYo.T3.Profile.prototype.module = undefined
eYo.T3.Profile.prototype.item = undefined
eYo.T3.Profile.prototype.type = undefined
*/

/**
 *
 * @param {String} identifier
 */
eYo.T3.Profiles = function (identifier) {
  this.identifier = identifier
  this.profiles = {}
}


var setup = (() => {

  var byIdentifier = {}

  /**
   * What is the profile of this string? an identifier, a number, a reserved word ?
   * For edython.
   * @param {!String} candidate
   * @param {?String} module  the module or holder
   * @return {!eYo.T3} the type of this candidate, possible keys are `name`, `expr`, `stmt`.
   */
  eYo.T3.Profile.get = function (candidate, module) {
    if (goog.isNumber(candidate)) {
      return candidate === Math.floor(candidate)
      ? eYo.T3.Profile.integer
      : eYo.T3.Profile.floatnumber
    }
    if (!candidate || !goog.isString(candidate)) {
      return eYo.T3.Profile.void
    }
    if (!candidate.length) {
      return eYo.T3.Profile.unset
    }
    // first literals
    var ans
    if ((ans = eYo.T3.Profile.getLiteral(candidate))) {
      return ans
    }
    var profiles = byIdentifier[candidate] || (byIdentifier[candidate] = {})
    if (module) {
      if ((ans = profiles[module])) {
        return ans
      }
      var M = eYo.Model[module] || eYo.Model[module + '__module']
      if (M) {
        return (profiles[module] = M.getProfile(candidate))
      }
    }
    var ans = profiles['.builtin']
    if (ans) {
      return ans
    }
    if ((ans = eYo.T3.Profile.getReference(candidate)) && !ans.isVoid) {
      return (profiles['.builtin'] = ans)
    }
    if ((ans = eYo.T3.Profile.getReserved(candidate)) && !ans.isVoid) {
      return (profiles['.builtin'] = ans)
    }
    if ((ans = eYo.T3.Profile.getShort(candidate)) && !ans.isVoid) {
      return (profiles['.builtin'] = ans)
    }
    if ((ans = eYo.T3.Profile.getDotted(candidate, module)) && !ans.isVoid) {
      return ans
    }
    if ((ans = eYo.T3.Profile.getIdentifier(candidate, module)) && !ans.isVoid) {
      return ans
    }
    return eYo.T3.Profile.void
  }
}) ()

eYo.Do.readOnlyMixin(
  eYo.T3.Profile,
  {
    /* Default void profile */
    void: new eYo.T3.Profile(null, {
      isVoid: true
    }),
    /* Profile for an unset identifier */
    unset: new eYo.T3.Profile(null, {
      expr: eYo.T3.Expr.identifier,
      isUnset: true
    }),
    /* Profile for an integer */
    integer: new eYo.T3.Profile(null, {
      expr: eYo.T3.Expr.integer
    }),
    /* Profile for a float number */
    floatnumber: new eYo.T3.Profile(null, {
      expr: eYo.T3.Expr.floatnumber
    })
  }
)

/**
 * The css class for the given text
 * For edython.
 * @param {!string} txt The text to yield_expr
 * @return {string}
 */
eYo.T3.getCssClassForText = function (txt) {
  switch (eYo.T3.Profile.get(txt, null).raw) {
  case eYo.T3.Expr.reserved_identifier:
  case eYo.T3.Expr.reserved_keyword:
    return 'eyo-code-reserved'
  case eYo.T3.Expr.builtin__name:
    return 'eyo-code-builtin'
  default:
    return 'eyo-code'
  }
}

/**
 * Returns a profile if `candidate` is a dotted name
 * For edython.
 * @param {!String} candidate
 * @return {!eYo.T3} the profile of this candidate.
 */
eYo.T3.Profile.getDotted = function (candidate, module) {
  var m = XRegExp.exec(candidate, eYo.XRE.dotted_name)
  if (m) {
    var first = m.dots ? m.dots.length : 0
    var base
    if (m.holder) {
      base = eYo.T3.Expr.dotted_name
    } else if (m.name) {
      base = eYo.T3.Expr.identifier
    } else {
      base = eYo.T3.Expr.unset
    }
    candidate = m.name
    var holder = module
      ? m.holder
        ? module + '.' + m.holder
        : module
      : null
    if (holder) {
      var M = eYo.Model[holder] || eYo.Model[holder + '__module']
      var ans = M && M.getProfile(candidate)
    } else {
      ans = eYo.T3.Profile.getReference(candidate) || eYo.T3.Profile.getInModule(candidate)
    }
    var item = ans && ans.item
    var mdl = item && item.module
    mdl = mdl && mdl.name.split('__')[0]
    return new eYo.T3.Profile(null, {
      raw: m.dots
        ? eYo.T3.Expr.custom_parent_module
        : m.holder
          ? eYo.T3.Expr.custom_dotted_name
          : (ans && ans.raw) || eYo.T3.Expr.custom_identifier,
      expr: m.dots
        ? eYo.T3.Expr.parent_module
        : m.holder
          ? eYo.T3.Expr.dotted_name
          : eYo.T3.Expr.identifier,
      prefixDots: first,
      base: base,
      name: candidate,
      holder: holder,
      module: mdl,
      item: item
    })
  }
}

/**
 * Returns a profile if `candidate` is an identifier,
 * possibly with an named attribute or a named value.
 * For edython.
 * @param {!String} candidate
 * @return {!eYo.T3} the profile of this candidate.
 */
eYo.T3.Profile.getIdentifier = function (candidate, module) {
  var m = XRegExp.exec(candidate, eYo.XRE.identifier_annotated_valued)
  if (m) {
    var r = m.annotated
    ? m.valued
      ? eYo.T3.Expr.identifier_annotated_valued
      : eYo.T3.Expr.identifier_annotated
    : m.valued
      ? eYo.T3.Expr.identifier_valued
      : eYo.T3.Expr.custom_identifier
    var x = m.annotated
      ? m.valued
        ? eYo.T3.Expr.identifier_annotated_valued
        : eYo.T3.Expr.identifier_annotated
      : m.valued
        ? eYo.T3.Expr.identifier_valued
        : eYo.T3.Expr.identifier
    return new eYo.T3.Profile(null, {
      raw: r,
      expr: x,
      name: m.name,
      annotated: m.annotated,
      valued: m.valued,
      holder: module
    })
  }
}

/**
 * Returns a profile if `candidate` is a name with a name annotation or a name definition
 * For edython.
 * @param {!String} candidate
 * @return {!eYo.T3} the profile of this candidate.
 */
eYo.T3.Profile.getAnnotatedValued = function (candidate, module) {
  var m = XRegExp.exec(candidate, eYo.XRE.name_annotated_valued)
  if (m) {
    var valued = m.valued_a || m.valued
    var t = valued
    ? m.annotated
      ? eYo.T3.Expr.identifier_annotated_valued
      : eYo.T3.Expr.identifier_annotated
    : eYo.T3.Expr.identifier_valued
    return new eYo.T3.Profile(null, {
      raw: t,
      expr: t,
      name: m.name,
      annotated: m.annotated,
      valued: valued
    })
  }
}

/**
 * Returns a profile if `candidate` is a literal
 * For edython.
 * @param {!String} candidate
 * @return {!eYo.T3} the profile of this candidate.
 */
eYo.T3.Profile.getLiteral = function (candidate) {
  // is it a number ?
  var match = XRegExp.exec(candidate, eYo.XRE.integer)
  if (match) {
    return new eYo.T3.Profile(null, {
      raw: eYo.T3.custom_literal,
      expr: eYo.T3.Expr.integer,
      type: match.bininteger
        ? eYo.T3.Expr.bininteger
        : match.octinteger
          ? eYo.T3.Expr.octinteger
          : match.hexinteger
            ? eYo.T3.Expr.octinteger
            : eYo.T3.Expr.decinteger
    })
  }
  if (!!XRegExp.exec(candidate, eYo.XRE.floatnumber)) {
    return new eYo.T3.Profile(null, {
      raw: eYo.T3.custom_literal,
      expr: eYo.T3.Expr.floatnumber
    })
  }
  if (!!XRegExp.exec(candidate, eYo.XRE.imagnumber)) {
    return new eYo.T3.Profile(null, {
      raw: eYo.T3.custom_literal,
      expr: eYo.T3.Expr.imagnumber
    })
  }
  if (!!XRegExp.exec(candidate, eYo.XRE.shortbytesliteralSingle)) {
    return {
      raw: eYo.T3.Expr.shortbytesliteral,
      expr: eYo.T3.Expr.shortliteral,
      type: eYo.T3.Expr.singleQuoted
    }
  }
  if (!!XRegExp.exec(candidate, eYo.XRE.shortbytesliteralDouble)) {
    return {
      raw: eYo.T3.Expr.shortbytesliteral,
      expr: eYo.T3.Expr.shortliteral,
      type: eYo.T3.Expr.doubleQuoted
    }
  }
  var m
  if ((m = XRegExp.exec(candidate, eYo.XRE.shortstringliteralSingle))) {
    return {
      raw: m.formatted ? eYo.T3.Expr.shortformattedliteral : eYo.T3.Expr.shortstringliteral,
      expr: m.formatted ? eYo.T3.Expr.shortformattedliteral : eYo.T3.Expr.shortstringliteral,
      type: eYo.T3.Expr.singleQuoted
    }
  }
  if ((m = XRegExp.exec(candidate, eYo.XRE.shortstringliteralDouble))) {
    return {
      raw: m.formatted ? eYo.T3.Expr.shortformattedliteral : eYo.T3.Expr.shortstringliteral,
      expr: m.formatted ? eYo.T3.Expr.shortformattedliteral : eYo.T3.Expr.shortstringliteral,
      type: eYo.T3.Expr.doubleQuoted
    }
  }
  if (!!XRegExp.exec(candidate, eYo.XRE.longbytesliteralSingle)) {
    return {
      raw: eYo.T3.Expr.longbytesliteral,
      expr: eYo.T3.Expr.longliteral,
      type: eYo.T3.Expr.singleQuoted
    }
  }
  if (!!XRegExp.exec(candidate, eYo.XRE.longbytesliteralDouble)) {
    return {
      raw: eYo.T3.Expr.longbytesliteral,
      expr: eYo.T3.Expr.longliteral,
      type: eYo.T3.Expr.doubleQuoted
    }
  }
  if ((m = XRegExp.exec(candidate, eYo.XRE.longstringliteralSingle))) {
    return {
      raw: m.formatted ? eYo.T3.Expr.longformattedliteral : eYo.T3.Expr.longstringliteral,
      expr: m.formatted ? eYo.T3.Expr.longformattedliteral : eYo.T3.Expr.longstringliteral,
      type: eYo.T3.Expr.singleQuoted
    }
  }
  if ((m = XRegExp.exec(candidate, eYo.XRE.longstringliteralDouble))) {
    return {
      raw: m.formatted ? eYo.T3.Expr.longformattedliteral : eYo.T3.Expr.longstringliteral,
      expr: m.formatted ? eYo.T3.Expr.longformattedliteral : eYo.T3.Expr.longstringliteral,
      type: eYo.T3.Expr.doubleQuoted
    }
  }
}

/**
 * Returns a profile if `identifier` is a reserved keyword/identifier
 * For edython.
 * @param {!String} identifier
 * @return {!eYo.T3} the profile of this identifier when a reference.
 */
eYo.T3.Profile.getReference = function (identifier) {
  var ans
  if ([
    'functions',
    'stdtypes',
    'datamodel'
  ].some((ref) => {
    var M = eYo.Model[ref]
    ans = M && M.getProfile(identifier)
    if (ans && !ans.isVoid) {
      return true
    }
  })) {
    return ans
  }
  if ([
    eYo.Key.PROPERTY,
    eYo.Key.STATICMETHOD,
    eYo.Key.CLASSMETHOD
  ].indexOf(identifier) >= 0) {
    return new eYo.T3.Profile(null,  {
      expr: eYo.T3.Expr.identifier,
      raw: eYo.T3.Expr.reserved_identifier,
      stmt: eYo.T3.Stmt.decorator_stmt
    })
  }
}

/**
 * Returns a profile if `identifier` is a known module's keyword/identifier
 * For edython.
 * @param {!String} identifier
 * @return {!eYo.T3} the profile of this identifier when a reference.
 */
eYo.T3.Profile.getInModule = function (identifier) {
  var ans
  if ([
    'turtle',
    'math',
    'decimal',
    'fraction',
    'statistics',
    'random',
    'cmath',
    'string'
  ].some(module => {
    var M = eYo.Model[module + '__module']
    ans = M && M.getProfile(identifier)
    if (ans && !ans.isVoid) {
      return true
    }
  })) {
    return ans
  }
}

/**
 * Returns a profile if `identifier` is a delimiter
 * For edython.
 * @param {!String} identifier
 * @return {!eYo.T3} the profile of this identifier when reserved.
 */
eYo.T3.Profile.getShort = function (identifier) {
  if (['(', ')', '[', ']', '{', '}', ',', ':', ';'].indexOf(identifier) >= 0) {
    return new eYo.T3.Profile(null, {
      raw: eYo.T3.Expr.const
    })
  }
}

/**
 * Returns a profile if `identifier` is a reference keyword/identifier
 * For edython.
 * @param {!String} identifier
 * @return {!eYo.T3} the profile of this identifier when reserved.
 */
eYo.T3.Profile.getReserved = function (identifier) {
  // reserved keywords
  var out
  if ((out = {
    for: {
      expr: eYo.T3.Expr.comp_for,
      stmt: eYo.T3.Stmt.for_part
    },
    from: {
      expr: eYo.T3.Expr.yield_expr,
      stmt: eYo.T3.Stmt.import_stmt
    },
    nonlocal: {
      stmt: eYo.T3.Stmt.nonlocal
    },
    global: {
      stmt: eYo.T3.Stmt.global_stmt
    },
    del: {
      stmt: eYo.T3.Stmt.del_stmt
    },
    return: {
      stmt: eYo.T3.Stmt.return_stmt
    },
    as: {
      expr: eYo.T3.Expr.identifier,
      stmt: eYo.T3.Stmt.except_part
    },
    yield: {
      expr: eYo.T3.Expr.yield_expr,
      stmt: eYo.T3.Stmt.yield_stmt
    }
  } [identifier])) {
    goog.mixin(out, {
      raw: eYo.T3.Expr.reserved_keyword
    })
    return new eYo.T3.Profile(null, out)
  }
  if ((out = {
    class: eYo.T3.Stmt.classdef_part,
    finally: eYo.T3.Stmt.finally_part,
    return: eYo.T3.Stmt.return_stmt,
    continue: eYo.T3.Stmt.continue_stmt,
    try: eYo.T3.Stmt.try_part,
    def: eYo.T3.Stmt.funcdef_part,
    while: eYo.T3.Stmt.while_part,
    del: eYo.T3.Stmt.del_stmt,
    with: eYo.T3.Stmt.with_part,
    elif: eYo.T3.Stmt.elif_part,
    if: eYo.T3.Stmt.if_part,
    assert: eYo.T3.Stmt.assert_stmt,
    else: eYo.T3.Stmt.else_part,
    import: eYo.T3.Stmt.import_stmt,
    pass: eYo.T3.Stmt.pass_stmt,
    break: eYo.T3.Stmt.break_stmt,
    except: eYo.T3.Stmt.except_part,
    raise: eYo.T3.Stmt.raise_stmt,
    await: eYo.T3.Stmt.await_stmt,
    async: eYo.T3.Stmt.async_stmt
  } [identifier])) {
    out = {
      raw: eYo.T3.Expr.reserved_keyword,
      stmt: out,
      isReserved: true
    }
    return new eYo.T3.Profile(null, out)
  }
  if ((out = {
    is: eYo.T3.Expr.object_comparison,
    lambda: eYo.T3.Expr.lambda,
    and: eYo.T3.Expr.and_expr,
    not: eYo.T3.Expr.not_test,
    or: eYo.T3.Expr.or_expr,
    in: eYo.T3.Expr.object_comparison
  } [identifier])) {
    out = {
      raw: eYo.T3.Expr.reserved_keyword,
      expr: out,
      isReserved: true
    }
    return new eYo.T3.Profile(null, out)
  }
  // reserved identifiers
  if (['True', 'False', 'None', 'Ellipsis', '...', 'NotImplemented'].indexOf(identifier) >= 0) {
    return new eYo.T3.Profile(null, {
      raw: eYo.T3.Expr.reserved_identifier,
      expr: eYo.T3.Expr.builtin__object
    })
  }
}
