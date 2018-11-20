<template>
  <div id="page-content">
    <block-toolbar></block-toolbar>
    <content-content></content-content>
  </div>
</template>

<script>
  import BlockToolbar from '@@/Toolbar/Block'
  import ContentContent from './Content/Content'

  export default {
    name: 'page-content',
    data: function () {
      return {
        step: 0
      }
    },
    components: {
      BlockToolbar,
      ContentContent
    }
  }
</script>

<style>
  #page-content {
    position: absolute;
    top: 3rem;
    height: calc(100% - 3rem);
    width: calc(100% - 0.5rem);
    padding: 0;
  }
</style>
