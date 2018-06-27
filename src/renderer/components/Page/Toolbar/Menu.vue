<template>
  <b-dropdown class="eyo-toolbar-menu eyo-dropdown" :title="titleMenu"  v-tippy right>
    <template slot="button-content">
      <icon-base :width="32" :height="32" icon-name="menu"><icon-menu /></icon-base>
    </template>
    <b-dropdown-item-button v-on:click="doToggleEcoSave()" v-bind:style="{fontFamily: $eYo.Font.familySans, fontSize: $eYo.Font.totalHeight}" :title="titleEcoSave" v-tippy><check-mark :checked="ecoSave" />
      Sauvegarde éco</b-dropdown-item-button>
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
      titleMenu () {
        return 'Options et actions'
      }
    },
    methods: {
      doToggleEcoSave () {
        this.$store.commit('PREF_SET_ECO_SAVE', !this.$store.state.Pref.ecoSave)
      }
    }
  }
</script>

<style>
</style>
