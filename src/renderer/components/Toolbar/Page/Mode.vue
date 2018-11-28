<template>
  <b-dropdown id="main-mode" class="eyo-dropdown" variant="secondary" :text="$$t(`toolbar.content.mode.${selectedMode}`)">
    <b-dropdown-item-button v-for="choice in choices" v-on:click="setSelectedMode(choice)" :key="choice" class="block-variant eyo-code" v-html="$$t(`toolbar.content.mode.${choice}`)" :title="$$t(`toolbar.tooltip.mode.${choice}`)" v-tippy ></b-dropdown-item-button>
  </b-dropdown>
</template>

<script>
  import {mapState, mapMutations} from 'vuex'

  export default {
    name: 'main-mode',
    computed: {
      choices () {
        return [
          eYo.App.TUTORIAL,
          eYo.App.BASIC,
          eYo.App.NORMAL,
          eYo.App.TEACHER
        ]
      },
      ...mapState({
        selectedMode: state => state.UI.selectedMode
      })
    },
    methods: {
      ...mapMutations({
        setSelectedMode: 'UI_SET_SELECTED_MODE'
      })
    }
  }
</script>
<style>
  #main-mode .btn {
    padding-right: 1rem;
  }
</style>
