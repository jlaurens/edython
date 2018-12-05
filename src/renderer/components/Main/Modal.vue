<template>
  <modal-should-save></modal-should-save>
</template>

<script>
  import ModalShouldSave from './Modal/ShouldSave'
  
  export default {
    name: 'modal',
    components: {
      ModalShouldSave
    }
  }
</script>
<style>
  #modal {
    display: none;
  }
</style>
