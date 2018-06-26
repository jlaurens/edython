<template>
  <g>
      <g :transform="copyTransform">
        <path :class="c3s" d="M 1,1 1,21 21,21 21,1 z"/>
        <path v-if="deep" :class="c3s" d="M 4,11 18,11"/>
      </g>
      <path class="below" :d="belowPath"/>
      <path v-if="deep" class="below" :d="belowMultiPath"/>
  </g>
</template>

<script>
  export default {
    computed: {
      c3s () {
        return this.copy ? 'copy' : ''
      },
      belowPath () {
        return ['M 11,', 31 - this.step * 7, ' 11,31 31,31 31,11 ', 31 - this.step * 7, ',11'].join('')
      },
      belowMultiPath () {
        return ['M ', 31 - this.step * 7, ',21 31,21'].join('')
      },
      copyTransform () {
        var t = 1 - this.step
        return ['translate(', 10 * t, ',', 10 * t, ')'].join('')
      }
    },
    props: {
      copy: {
        type: Boolean,
        default: true
      },
      deep: {
        type: Boolean,
        default: false
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