<template>
  <Split id="page-content" @onDrag="onDrag">
    <SplitArea :size="50">
      <content-blockly></content-blockly>
    </SplitArea>
    <SplitArea :size="50">
      <content-panels></content-panels>
    </SplitArea>
  </Split>
</template>

<script>
  import ContentBlockly from './Content/Blockly'
  import ContentPanels from './Content/Panels'

  export default {
    name: 'page-content',
    methods: {
      onDrag (size) {
        window.eYo.Vue.getBus().$emit('size-did-change', size)
      }
    },
    components: {
      'content-blockly': ContentBlockly,
      'content-panels': ContentPanels
    }
  }
</script>

<style>
  #page-content {
    height: 100%;
    padding:8px;
  }
  .gutter {
    background-color: #f4f4f4
  }
</style>