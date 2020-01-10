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

eYo.require('svg')

eYo.forwardDeclare('slot')

/**
 * Svg driver for slots.
 */
eYo.svg.makeDriverC9r('Slot', {
    /**
   * Prepare the given slot.
   * @param {eYo.slot.Dflt} slot to be prepared.
   */
  initUI (slot) {
    var dom = this._initUI(slot)
    var svg = dom.svg = Object.create(null)
    var g = svg.group_ = eYo.svg.newElement('g', {
      class: 'eyo-slot'
    }, null)
    g.dataset && (g.dataset.slot = slot.key)
    if (slot.previous) {
      goog.dom.insertSiblingAfter(g, slot.previous.dom.svg.group_)
    } else {
      eYo.Assert(slot.brick.slotAtHead === slot, 'Unexpected head slot not at head')
      goog.dom.appendChild(slot.brick.dom.svg.group_, g)
    }
    this.displayedUpdate(slot)
  },
  /**
   * Dispose of the given slot's rendering resources.
   * @param {eYo.slot.Dflt} slot
   */
  disposeMake (slot) {
    goog.dom.removeNode(slot.dom.svg.group_)
    slot.dom.svg.group_ = null
    slot.dom.svg = null
  },
})

/**
 * Whether the slot is displayed.
 * @param {Object} slot  the slot to query about
 */
eYo.svg.Slot.prototype.displayedGet = function (slot) {
  var g = slot.dom.svg.group_
  return g.style.display !== 'none'
}

/**
 * Display/hide the given slot.
 * @param {Object} slot  the slot the driver acts on
 * @param {boolean} yorn
 */
eYo.svg.Slot.prototype.displayedSet = function (slot, yorn) {
  var g = slot.dom.svg.group_
  if (yorn) {
    g.removeAttribute('display')
  } else {
    g.style.display = 'none'
  }
}

/**
 * Display/hide the given slot according to its `visible` property.
 * @param {Object} slot  the slot the driver acts on
 * @param {boolean} yorn
 */
eYo.svg.Slot.prototype.displayedUpdate = function (slot) {
  this.displayedSet(slot, slot.visible)
}

/**
 * Dispose of the given slot's rendering resources.
 * @param {eYo.slot.Dflt} slot
 */
eYo.svg.Slot.prototype.display = function (slot) {
  var g = slot.dom && slot.dom.svg.group_
  eYo.Assert(g, 'Slot with no root', slot.brick.type, slot.key)
  if (slot.incog) {
    g.setAttribute('display', 'none')
  } else {
    g.removeAttribute('display')
    g.setAttribute('transform',
      `translate(${slot.where.x}, ${slot.where.y})`)
  }
}
