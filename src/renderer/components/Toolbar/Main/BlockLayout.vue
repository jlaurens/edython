<template>
  <b-btn-group
    variant="outline-secondary">
    <b-btn
      id="toolbar-back"
      v-on:click="doBack()"
      :title="$$t('block.tooltip.selection.send_to_back')"
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
      id="toolbar-focus"
      v-on:click="doFocus()"
      :title="$$t('block.tooltip.selection.show')"
      v-tippy
      :disabled="!eyo">
      <icon-base
        :width="24"
        :height="24"
        icon-name="focus">
        <icon-focus/>
      </icon-base>
    </b-btn>
  </b-btn-group>
</template>

<script>
  import {mapState} from 'vuex'

  import IconBase from '@@/Icon/IconBase.vue'
  import IconFrontBack from '@@/Icon/IconFrontBack.vue'
  import IconFocus from '@@/Icon/IconFocus.vue'

  export default {
    name: 'page-toolbar-layout',
    components: {
      IconBase,
      IconFrontBack,
      IconFocus
    },
    computed: {
      ...mapState('UI', {
        eyo: state => state.selectedBlockEyo
      })
    },
    methods: {
      doFront () {
        eYo.App.doFront()
      },
      doBack () {
        eYo.App.doBack()
      },
      doFocus () {
        eYo.App.doFocus()
      }
    }
  }
</script>
