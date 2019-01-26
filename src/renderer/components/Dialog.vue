<template>
  <div>
    <dialog-should-save
      id="dialog-should-save"
    ></dialog-should-save>
    <dialog-rename
      id="dialog-should-save"
    ></dialog-rename>
  </div>
</template>

<script>
  import DialogShouldSave from './Dialog/ShouldSave'
  import DialogRename from './Dialog/Rename'

  export default {
    name: 'dialog',
    components: {
      DialogShouldSave,
      DialogRename
    }
  }
</script>
<style>
</style>
