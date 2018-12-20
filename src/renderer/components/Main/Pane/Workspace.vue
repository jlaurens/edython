<template>
  <div
    class="eyo-wrapper"
    ref="wrapper">
    <div
      class="eyo-workspace"
      ref="workspace">
      <toolbar
        :where="where"
        what="workspace"
        v-on="$listeners"></toolbar>
      <workspace-content
        ref="content"></workspace-content>  
    </div>
  </div>
</template>

<script>
  import Toolbar from './Toolbar'
  import WorkspaceContent from './Workspace/Content'

  export default {
    name: 'workspace',
    components: {
      Toolbar,
      WorkspaceContent
    },
    props: {
      where: {
        type: String,
        default: undefined
      }
    },
    methods: {
      didPlace () {
        this.$refs.content.didPlace()
      }
    }
  }
</script>

<style>
  .eyo-wrapper {
    background-color: transparent;
    height: 100%;
  }
  .eyo-wrapper .content {
    height: calc(100% - 1.75rem);
    margin: 0;
    padding: 0;
    border-radius: 0px;
    padding-top: 0.25rem;
  }
  .eyo-workspace {
    width: 100%;
    height: 100%;
  }
</style>