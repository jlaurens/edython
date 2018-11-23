<template>
  <b-dropdown class="eyo-toolbar-menu eyo-dropdown mx-1" right>
    <template slot="button-content">
      <icon-base :width="32" :height="32" icon-name="menu"><icon-menu /></icon-base>
    </template>
    <b-dropdown-item-button v-on:click="doToggleToolbarBlockVisible()" v-bind:style="{fontFamily: $$.eYo.Font.familySans, fontSize: $$.eYo.Font.totalHeight}" :title="titleToolbarBlockVisible" v-tippy><check-mark></check-mark>{{contentToolbarBlockVisible}}</b-dropdown-item-button>
    <b-dropdown-item-button v-if="toolbarBlockVisible" v-on:click="doToggleToolbarBlockDebug()" v-bind:style="{fontFamily: $$.eYo.Font.familySans, fontSize: $$.eYo.Font.totalHeight}" :title="titleToolbarBlockDebug" v-tippy><check-mark :checked="toolbarInfoDebug" />{{contentToolbarBlockDebug}}</b-dropdown-item-button>    <b-dropdown-item-button v-on:click="doToggleEcoSave()" v-bind:style="{fontFamily: $$.eYo.Font.familySans, fontSize: $$.eYo.Font.totalHeight}" :title="titleEcoSave" v-tippy><check-mark :checked="ecoSave" />{{contentEcoSave}}</b-dropdown-item-button>
    <b-dropdown-item-button v-on:click="doToggleDisabledTips()" v-bind:style="{fontFamily: $$.eYo.Font.familySans, fontSize: $$.eYo.Font.totalHeight}" :title="titleDisabledTips" v-tippy><check-mark :checked="false" />{{contentDisabledTips}}</b-dropdown-item-button>
  </b-dropdown>
</template>

<script>
  import {mapState, mapMutations} from 'vuex'

  import IconBase from '@@/Icon/IconBase.vue'
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
      titleToolbarBlockVisible () {
        return this.toolbarBlockVisible ? 'Cacher la barre d\'édition' : 'Afficher la barre d\'édition et de réglage du bloc sélectionné'
      },
      contentToolbarBlockVisible () {
        return this.toolbarBlockVisible ? 'Cacher la barre d\'édition' : 'Afficher la barre d\'édition'
      },
      titleToolbarBlockDebug () {
        return this.toolbarInfoDebug ? 'Cacher les informations de débogage' : 'Afficher les informations de débogage'
      },
      contentToolbarBlockDebug () {
        return 'Mode débogage'
      },
      titleMenu () {
        return 'Options et actions'
      },
      ...mapState({
        ecoSave: state => state.Document.ecoSave,
        disabledTips: state => state.Document.disabledTips,
        toolbarBlockVisible: state => state.UI.toolbarBlockVisible,
        toolbarInfoDebug: state => state.UI.toolbarInfoDebug
      })
    },
    methods: {
      ...mapMutations({
        setToolbarBlockVisible: 'UI_SET_TOOLBAR_BLOCK_VISIBLE'
      }),
      doToggleToolbarBlockVisible () {
        this.setToolbarBlockVisible(!this.toolbarBlockVisible)
      },
      doToggleToolbarBlockDebug () {
        this.$store.commit('UI_SET_TOOLBAR_BLOCK_DEBUG', !this.$store.state.UI.toolbarInfoDebug)
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
