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

eYo.require('c9r')

// ANCHOR eYo.shared
/**
 * @name{eYo.attr}
 * @namespace
 */
eYo.makeNS('shared', {
  OWNER: eYo.c9r.new(),
})
//<<< mochai: Basics
//... chai.assert(eYo.shared)
//... chai.expect(eYo.shared.OWNER).instanceof(eYo.c9r.BaseC9r)
//>>>
