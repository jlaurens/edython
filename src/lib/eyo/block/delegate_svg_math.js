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

goog.provide('eYo.DelegateSvg.Math')

goog.require('eYo.DelegateSvg.Stmt')

goog.require('eYo.DelegateSvg.List')
goog.require('eYo.DelegateSvg.Primary')

goog.require('eYo.Tooltip')
goog.require('eYo.FlyoutCategory')

/**
 * Class for a DelegateSvg, import math block.
 * A unique block for each module to ease forthcoming management.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('math__import_stmt', {
  xml: {
    tag: 'math__import',
  },
  fields: {
    label: {
      value: 'import',
      css: 'builtin'
    },
    math: {
      value: 'math'
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

 eYo.DelegateSvg.Expr.module__call_expr.makeSubclass('math__call_expr', {
  data: {
    variant: {
      all: ['namePower', 'nameSpecial', 'nameTrigonometric', 'nameHyperbolic', 'nameNumber', 'nameRepresentation'],
      noUndo: true,
      xml: false,  
    },
    nameNumber: {
      all: ['gcd', 'factorial', 'floor', 'ceil', 'trunc', 'fmod', 'fsum', 'copysign', 'fabs'],
      noUndo: true,
      xml: false,
      didChange: /** @suppress {globalThis} */ function () {
        this.data.variant.set('nameNumber')
      }
    },
    nameRepresentation: {
      all: ['modf', 'frexp', 'ldexp', 'isclose', 'isfinite', 'isinf', 'isnan'],
      noUndo: true,
      xml: false,
      didChange: /** @suppress {globalThis} */ function () {
        this.data.variant.set('nameRepresentation')
      }
/*
9.2.1. Number-theoretic and representation functions
math.ceil(x)
Return the ceiling of x, the smallest integer greater than or equal to x. If x is not a float, delegates to x.__ceil__(), which should return an Integral value.

math.copysign(x, y)
Return a float with the magnitude (absolute value) of x but the sign of y. On platforms that support signed zeros, copysign(1.0, -0.0) returns -1.0.

math.fabs(x)
Return the absolute value of x.

math.factorial(x)
Return x factorial. Raises ValueError if x is not integral or is negative.

math.floor(x)
Return the floor of x, the largest integer less than or equal to x. If x is not a float, delegates to x.__floor__(), which should return an Integral value.

math.fmod(x, y)
Return fmod(x, y), as defined by the platform C library. Note that the Python expression x % y may not return the same result. The intent of the C standard is that fmod(x, y) be exactly (mathematically; to infinite precision) equal to x - n*y for some integer n such that the result has the same sign as x and magnitude less than abs(y). Python’s x % y returns a result with the sign of y instead, and may not be exactly computable for float arguments. For example, fmod(-1e-100, 1e100) is -1e-100, but the result of Python’s -1e-100 % 1e100 is 1e100-1e-100, which cannot be represented exactly as a float, and rounds to the surprising 1e100. For this reason, function fmod() is generally preferred when working with floats, while Python’s x % y is preferred when working with integers.

math.frexp(x)
Return the mantissa and exponent of x as the pair (m, e). m is a float and e is an integer such that x == m * 2**e exactly. If x is zero, returns (0.0, 0), otherwise 0.5 <= abs(m) < 1. This is used to “pick apart” the internal representation of a float in a portable way.

math.fsum(iterable)
Return an accurate floating point sum of values in the iterable. Avoids loss of precision by tracking multiple intermediate partial sums:

>>>
>>> sum([.1, .1, .1, .1, .1, .1, .1, .1, .1, .1])
0.9999999999999999
>>> fsum([.1, .1, .1, .1, .1, .1, .1, .1, .1, .1])
1.0
The algorithm’s accuracy depends on IEEE-754 arithmetic guarantees and the typical case where the rounding mode is half-even. On some non-Windows builds, the underlying C library uses extended precision addition and may occasionally double-round an intermediate sum causing it to be off in its least significant bit.

For further discussion and two alternative approaches, see the ASPN cookbook recipes for accurate floating point summation.

math.gcd(a, b)
Return the greatest common divisor of the integers a and b. If either a or b is nonzero, then the value of gcd(a, b) is the largest positive integer that divides both a and b. gcd(0, 0) returns 0.

New in version 3.5.

math.isclose(a, b, *, rel_tol=1e-09, abs_tol=0.0)
Return True if the values a and b are close to each other and False otherwise.

Whether or not two values are considered close is determined according to given absolute and relative tolerances.

rel_tol is the relative tolerance – it is the maximum allowed difference between a and b, relative to the larger absolute value of a or b. For example, to set a tolerance of 5%, pass rel_tol=0.05. The default tolerance is 1e-09, which assures that the two values are the same within about 9 decimal digits. rel_tol must be greater than zero.

abs_tol is the minimum absolute tolerance – useful for comparisons near zero. abs_tol must be at least zero.

If no errors occur, the result will be: abs(a-b) <= max(rel_tol * max(abs(a), abs(b)), abs_tol).

The IEEE 754 special values of NaN, inf, and -inf will be handled according to IEEE rules. Specifically, NaN is not considered close to any other value, including NaN. inf and -inf are only considered close to themselves.

New in version 3.5.

See also PEP 485 – A function for testing approximate equality
math.isfinite(x)
Return True if x is neither an infinity nor a NaN, and False otherwise. (Note that 0.0 is considered finite.)

New in version 3.2.

math.isinf(x)
Return True if x is a positive or negative infinity, and False otherwise.

math.isnan(x)
Return True if x is a NaN (not a number), and False otherwise.

math.ldexp(x, i)
Return x * (2**i). This is essentially the inverse of function frexp().

math.modf(x)
Return the fractional and integer parts of x. Both results carry the sign of x and are floats.

math.trunc(x)
Return the Real value x truncated to an Integral (usually an integer). Delegates to x.__trunc__().

Note that frexp() and modf() have a different call/return pattern than their C equivalents: they take a single argument and return a pair of values, rather than returning their second return value through an ‘output parameter’ (there is no such thing in Python).

For the ceil(), floor(), and modf() functions, note that all floating-point numbers of sufficiently large magnitude are exact integers. Python floats typically carry no more than 53 bits of precision (the same as the platform C double type), in which case any float x with abs(x) >= 2**52 necessarily has no fractional bits.
*/
    },
    nameTrigonometric: {
      all: ['cos', 'sin', 'tan', 'hypoth', 'acos', 'asin', 'atan', 'atan2', 'degrees', 'radians'],
      noUndo: true,
      xml: false,
      didChange: /** @suppress {globalThis} */ function () {
        this.data.variant.set('nameTrigonometric')
      }
/*
9.2.3. Trigonometric functions
math.acos(x)
Return the arc cosine of x, in radians.

math.asin(x)
Return the arc sine of x, in radians.

math.atan(x)
Return the arc tangent of x, in radians.

math.atan2(y, x)
Return atan(y / x), in radians. The result is between -pi and pi. The vector in the plane from the origin to point (x, y) makes this angle with the positive X axis. The point of atan2() is that the signs of both inputs are known to it, so it can compute the correct quadrant for the angle. For example, atan(1) and atan2(1, 1) are both pi/4, but atan2(-1, -1) is -3*pi/4.

math.cos(x)
Return the cosine of x radians.

math.hypot(x, y)
Return the Euclidean norm, sqrt(x*x + y*y). This is the length of the vector from the origin to point (x, y).

math.sin(x)
Return the sine of x radians.

math.tan(x)
Return the tangent of x radians.

9.2.4. Angular conversion
math.degrees(x)
Convert angle x from radians to degrees.

math.radians(x)
Convert angle x from degrees to radians.
*/    },
    nameHyperbolic: {
      all: ['cosh', 'sinh', 'tanh', 'acosh', 'asinh', 'atanh'],
      noUndo: true,
      xml: false,
      didChange: /** @suppress {globalThis} */ function () {
        this.data.variant.set('nameHyperbolic')
      }
      /*
      9.2.5. Hyperbolic functions
Hyperbolic functions are analogs of trigonometric functions that are based on hyperbolas instead of circles.

math.acosh(x)
Return the inverse hyperbolic cosine of x.

math.asinh(x)
Return the inverse hyperbolic sine of x.

math.atanh(x)
Return the inverse hyperbolic tangent of x.

math.cosh(x)
Return the hyperbolic cosine of x.

math.sinh(x)
Return the hyperbolic sine of x.

math.tanh(x)
Return the hyperbolic tangent of x.
*/ 
    },
    nameSpecial: {
      all: ['erf', 'phi', 'erfc', 'gamma', 'lgamma'],
      noUndo: true,
      xml: false,
      didChange: /** @suppress {globalThis} */ function () {
        this.data.variant.set('nameSpecial')
      }
/*
9.2.6. Special functions
math.erf(x)
Return the error function at x.

The erf() function can be used to compute traditional statistical functions such as the cumulative standard normal distribution:

def phi(x):
    'Cumulative distribution function for the standard normal distribution'
    return (1.0 + erf(x / sqrt(2.0))) / 2.0
New in version 3.2.

math.erfc(x)
Return the complementary error function at x. The complementary error function is defined as 1.0 - erf(x). It is used for large values of x where a subtraction from one would cause a loss of significance.

New in version 3.2.

math.gamma(x)
Return the Gamma function at x.

New in version 3.2.

math.lgamma(x)
Return the natural logarithm of the absolute value of the Gamma function at x.
*/
    },
    namePower: {
      all: ['sqrt', 'pow', 'exp', 'expm1', 'log', 'log1p', 'log10', 'log2'],
      init: 'sqrt',
      noUndo: true,
      xml: false,
      /*
9.2.2. Power and logarithmic functions
math.exp(x)
Return e**x.

math.expm1(x)
Return e**x - 1. For small floats x, the subtraction in exp(x) - 1 can result in a significant loss of precision; the expm1() function provides a way to compute this quantity to full precision:

>>>
>>> from math import exp, expm1
>>> exp(1e-5) - 1  # gives result accurate to 11 places
1.0000050000069649e-05
>>> expm1(1e-5)    # result accurate to full precision
1.0000050000166668e-05
New in version 3.2.

math.log(x[, base])
With one argument, return the natural logarithm of x (to base e).

With two arguments, return the logarithm of x to the given base, calculated as log(x)/log(base).

math.log1p(x)
Return the natural logarithm of 1+x (base e). The result is calculated in a way which is accurate for x near zero.

math.log2(x)
Return the base-2 logarithm of x. This is usually more accurate than log(x, 2).

New in version 3.3.

See also int.bit_length() returns the number of bits necessary to represent an integer in binary, excluding the sign and leading zeros.
math.log10(x)
Return the base-10 logarithm of x. This is usually more accurate than log(x, 10).

math.pow(x, y)
Return x raised to the power y. Exceptional cases follow Annex ‘F’ of the C99 standard as far as possible. In particular, pow(1.0, x) and pow(x, 0.0) always return 1.0, even when x is a zero or a NaN. If both x and y are finite, x is negative, and y is not an integer then pow(x, y) is undefined, and raises ValueError.

Unlike the built-in ** operator, math.pow() converts both its arguments to type float. Use ** or the built-in pow() function for computing exact integer powers.

math.sqrt(x)
Return the square root of x.
*/
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
        var n_aries = ['isclose', 'fsum']
        var binaries = ['atan2', 'pow', 'log', 'copysign', 'fmod', 'gcd', 'ldexp']
        d.set(n_aries.indexOf(newValue) >= 0 ? d.model.N_ARY : binaries.indexOf(newValue) >= 0 ? d.model.BINARY : d.model.UNARY)
      },
      consolidate: /** @suppress {globalThis} */ function () {
        this.didChange(undefined, this.get())
      }
    }
  },
  fields: {
    module: {
      value: 'math',
      endEditing: false
    }
  },
  output: {
    check: [eYo.T3.Expr.math__call_expr, eYo.T3.Expr.call_expr]
  }
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Expr.math__call_expr.populateMenu = function (block, mgr) {
  var eyo = block.eyo
  var current_variant = eyo.data.variant.get()
  var current_name = eyo.data.name.get()
  var isFinite = !!eyo.data.name.isFinite
  var data = eyo.data[current_variant]
  var names = data.getAll()
  var F = function (i) {
    var name = names[i]
    if (name !== current_name) {
      var content =
      goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
        'math.' + name + '(...)'
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
        nameNumber: 'gcd, floor, fsum, ...',
        nameRepresentation: 'modf, isclose, isinf, ...',
        nameTrigonometric: 'sin, cos, hypoth, ...',
        namePower: 'sqrt, exp, log...',
        nameTrigonometric: 'cos, sin, atan2, ...',
        nameHyperbolic: 'sinh, cosh, ...',
        nameSpecial: 'erf, phi, gamma, ...',
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
eYo.DelegateSvg.Expr.math__call_expr.prototype.populateContextMenuFirst_ = function (block, mgr) {
  eYo.DelegateSvg.Expr.math__call_expr.populateMenu.call(this, block, mgr)
  return eYo.DelegateSvg.Expr.base_call_expr.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

/**
 * Class for a DelegateSvg, call statement block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('math__call_stmt', {
  link: eYo.T3.Expr.math__call_expr
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Stmt.math__call_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  eYo.DelegateSvg.Expr.math__call_expr.populateMenu.call(this, block, mgr)
  return eYo.DelegateSvg.Stmt.math__call_stmt.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

/**
 * Class for a DelegateSvg, math constant block.
 * As call is already a reserved message in javascript,
 * we use call_expr instead.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.makeSubclass('math__const', {
  data: {
    name: {
      all: ['pi', 'e', 'tau', 'inf', 'nan'],
      init: /** @suppress {globalThis} */ function () {
        this.set('pi')
      },
      synchronize: true,
      validate: true
    }
  },
  fields: {
    module: {
      order: 1,
      value: 'math',
      endEditing: false
    },
    dot: {
      order: 2,
      separator: '.'
    },
    name: {
      order: 3,
      validate: true,
      endEditing: true,
      placeholder: eYo.Msg.Placeholder.IDENTIFIER
    }
  },
  output: {
    check: [eYo.T3.Expr.math__const, eYo.T3.Expr.builtin__object]
  }
})


/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Expr.math__call_expr.populateMenu = function (block, mgr) {
  var eyo = block.eyo
  var current_name = eyo.data.name.get()
  var names = eyo.data.name.getAll()
  var F = function (i) {
    var name = names[i]
    if (name !== current_name) {
      var content =
      goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
        'math.' + name
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
  var key = 'math__'+name
  title && (eYo.Tooltip.Title[key] = title)
  return {
    type: eYo.T3.Expr.math__call_expr,
    data: name,
    title: key
  }
}
eYo.FlyoutCategory.math__module = [
  eYo.T3.Stmt.math__import_stmt,
  F('sqrt', 'Racine carrée (square root)'),
  F('pow', 'Fonction puissance (power), préférer l\'opérateur ** pour les entiers'),
  F('cos', 'Fonction cosinus'),
  F('sin', 'Fonction sinus'),
  F('tan', 'Fonction tangente'),
  F('hypoth', 'Fonction hypothénuse (module), distance euclidienne à l\'origine'),
  F('atan2', 'Fonction angle polaire (argument)'),
  F('degrees', 'Pour convertir en degrés'),
  F('radians', 'Pour convertif en radians'),
  F('exp', 'Fonction exponentielle'),
  F('log', 'Fonction logarithme népérien, donner un deuxième argument pour changer de base'),
  F('phi', 'Fonction de répartition de la loi normale centrée réduite'),
  F('gcd', 'Plus grand diviseur commun (pgcd)'),
  F('factorial', 'Factorielle (n!)'),
  F('floor', 'Partie entière par défaut'),
  F('ceil', 'Partie entière par excès'),
  F('trunc', 'Partie tronquée (parmi les deux parties entières, celles qui est le plus proche de 0) '),
  F('fmod', 'modulo avec des nombres, préférer % pour des arguments entiers'),
  F('fsum', 'Somme pour des nombres entiers ou non, tient compte de problèmes d\'arrondi'),
  F('copysign', 'Copie le signe d\'un nombre sur l\'autre'),
  F('fabs', 'Valeur absolue ou module'),
  F('modf', 'Parties entière et fractionnaire'),
  F('frexp', 'Représentation interne m * 2 ** e'),
  F('ldexp', 'Renvoie  m * 2 ** e, fonction inverse de frexp'),
  F('isclose', 'Teste si deux valeurs sont proches'),
  F('isfinite', 'Teste si l\'argument est un nombre fini'),
  F('isinf', 'Teste si l\'argument est infini (au sens informatique)'),
  F('isnan', 'Teste si l\'argument n\'est as un nombre (Not A Number)'),
  F('acos', 'Fonction arc cosinus'),
  F('asin', 'Fonction arc sinus'),
  F('atan', 'Fonction arc tangente'),
  F('cosh', 'Fonction cosinus hyperbolique (ch)'),
  F('sinh', 'Fonction sinus hyperbolique (sh)'),
  F('tanh', 'Fonction tangente hyperbolique (th)'),
  F('acosh', 'Fonction arc cosinus hyperbolique (argch)'),
  F('asinh', 'Fonction arc sinus hyperbolique (argsh)'),
  F('atanh', 'Fonction arc tangente hyperbolique (argth)'),
  F('expm1', 'Fonction exp(x) - 1, avec une meilleure précision près de 0'),
  F('log1p', 'log(1 + x), avec une meilleure précision près de 0'),
  F('log10', 'Fonction logarithme de base 10 avec une meilleure précision que (log(x, 10)'),
  F('log2', 'Fonction logarithme de base 2 avec une meilleure précision que (log(x, 2)'),
  F('erf', 'Fonction erreur de Gauss'),
  F('erfc', 'Complément à 1 de la fonction erf'),
  F('gamma', 'Fonction Gamma d\'Euler'),
  F('lgamma', 'Logarithme népérien de la fonction Gamma')
]

goog.mixin(eYo.Tooltip.Title, {
  math__import_stmt: 'Importer le module math',
})

eYo.DelegateSvg.Math.T3s = [
  eYo.T3.Stmt.math__import_stmt,
  eYo.T3.Expr.math__call_expr,
  eYo.T3.Stmt.math__call_stmt,
  eYo.T3.Expr.math__const
]
