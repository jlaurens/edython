<template>
  <b-dd
    id="main-mode"
    class="eyo-dropdown"
    variant="secondary"
    :text="$$t(`toolbar.content.mode.${selectedMode}`)"
    >
    <b-dd-item-button
      v-for="choice in choices"
      v-on:click="setSelectedMode(choice)"
      :key="choice"
      class="block-variant eyo-code"
      v-html="$$t(`toolbar.content.mode.${choice}`)"
      :title="$$t(`toolbar.tooltip.mode.${choice}`)"
      v-tippy
      >
    </b-dd-item-button>
  </b-dd>
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
      ...mapState('UI', {
        selectedMode: state => state.selectedMode
      })
    },
    methods: {
      ...mapMutations('UI', {
        setSelectedMode: 'setSelectedMode'
      })
    }
  }
</script>
<style>
  #main-mode .btn {
    padding-right: 1rem;
  }
</style>
