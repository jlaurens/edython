<template>
  <div id="page-content">
    <block-toolbar></block-toolbar>
    <div
      id="working-area"
      :style="style">
      <Split
        @onDrag="onDrag"
          id="page-split">
        <SplitArea
          :size="75"
            id="page-split-eyo">
          <page-workspace></page-workspace>
        </SplitArea>
        <SplitArea
          :size="25"
            id="page-split-panels">
          <page-panels></page-panels>
        </SplitArea>
      </Split>
    </div>
  </div>
</template>

<script>
  import {mapState} from 'vuex'

  import BlockToolbar from '@@/Toolbar/Block'
  import PageWorkspace from './Page/Workspace'
  import PagePanels from './Page/Panels'

  export default {
    name: 'page-content',
    data: function () {
      return {
        step: 0,
        max: 2.25
      }
    },
    components: {
      BlockToolbar,
      PageWorkspace,
      PagePanels
    },
    computed: {
      style () {
        return `top: ${this.step}rem;
        height: calc(100% - ${this.step}rem)`
      },
      ...mapState({
        displayMode: state => state.UI.displayMode,
        toolbarBlockVisible: state => state.UI.toolbarBlockVisible
      })
    },
    methods: {
      onDrag (size) {
        eYo.$$.bus.$emit('size-did-change')
      }
    },
    mounted () {
      this.step = this.toolbarBlockVisible ? this.max : 0
    },
    watch: {
      toolbarBlockVisible (newValue, oldValue) {
        this.step = newValue ? 0 : this.max
        eYo.$$.TweenLite.to(this, 1, {
          step: this.max - this.step,
          onUpdate: () => {
            eYo.$$.bus.$emit('size-did-change')
          }
        })
      }
    }
  }
</script>

<style>
  #page-content {
    position: absolute;
    top: 3rem;
    height: calc(100% - 3rem);
    width: calc(100% - 0.5rem);
    padding: 0;
  }
  /* tablets and desktop */
  #page-content {
    top: 3rem;
    height: calc(100% - 3rem);
    min-width: 300px;
  }
  @media only screen and (max-width: 890px) {
    /* tablets and desktop */
      #page-content {
      top: calc(3rem + 1 * 2.5rem);
      height: calc(100% - (3rem + 1 * 2.5rem));
    }
  }
  @media only screen and (max-width: 495px) {
    /* tablets and desktop */
      #page-content {
      top: calc(3rem + 2 * 2.5rem);
      height: calc(100% - (3rem + 2 * 2.5rem));
    }
  }
  @media only screen and (max-width: 340px) {
    /* tablets and desktop */
      #page-content {
      top: calc(3rem + 3 * 2.5rem);
      height: calc(100% - (3rem + 3 * 2.5rem));
    }
  }

  #working-area {
    position: absolute;
    width: 100%;
    padding: 0.25rem 0;
  }
  .gutter {
    background-color:transparent;
  }
</style>
