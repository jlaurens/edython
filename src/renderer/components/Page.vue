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
    position: absolute;
    left: 0px;
    top: 0px;
    height: 100%;
    width: 100%;
    padding:0.25rem;
  }
</style>
