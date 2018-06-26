<template>
  <Split id="page-content" @onDrag="onDrag">
    <SplitArea :size="75">
      <content-eyo></content-eyo>
    </SplitArea>
    <SplitArea :size="25">
      <content-panels></content-panels>
    </SplitArea>
  </Split>
</template>

<script>
  import ContentEyO from './Content/EyO'
  import ContentPanels from './Content/Panels'

  export default {
    name: 'page-content',
    methods: {
      onDrag (size) {
        this.$$.bus.$emit('size-did-change', size)
      }
    },
    components: {
      'content-eyo': ContentEyO,
      'content-panels': ContentPanels
    },
    mounted: function () {
      this.$$.bus.$on('setConsoleVisible', function (visible) {
        console.log('setConsoleVisible', visible)
      })
    }
  }
</script>

<style>
  #page-content {
    position: absolute;
    top: 3.25rem;
    height: calc(100% - 3.5rem);
    width: calc(100% - 0.5rem);
    padding: 0.25rem;
  }
  .gutter {
    background-color:transparent;
  }
</style>
