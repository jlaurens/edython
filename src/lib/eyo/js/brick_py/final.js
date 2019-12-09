/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Bricks for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('eYo.ns.Brick')

eYo.provide('eYo.ns.Brick.Final')


/**
 * Final processing of delegates.
 * Must be loaded after all the delegates have been defined.
 * This installs behaviors on a group basis.
 */
