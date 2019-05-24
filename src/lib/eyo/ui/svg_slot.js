/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Rendering delegate.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Svg.Slot')

goog.require('eYo.Svg')

// Slot management

/**
 * Prepare the given slot.
 * @param {!eYo.Slot} slot to be prepared.
 */
eYo.Svg.prototype.slotInit = function (slot) {
  if (slot.dom) {
    return // already initialized
  }
  var svg = slot.dom = {}
  dom.group_ = eYo.Svg.newElement('g', {
    class: 'eyo-slot'
  }, null)
  if (slot.previous) {
    goog.dom.insertSiblingAfter(dom.group_, slot.previous.dom.group_)
  } else {
    goog.asserts.assert(slot.brick.slotAtHead === slot, 'Unexpected head slot not at head')
    goog.dom.appendChild(slot.brick.ui.dom.group_, dom.group_)
  }
  this.slotDisplayedUpdate(slot)
}

/**
 * Dispose of the given slot's rendering resources.
 * @param {eYo.Slot} slot
 */
eYo.Svg.prototype.slotDispose = function (slot) {
  goog.dom.removeNode(slot.dom.group_)
  slot.dom.group_ = null
  slot.dom = undefined
}

/**
 * Whether the slot is displayed.
 * @param {!Object} slot  the slot to query about
 */
eYo.Svg.prototype.slotDisplayedGet = function (slot) {
  var g = slot.dom.group_
  return g.style.display !== 'none'
}

/**
 * Display/hide the given slot.
 * @param {!Object} slot  the slot the driver acts on
 * @param {boolean} yorn
 */
eYo.Svg.prototype.slotDisplayedSet = function (slot, yorn) {
  var g = slot.dom.group_
  if (yorn) {
    g.removeAttribute('display')
  } else {
    g.style.display = 'none'
  }
}

/**
 * Display/hide the given slot according to its `visible` property.
 * @param {!Object} slot  the slot the driver acts on
 * @param {boolean} yorn
 */
eYo.Svg.prototype.slotDisplayedUpdate = function (slot) {
  this.slotDisplayedSet(slot, slot.visible)
}

/**
 * Dispose of the given slot's rendering resources.
 * @param {eYo.Slot} slot
 */
eYo.Svg.prototype.slotDisplay = function (slot) {
  var g = slot.dom && slot.dom.group_
  goog.asserts.assert(g, 'Slot with no root', slot.brick.type, slot.key)
  if (slot.incog) {
    g.setAttribute('display', 'none')
  } else {
    g.removeAttribute('display')
    g.setAttribute('transform',
      `translate(${slot.where.x}, ${slot.where.y})`)
  }
}
