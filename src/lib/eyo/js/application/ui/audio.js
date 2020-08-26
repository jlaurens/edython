/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Standalone Audio manager.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.o3d.newNS(eYo, 'audio', {
  /**
   * Play a sound at least this amount of milliseconds.
   */
  SOUND_LIMIT: 100,
  /**
   * Default volume.
   */
  SOUND_VOLUME: 0.5,
})

/**
 * Class for loading, storing, and playing audio.
 * @param {String} pathToMedia
 * @constructor
 */
eYo.audio.makeC9rBase({
  properties: {
    /**
     * Time that the last sound was played.
     * @type {String}
     */
    pathToMedia: {
      get () {
        return this.options.pathToMedia
      },
    },
  },
  methods: {
    /**
     * Play a named sound at specified volume.  If volume is not specified,
     * use SOUND_VOLUME.
     * @param {string} name Name of sound.
     * @param {number=} opt_volume Volume of sound (0-1).
     */
    play (name, opt_volume) {
      this.drvr.play(this, name, eYo.isNA(opt_volume) ? this.ns.SOUND_VOLUME : opt_volume)
    },
  },
})


