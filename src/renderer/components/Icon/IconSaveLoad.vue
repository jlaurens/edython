<template>
  <g>
    <path d="M 12,6 6,6 A 3,3 0 0 0 3,9 L 3,31 29,31 29,9 A 3,3 0 0 0 26,6 L 20,6"/>
    <path d="M 12,14 8,14 8,31 24,31 24,14 20,14"/>
    <g :transform="arrowTransform">
      <path d="M 16,0 16,26" />
      <path :transform="edgeTransform" d="M 13.5,21.5 16,26 18.5,21.5" />  
    </g>
  </g>
</template>

<script>
  export default {
    computed: {
      arrowTransform: function () {
        return this.variant === 'save' ? '' : 'rotate(180,16,12.5)'
      },
      edgeTransform: function () {
        return ['translate(0,', -23 * (1 - this.step), ')'].join('')
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
