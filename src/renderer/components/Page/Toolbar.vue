<template>
  <div id="toolbar">
    <toolbar-main />
    <toolbar-block />
  </div>
</template>

<script>
  import ToolbarMain from './Toolbar/Main.vue'
  import ToolbarBlock from './Toolbar/Block.vue'

  export default {
    name: 'page-toolbar',
    components: {
      ToolbarMain,
      ToolbarBlock
    }
  }
</script>
