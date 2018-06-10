<template>
  <div id='eyo-content'>
    <eyo-workspace></eyo-workspace>
  </div>
</template>

<script>
  import EyOWorkspace from './EyO/Workspace'

  export default {
    name: 'eyo-content',
    components: {
      'eyo-workspace': EyOWorkspace
    }
  }
</script>

<style>
  #eyo-content {
    border-radius: 20px;
    background-color: white;
    height: 100%;
  }
</style>