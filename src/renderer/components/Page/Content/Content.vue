<template>
  <div id="content-content" :style="style">
    <Split @onDrag="onDrag" id="content-split">
      <SplitArea :size="75" id="content-split-eyo">
        <content-eyo></content-eyo>
      </SplitArea>
      <SplitArea :size="25" id="content-split-panels">
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
        step: 0,
        max: 2.25
      }
    },
    methods: {
      onDrag (size) {
        this.$$.bus.$emit('size-did-change')
      }
    },
    components: {
      'content-eyo': ContentEyO,
      'content-panels': ContentPanels
    },
    computed: {
      displayMode () {
        return this.$store.state.UI.displayMode
      },
      toolbarBlockVisible () {
        return this.$store.state.UI.toolbarBlockVisible
      },
      style () {
        return `top: ${this.step}rem;
        height: calc(100% - ${this.step}rem)`
      }
    },
    mounted () {
      this.step = this.$store.state.UI.toolbarBlockVisible ? this.max : 0
    },
    watch: {
      toolbarBlockVisible (newValue, oldValue) {
        this.step = newValue ? 0 : this.max
        this.$$.TweenLite.to(this, 1, {
          step: this.max - this.step,
          onUpdate: () => {
            this.$$.bus.$emit('size-did-change')
          }
        })
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
