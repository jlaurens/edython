<template>
  <b-btn :class="redo ? 'toolbar-redo' : 'toolbar-undo'" v-on:click="doIt()" :disabled="!canDoIt" :title="title" v-tippy>
    <icon-base :width="32" :height="32" icon-name="undo/redo"><icon-undo-redo :redo="redo"/></icon-base>
  </b-btn>
</template>

<script>
  import IconBase from '@@/IconBase.vue'
  import IconUndoRedo from '@@/Icon/IconUndoRedo.vue'

  export default {
    name: 'page-toolbar-undo-redo',
    components: {
      IconBase,
      IconUndoRedo
    },
    computed: {
      title () {
        return this.redo
          ? "Refaire l'action de blocs"
          : "Annuler l'action de blocs"
      },
      canDoIt () {
        return (this.redo
          ? this.$store.state.UI.redoCount
          : this.$store.state.UI.undoCount) > 0
      }
    },
    props: {
      redo: {
        type: Boolean,
        default: false
      }
    },
    methods: {
      doIt () {
        eYo.App.workspace && eYo.App.workspace.undo(this.redo)
      }
    }
  }
</script>
