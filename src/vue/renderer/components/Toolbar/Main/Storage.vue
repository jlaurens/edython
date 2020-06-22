<template>
  <b-btn-group>
    <b-btn
      id="toolbar-new"
      v-tippy
      title="Nouveau"
      @click="doNew"
    >
      <icon-base
        :width="32"
        :height="32"
        icon-name="new"
      >
        <icon-new />
      </icon-base>
    </b-btn>
    <b-btn
      id="toolbar-open"
      v-tippy
      title="Ouvrir"
      @click="doOpen"
    >
      <icon-base
        :width="32"
        :height="32"
        icon-name="load"
      >
        <icon-save-load
          variant="load"
          :theta="open_theta"
          :active="open_active"
        />
      </icon-base>
    </b-btn>
    <b-btn
      id="toolbar-save"
      v-tippy
      title="Sauvegarder"
      @click="doSave"
    >
      <icon-base
        :width="32"
        :height="32"
        icon-name="save"
      >
        <icon-save-load
          variant="save"
          :theta="save_theta"
          :active="isDocumentEdited || save_active"
        />
      </icon-base>
    </b-btn>
  </b-btn-group>
</template>

<script>
import {mapGetters, mapState} from 'vuex'

import IconBase from '@@/Icon/IconBase.vue'
import IconNew from '@@/Icon/IconNew.vue'
import IconSaveLoad from '@@/Icon/IconSaveLoad.vue'
  
export default {
  name: 'PageToolbarNewLoadSave',
  components: {
    IconBase,
    IconNew,
    IconSaveLoad
  },
  data: function () {
    return {
      open_theta: 1,
      save_theta: 1,
      open_active: false,
      save_active: false,
      flashInterval: undefined
    }
  },
  computed: {
    ...mapState('Undo', [
      'undoCount',
      'redoCount',
      'undoStage'
    ]),
    ...mapGetters('Undo', [
      'isDocumentEdited'
    ])
  },
  created: function () {
    this.$$onOnly('document-open-complete', () => {
      this.open_theta = 0
      eYo.$$.TweenLite.to(this, 0.5, {open_theta: 1})
      this.open_active = false
    })
    this.$$onOnly('document-open-abort', () => {
      this.open_active = false
    })
    this.$$onOnly('document-save-complete', () => {
      this.save_theta = 0
      eYo.$$.TweenLite.to(this, 0.5, {save_theta: 1})
      this.save_active = false
    })
    this.$$onOnly('document-save-abort', () => {
      this.save_active = false
    })
  },
  methods: {
    doNew (evt) {
      eYo.App.Document.doNew(evt)
    },
    doOpen (evt) {
      this.open_active = true
      this.$nextTick(() => {
        this.$root.$emit('document-open', evt)
      })
    },
    doSave (evt) {
      this.save_active = true
      this.$nextTick(() => {
        this.$root.$emit('document-save', evt)
      })
    },
    doSaveAs (evt) {
      this.save_active = true
      this.$nextTick(() => {
        this.$root.$emit('document-save-as', evt)
      })
    }
  }
}
</script>
