<template>
  <div id="eyo-panel-console" :style="{visibility: visible? 'visible': 'hidden'}">
    <panel-console-script></panel-console-script>
    <textarea id="eyo-console-area" rows=20 v-bind:style="{fontFamily: this.$eYo.Font.familyMono, fontSize: this.$eYo.Font.totalAscent + 'px'}"></textarea>
  </div>
</template>

<script>
  import PanelConsoleScript from './ConsoleScript'
  export default {
    name: 'panel-console',
    components: {
      PanelConsoleScript
    },
    props: {
      visible: {
        type: Boolean,
        default: true
      }
    }
  }
</script>

<style>
  #eyo-panel-console {
    box-sizing: border-box;
    width:100%;
    height: 100%;
    position:absolute;
    left:0;
    top:0;
  }
  #eyo-console-area {
    background-color:#000;
    color:#fff;
    font-family: monospace;
    font-size:14px;
    overflow:auto;
    width:100%;
    height: 100%;
  }
  #eyo-console-area:focus {
    outline: none;
  }
  
</style>
