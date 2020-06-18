<template>
  <b-dd
    id="main-mode"
    class="eyo-dropdown"
    variant="secondary"
    :text="$$t(`toolbar.content.mode.${selectedMode}`)"
  >
    <b-dd-item-button
      v-for="choice in choices"
      :key="choice"
      v-tippy
      class="brick-variant"
      :title="$$t(`toolbar.tooltip.mode.${choice}`)"
      @click="choose(choice)"
      v-html="$$t(`toolbar.content.mode.${choice}`)"
    />
  </b-dd>
</template>

<script>
import {mapState, mapMutations} from 'vuex'

export default {
    name: 'MainMode',
    computed: {
        ...mapState('UI', [
            'selectedMode'
        ]),
        choices () {
            return [
                eYo.App.TUTORIAL,
                eYo.App.BASIC,
                eYo.App.NORMAL,
                eYo.App.TEACHER
            ]
        }
    },
    methods: {
        ...mapMutations('UI', [
            'selectMode'
        ]),
        choose (choice) {
            this.selectMode(choice)
        }
    }
}
</script>
<style>
  #main-mode .btn {
    padding-right: 1rem;
  }
</style>
