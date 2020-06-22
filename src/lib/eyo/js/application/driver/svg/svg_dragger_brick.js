/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview draggerBrick rendering delegate.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * Svg driver for a brick dragger.
 */
eYo.svg.newDriverC9r('DraggerBrick', {
  /**
   * Initializes the draggerBrick SVG ressources.
   * @param {eYo.dragger.Brick} draggerBrick
   */
  initUI (dragger) {
    var dom = dragger.dom
    var svg = dom.svg = Object.create(null)
    svg.dragSurface = dragger.board.dom.svg.brickDragSurface
  },
  /**
   * Dispose of the given slot's rendering resources.
   * @param {eYo.draggerBrick} draggerBrick
   */
  disposeUI (draggerBrick) {
    var dom = draggerBrick.dom
    var svg = dom.svg
    if (svg) {
      svg.dragSurface = dom.svg = eYo.NA
    }
  },
  methods: {
    /**
     * Start dragging.
     * @param {eYo.draggerBrick} draggerBrick
     */
    start (draggerBrick) {
      // Move the brick dragged to the drag surface
      // The translation for drag surface bricks,
      // is equal to the current relative-to-surface position,
      // to keep the position in sync as it moves on/off the surface.
      var main = draggerBrick.destination
      var stl = main.board_.dom.div_.style
      stl.display = 'block'
      var bds = draggerBrick.dragSurface
      // Execute the move on the top-level SVG component
      if (bds) {
        bds.start(draggerBrick)
      } else { // eslint-disable-line
        //TODO: IS IT VOID ?
      }
      // at start the board is centered in the visible area,
      // the whole size is at least 3x3 times the visible area.
      // Prepare the dragging boundaries
      return
    },
    /**
    * End dragging.
    * @param {eYo.dragger.Brick} dragger
    */
    end (dragger) {
      this.brickEffectStop(dragger.brick)
      dragger.dragSurface.end(!dragger.wouldDelete_)
    },
  },
})
