<template>
    <div
    class="eyo-wrapper"
    ref="wrapper">
    <toolbar
      :where="where"
      what="turtle"
      v-on="$listeners"></toolbar>
    <div
      class="content eyo-panel-turtle">
      <div id="eyo-turtle-canvas-wrapper"></div>
    </div>
  </div>
</template>

<script>
  import Toolbar from './Toolbar'
  export default {
    name: 'panel-turtle',
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
  .eyo-wrapper .content.eyo-panel-turtle {
    background-color: aliceblue;
    margin-top: 0.25rem;
    padding: 0;
    height: calc(100% - 2rem);
  }
  #eyo-turtle-canvas-wrapper {
    width: 100%;
    height: 100%;
  }
</style>
