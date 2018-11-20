<template>
  <g>
      <path :d="lineDef" transform="rotate(45, 16, 16)"/>
      <path :d="lineDef" transform="rotate(-45, 16, 16)"/>
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
      lineDef: function () {
        return `M 16 ${16 - this.radius} 16 ${16 + this.radius}`
      }
    }
  }
</script>
