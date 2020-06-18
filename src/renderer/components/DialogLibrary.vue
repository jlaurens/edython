<template>
  <div>
    <dialog-should-save
      id="dialog-should-save"
      ref="shouldSave"
    />
    <dialog-rename
      id="dialog-rename"
      ref="rename"
    />
    <dialog-recovered
      id="dialog-recovered"
      ref="recovered"
    />
  </div>
</template>

<script>
import DialogShouldSave from './Dialog/ShouldSave'
import DialogRename from './Dialog/Rename'
import DialogRecovered from './Dialog/Recovered'

export default {
    name: 'DialogLibrary',
    components: {
        DialogShouldSave,
        DialogRename,
        DialogRecovered
    },
    mounted () {
        var z = this.$refs.recovered
        this.$$.bus.$on('document-read-string-recovered',
            z.show.bind(z)
        )
        z = this.$refs.shouldSave
        this.$$onOnly('document-should-save',
            z.show.bind(z)
        )
    }
}
</script>
<style>
</style>
