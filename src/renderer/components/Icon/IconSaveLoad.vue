<template>
  <g>
    <rect
      x="1"
      y="20"
      width="30"
      height="11"
      rx="3"
      ry="3"></rect
    >
    <rect
      x="23"
      y="24.5"
      width="4"
      height="2"
      :stroke="color"></rect
    >
    <g
      :transform="arrowTransform"
      :stroke="color"
    >
      <path :d="d"></path>
    </g>
  </g>
</template>

<script>
  export default {
    props: {
      variant: {
        type: String,
        default: 'save'
      },
      active: {
        type: Boolean,
        default: false
      },
      theta: {
        type: Number,
        default: 1,
        validator: function (value) {
          // The value must match one of these strings
          return value >= 0 && value <= 1
        }
      }
    },
    computed: {
      arrowTransform: function () {
        return this.variant === 'save' ? null : 'rotate(180,16,8.5)' // no attribute when `null`
      },
      d () {
        var h = 1 + 11.5 * this.theta
        return `M 13,1 13,${h} 10.5,${h} 16,${h + 4.5} 21.5,${h} 19,${h} 19,1 Z`
      },
      color () {
        return this.active || this.theta < 1 ? '#f9951b' : ''
      }
    }
  }
</script>
