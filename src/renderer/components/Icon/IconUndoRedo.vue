<template>
  <g :transform="transform">
      <path d="M 10,5 19,5 a 11,11 0 0,1 0,22 L 15,27 15,21 19,21 a 5,5 0 0,0 0,-10 L 10,11 10,13.5 5.5,8 10,2.5Z"/>
  </g>
</template>

<script>
  export default {
    computed: {
      transform: function () {
        return this.redo ? 'matrix(-1,0,0,1,32,0)' : ''
      }
    },
    props: {
      redo: {
        type: Boolean,
        default: false
      }
    }
  }
</script>