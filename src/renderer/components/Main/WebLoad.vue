<template>
  <div>
    <input ref="input" type="file" @change="loadTextFromFile" style="display:none">
  </div>
</template>

<script>
export default {
  name: 'webLoadAlert',
  mounted: function () {
    var self = this
    eYo.$$.bus.$on('webUploadStart', function (ev) {
      self.showAlert = false
      self.$refs.input.click(ev)
    })
  },
  methods: {
    loadTextFromFile (ev) {
      const file = ev.target.files[0]
      if (file) {
        eYo.$$.bus.$emit('webUploadDidStart', file)
        const reader = new FileReader()
        reader.onload = e => eYo.$$.bus.$emit('webUploadEnd', e.target.result)
        console.log(file)
        reader.readAsArrayBuffer(file)
      }
    }
  }
}
</script>
  