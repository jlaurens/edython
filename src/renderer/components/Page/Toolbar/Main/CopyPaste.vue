<template>
  <b-button-group class="mx-1">
    <copy-paste :copy="true" :deep="false" />
    <copy-paste :copy="false" />
  </b-button-group>
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
