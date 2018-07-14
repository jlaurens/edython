<template>
  <b-button-group class="mx-1">
    <b-btn id="toolbar-back" v-on:click="doBack()" :title="title" v-tippy>
      <icon-base :width="32" :height="32" icon-name="back"><icon-front-back :front="false" /></icon-base>
    </b-btn>
    <b-btn id="toolbar-focus" v-on:click="doFocus()" title="Montrer la sélection" v-tippy>
      <icon-base :width="32" :height="32" icon-name="focus"><icon-focus/></icon-base>
    </b-btn>
  </b-button-group>
</template>

<script>
  import IconBase from '@@/IconBase.vue'
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
      title () {
        return 'Sélection à l\'arrière plan'
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
