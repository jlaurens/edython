<template>
  <div
    class="eyo-wrapper"
    ref="wrapper">
    <toolbar
      :where="where"
      what="console"
      v-on="$listeners"></toolbar>
    <div
      class="content">
      <textarea
        id="eyo-console-area"
        rows=20
        v-bind:style="{fontFamily: $$.eYo.Font.familyMono, fontSize: $$.eYo.Font.totalAscent + 'px'}"></textarea>
    </div>
  </div>
</template>

<script>
  import Toolbar from './Toolbar'
  export default {
    name: 'panel-console',
    components: {
      Toolbar
    },
    props: {
      where: {
        type: String,
        default: undefined
      }
    }
  }
</script>

<style>
  #eyo-console-area {
    background-color:#000;
    color:#fff;
    font-family: monospace;
    font-size:1.2rem;
    overflow:auto;
    width: 100%;
    height: calc(100% - 2px); /* include border */
  }
  #eyo-console-area:focus {
    outline: none;
  }
  
</style>
