<template>
  <div id="eyo-panel-turtle" :style="{display: visible? 'block': 'none'}"></div>
</template>

<script>
  export default {
    name: 'panel-turtle',
    mounted: function () {
      console.log('TURTLE MOUNTED')
    },
    props: {
      visible: {
        type: Boolean,
        default: false
      }
    }
  }
</script>

<style>
  #eyo-panel-turtle {
    width: 100%;
    height: 100%;
    background-color: aliceblue;
  }
</style>
