<template>
  <path
    id="p-icon-triangle"
    v-tippy
    :transform="transform"
    :d="d"
    title="Afficher ou masquer le tiroir des blocs"
  />
</template>

<script>
export default {
  props: {
    width: {
      type: Number,
      default: 20
    },
    height: {
      type: Number,
      default: 20
    },
    right: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      default: ''
    }
  },
  data: function () {
    return {
      footstep: 0
    }
  },
  computed: {
    d: function () {
      var radius = this.width / 2 * 0.8
      return `M 4,16 l${radius * 1.5},${radius * 0.866} l 0,${-radius * 1.732} z`
    },
    transform: function () {
      var angle = this.right
        ? 540 * this.footstep - 180
        : -540 * this.footstep
      return `rotate(${angle},${4 + 2 * this.width / 5},16)`
    }
  },
  mounted: function () {
    var self = this
    eYo.FlyoutDelegate.prototype.oneStep = function (footstep) {
      // next loop to disable tooltips while scrolling
      for (const popper of document.querySelectorAll('.tippy-popper')) {
        const instance = popper._tippy
        if (instance.state.visible) {
          instance.popperInstance.disableEventListeners()
          instance.hide()
        }
      }
      self.footstep = footstep
    }
  }
}
</script>

<style>
  #p-icon-triangle {
    stroke: none;
    fill: white;
    fill-opacity: 0.8;
  }
  #p-icon-triangle:hover {
    fill: black;
    fill-opacity: 0.2;
  }
  .busy #p-icon-triangle {
    fill: #f9951b;
    fill-opacity: 1;
  }
</style>
