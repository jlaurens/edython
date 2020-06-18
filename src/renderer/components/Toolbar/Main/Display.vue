<template>
  <b-btn-group>
    <b-btn
      v-tippy
      class="eyo-display-packed"
      :title="titleLeft"
      @click="toggleLeft()"
    >
      <icon-base icon-name="display">
        <icon-display
          :left="true"
          :hide="left"
        />
      </icon-base>
    </b-btn>
    <b-btn
      v-tippy
      class="eyo-display-packed"
      :title="titleRight"
      @click="toggleRight()"
    >
      <icon-base icon-name="display">
        <icon-display
          :left="false"
          :hide="right"
        />
      </icon-base>
    </b-btn>
  </b-btn-group>
</template>

<script>
import IconBase from '@@/Icon/IconBase.vue'
import IconDisplay from '@@/Icon/IconDisplay.vue'

export default {
    name: 'PageToolbarDisplay',
    components: {
        IconBase,
        IconDisplay
    },
    data: function () {
        return {
            left: true,
            right: true
        }
    },
    computed: {
        displayMode: {
            get () {
                return this.$store.state.UI.displayMode
            },
            set (newValue) {
                this.$store.commit('UI_SET_DISPLAY_MODE', newValue)
            }
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
