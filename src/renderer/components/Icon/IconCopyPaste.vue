<template>
  <g>
      <path :class="variant" d="M 1,1 1,21 21,21 21,1 z"/>
      <path class = "below" d="M 11,24 11,31 31,31 31,11 24,11"/>
  </g>
</template>

<script>
  export default {
    props: {
      variant: {
        type: [String],
        default: 'copy'
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