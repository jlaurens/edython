<template>
  <b-btn-group>
    <b-btn class="eyo-display-packed" v-on:click="toggleLeft()" :title="titleLeft" v-tippy>
      <icon-base icon-name="display"><icon-display :left="true" :hide="left"/></icon-base>
    </b-btn>
    <b-btn class="eyo-display-packed" v-on:click="toggleRight()" :title="titleRight" v-tippy>
      <icon-base icon-name="display"><icon-display :left="false" :hide="right"/></icon-base>
    </b-btn>
  </b-btn-group>
</template>

<script>
  import IconBase from '@@/Icon/IconBase.vue'
  import IconDisplay from '@@/Icon/IconDisplay.vue'

  export default {
    name: 'page-toolbar-display',
    data: function () {
      return {
        left: true,
        right: true
      }
    },
    components: {
      IconBase,
      IconDisplay
    },
    computed: {
      titleLeft () {
        return this.left
          ? this.$t('message.hide_workspace')
          : this.$t('message.show_workspace')
      },
      titleRight () {
        return this.right
          ? this.$t('message.hide_console_panel')
          : this.$t('message.show_console_panel')
      }
    },
    methods: {
      toggleLeft () {
        this.left = !this.left
      },
      toggleRight () {
        this.right = !this.right
      }
    }
  }
</script>
