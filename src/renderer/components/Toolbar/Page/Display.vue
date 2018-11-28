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
      displayMode: {
        get () {
          return this.$store.state.UI.displayMode
        },
        set (newValue) {
          this.$store.commit('UI_SET_DISPLAY_MODE', newValue)
        }
      },
      titleLeft () {
        return this.left
          ? this.$$t('toolbar.tooltip.workspace.hide')
          : this.$$t('toolbar.tooltip.workspace.show')
      },
      titleRight () {
        return this.right
          ? this.$$t('toolbar.tooltip.console_panel.hide')
          : this.$$t('toolbar.tooltip.console_panel.show')
      }
    },
    methods: {
      toggleLeft () {
        if (this.left) {
          this.left = !(this.right = true)
        } else {
          this.left = true
        }
        this.update()
      },
      toggleRight () {
        if (this.right) {
          this.right = !(this.left = true)
        } else {
          this.right = true
        }
        this.update()
      },
      update () {
        // retrieve the dimensions of the split components
        // resize the split component
        //
        //
        // if (this.left && !this.right) {
        //   this.displayMode = eYo.App.WORKSPACE_ONLY
        // } else if (this.right && !this.left) {
        //   this.displayMode = eYo.App.CONSOLE_ONLY
        // } else {
        //   this.displayMode = null
        // }
      }
    }
  }
</script>
