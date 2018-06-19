<template>
  <g>
      <path :class="variant" d="M 1,1 1,21 21,21 21,1 z"/>
      <path class="below" d="M 11,24 11,31 31,31 31,11 24,11"/>
      <path v-if="multi" :class="variant" d="M 4,11 18,11"/>
      <path v-if="multi" class="below" d="M 24,21 31,21"/>
  </g>
</template>

<script>
  export default {
    computed: {
      multi: function () {
        return this.single !== 'true'
      }
    },
    props: {
      variant: {
        type: [String],
        default: 'copy'
      },
      single: {
        type: [String],
        default: 'true'
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