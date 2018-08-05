<template>
  <b-dropdown class="eyo-toolbar-menu eyo-dropdown" right>
    <template slot="button-content">
      <icon-base :width="32" :height="32" icon-name="menu"><icon-menu /></icon-base>
    </template>
    <b-dropdown-item-button v-on:click="doToggleToolbarInfoVisible()" v-bind:style="{fontFamily: $$.eYo.Font.familySans, fontSize: $$.eYo.Font.totalHeight}" :title="titleToolbarInfoVisible" v-tippy><check-mark></check-mark>{{contentToolbarInfoVisible}}</b-dropdown-item-button>
    <b-dropdown-item-button v-if="toolbarInfoVisible" v-on:click="doToggleToolbarInfoDebug()" v-bind:style="{fontFamily: $$.eYo.Font.familySans, fontSize: $$.eYo.Font.totalHeight}" :title="titleToolbarInfoDebug" v-tippy><check-mark :checked="toolbarInfoDebug" />{{contentToolbarInfoDebug}}</b-dropdown-item-button>    <b-dropdown-item-button v-on:click="doToggleEcoSave()" v-bind:style="{fontFamily: $$.eYo.Font.familySans, fontSize: $$.eYo.Font.totalHeight}" :title="titleEcoSave" v-tippy><check-mark :checked="ecoSave" />{{contentEcoSave}}</b-dropdown-item-button>
    <b-dropdown-item-button v-on:click="doToggleDisabledTips()" v-bind:style="{fontFamily: $$.eYo.Font.familySans, fontSize: $$.eYo.Font.totalHeight}" :title="titleDisabledTips" v-tippy><check-mark :checked="false" />{{contentDisabledTips}}</b-dropdown-item-button>
  </b-dropdown>
</template>

<script>
  import {mapState, mapMutations} from 'vuex'

  import IconBase from '@@/IconBase.vue'
  import IconMenu from '@@/Icon/IconMenu.vue'
  import CheckMark from '@@/Util/CheckMark.vue'
  
  export default {
    name: 'page-toolbar-menu',
    data: function () {
      return {
      }
    },
    components: {
      IconBase,
      IconMenu,
      CheckMark
    },
    computed: {
      titleEcoSave () {
        return 'Sauvegarde au format compressé avec gzip si coché'
      },
      contentEcoSave () {
        return 'Sauvegarde éco'
      },
      titleDisabledTips () {
        return this.disabledTips ? 'Activer les bulles d\'aide qui apparaissent quand le pointeur reste sur un objet' : 'Désactiver les bulles d\'aide qui apparaissent quand le pointeur reste sur un objet'
      },
      contentDisabledTips () {
        return this.disabledTips ? 'Activer les bulles d\'aide' : 'Désactiver les bulles d\'aide'
      },
      titleToolbarInfoVisible () {
        return this.toolbarInfoVisible ? 'Cacher la barre d\'informations' : 'Afficher la barre d\'informations et de réglage du bloc sélectionné'
      },
      contentToolbarInfoVisible () {
        return this.toolbarInfoVisible ? 'Cacher la barre d\'informations' : 'Afficher la barre d\'informations'
      },
      titleToolbarInfoDebug () {
        return this.toolbarInfoDebug ? 'Cacher les informations de débogage' : 'Afficher les informations de débogage'
      },
      contentToolbarInfoDebug () {
        return 'Mode débogage'
      },
      titleMenu () {
        return 'Options et actions'
      },
      ...mapState({
        ecoSave: state => state.Document.ecoSave,
        disabledTips: state => state.Document.disabledTips,
        toolbarInfoVisible: state => state.UI.toolbarInfoVisible,
        toolbarInfoDebug: state => state.UI.toolbarInfoDebug
      })
    },
    methods: {
      ...mapMutations({
        setToolbarInfoVisible: 'UI_SET_TOOLBAR_INFO_VISIBLE' // map `this.add()` to `this.$store.commit('increment')`
      }),
      doToggleToolbarInfoVisible () {
        this.setToolbarInfoVisible(!this.toolbarInfoVisible)
      },
      doToggleToolbarInfoDebug () {
        this.$store.commit('UI_SET_TOOLBAR_INFO_DEBUG', !this.$store.state.UI.toolbarInfoDebug)
      },
      doToggleEcoSave () {
        this.$store.commit('DOC_SET_ECO_SAVE', !this.$store.state.Document.ecoSave)
      },
      doToggleDisabledTips () {
        var tippies = Array.from(document.querySelectorAll('[data-tippy]'), el => el._tippy)
        var i = 0
        if (this.$store.state.Document.disabledTips) {
          for (; i < tippies.length; ++i) {
            tippies[i].enable()
          }
        } else {
          for (; i < tippies.length; ++i) {
            var t = tippies[i]
            if (t.state.visible) {
              t.hide()
            }
            t.disable()
          }
        }
        this.$store.commit('DOC_SET_DISABLED_TIPS', !this.$store.state.Document.disabledTips)
      }
    }
  }
</script>

<style>
</style>
