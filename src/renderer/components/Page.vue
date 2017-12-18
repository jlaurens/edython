<template>
  <div id="page">
    <page-toolbar></page-toolbar>
    <page-content></page-content>
  </div>
</template>

<script>
  import PageToolbar from './Page/Toolbar'
  import PageContent from './Page/Content'
  
  export default {
    name: 'page',
    components: {
      'page-toolbar': PageToolbar,
      'page-content': PageContent
    }
  }
</script>
<style>
  #page {
    height: calc(100% - 32px);
  }
</style>
