<template>
  <b-btn-group>
    <b-dd
      class="eyo-toolbar-menu eyo-dropdown"
      right
    >
      <template
        slot="button-content"
      >
        <icon-base
          :width="32"
          :height="32"
          icon-name="menu"
        >
          <icon-menu />
        </icon-base>
      </template>
      <b-dd-item-button
        v-tippy
        :style="style"
        :title="titleToolbarBlockVisible"
        @click="doToggleToolbarBlockVisible()"
      >
        <check-mark />{{ contentToolbarBlockVisible }}
      </b-dd-item-button>
      <b-dd-item-button
        v-if="toolbarBlockVisible"
        v-tippy
        :style="style"
        :title="titleToolbarBlockDebug"
        @click="doToggleToolbarBlockDebug()"
      >
        <check-mark
          :checked="toolbarInfoDebug"
        />{{ contentToolbarBlockDebug }}
      </b-dd-item-button>
      <b-dd-item-button
        v-if="selectedMode === $$.eYo.App.TEACHER"
        v-tippy
        :style="style"
        :title="titleEcoSave"
        @click="doToggleEcoSave()"
      >
        <check-mark
          :checked="ecoSave"
        />{{ contentEcoSave }}
      </b-dd-item-button>
      <b-dd-item-button
        v-tippy
        :style="style"
        :title="titleTipsDisabled"
        @click="toggleTipsDisabled()"
      >
        <check-mark />{{ contentTipsDisabled }}
      </b-dd-item-button>
      <b-dd-item-button
        v-tippy
        :style="style"
        :title="titleDeepCopy"
        @click="toggleDeepCopy()"
      >
        <check-mark
          :checked="deepCopy"
        />{{ contentDeepCopy }}
      </b-dd-item-button>
      <b-dd-divider />
      <b-dd-item-button
        v-tippy
        :style="style"
        :title="titleFactoryDefaults"
        @click="resetFactoryDefaults()"
      >
        <check-mark />{{ contentFactoryDefaults }}
      </b-dd-item-button>
    </b-dd>
  </b-btn-group>
</template>

<script>
import {mapState, mapMutations, mapActions} from 'vuex'

import IconBase from '@@/Icon/IconBase.vue'
import IconMenu from '@@/Icon/IconMenu.vue'
import CheckMark from '@@/Util/CheckMark.vue'
  
export default {
    name: 'PageToolbarMenu',
    components: {
        IconBase,
        IconMenu,
        CheckMark
    },
    data: function () {
        return {
        }
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
            return this.$$t(`toolbar.tooltip.tooltip.${this.tipsDisabled ? 'on' : 'off'}`, this.locale)
        },
        contentTipsDisabled () {
            return this.$$t(`toolbar.content.tooltip.${this.tipsDisabled ? 'on' : 'off'}`, this.locale)
        },
        titleToolbarBlockVisible () {
            return this.$$t(`toolbar.tooltip.brick.${this.toolbarBlockVisible ? 'off' : 'on'}`, this.locale)
        },
        contentToolbarBlockVisible () {
            return this.$$t(`toolbar.content.brick.${this.toolbarBlockVisible ? 'off' : 'on'}`, this.locale)
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
        resetFactoryDefaults () {
            this.resetUI()
            this.resetLayout()
            this.resetPrefs()
            this.setEcoSave(true)
            this.setToolbarBlockDebug(false)
            this.setToolbarBlockVisible(true)
            if (this.deepCopy) {
                this.toggleDeepCopy()
            }
            if (this.tipsDisabled) {
                this.toggleTipsDisabled()
            }
        }
    }
}
</script>

<style>
</style>
