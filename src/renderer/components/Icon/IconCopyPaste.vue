<template>
  <g>
      <g :transform="copyTransform">
        <path :class="variant" d="M 1,1 1,21 21,21 21,1 z"/>
        <path v-if="!single" :class="variant" d="M 4,11 18,11"/>
      </g>
      <path class="below" :d="belowPath"/>
      <path v-if="!single" class="below" :d="belowMultiPath"/>
  </g>
</template>

<script>
  export default {
    computed: {
      belowPath: function () {
        return ['M 11,', 31 - this.step * 7, ' 11,31 31,31 31,11 ', 31 - this.step * 7, ',11'].join('')
      },
      belowMultiPath: function () {
        return ['M ', 31 - this.step * 7, ',21 31,21'].join('')
      },
      copyTransform: function () {
        console.log('this.step', this.step)
        var t = 1 - this.step
        return ['translate(', 10 * t, ',', 10 * t, ')'].join('')
      }
    },
    props: {
      variant: {
        type: String,
        default: 'copy'
      },
      single: {
        type: Boolean,
        default: true
      },
      step: {
        type: Number,
        default: 1
      }
    }
  }
</script>

<style>
  .icon path.copy {
    stroke-dasharray: 2;
    stroke-linecap: butt;
  }
  .icon path.below {
    stroke-linecap: butt;
  }
</style>