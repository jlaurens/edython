<template>
  <b-btn-group>
      <b-dd
      class="eyo-toolbar-menu eyo-dropdown"
      right>
      <template
        slot="button-content">
        <icon-base
          :width="32"
          :height="32"
          icon-name="menu"
          ><icon-menu /></icon-base>
      </template>
      <b-dd-item-button
        v-on:click="doToggleToolbarBlockVisible()"
        :style="style"
        :title="titleToolbarBlockVisible"
        v-tippy
        >
        <check-mark></check-mark>{{contentToolbarBlockVisible}}</b-dd-item-button>
      <b-dd-item-button
        v-if="toolbarBlockVisible"
        v-on:click="doToggleToolbarBlockDebug()"
        :style="style"
        :title="titleToolbarBlockDebug"
        v-tippy
        >
        <check-mark
      :checked="toolbarInfoDebug" />{{contentToolbarBlockDebug}}</b-dd-item-button>
      <b-dd-item-button
        v-if="selectedMode == $$.eYo.App.TEACHER"
        v-on:click="doToggleEcoSave()"
        :style="style"
        :title="titleEcoSave"
        v-tippy
        >
        <check-mark
          :checked="ecoSave"
          />{{contentEcoSave}}</b-dd-item-button>
      <b-dd-item-button
        v-on:click="toggleTipsDisabled()"
        :style="style"
        :title="titleTipsDisabled"
        v-tippy
        >
        <check-mark
        :checked="tipsDisabled"
      />{{contentTipsDisabled}}</b-dd-item-button>
      <b-dd-item-button
        v-on:click="toggleDeepCopy()"
        :style="style"
        :title="titleDeepCopy"
        v-tippy
        >
        <check-mark
        :checked="deepCopy"
      />{{contentDeepCopy}}</b-dd-item-button>
      <b-dd-divider></b-dd-divider>
      <b-dd-item-button
        v-on:click="resetFactoryDefaults()"
        :style="style"
        :title="titleFactoryDefaults"
        v-tippy
        ><check-mark
        :checked="false"
        />{{contentFactoryDefaults}}</b-dd-item-button>
    </b-dd>
  </b-btn-group>
</template>

<script>
  import {mapState, mapMutations, mapActions} from 'vuex'

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
      ...mapState('Document', [
        'ecoSave'
      ]),
      ...mapState('Pref', [
        'tipsDisabled',
        'deepCopy'
      ]),
      ...mapState('UI', [
        'selectedMode',
        'toolbarBlockVisible',
        'toolbarRyVisible',
        'toolbarInfoDebug'
      ]),
      style () {
        return {
          fontFamily: this.$$.eYo.Font.familySans,
          fontSize: this.$$.eYo.Font.totalHeight
        }
      },
      locale () {
        return this.$i18n.locale
      },
      titleEcoSave () {
        return this.$$t('toolbar.tooltip.eco_save', this.locale)
      },
      contentEcoSave () {
        return this.$$t('toolbar.content.eco_save', this.locale)
      },
      titleDeepCopy () {
        return this.$$t('toolbar.tooltip.deep_copy', this.locale)
      },
      contentDeepCopy () {
        return this.$$t('toolbar.content.deep_copy', this.locale)
      },
      titleTipsDisabled () {
        return this.$$t(`toolbar.tooltip.tooltip.${this.tipsDisabled ? 'off' : 'on'}`, this.locale)
      },
      contentTipsDisabled () {
        return this.$$t(`toolbar.content.tooltip.${this.tipsDisabled ? 'off' : 'on'}`, this.locale)
      },
      titleToolbarBlockVisible () {
        return this.$$t(`toolbar.tooltip.block.${this.toolbarBlockVisible ? 'off' : 'on'}`, this.locale)
      },
      contentToolbarBlockVisible () {
        return this.$$t(`toolbar.content.block.${this.toolbarBlockVisible ? 'off' : 'on'}`, this.locale)
      },
      titleToolbarBlockDebug () {
        return this.$$t(`toolbar.tooltip.debug.${this.toolbarInfoDebug ? 'off' : 'on'}`, this.locale)
      },
      contentToolbarBlockDebug () {
        return this.$$t('toolbar.content.debug', this.locale)
      },
      titleMenu () {
        return this.$$t('toolbar.tooltip.menu', this.locale)
      },
      contentFactoryDefaults () {
        return this.$$t('toolbar.content.factoryDefaults', this.locale)
      },
      titleFactoryDefaults () {
        return this.$$t('toolbar.tooltip.factoryDefaults', this.locale)
      }
    },
    methods: {
      ...mapMutations('UI', [
        'setToolbarBlockVisible',
        'setToolbarBlockDebug'
      ]),
      ...mapMutations('Pref', [
        'toggleTipsDisabled',
        'toggleDeepCopy'
      ]),
      ...mapMutations('Document', [
        'setEcoSave'
      ]),
      ...mapActions('UI', {
        resetUI: 'reset'
      }),
      ...mapActions('Prefs', {
        resetPrefs: 'reset'
      }),
      ...mapActions('Layout', {
        resetLayout: 'reset'
      }),
      doToggleToolbarBlockVisible () {
        this.setToolbarBlockVisible(!this.toolbarBlockVisible)
      },
      doToggleToolbarBlockDebug () {
        this.setToolbarBlockDebug(!this.toolbarInfoDebug)
      },
      doToggleEcoSave () {
        this.setEcoSave(!this.ecoSave)
      },
      resetFatoryDefaults () {
        this.resetUI()
        this.resetLayout()
        this.resetPrefs()
      }
    }
  }
</script>

<style>
</style>
