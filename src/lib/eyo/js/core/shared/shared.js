/**
 * edython
 *
 * Copyright 2020 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview eYo.shared is a namespace to collect singletons.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('c3s')

// ANCHOR eYo.shared
/**
 * @name{eYo.attr}
 * @namespace
 */
eYo.newNS('shared', {
  OWNER: eYo.c3s.new(),
})
//<<< mochai: Basics
//... chai.assert(eYo.shared)
//... chai.expect(eYo.shared.OWNER).instanceof(eYo.c3s.C9rBase)
//>>>
