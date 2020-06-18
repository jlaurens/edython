<template>
  <b-btn
    v-tippy
    :class="redo ? 'toolbar-redo' : 'toolbar-undo'"
    :disabled="!canRevert(redo)"
    :title="title"
    @click="doIt()"
  >
    <icon-base
      :width="32"
      :height="32"
      icon-name="undo/redo"
    >
      <icon-undo-redo :redo="redo" />
    </icon-base>
  </b-btn>
</template>

<script>
import {mapGetters} from 'vuex'
import IconBase from '@@/Icon/IconBase.vue'
import IconUndoRedo from '@@/Icon/IconUndoRedo.vue'

export default {
    name: 'PageToolbarUndoRedo',
    components: {
        IconBase,
        IconUndoRedo
    },
    props: {
        redo: {
            type: Boolean,
            default: false
        }
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
    methods: {
        doIt () {
            eYo.App.workspace && eYo.App.workspace.undo(this.redo)
        }
    }
}
</script>
