<template>
  <g transform="rotate(45, 10, 10)">
    <path :d="pathDef"/> 
    <path :d="lineDef" :tranform="transform"/> 
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
        var R = this.radius
        return ['M 10,10 m 0,', -R, ' a ', R, ',', R, ' 0 1 1 ', -R, ',', R].join('')
      },
      lineDef: function () {
        var R = this.radius
        return ['M 10,10 m 0,', -R, ' m 2,3.25 -5,-3 4,-3'].join('')
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