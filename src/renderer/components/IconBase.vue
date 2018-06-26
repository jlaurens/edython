<template>
  <svg xmlns="http://www.w3.org/2000/svg" 
    :width="width" 
    :height="height" 
    :viewBox="viewBox"
    :aria-labelledby="iconName" 
    role="presentation"
    class="eyo-icon"
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
      type: Number,
      default: 20
    },
    height: {
      type: Number,
      default: 20
    },
    iconColor: {
      type: String,
      default: 'currentColor'
    }
  }
}
</script>

<style>
  svg.eyo-icon {
    display: block;
    margin: auto;
    height:100%;
  }
  .dropdown-item svg.eyo-icon {
    display: inline-block;
    height:100%;
    margin-right:0.5rem;
    margin-left:0;
  }
</style>
