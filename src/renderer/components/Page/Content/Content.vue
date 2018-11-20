<template>
  <div id="content-content" :style="style">
    <Split @onDrag="onDrag">
      <SplitArea :size="75">
        <content-eyo></content-eyo>
      </SplitArea>
      <SplitArea :size="25">
        <content-panels></content-panels>
      </SplitArea>
    </Split>
  </div>
</template>

<script>
  import ContentEyO from './Content/EyO'
  import ContentPanels from './Content/Panels'

  export default {
    name: 'content-content',
    data: function () {
      return {
        step: 0
      }
    },
    methods: {
      onDrag (size) {
        this.$$.bus.$emit('size-did-change', size)
      }
    },
    components: {
      'content-eyo': ContentEyO,
      'content-panels': ContentPanels
    },
    computed: {
      toolbarEditVisible () {
        return this.$store.state.UI.toolbarEditVisible
      },
      style () {
        return `top: ${0.5 + this.step}rem;
        height: calc(100% - ${0.5 + this.step}rem)`
      }
    },
    mounted () {
      this.step = this.$store.state.UI.toolbarEditVisible ? 2 : 0
    },
    watch: {
      toolbarEditVisible (newValue, oldValue) {
        this.step = newValue ? 0 : 2
        this.$$.TweenLite.to(this, 1, {step: 2 - this.step})
      }
    }
  }
</script>

<style>
  #content-content {
    position: absolute;
    width: 100%;
    padding: 0.25rem 0;
  }
  .gutter {
    background-color:transparent;
  }
</style>
