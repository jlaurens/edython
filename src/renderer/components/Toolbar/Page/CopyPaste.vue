<template>
  <b-btn-group>
    <copy-paste :copy="true" :deep="false" />
    <copy-paste :copy="false" />
  </b-btn-group>
</template>

<script>
  import CopyPaste from '@@/Util/CopyPaste.vue'

  export default {
    name: 'page-toolbar',
    components: {
      CopyPaste
    }
  }
</script>
<style>
</style>
