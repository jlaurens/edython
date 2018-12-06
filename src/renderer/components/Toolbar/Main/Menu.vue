<template>
  <b-dd
    class="eyo-toolbar-menu eyo-dropdown mx-1"
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
      v-bind:style="{fontFamily: $$.eYo.Font.familySans, fontSize: $$.eYo.Font.totalHeight}"
      :title="titleToolbarBlockVisible"
      v-tippy
      >
      <check-mark></check-mark>{{contentToolbarBlockVisible}}</b-dd-item-button>
    <b-dd-item-button
      v-if="toolbarBlockVisible"
      v-on:click="doToggleToolbarBlockDebug()"
      v-bind:style="{fontFamily: $$.eYo.Font.familySans, fontSize: $$.eYo.Font.totalHeight}"
      :title="titleToolbarBlockDebug"
      v-tippy
      >
      <check-mark
    :checked="toolbarInfoDebug" />{{contentToolbarBlockDebug}}</b-dd-item-button>
    <b-dd-item-button
      v-on:click="doToggleEcoSave()"
      v-bind:style="{fontFamily: $$.eYo.Font.familySans, fontSize: $$.eYo.Font.totalHeight}"
      :title="titleEcoSave"
      v-tippy
      >
      <check-mark
        :checked="ecoSave"
        />{{contentEcoSave}}</b-dd-item-button>
    <b-dd-item-button
      v-on:click="toggleTipsDisabled()"
      v-bind:style="{fontFamily: $$.eYo.Font.familySans, fontSize: $$.eYo.Font.totalHeight}"
      :title="titleTipsDisabled"
      v-tippy
      >
      <check-mark
      :checked="false"
      />{{contentTipsDisabled}}</b-dd-item-button>
  </b-dd>
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
        return this.$$t('toolbar.tooltip.eco_save')
      },
      contentEcoSave () {
        return this.$$t('toolbar.content.eco_save')
      },
      titleTipsDisabled () {
        return this.tipsDisabled
          ? this.$$t('toolbar.tooltip.tooltip.on')
          : this.$$t('toolbar.tooltip.tooltip.off')
      },
      contentTipsDisabled () {
        return this.tipsDisabled
          ? this.$$t('toolbar.content.tooltip.on')
          : this.$$t('toolbar.content.tooltip.off')
      },
      titleToolbarBlockVisible () {
        return this.toolbarBlockVisible
          ? this.$$t('toolbar.tooltip.block.off')
          : this.$$t('toolbar.tooltip.block.on')
      },
      contentToolbarBlockVisible () {
        return this.toolbarBlockVisible
          ? this.$$t('toolbar.content.block.off')
          : this.$$t('toolbar.content.block.on')
      },
      titleToolbarBlockDebug () {
        return this.toolbarInfoDebug
          ? this.$$t('toolbar.tooltip.debug.off')
          : this.$$t('toolbar.tooltip.debug.on')
      },
      contentToolbarBlockDebug () {
        return this.$$t('toolbar.content.debug')
      },
      titleMenu () {
        return this.$$t('toolbar.tooltip.menu')
      },
      ...mapState({
        ecoSave: state => state.Document.ecoSave
      }),
      ...mapState('Pref', {
        tipsDisabled: state => state.tipsDisabled
      }),
      ...mapState('UI', {
        toolbarBlockVisible: state => state.toolbarBlockVisible,
        toolbarRyVisible: state => state.toolbarRyVisible,
        toolbarInfoDebug: state => state.toolbarInfoDebug
      })
    },
    methods: {
      ...mapMutations('UI', {
        setToolbarBlockVisible: 'setToolbarBlockVisible',
        setToolbarBlockDebug: 'setToolbarBlockDebug'
      }),
      ...mapMutations('Pref', {
        toggleTipsDisabled: 'toggleTipsDisabled'
      }),
      ...mapMutations({
        setEcoSave: 'DOC_SET_ECO_SAVE'
      }),
      doToggleToolbarBlockVisible () {
        this.setToolbarBlockVisible(!this.toolbarBlockVisible)
      },
      doToggleToolbarBlockDebug () {
        this.setToolbarBlockDebug(!this.toolbarInfoDebug)
      },
      doToggleEcoSave () {
        this.setEcoSave(!this.ecoSave)
      }
    }
  }
</script>

<style>
</style>
