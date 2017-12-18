<template>
  <div id="toolbar">
    <toolbar-left></toolbar-left>
    <toolbar-center></toolbar-center>
    <toolbar-right></toolbar-right>
  </div>
</template>

<script>
  import ToolbarLeft from './Toolbar/Left'
  import ToolbarCenter from './Toolbar/Center'
  import ToolbarRight from './Toolbar/Right'
  
  export default {
    name: 'page-toolbar',
    components: {
      'toolbar-left': ToolbarLeft,
      'toolbar-center': ToolbarCenter,
      'toolbar-right': ToolbarRight
    }
  }
</script>
<style>
#toolbar {
  text-align:center;
  height: 32px;
}
</style>
