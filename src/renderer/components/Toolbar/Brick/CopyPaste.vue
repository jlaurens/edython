<template>
  <b-btn-group>
    <copy-paste
      :width="24"
      :height="24"
      :copy="false"
      :duplicate="true"
    />
    <copy-paste
      :width="24"
      :height="24"
      :copy="true"
      :deep="false"
    />
    <copy-paste
      :width="24"
      :height="24"
      :copy="true"
      :deep="true"
    />
    <copy-paste
      :width="24"
      :height="24"
      :copy="false"
    />
  </b-btn-group>
</template>

<script>
import CopyPaste from '@@/Util/CopyPaste.vue'

export default {
    name: 'PageToolbar',
    components: {
        CopyPaste
    }
}
</script>
<style>
</style>
