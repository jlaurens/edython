<template>
  <div id="eyo-panel-console">
    <script type="text/python">
      print('%%% importing console module')
      try:
        import console
      except:
        print('BIG FAILURE, YOU WON\'T HAVE A CONSOLE')
      print('%%% importing console module: done')
    </script>
    <textarea id="eyo-console-area" rows=20 v-bind:style="{fontFamily: this.eYo.Font.familyMono, fontSize: (this.eYo.Font.totalAscent) + 'px'}"></textarea>
  </div>
</template>

<script>
  export default {
    name: 'panel-console',
    mounted: function () {
      console.log('CONSOLE MOUNTED')
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
      height:100%;
      width:100%;
  }
  #eyo-console-area:focus {
      outline: none;
  }
  
</style>
