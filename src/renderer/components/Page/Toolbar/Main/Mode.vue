<template>
  <b-dropdown id="main-mode" class="eyo-dropdown" variant="secondary" :text="$t(`message.main_mode_${chosen}`)">
    <b-dropdown-item-button v-for="choice in choices" v-on:click="choose(choice)" :key="choice" class="info-variant eyo-code" v-html="$t(`message.main_mode_${choice}`)" :title="$t(`message.main_mode_${choice}_title`)" v-tippy ></b-dropdown-item-button>
  </b-dropdown>
</template>

<script>
  eYo.Do.readOnlyMixin(eYo.Key, {
    TUTORIAL: 'tutorial',
    NORMAL: 'normal',
    TEACHER: 'teacher'
  })

  export default {
    name: 'main-mode',
    data: function () {
      return {
        chosen: eYo.Key.NORMAL
      }
    },
    computed: {
      choices () {
        return [
          eYo.Key.TUTORIAL,
          eYo.Key.NORMAL,
          eYo.Key.TEACHER
        ]
      }
    },
    created () {
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
    padding-right: 0.75rem;
  }
</style>
