<template>
  <div id="eyo-panel-turtle" :style="{visibility: visible? 'visible': 'hidden'}">
    <div id="eyo-turtle-canvas-wrapper" :style="{visibility: visible? 'visible': 'hidden'}"></div>
  </div>
</template>

<script>
  export default {
    name: 'panel-turtle',
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
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: aliceblue;
  }
  #eyo-turtle-canvas-wrapper {
    width: 200px;
    height: 200px;
  }
</style>
