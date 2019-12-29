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

eYo.require('C9r.Owned')

/**
 * Class for loading, storing, and playing audio.
 * @param {String} pathToMedia
 * @constructor
 */
eYo.makeClass('Audio', eYo.C9r.Owned, {
  computed: {
    /**
     * Time that the last sound was played.
     * @type {String}
     */
    pathToMedia () {
      return this.options.pathToMedia
    },
  }
})

/**
 * Play a named sound at specified volume.  If volume is not specified,
 * use SOUND_VOLUME.
 * @param {string} name Name of sound.
 * @param {number=} opt_volume Volume of sound (0-1).
 */
eYo.Audio_p.play = function(name, opt_volume) {
  this.ui_driver.play(this, name, opt_volume)
}
