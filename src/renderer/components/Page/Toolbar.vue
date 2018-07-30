<template>
  <div id="toolbar">
    <toolbar-main />
    <toolbar-info />
  </div>
</template>

<script>
  import ToolbarMain from './Toolbar/Main.vue'
  import ToolbarInfo from './Toolbar/Info.vue'

  export default {
    name: 'page-toolbar',
    components: {
      ToolbarMain,
      ToolbarInfo
    }
  }
</script>
