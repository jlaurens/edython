<template>
  <b-dd
    id="main-mode"
    class="eyo-dropdown"
    variant="secondary"
    :text="$$t(`toolbar.content.mode.${selectedMode}`)"
    >
    <b-dd-item-button
      v-for="choice in choices"
      v-on:click="choose(choice)"
      :key="choice"
      class="block-variant"
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
    mounted () {
      this.choices.forEach(el => {
        console.log('CHOICE', el, this.$$t(`toolbar.tooltip.mode.${el}`))
      })
    },
    methods: {
      ...mapMutations('UI', [
        'selectMode'
      ]),
      choose (choice) {
        this.selectMode(choice)
        this.$nextTick(() => {
          this.$$.bus.$emit('toolbar-resize')
        })
      }
    }
  }
</script>
<style>
  #main-mode .btn {
    padding-right: 1rem;
  }
</style>
