<template>
  <div>
    <dialog-should-save
      id="dialog-should-save"
      ref="shouldSave"
    ></dialog-should-save>
    <dialog-rename
      id="dialog-rename"
      ref="rename"
    ></dialog-rename>
    <dialog-recovered
      id="dialog-recovered"
      ref="recovered"
    ></dialog-recovered>
  </div>
</template>

<script>
  import DialogShouldSave from './Dialog/ShouldSave'
  import DialogRename from './Dialog/Rename'
  import DialogRecovered from './Dialog/Recovered'

  export default {
    name: 'dialog-library',
    components: {
      DialogShouldSave,
      DialogRename,
      DialogRecovered
    },
    mounted () {
      var z = this.$refs.recovered
      this.$$.bus.$on(
        'document-read-string-recovered',
        z.show.bind(z)
      )
      z = this.$refs.shouldSave
      this.$root.$on(
        'document-should-save',
        z.show.bind(z)
      )
    }
  }
</script>
<style>
</style>
