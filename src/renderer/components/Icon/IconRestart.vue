<template>
  <g>
    <path :d="pathDef" transform="rotate(45, 10, 10)"/> 
    <path :d="lineDef"/> 
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
      pathDef: function () {
        var R = this.radius.toString()
        return ['M 10 10 m -', R, ',0 a ', R, ',', R, ' 0 1,0 ', R, ',-', R].join('')
      },
      lineDef: function () {
        return 'M 10 10 10 ' + (10 - this.radius)
      }
    }
  }
</script>
    
<style>
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