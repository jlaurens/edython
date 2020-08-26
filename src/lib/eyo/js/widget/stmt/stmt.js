/**
 * edython
 *
 * Copyright 2020 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Bricks for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * @name {eYo.stmt}
 * @namespace
 */
eYo.brick.newNS(eYo, 'stmt')

/**
 * Class for a Delegate, statement brick.
 * Not normally called directly, eYo.brick.Create(...) is preferred.
 * For edython.
 */
eYo.stmt.makeC9rBase(true, {
  left /** @suppress {globalThis} */ (type) { // eslint-disable-line
    return this.brick.head || this.brick.foot
      ? [eYo.t3.stmt.comment_stmt]
      : eYo.t3.stmt.left.Simple_stmt
  },
  right: {
    fields: {
      label: { // don't call it 'operator'
        reserved: ';',
        hidden: true
      }
    },
    check /** @suppress {globalThis} */ (type) { // eslint-disable-line
      return eYo.t3.stmt.right.Simple_stmt
    }
  },
  head /** @suppress {globalThis} */ (type) { // eslint-disable-line
    return this.brick.left
      ? []
      : null // except start_stmt ? connections must also have an uncheck_
  },
  foot /** @suppress {globalThis} */ (type) { // eslint-disable-line
    return this.brick.left
      ? []
      : null
  },
  properties: {
    isStmt: {
      get () {
        return true
      },
    },
    depth: {
      get () {
        var group = this.group
        return (group && (group.depth + 1)) || 0
      },
    },
  },
  methods: {
    /**
     * Insert a brick above.
     * If the brick's previous connection is connected,
     * connects the brick above to it.
     * The connection cannot always establish.
     * The holes are filled.
     * @param {Object} model
     * @return the created brick
     */
    insertParentWithModel (model) {
      var magnet = this.head_m
      if (magnet) {
        var parent
        eYo.event.disableWrap(
          () => {
            parent = eYo.brick.newReady(this, model)
          },
          () => {
            if (parent) {
              var p_magnet = parent.foot_m
              if (p_magnet && magnet.checkType_(p_magnet)) {
                eYo.event.groupWrap(() => {
                  eYo.event.fireBrickCreate(parent)
                  var targetMagnet = magnet.target
                  if (targetMagnet) {
                    targetMagnet.disconnect()
                    if ((targetMagnet = parent.head_m)) {
                      p_magnet.target = targetMagnet
                    }
                  } else {
                    parent.moveTo(this.xy)
                  }
                  parent.render()
                  magnet.target = p_magnet
                  parent.initUI(this.hasUI)
                  if (this.hasFocus) {
                    parent.hasFocus
                  }
                })
              } else {
                parent.dispose(true)
                parent = eYo.NA
              }
            }
          }
        )
        return parent
      }
    },
    /**
     * Insert a brick below the receiver.
     * If the receiver's next connection is connected,
     * connects the brick below to it.
     * The connection cannot always establish.
     * The holes are filled.
     * @param {string} belowPrototypeName
     * @return the created brick
     */
    insertBrickAfter (belowPrototypeName) {
      return eYo.event.groupWrap(() => {
        let below = eYo.brick.newReady(this, belowPrototypeName)
        let m4t = this.foot_m
        let targetM4t = m4t.target
        if (targetM4t) {
          targetM4t.disconnect()
          if (targetM4t.checkType_(this.foot_m)) {
            targetM4t.target = this.foot_m
          }
        }
        m4t.target = this.head_m
        if (this.hasFocus) {
          below.focusOn()
        }
        return below
      })
    },
  },
})

eYo.brick.registerAll(eYo.t3.stmt, eYo.Stmt, true)

eYo.Stmt[eYo.$].finalizeC9r({
  left: ['check'],
}, {
  right: ['check', 'fields'], 
}, {
  head: ['check'],
}, {
  foot: ['check'],
})
