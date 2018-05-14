/*
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */

/**
 * @fileoverview utilities for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * @name eYo
 * @namespace
 */

eYo = Object.create(null)

goog.provide('eYo')
goog.provide('eYo.Version')
goog.provide('eYo.Session')

/** @define {number} */
eYo.Version.MAJOR = 0

/** @define {number} */
eYo.Version.MINOR = 1

/** @define {number} */
eYo.Version.PATCH = 0

/** @define {sting} */
eYo.Version.PRERELEASE = ''

/** @define {string} */
eYo.Version.BUILD_DATE = ''

/** @define {string} */
eYo.Version.GIT_HEAD = ''

/**
 * Setup.
 */
eYo.setup = (function () {
  var i11rs = []
  var me = function (workspace) {
    eYo.Session.workspace = workspace
    for (var i11r, i = 0; (i11r = i11rs[i]); ++i) {
      i11r()
    }
    i11rs = undefined
  }
  me.register = function (i11r) {
    goog.asserts.assert(goog.isFunction(i11r))
    i11rs.push(i11r)
  }
  return me
}())
