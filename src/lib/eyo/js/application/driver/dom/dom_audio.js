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

goog.forwardDeclare('goog.userAgent')

/**
 * @name {eYo.dom.Audio}
 * Class for loading, storing, and playing audio.
 * @param {String} pathToMedia
 * @constructor
 */
eYo.dom.makeDriverC9r('Audio', {
  initUI(audio) {
    /**
     * Database of pre-loaded sounds.
     * @private
     * @const
     */
    try {
      this.load(audio, 'click')
      this.load(audio, 'disconnect')
      this.load(audio, 'delete')
    } catch(e) {
      return
    }
    // Android ignores any sound not loaded as a result of a user action.
    // Bind temporary hooks that preload the sounds.
    var soundBinds
    var self = this
    var unbindSounds = () => {
      while (soundBinds.length) {
        eYo.dom.unbindEvent(soundBinds.pop())
      }
      self.preload()
    }
    // These are bound on mouse/touch events with Blockly.bindEventWithChecks_, so
    // they restrict the touch identifier that will be recognized.  But this is
    // really something that happens on a click, not a drag, so that's not
    // necessary.

    soundBinds = [eYo.dom.BindEvent(
      document,
      'mousemove',
      unbindSounds,
      {noCaptureIdentifier: true}
    ), eYo.dom.BindEvent(
      document,
      'touchstart',
      unbindSounds,
      {noCaptureIdentifier: true}
    )]
  },
  valued: {
    /**
     * Time that the last sound was played.
     * @type {Date}
     * @private
     */
    lastPlay: { value: null, writable: true },
    tester () {
      return new Audio()
    },
    sounds () {
      return Object.create(null)
    },
  },
  CONST: {
    /**
     * Play a sound at least this amount of milliseconds.
     */
    SOUND_LIMIT: 100,
    /**
     * Default volume.
     */
    SOUND_VOLUME: 0.5,
  }
})

/**
 * Load an audio file.  Cache it, ready for playing.
 * @param {Array<string>} filenames List of file types in decreasing order of
 *   preference (i.e. increasing size).  E.g. ['media/go.mp3', 'media/go.wav']
 *   Filenames include path from Blockly's root.  File extensions matter.
 * @param {string} name Name of sound.
 */
eYo.dom.Audio_p.load = function(audio, name) {
  let pathToMedia = audio.pathToMedia
  var base = pathToMedia + name + '.'
  ;[ 'mp3', 'ogg', 'wav' ].some(ext => {
    if (this.tester.canPlayType('audio/' + ext)) {
      var sound = new Audio(base + ext)
      if (sound && sound.play) {
        this.sounds_[name] = sound
        return true
      }
    }
  })
}

/**
 * Preload all the audio files so that they play quickly when asked for.
 */
eYo.dom.Audio_p.preload = function() {
  if (eYo.Test && !eYo.Test.Audio) {
    return
  }
  Object.values(this.sounds).some(sound => {
    sound.volume = 0.01
    sound.play().catch(()=>{})
    sound.pause()
    // iOS can only process one sound at a time.  Trying to load more than one
    // corrupts the earlier ones.  Just load one and leave the others uncached.
    return goog.userAgent.IPAD || goog.userAgent.IPHONE
  })
}

/**
 * Play a named sound at specified volume.  If volume is not specified,
 * use SOUND_VOLUME.
 * @param {string} name Name of sound.
 * @param {number=} opt_volume Volume of sound (0-1).
 */
eYo.dom.Audio_p.play = function(audio, name, opt_volume) {
  var sound = this.sounds_[name]
  if (sound) {
    // Don't play one sound on top of another, setTimeout?
    var now = new Date
    if (this.lastPlay_ && now - this.lastPlay_ < this.SOUND_LIMIT) {
      return
    }
    this.lastPlay_ = now
    var mySound
    var ie9 = goog.userAgent.DOCUMENT_MODE &&
              goog.userAgent.DOCUMENT_MODE === 9
    if (ie9 || goog.userAgent.IPAD || goog.userAgent.ANDROID) {
      // Creating a new audio node causes lag in IE9, Android and iPad. Android
      // and IE9 refetch the file from the server, iPad uses a singleton audio
      // node which must be deleted and recreated for each new audio tag.
      mySound = sound
    } else {
      mySound = sound.cloneNode()
    }
    mySound.volume = (opt_volume === eYo.NA ? this.SOUND_VOLUME : opt_volume)
    mySound.play()
  }
}
