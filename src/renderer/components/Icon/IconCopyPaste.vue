<template>
  <g>
    <g
      :transform="copyTransform">
      <path
        :class="to"
        d="M 1,1 1,21 21,21 21,1 z"/>
      <path
        v-if="deep"
        :class="to"
        d="M 4,11 18,11"/>
    </g>
    <path
      :class="from"
      :d="fromPath"/>
    <path
      v-if="deep"
      :class="from"
      :d="fromMultiPath"/>
  </g>
</template>

<script>
  export default {
    props: {
      copy: {
        type: Boolean,
        default: true // false to paste
      },
      duplicate: {
        type: Boolean,
        default: false
      },
      deep: {
        type: Boolean,
        default: false
      },
      theta: {
        type: Number,
        default: 1
      }
    },
    computed: {
      from () {
        return this.duplicate || this.copy ? '' : 'clipboard'
      },
      to () {
        return this.copy ? 'clipboard' : ''
      },
      fromPath () {
        return `M 11,${31 - this.theta * 7} 11,31 31,31 31,11 ${31 - this.theta * 7},11`
      },
      fromMultiPath () {
        return `M ${31 - this.theta * 7},21 31,21`
      },
      copyTransform () {
        var t = this.copy ? 1 - this.theta : 0
        return t ? `translate(${10 * t} ${10 * t})` : null
      }
    }
  }
</script>

<style>
  .icon path {
    stroke-linecap: butt;
  }
  .icon path.clipboard {
    stroke-dasharray: 2;
  }
</style>