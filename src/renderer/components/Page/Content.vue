<template>
  <Split id="page-content" @onDrag="onDrag">
    <SplitArea :size="75">
      <content-eyo></content-eyo>
    </SplitArea>
    <SplitArea :size="25">
      <content-panels></content-panels>
    </SplitArea>
  </Split>
</template>

<script>
  import ContentEyO from './Content/EyO'
  import ContentPanels from './Content/Panels'

  export default {
    name: 'page-content',
    methods: {
      onDrag (size) {
        window.eYo.App.bus.$emit('size-did-change', size)
      }
    },
    components: {
      'content-eyo': ContentEyO,
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
    background-color:transparent;
  }
</style>
