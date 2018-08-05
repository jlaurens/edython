<template>
  <div id="page-content" :style="style">
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
    name: 'page-content',
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
      toolbarInfoVisible () {
        return this.$store.state.UI.toolbarInfoVisible
      },
      style () {
        return ['top: ', 3.25 + this.step, 'rem;height: calc(100% - ', 3.5 + this.step, 'rem)'].join('')
      }
    },
    mounted () {
      this.step = this.$store.state.UI.toolbarInfoVisible ? 2 : 0
    },
    watch: {
      toolbarInfoVisible (newValue, oldValue) {
        this.step = newValue ? 0 : 2
        this.$$.TweenLite.to(this, 1, {step: 2 - this.step})
      }
    }
  }
</script>

<style>
  #page-content {
    position: absolute;
    width: calc(100% - 0.5rem);
    padding: 0.25rem;
  }
  .gutter {
    background-color:transparent;
  }
</style>
