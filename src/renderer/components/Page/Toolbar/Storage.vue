<template>
  <b-button-group class="mx-1">
    <b-btn id="toolbar-new" v-on:click="doNew()" title="Nouveau" v-tippy>
      <icon-base :width="32" :height="32" icon-name="new"><icon-new /></icon-base>
    </b-btn>
    <b-btn id="toolbar-open" v-on:click="doOpen()" title="Ouvrir" v-tippy v-if="!isWeb">
        <icon-base :width="32" :height="32" icon-name="load"><icon-save-load variant="load" /></icon-base>
    </b-btn>
    <b-btn id="toolbar-save" v-on:click="doSave()" title="Sauvegarder" v-tippy v-if="!isWeb">
      <icon-base :width="32" :height="32" icon-name="save"><icon-save-load variant="save" :step="step"/></icon-base>
    </b-btn>
    <b-btn id="toolbar-download" v-on:click="doDownload()" title="Télécharger" v-tippy v-if="isWeb">
      <icon-base :width="32" :height="32" icon-name="download"><icon-save-load variant="save" :step="step"/></icon-base>
    </b-btn>
    <b-btn id="toolbar-upload" v-on:click="doUpload()" title="Téléverser" v-tippy v-if="isWeb">
      <icon-base :width="32" :height="32" icon-name="upload"><icon-save-load variant="load" :step="step"/></icon-base>
    </b-btn>
  </b-button-group>
</template>

<script>
  import IconBase from '@@/IconBase.vue'
  import IconNew from '@@/Icon/IconNew.vue'
  import IconSaveLoad from '@@/Icon/IconSaveLoad.vue'
  
  export default {
    name: 'page-toolbar-new-load-save',
    data: function () {
      return {
        step: 1
      }
    },
    components: {
      IconBase,
      IconNew,
      IconSaveLoad
    },
    computed: {
      isWeb () {
        return this.$$.process.env.BABEL_ENV !== 'web'
      }
    },
    created: function () {
      var self = this
      this.$$.bus.$on('saveDidSucceed', function () {
        self.step = 0
        self.$$.TweenLite.to(self, 0.5, {step: 1})
      })
    },
    methods: {
      doNew: function () {
        this.$$.eYo.App.Document.doNew()
      },
      doOpen: function () {
        this.$$.eYo.App.Document.doOpen()
      },
      doSave: function () {
        this.$$.eYo.App.Document.doSave()
      },
      doSaveAs: function () {
        this.$$.eYo.App.Document.doSaveAs()
      },
      doUpload: function () {
        this.$$.eYo.App.Document.doUpload()
      },
      doDownload: function () {
        this.$$.eYo.App.Document.doDownload()
      }
    }
  }
</script>
