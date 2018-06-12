<template>
  <g :transform="transform">
      <path d="M 5,8 19,8 a 8,8 0 0,1 0,16 L 5,24"/>
      <path d="M 8.5,5.5 5,8 8.5,10.5"/>
  </g>
</template>

<script>
  export default {
    computed: {
      transform: function () {
        return this.variant === 'redo' ? 'matrix(-1,0,0,1,32,0)' : ''
      }
    },
    props: {
      variant: {
        type: [String],
        default: 'undo'
      }
    }
  }
</script>