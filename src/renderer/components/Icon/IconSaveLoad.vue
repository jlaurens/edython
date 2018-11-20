<template>
  <g>
    <rect x="1" y="20" width="30" height="11" rx="3" ry="3" />
    <rect x="23" y="24.5" width="4" height="2"/>
    <g :transform="arrowTransform">
      <path :d="d" /> 
    </g>
  </g>
</template>

<script>
  export default {
    computed: {
      arrowTransform: function () {
        return this.variant === 'save' ? null : 'rotate(180,16,8.5)' // no attribute when `null`
      },
      d () {
        var h = 1 + 11.5 * this.step
        return `M 13,1 13,${h} 10.5,${h} 16,${h + 4.5} 21.5,${h} 19,${h} 19,1 Z`
      }
    },
    props: {
      variant: {
        type: String,
        default: 'save'
      },
      step: {
        type: Number,
        default: 1,
        validator: function (value) {
          // The value must match one of these strings
          return value >= 0 && value <= 1
        }
      }
    }
  }
</script>
