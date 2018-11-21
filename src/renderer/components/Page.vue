<template>
  <b-container id="page" class="m-0 px-1 h-100 fluid">
    <page-toolbar></page-toolbar>
    <page-content></page-content>
    <page-web-load></page-web-load>
    <page-modal></page-modal>
  </b-container>
</template>

<script>
  import PageToolbar from '@@/Toolbar/Page'
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
  }
</style>
