<template>
  <b-btn :class="redo ? 'toolbar-redo' : 'toolbar-undo'" v-on:click="doIt()" :disabled="!canRevert(redo)" :title="title" v-tippy>
    <icon-base :width="32" :height="32" icon-name="undo/redo"><icon-undo-redo :redo="redo"/></icon-base>
  </b-btn>
</template>

<script>
  import {mapGetters} from 'vuex'
  import IconBase from '@@/Icon/IconBase.vue'
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
      ...mapGetters('Undo', [
        'canRevert'
      ])
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
