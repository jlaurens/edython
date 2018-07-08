<template>
    <path :transform="transform" id="p-icon-triangle" :d="d" title="Afficher ou masquer le tiroir des blocs" v-tippy/>
  </template>

<script>
  export default {
    data: function () {
      return {
        step: 0
      }
    },
    computed: {
      d: function () {
        var radius = this.width / 2 * 0.8
        return ['M', 0, ',', this.height / 2, 'l', radius * 1.5, ',', radius * 0.866, 'l', 0, ',', -radius * 1.732, 'z'].join('')
      },
      transform: function () {
        return ['rotate(', -540 * this.step, ',', 2 * this.width / 5, ',', this.height / 2, ')'].join('')
      }
    },
    props: {
      width: {
        type: [Number, String],
        default: 20
      },
      height: {
        type: [Number, String],
        default: 20
      }
    },
    mounted: function () {
      var self = this
      eYo.FlyoutDelegate.prototype.oneStep = function (step) {
        // next loop to disable tooltips while scrolling
        for (const popper of document.querySelectorAll('.tippy-popper')) {
          const instance = popper._tippy
          if (instance.state.visible) {
            instance.popperInstance.disableEventListeners()
            instance.hide()
          }
        }
        self.step = step
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
</style>