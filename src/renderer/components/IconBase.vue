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
    <g class="icon" :stroke="iconColor" :transform="transform">
      <slot :iconColor="iconColor" />
    </g>
  </svg>
</template>

<script>
export default {
  props: {
    iconName: {
      type: String,
      default: 'box'
    },
    width: {
      type: Number,
      default: 32
    },
    height: {
      type: Number,
      default: 32
    },
    iconColor: {
      type: String,
      default: 'currentColor'
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
    viewBox: function () {
      return '0 0 ' + this.width + ' ' + this.height
    },
    transform () {
      var t = ''
      if (this.dx || this.dy) {
        t = `translate(${this.dx} ${this.dy})`
      }
      if (this.height !== 32) {
        t += `scale(${this.height / 32})`
      }
      return t
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
  .icon path {
    opacity:1;
    fill:none;
    fill-opacity:1;
    stroke-width:2.25;
    stroke-linecap:round;
    stroke-linejoin:round;
    stroke-miterlimit:4;
    stroke-dasharray:none;
    stroke-dashoffset:0;
    stroke-opacity:1
  }
</style>