<template>
  <b-btn-group
    variant="outline-secondary">
    <b-btn
      id="toolbar-back"
      v-on:click="doBack()"
      :title="titleBack"
      v-tippy
      :disabled="!eyo">
      <icon-base
        :width="24"
        :height="24"
        icon-name="back">
        <icon-front-back
        :front="false" />
      </icon-base>
    </b-btn>
    <b-btn
      id="toolbar-show"
      v-on:click="doShow()"
      :title="titleShow"
      v-tippy
      :disabled="!eyo">
      <icon-base
        :width="24"
        :height="24"
        icon-name="show">
        <icon-show/>
      </icon-base>
    </b-btn>
  </b-btn-group>
</template>

<script>
  import {mapGetters} from 'vuex'

  import IconBase from '@@/Icon/IconBase.vue'
  import IconFrontBack from '@@/Icon/IconFrontBack.vue'
  import IconShow from '@@/Icon/IconShow.vue'

  export default {
    name: 'page-toolbar-layout',
    components: {
      IconBase,
      IconFrontBack,
      IconShow
    },
    computed: {
      ...mapGetters('Selected', [
        'eyo'
      ]),
      locale () {
        return this.$i18n.locale
      },
      titleBack () {
        return this.$$t('toolbar.tooltip.selection.send_to_back', this.locale)
      },
      titleShow () {
        return this.$$t('toolbar.tooltip.selection.show', this.locale)
      }
    },
    methods: {
      doFront () {
        eYo.App.doFront()
      },
      doBack () {
        eYo.App.doBack()
      },
      doShow () {
        eYo.App.doFocus()
      }
    }
  }
</script>
