<template>
  <b-dropdown id="main-mode" class="eyo-dropdown" variant="secondary" :text="$t(`message.main_mode_${chosen}`)">
    <b-dropdown-item-button v-for="choice in choices" v-on:click="choose(choice)" :key="choice" class="block-variant eyo-code" v-html="$t(`message.main_mode_${choice}`)" :title="$t(`message.main_mode_${choice}_title`)" v-tippy ></b-dropdown-item-button>
  </b-dropdown>
</template>

<script>
  export default {
    name: 'main-mode',
    data: function () {
      return {
        chosen: eYo.App.NORMAL
      }
    },
    computed: {
      choices () {
        return [
          eYo.App.TUTORIAL,
          eYo.App.NORMAL,
          eYo.App.TEACHER
        ]
      }
    },
    created () {
      this.synchronize()
    },
    updated () {
      this.synchronize()
    },
    methods: {
      choose (choice) {
        this.chosen = choice
      },
      synchronize () {
      }
    }
  }
</script>
<style>
  #main-mode .btn {
    padding-right: 1rem;
  }
</style>
