<template>
  <g transform="rotate(45, 16, 16)">
    <path :d="pathDef" /> 
    <path :d="lineDef" /> 
  </g>
</template>

<script>
export default {
  props: {
    radius: {
      type: [Number, String],
      default: 12
    }
  },
  computed: {
    pathDef: function () {
      var R = this.radius
      return `M 16,${16 - R} a ${R},${R} 0 1 1 ${-R},${R}`
    },
    lineDef: function () {
      var R = this.radius
      return `M 16,${16 - R} m 2,3.25 -5,-3 4,-3`
    }
  }
}
</script>
