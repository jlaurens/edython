<template>
  <g>
    <path :d="pathDef" transform="rotate(45, 16, 16)"/> 
    <path :d="lineDef"/> 
  </g>
</template>

<script>
  export default {
    props: {
      radius: {
        type: [Number, String],
        default: 10
      }
    },
    computed: {
      pathDef: function () {
        var R = this.radius.toString()
        return `M ${16 - R} 16 a ${R},${R} 0 1,0 ${R},${-R}`
      },
      lineDef: function () {
        return `M 16 16 16 ${16 - this.radius}`
      }
    }
  }
</script>
