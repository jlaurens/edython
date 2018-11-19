<template>
  <b-button-group class="mx-1" variant="outline-secondary">
    <b-btn id="toolbar-back" v-on:click="doBack()" :title="$t('message.send_selection_to_back')" v-tippy :disabled="!canDoIt">
      <icon-base :width="24" :height="24" icon-name="back"><icon-front-back :front="false" /></icon-base>
    </b-btn>
    <b-btn id="toolbar-focus" v-on:click="doFocus()" :title="$t('message.show_selection')" v-tippy :disabled="!canDoIt">
      <icon-base :width="24" :height="24" icon-name="focus"><icon-focus/></icon-base>
    </b-btn>
  </b-button-group>
</template>

<script>
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
      canDoIt () {
        return !!this.$store.state.UI.selectedBlockId
      }
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
