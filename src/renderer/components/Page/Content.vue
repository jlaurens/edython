<template>
  <Split id="page-content">
    <SplitArea :size="50">
      <content-workspace></content-workspace>
    </SplitArea>
    <SplitArea :size="50">
      <content-panels></content-panels>
    </SplitArea>
  </Split>
</template>

<script>
  import ContentWorkspace from './Content/Workspace'
  import ContentPanels from './Content/Panels'

  export default {
    name: 'page-content',
    components: {
      'content-workspace': ContentWorkspace,
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