<template>
  <g>
      <path :d="lineDef" transform="rotate(45, 10, 10)"/>
      <path :d="lineDef" transform="rotate(-45, 10, 10)"/>
  </g>
</template>

<script>
  export default {
    props: {
      radius: {
        type: [Number, String],
        default: 7
      }
    },
    computed: {
      lineDef: function () {
        return 'M 10 ' + (10 - this.radius) + ' 10 ' + (10 + this.radius)
      }
    }
  }
</script>
