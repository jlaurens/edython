/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
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

eYo.require('t3')

eYo.require('xre')

eYo.require('module')

eYo.require('do')

/**
 * @name{eYo.t3.profile}
 * @namespace
 */
eYo.t3.makeNS('profile')

eYo.do.readOnlyMixin(
  eYo.t3.Expr,
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
    doubleQuoted: '.double quoted',
    placehoder: '.placeholder',
  }
)

eYo.do.readOnlyMixin(
  eYo.t3.Stmt,
  {
    control: '.control statement',
    placehoder: '.placeholder',
  }
)

/**
 * Get the profile for that identifier,
 * create one on the first call if the module knows it.
 * @param {*} identifier
 */
eYo.module.Dflt.prototype.getProfile = function(identifier) {
  var ans = this.profiles[identifier]
  if (ans) {
    return ans
  }
  var item = this.getItem(identifier)
  if (item) {
    ans = new eYo.t3.profile.Dflt(this, {
      raw: eYo.t3.Expr.known_identifier,
      expr: eYo.t3.Expr.identifier,
      name: identifier,
      item: item
    })
    this.profiles[identifier] = ans
    return ans
  }
  return eYo.t3.profile.void
}

/**
 * The profile of identifiers.
 * `model` is one of
 * `{methods: *dict of methods*, properties: *dict of properties*}`
 * or simply a dict of properties.
 * When a dictionary has not a `methods` key,
 * it is considered a properties dictionary.
 * @param {eYo.t3.Profiles} [owner]  a dictionary
 * @param {*} model  a dictionary
 * @constructor
 */
eYo.t3.profile.makeClass('Dflt', {
  init (owner, model) {
    this.owner = owner
    var m = {
      isVoid: false,
      isUnset: false,
      raw: eYo.t3.Expr.unset,
      expr: eYo.t3.Expr.unset,
      stmt: eYo.t3.Expr.unset,
      prefixDots: eYo.NA,
      base: eYo.NA,
      name: eYo.NA,
      module: eYo.NA,
      holder: eYo.NA,
      item: eYo.NA,
      type: eYo.NA,
      prefixDots: eYo.NA
    }
    if (model) {
      var methods = model.methods
      var properties = model.properties || (!methods && model)
      goog.mixin(m, properties)
      var key, value
      var f = (key) => {
        value = m[key]
        if (eYo.isStr(value)) {
          Object.defineProperty(
            this,
            key,
            {
              value: value
            }
          )
        } else if (eYo.isF(value)) {
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
            value: eYo.isStr(value) ? value : eYo.NA
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
        if (eYo.isF(value)) {
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
      eYo.do.readOnlyMixin(this, m)
    }
  },
})

/**
 * The profile of identifiers.
 * Based on a default profile.
 * Mainly for dotted names.
 * @param {eYo.t3.Profiles} [owner]  a dictionary
 * @param {eYo.t3.profile} profile  another profile
 * @param {*} model  a dictionary of properties
 * @constructor
 */
eYo.t3.profile.makeClass('Dotted', {
  init (owner, profile, model) {
    this.profile = profile
    if (model) {
      for (var key in model) {
        var value = model[key]
        Object.defineProperty(
          this,
          key,
          eYo.isF(value)
          ? {
            get: value
          }
          : {
            value: value
          }
        )
      }
    }
  },
  computed: {
    isVoid () { return this.profile.isVoid },
    isUnset() { return this.profile.isUnset },
    raw () { return this.profile.raw },
    expr () { return this.profile.expr },
    stmt () { return this.profile.stmt },
    name () { return this.profile.name },
    item () { return this.profile.item },
    type () { return this.profile.type },
  }
})

/**
 * Basic readonly profile properties
 */
/*
eYo.t3.profile.prototype.isUnset = False
eYo.t3.profile.prototype.isVoid = False
eYo.t3.profile.prototype.raw = eYo.NA
eYo.t3.profile.prototype.expr = eYo.NA
eYo.t3.profile.prototype.stmt = eYo.NA
eYo.t3.profile.prototype.name = eYo.NA
eYo.t3.profile.prototype.module = eYo.NA
eYo.t3.profile.prototype.item = eYo.NA
eYo.t3.profile.prototype.type = eYo.NA
*/

/**
 *
 * @param {String} identifier
 */
eYo.t3.makeClass('Profiles', {
  init (identifier) {
    this.identifier = identifier
    this.profiles = {}
  },
})

;(function () {

  var byIdentifier = {}

  /**
   * What is the profile of this string? an identifier, a number, a reserved word ?
   * For edython.
   * @param {String} candidate
   * @param {String} [module]  the module or holder
   * @return {!eYo.t3} the type of this candidate, possible keys are `name`, `expr`, `stmt`.
   */
  eYo.t3.profile.get = function (candidate, module) {
    if (goog.isNumber(candidate)) {
      return candidate === Math.floor(candidate)
      ? eYo.t3.profile.integer
      : eYo.t3.profile.floatnumber
    }
    if (!candidate || !eYo.isStr(candidate)) {
      return eYo.t3.profile.void
    }
    if (!candidate.length) {
      return eYo.t3.profile.unset
    }
    // first literals
    var ans
    if ((ans = eYo.t3.profile.getLiteral(candidate))) {
      return ans
    }
    var profiles = byIdentifier[candidate] || (byIdentifier[candidate] = {})
    if (module) {
      if ((ans = profiles[module])) {
        return ans
      }
      var M = eYo.c9r.model[module] || eYo.c9r.model[module + '__module']
      if (M) {
        return (profiles[module] = M.getProfile(candidate))
      }
    }
    var ans = profiles['.builtin']
    if (ans) {
      return ans
    }
    if ((ans = eYo.t3.profile.getReference(candidate)) && !ans.isVoid) {
      return (profiles['.builtin'] = ans)
    }
    if ((ans = eYo.t3.profile.getReserved(candidate)) && !ans.isVoid) {
      return (profiles['.builtin'] = ans)
    }
    if ((ans = eYo.t3.profile.getShort(candidate)) && !ans.isVoid) {
      return (profiles['.builtin'] = ans)
    }
    if ((ans = eYo.t3.profile.getDotted(candidate, module)) && !ans.isVoid) {
      return ans
    }
    if ((ans = eYo.t3.profile.getIdentifier(candidate, module)) && !ans.isVoid) {
      return ans
    }
    return eYo.t3.profile.void
  }
}) ()

eYo.do.readOnlyMixin(
  eYo.t3.profile,
  {
    /* Default void profile */
    void: new eYo.t3.profile.Dflt(null, {
      isVoid: true
    }),
    /* Profile for an unset identifier */
    unset: new eYo.t3.profile.Dflt(null, {
      expr: eYo.t3.Expr.identifier,
      isUnset: true
    }),
    /* Profile for an integer */
    integer: new eYo.t3.profile.Dflt(null, {
      expr: eYo.t3.Expr.integer
    }),
    /* Profile for a float number */
    floatnumber: new eYo.t3.profile.Dflt(null, {
      expr: eYo.t3.Expr.floatnumber
    })
  }
)

/**
 * Returns a profile if `candidate` is a dotted name
 * For edython.
 * @param {String} candidate
 * @return {!eYo.t3} the profile of this candidate.
 */
eYo.t3.profile.getDotted = function (candidate, module) {
  var m = XRegExp.exec(candidate, eYo.xre.Dotted_name)
  if (m) {
    var first = m.dots ? m.dots.length : 0
    var base
    if (m.holder) {
      base = eYo.t3.Expr.Dotted_name
    } else if (m.name) {
      base = eYo.t3.Expr.identifier
    } else {
      base = eYo.t3.Expr.unset
    }
    candidate = m.name
    var holder = module
      ? m.holder
        ? module + '.' + m.holder
        : module
      : null
    if (holder) {
      var M = eYo.c9r.model[holder] || eYo.c9r.model[holder + '__module']
      var ans = M && (M.getProfile(candidate))
    } else {
      ans = eYo.t3.profile.getReference(candidate) || eYo.t3.profile.getInModule(candidate)
    }
    var item = ans && ans.item
    var mdl = item && item.module
    mdl = mdl && (mdl.name.split('__'))[0]
    return new eYo.t3.profile.Dflt(null, {
      raw: m.dots
        ? eYo.t3.Expr.Custom_parent_module
        : m.holder
          ? eYo.t3.Expr.Custom_dotted_name
          : (ans && ans.raw) || eYo.t3.Expr.Custom_identifier,
      expr: m.dots
        ? eYo.t3.Expr.parent_module
        : m.holder
          ? eYo.t3.Expr.Dotted_name
          : eYo.t3.Expr.identifier,
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
 * @param {String} candidate
 * @return {!eYo.t3} the profile of this candidate.
 */
eYo.t3.profile.getIdentifier = function (candidate, module) {
  var m = XRegExp.exec(candidate, eYo.xre.identifier_annotated_valued)
  if (m) {
    var r = m.annotated
    ? m.valued
      ? eYo.t3.Expr.identifier_annotated_valued
      : eYo.t3.Expr.identifier_annotated
    : m.valued
      ? eYo.t3.Expr.identifier_valued
      : eYo.t3.Expr.Custom_identifier
    var x = m.annotated
      ? m.valued
        ? eYo.t3.Expr.identifier_annotated_valued
        : eYo.t3.Expr.identifier_annotated
      : m.valued
        ? eYo.t3.Expr.identifier_valued
        : eYo.t3.Expr.identifier
    return new eYo.t3.profile.Dflt(null, {
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
 * @param {String} candidate
 * @return {!eYo.t3} the profile of this candidate.
 */
eYo.t3.profile.getAnnotatedValued = function (candidate, module) {
  var m = XRegExp.exec(candidate, eYo.xre.name_annotated_valued)
  if (m) {
    var valued = m.valued_a || m.valued
    var t = valued
    ? m.annotated
      ? eYo.t3.Expr.identifier_annotated_valued
      : eYo.t3.Expr.identifier_annotated
    : eYo.t3.Expr.identifier_valued
    return new eYo.t3.profile.Dflt(null, {
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
 * @param {String} candidate
 * @return {!eYo.t3} the profile of this candidate.
 */
eYo.t3.profile.getLiteral = function (candidate) {
  // is it a number ?
  var match = XRegExp.exec(candidate, eYo.xre.integer)
  if (match) {
    return new eYo.t3.profile.Dflt(null, {
      raw: eYo.t3.Custom_literal,
      expr: eYo.t3.Expr.integer,
      type: match.bininteger
        ? eYo.t3.Expr.Bininteger
        : match.octinteger
          ? eYo.t3.Expr.octinteger
          : match.hexinteger
            ? eYo.t3.Expr.octinteger
            : eYo.t3.Expr.decinteger
    })
  }
  if (!!XRegExp.exec(candidate, eYo.xre.floatnumber)) {
    return new eYo.t3.profile.Dflt(null, {
      raw: eYo.t3.Custom_literal,
      expr: eYo.t3.Expr.floatnumber
    })
  }
  if (!!XRegExp.exec(candidate, eYo.xre.imagnumber)) {
    return new eYo.t3.profile.Dflt(null, {
      raw: eYo.t3.Custom_literal,
      expr: eYo.t3.Expr.imagnumber
    })
  }
  if (!!XRegExp.exec(candidate, eYo.xre.ShortbytesliteralSingle)) {
    return {
      raw: eYo.t3.Expr.Shortbytesliteral,
      expr: eYo.t3.Expr.Shortliteral,
      type: eYo.t3.Expr.SingleQuoted
    }
  }
  if (!!XRegExp.exec(candidate, eYo.xre.ShortbytesliteralDouble)) {
    return {
      raw: eYo.t3.Expr.Shortbytesliteral,
      expr: eYo.t3.Expr.Shortliteral,
      type: eYo.t3.Expr.doubleQuoted
    }
  }
  var m
  if ((m = XRegExp.exec(candidate, eYo.xre.ShortstringliteralSingle))) {
    return {
      raw: m.formatted ? eYo.t3.Expr.Shortformattedliteral : eYo.t3.Expr.shortstringliteral,
      expr: m.formatted ? eYo.t3.Expr.Shortformattedliteral : eYo.t3.Expr.shortstringliteral,
      type: eYo.t3.Expr.SingleQuoted
    }
  }
  if ((m = XRegExp.exec(candidate, eYo.xre.ShortstringliteralDouble))) {
    return {
      raw: m.formatted ? eYo.t3.Expr.Shortformattedliteral : eYo.t3.Expr.shortstringliteral,
      expr: m.formatted ? eYo.t3.Expr.Shortformattedliteral : eYo.t3.Expr.shortstringliteral,
      type: eYo.t3.Expr.doubleQuoted
    }
  }
  if (!!XRegExp.exec(candidate, eYo.xre.longbytesliteralSingle)) {
    return {
      raw: eYo.t3.Expr.longbytesliteral,
      expr: eYo.t3.Expr.longliteral,
      type: eYo.t3.Expr.SingleQuoted
    }
  }
  if (!!XRegExp.exec(candidate, eYo.xre.longbytesliteralDouble)) {
    return {
      raw: eYo.t3.Expr.longbytesliteral,
      expr: eYo.t3.Expr.longliteral,
      type: eYo.t3.Expr.doubleQuoted
    }
  }
  if ((m = XRegExp.exec(candidate, eYo.xre.longstringliteralSingle))) {
    return {
      raw: m.formatted ? eYo.t3.Expr.longformattedliteral : eYo.t3.Expr.longstringliteral,
      expr: m.formatted ? eYo.t3.Expr.longformattedliteral : eYo.t3.Expr.longstringliteral,
      type: eYo.t3.Expr.SingleQuoted
    }
  }
  if ((m = XRegExp.exec(candidate, eYo.xre.longstringliteralDouble))) {
    return {
      raw: m.formatted ? eYo.t3.Expr.longformattedliteral : eYo.t3.Expr.longstringliteral,
      expr: m.formatted ? eYo.t3.Expr.longformattedliteral : eYo.t3.Expr.longstringliteral,
      type: eYo.t3.Expr.doubleQuoted
    }
  }
}

/**
 * Returns a profile if `identifier` is a reserved keyword/identifier
 * For edython.
 * @param {String} identifier
 * @return {!eYo.t3} the profile of this identifier when a reference.
 */
eYo.t3.profile.getReference = function (identifier) {
  var ans
  if ([
    'functions',
    'stdtypes',
    'datamodel'
  ].some((ref) => {
    var M = eYo.c9r.model[ref]
    ans = M && (M.getProfile(identifier))
    if (ans && !ans.isVoid) {
      return true
    }
  })) {
    return ans
  }
  if ([
    eYo.key.PROPERTY,
    eYo.key.STATICMETHOD,
    eYo.key.CLASSMETHOD
  ].indexOf(identifier) >= 0) {
    return new eYo.t3.profile.Dflt(null,  {
      expr: eYo.t3.Expr.identifier,
      raw: eYo.t3.Expr.reserved_identifier,
      stmt: eYo.t3.Stmt.decorator_stmt
    })
  }
}

/**
 * Returns a profile if `identifier` is a known module's keyword/identifier
 * For edython.
 * @param {String} identifier
 * @return {!eYo.t3} the profile of this identifier when a reference.
 */
eYo.t3.profile.getInModule = function (identifier) {
  var ans
  if ([
    'Turtle',
    'math',
    'decimal',
    'fraction',
    'statistics',
    'random',
    'cmath',
    'string'
  ].some(module => {
    var M = eYo.c9r.model[module + '__module']
    ans = M && (M.getProfile(identifier))
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
 * @param {String} identifier
 * @return {!eYo.t3} the profile of this identifier when reserved.
 */
eYo.t3.profile.getShort = function (identifier) {
  if (['(', ')', '[', ']', '{', '}', ',', ':', ';'].indexOf(identifier) >= 0) {
    return new eYo.t3.profile.Dflt(null, {
      raw: eYo.t3.Expr.Const
    })
  }
}

/**
 * Returns a profile if `identifier` is a reference keyword/identifier
 * For edython.
 * @param {String} identifier
 * @return {!eYo.t3} the profile of this identifier when reserved.
 */
eYo.t3.profile.getReserved = function (identifier) {
  // reserved keywords
  var out
  if ((out = {
    for: {
      expr: eYo.t3.Expr.Comp_for,
      stmt: eYo.t3.Stmt.for_part
    },
    from: {
      expr: eYo.t3.Expr.yield_expr,
      stmt: eYo.t3.Stmt.import_stmt
    },
    nonlocal: {
      stmt: eYo.t3.Stmt.nonlocal
    },
    global: {
      stmt: eYo.t3.Stmt.global_stmt
    },
    del: {
      stmt: eYo.t3.Stmt.del_stmt
    },
    return: {
      stmt: eYo.t3.Stmt.return_stmt
    },
    as: {
      expr: eYo.t3.Expr.identifier,
      stmt: eYo.t3.Stmt.except_part
    },
    yield: {
      expr: eYo.t3.Expr.yield_expr,
      stmt: eYo.t3.Stmt.yield_stmt
    }
  } [identifier])) {
    goog.mixin(out, {
      raw: eYo.t3.Expr.reserved_keyword
    })
    return new eYo.t3.profile.Dflt(null, out)
  }
  if ((out = {
    class: eYo.t3.Stmt.Classdef_part,
    finally: eYo.t3.Stmt.finally_part,
    return: eYo.t3.Stmt.return_stmt,
    continue: eYo.t3.Stmt.Continue_stmt,
    try: eYo.t3.Stmt.try_part,
    def: eYo.t3.Stmt.funcdef_part,
    while: eYo.t3.Stmt.while_part,
    del: eYo.t3.Stmt.del_stmt,
    with: eYo.t3.Stmt.with_part,
    elif: eYo.t3.Stmt.elif_part,
    if: eYo.t3.Stmt.if_part,
    assert: eYo.t3.Stmt.Assert_stmt,
    else: eYo.t3.Stmt.else_part,
    import: eYo.t3.Stmt.import_stmt,
    pass: eYo.t3.Stmt.pass_stmt,
    break: eYo.t3.Stmt.Break_stmt,
    except: eYo.t3.Stmt.except_part,
    raise: eYo.t3.Stmt.raise_stmt,
    await: eYo.t3.Stmt.Await_stmt,
    async: eYo.t3.Stmt.Async_stmt
  } [identifier])) {
    out = {
      raw: eYo.t3.Expr.reserved_keyword,
      stmt: out,
      isReserved: true
    }
    return new eYo.t3.profile.Dflt(null, out)
  }
  if ((out = {
    is: eYo.t3.Expr.object_comparison,
    lambda: eYo.t3.Expr.lambda,
    and: eYo.t3.Expr.And_expr,
    not: eYo.t3.Expr.not_test,
    or: eYo.t3.Expr.or_expr,
    in: eYo.t3.Expr.object_comparison
  } [identifier])) {
    out = {
      raw: eYo.t3.Expr.reserved_keyword,
      expr: out,
      isReserved: true
    }
    return new eYo.t3.profile.Dflt(null, out)
  }
  // reserved identifiers
  if (['True', 'False', 'None', 'Ellipsis', '...', 'NotImplemented'].indexOf(identifier) >= 0) {
    return new eYo.t3.profile.Dflt(null, {
      raw: eYo.t3.Expr.reserved_identifier,
      expr: eYo.t3.Expr.Builtin__object
    })
  }
}
