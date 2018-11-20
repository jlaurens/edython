<template>
  <g :transform="transform">
    <path d="M 8,16 A 10,10 0 0 1 24,16 M 16,10 16,7 M 9,12 9,9 M 23,12 24,9"/>
    <path v-if="open" d="M 16,15.5 A 1.25,1.25 0 0 1 16,18 A 1.25,1.25 0 0 1 16,15.5 z"/>
  </g>
</template>

<script>
  export default {
    props: {
      open: {
        type: Boolean,
        default: true
      },
      dx: {
        type: Number,
        default: 0
      },
      dy: {
        type: Number,
        default: 0
      }
    },
    computed: {
      transform () {
        return this.open
          ? `translate(${this.dx} ${this.dy})`
          : `translate(${this.dx} ${30 + this.dy})scale(1 -1)`
      }
    }
  }
</script>
