<template>
  <b-button-group class="mx-1">
    <copy-paste :width="24" :height="24" :copy="false" :duplicate="true" />
    <copy-paste :width="24" :height="24" :copy="true" :deep="false" />
    <copy-paste :width="24" :height="24" :copy="true" :deep="true" />
    <copy-paste :width="24" :height="24" :copy="false" />
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
