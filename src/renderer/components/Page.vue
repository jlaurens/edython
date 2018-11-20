<template>
  <div id="page">
    <page-toolbar></page-toolbar>
    <page-web-load></page-web-load>
    <page-content></page-content>
    <page-modal></page-modal>
  </div>
</template>

<script>
  import PageToolbar from './Page/Toolbar'
  import PageWebLoad from './Page/WebLoad'
  import PageContent from './Page/Content'
  import PageModal from './Page/Modal'
  
  export default {
    name: 'page',
    components: {
      PageToolbar,
      PageWebLoad,
      PageContent,
      PageModal
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
