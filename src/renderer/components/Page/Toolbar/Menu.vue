<template>
  <b-dropdown class="eyo-toolbar-menu eyo-dropdown" right>
    <template slot="button-content">
      <icon-base :width="32" :height="32" icon-name="menu"><icon-menu /></icon-base>
    </template>
    <b-dropdown-item-button v-on:click="doToggleEcoSave()" v-bind:style="{fontFamily: $eYo.Font.familySans, fontSize: $eYo.Font.totalHeight}" :title="titleEcoSave" v-tippy><check-mark :checked="ecoSave" />Sauvegarde éco</b-dropdown-item-button>
    <b-dropdown-item-button v-on:click="doToggleDisabledTips()" v-bind:style="{fontFamily: $eYo.Font.familySans, fontSize: $eYo.Font.totalHeight}" :title="titleDisabledTips" v-tippy><check-mark :checked="false" />{{contentDisabledTips}}</b-dropdown-item-button>
  </b-dropdown>
</template>

<script>
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
      ecoSave () {
        return this.$store.state.Pref.ecoSave
      },
      titleEcoSave () {
        return 'Sauvegarde au format compressé avec gzip si coché'
      },
      disabledTips () {
        return this.$store.state.Pref.disabledTips
      },
      titleDisabledTips () {
        return this.$store.state.Pref.disabledTips ? 'Activer les bulles d\'aide qui apparaissent quand le pointeur reste sur un objet' : 'Désactiver les bulles d\'aide qui apparaissent quand le pointeur reste sur un objet'
      },
      contentDisabledTips () {
        return this.$store.state.Pref.disabledTips ? 'Activer les bulles d\'aide' : 'Désactiver les bulles d\'aide'
      },
      titleMenu () {
        return 'Options et actions'
      }
    },
    methods: {
      doToggleEcoSave () {
        this.$store.commit('PREF_SET_ECO_SAVE', !this.$store.state.Pref.ecoSave)
      },
      doToggleDisabledTips () {
        var tippies = Array.from(document.querySelectorAll('[data-tippy]'), el => el._tippy)
        var i = 0
        if (this.$store.state.Pref.disabledTips) {
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
        this.$store.commit('PREF_SET_DISABLED_TIPS', !this.$store.state.Pref.disabledTips)
      }
    }
  }
</script>

<style>
</style>
