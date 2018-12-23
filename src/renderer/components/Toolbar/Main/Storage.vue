<template>
  <b-btn-group>
    <b-btn
      id="toolbar-new"
      @click="doNew"
      title="Nouveau"
      v-tippy>
      <icon-base
        :width="32"
        :height="32"
        icon-name="new"
      ><icon-new /></icon-base>
    </b-btn>
    <b-btn
      id="toolbar-open"
      @click="doOpen"
      title="Ouvrir"
      v-tippy>
      <icon-base
        :width="32"
        :height="32"
        icon-name="load"
      ><icon-save-load
        variant="load" /></icon-base>
    </b-btn>
    <b-btn
      id="toolbar-save"
      @click="doSave"
      title="Sauvegarder"
      v-tippy>
      <icon-base
        :width="32"
        :height="32"
        icon-name="save"
      ><icon-save-load
        variant="save"
        :theta="theta"
        :active="isDocumentEdited" /></icon-base>
    </b-btn>
  </b-btn-group>
</template>

<script>
  import {mapGetters, mapState} from 'vuex'

  import IconBase from '@@/Icon/IconBase.vue'
  import IconNew from '@@/Icon/IconNew.vue'
  import IconSaveLoad from '@@/Icon/IconSaveLoad.vue'
  
  export default {
    name: 'page-toolbar-new-load-save',
    data: function () {
      return {
        theta: 1,
        flashInterval: undefined
      }
    },
    components: {
      IconBase,
      IconNew,
      IconSaveLoad
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
      eYo.$$.bus.$on('saveDidSucceed', () => {
        this.theta = 0
        eYo.$$.TweenLite.to(this, 0.5, {theta: 1})
      })
    },
    methods: {
      doNew: function (ev) {
        eYo.App.Document.doNew(ev)
      },
      doOpen: function (ev) {
        eYo.App.Document.doOpen(ev)
      },
      doSave: function (ev) {
        eYo.App.Document.doSave(ev)
      },
      doSaveAs: function (ev) {
        eYo.App.Document.doSaveAs(ev)
      }
    }
  }
</script>
