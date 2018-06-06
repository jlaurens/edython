<template>
  <div id="eyo-panel-console">
    <panel-console-script></panel-console-script><textarea id="eyo-console-area" rows=20 v-bind:style="{fontFamily: this.eYo.Font.familyMono, fontSize: this.eYo.Font.totalAscent + 'px'}"></textarea>
  </div>
</template>

<script>
  import PanelConsoleScript from './ConsoleScript'
  export default {
    name: 'panel-console',
    mounted: function () {
      console.log('CONSOLE MOUNTED')
    },
    components: {
      'panel-console-script': PanelConsoleScript
    }
  }
</script>

<style>
  #eyo-panel-console {
      height:100%;
      width:100%;
  }
  #eyo-console-area {
      background-color:#000;
      color:#fff;
      font-family: monospace;
      font-size:14px;
      overflow:auto;
      height:calc(100% - 32px);
      width:100%;
  }
  #eyo-console-area:focus {
      outline: none;
  }
  
</style>
