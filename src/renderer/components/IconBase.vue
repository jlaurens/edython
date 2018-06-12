<template>
  <svg xmlns="http://www.w3.org/2000/svg" 
    :width="width" 
    :height="height" 
    :viewBox="viewBox"
    :aria-labelledby="iconName" 
    role="presentation"
  >
    <title :id="iconName" lang="en">{{iconName}} icon</title>
    <g class="icon" :stroke="iconColor">
      <slot />
    </g>
  </svg>
</template>

<script>
export default {
  computed: {
    viewBox: function () {
      return '0 0 ' + this.width + ' ' + this.height
    }
  },
  props: {
    iconName: {
      type: String,
      default: 'box'
    },
    width: {
      type: [Number, String],
      default: 20
    },
    height: {
      type: [Number, String],
      default: 20
    },
    iconColor: {
      type: String,
      default: 'currentColor'
    }
  }
}
</script>

<style scoped>
svg {
  display: inline-block;
  vertical-align: middle;
  margin-top:-0.125rem;
}
</style>
