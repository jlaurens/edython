<template>
  <b-button-group class="mx-1">
    <b-btn id="toolbar-new" v-on:click="doNew()" title="Nouveau" v-tippy>
      <icon-base :width="32" :height="32" icon-name="new"><icon-new /></icon-base>
    </b-btn>
    <b-btn id="toolbar-open" v-on:click="doOpen()" title="Ouvrir" v-tippy>
        <icon-base :width="32" :height="32" icon-name="load"><icon-save-load variant="load" /></icon-base>
    </b-btn>
    <b-btn id="toolbar-save" v-on:click="doSave()" title="Sauvegarder" v-tippy>
      <icon-base :width="32" :height="32" icon-name="save"><icon-save-load variant="save" :step="step"/></icon-base>
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
    computed: {
      documentPath: {
        get: function () {
          return this.$store.state.Document.path
        },
        set: function (new_path) {
          this.$store.commit('DOC_SET_PATH', new_path)
        }
      }
    },
    components: {
      IconBase,
      IconNew,
      IconSaveLoad
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
        this.$$.eYo.App.Document.doClear()
      },
      doOpen: function () {
        this.$$.eYo.App.Document.doOpen()
      },
      doSave: function () {
        this.$$.eYo.App.Document.doSave()
      },
      doSaveAs: function () {
        this.$$.eYo.App.Document.doSaveAs()
      }
    }
  }
</script>
