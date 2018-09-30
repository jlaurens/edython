<template>
  <b-button-toolbar id="info-any-statement" key-nav  aria-label="Info any statement" justify>
    <b-button-toolbar>
      <codex :eyo="eyo"></codex>
      <comment :eyo="eyo"></comment>
    </b-button-toolbar>
    <common :eyo="eyo"></common>
  </b-button-toolbar>
</template>

<script>
  import Codex from './Codex.vue'
  import Comment from './Comment.vue'
  import Common from './Common.vue'

  export default {
    name: 'info-any-statement',
    data: function () {
      return {
      }
    },
    components: {
      Codex,
      Comment,
      Common
    },
    props: {
      eyo: {
        type: Object,
        default: undefined
      }
    }
  }
</script>
<style>
  #info-any-statement {
    padding: 0 0.25rem;
  }
</style>
