<template>
  <div id="pane-content">
    <block-toolbar></block-toolbar>
    <div
      id="working-area"
      class="eyo-workbench"
      :style="style"
      ref="container_f">
    </div>
    <Split
      @onDrag="onDrag"
      ref="component_h"><!-- top row -->
      <SplitArea
        :size="width_h1"
        ref="h1">
        <div
          class="container"
          ref="container_h1">
        </div>
      </SplitArea>
      <SplitArea
        :size="width_h2"
        ref="h2">
        <div
          class="container"
          ref="container_h2">
        </div>
      </SplitArea>
    </Split>
    <Split
      @onDrag="onDrag"
      ref="component_hh"><!-- bottom row -->
      <SplitArea
        :size="width_hh1"
        ref="hh1">
        <div
          class="container"
          ref="container_hh1">
        </div>
      </SplitArea>
      <SplitArea
        :size="width_hh2"
        ref="hh2">
        <div
          class="container"
          ref="container_hh2">
        </div>
      </SplitArea>
    </Split>
    <Split
      @onDrag="onDrag"
      ref="component_v"
      direction="vertical"><!-- left column -->
      <SplitArea
        :size="height_v1"
        ref="v1">
        <div
          class="container"
          ref="container_v1">
        </div>
      </SplitArea>
      <SplitArea
        :size="height_v2"
        ref="v2">
        <div
          class="container"
          ref="container_v2">
        </div>
      </SplitArea>
    </Split>
    <Split
      @onDrag="onDrag"
      ref="component_vv"
      direction="vertical"><!-- right column -->
      <SplitArea
        :size="height_vv1"
        ref="vv1">
        <div
          class="container"
          ref="container_vv1">
        </div>
      </SplitArea>
      <SplitArea
        :size="height_vv2"
        ref="vv2">
        <div
          class="container"
          ref="container_vv2">
        </div>
      </SplitArea>
    </Split>
    <div
      class="transporter"
      ref="transporter_tl">
    </div>
    <div
      class="transporter"
      ref="transporter_tr">
    </div>
    <div
      class="transporter"
      ref="transporter_bl">
    </div>
    <div
      class="transporter"
      ref="transporter_br">
    </div>
    <pane-workspace
      ref="pane_workspace"
      :where="where_workspace"
      @change-layout="changeLayout"></pane-workspace>
    <pane-console
      ref="pane_console"
      :where="where_console"
      @change-layout="changeLayout"></pane-console>
    <pane-turtle
      ref="pane_turtle"
      :where="where_turtle"
      @change-layout="changeLayout"></pane-turtle>
    <console-script></console-script>
  </div>
</template>

<script>
  import {mapState, mapMutations} from 'vuex'

  import BlockToolbar from '@@/Toolbar/Block'
  import PaneWorkspace from './Pane/Workspace'
  import PaneConsole from './Pane/Console'
  import PaneTurtle from './Pane/Turtle'
  import PanePanels from './Pane/Panels'
  import ConsoleScript from './Pane/ConsoleScript'

  export default {
    name: 'pane-content',
    data: function () {
      return {
        step: 0,
        max: 2.25
      }
    },
    components: {
      BlockToolbar,
      PaneWorkspace,
      PaneConsole,
      PaneTurtle,
      PanePanels,
      ConsoleScript
    },
    computed: {
      style () {
        return `top: ${this.step}rem;
        height: calc(100% - ${this.step}rem)`
      },
      ...mapState('UI', [
        'displayMode',
        'toolbarBlockVisible'
      ]),
      ...mapState('Layout', [
        'paneLayout',
        'where_console',
        'where_turtle',
        'where_workspace',
        'what_f',
        'what_h1',
        'what_h2',
        'what_hh1',
        'what_hh2',
        'what_v1',
        'what_v2',
        'what_vv1',
        'what_vv2',
        'width_h1',
        'width_h2',
        'width_hh1',
        'width_hh2',
        'height_v1',
        'height_v2',
        'height_vv1',
        'height_vv2'
      ])
    },
    methods: {
      onDrag (size) {
        eYo.$$.bus.$emit('size-did-change')
      },
      ...mapMutations('Layout', [
        'setPaneLayout',
        'setWhat_f',
        'setWhat_h1',
        'setWhat_h2',
        'setWhat_hh1',
        'setWhat_hh2',
        'setWhat_v1',
        'setWhat_v2',
        'setWhat_vv1',
        'setWhat_vv2'
      ]),
      changeLayout (opt) {
        var k = `setWhat_${opt.where}`
        var f = this[k]
        console.error('changeLayout', opt, k, f)
        if (goog.isFunction(f)) {
          f(opt.what)
        }
        if (opt.how) {
          this.setPaneLayout(opt.how)
        }
      }
    },
    mounted () {
      this.step = this.toolbarBlockVisible ? this.max : 0
      var f = (child) => {
        var parent = child.parentNode || child.$el.parentNode
        parent && parent.removeChild(child)
      }
      f(this.$refs.transporter_tl)
      f(this.$refs.transporter_tr)
      f(this.$refs.transporter_bl)
      f(this.$refs.transporter_br)
      f = (component) => {
        var parent = component.$el.parentNode
        parent.removeChild(component.$el)
      }
      f(this.$refs.component_h)
      f(this.$refs.component_hh)
      f(this.$refs.component_v)
      f(this.$refs.component_vv)
      // We must keep them in the dom because we really need the elements
      this.$refs.pane_workspace.$el.style.display = 'none'
      this.$refs.pane_console.$el.style.display = 'none'
      this.$refs.pane_turtle.$el.style.display = 'none'
      console.error('setWhat_f', 'workspace')
      this.setWhat_f('workspace')
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
      },
      panelLayout (newValue, oldValue) {
        console.error('panelLayout', newValue, oldValue)
        if (newValue === 'h') {
          var div = this.$refs.container_f
          var component = this.$refs[`component_${newValue}`]
          if (component) {
            if (div.firstChild === component.$el) {
              // nothing to do
              return
            }
            while (div.firstChild) {
              div.removeChild(div.firstChild)
            }
            div.appendChild(component.$el)
            component.$el.style.display = ''
            var div1 = this.$refs.container_h1
            if (!div1.firstChild) {
              if (!this.whereConsole) {
                div1.appendChild(this.pane_console.$el)
              } else if (!this.whereWorkspace) {
                div1.appendChild(this.pane_workspace.$el)
              } else if (!this.whereTurtle) {
                div1.appendChild(this.pane_turtle.$el)
              } else {
                var div2 = this.$refs.container_hh1
                if (div2.firstChild) {
                  div1.appendChild(div2.firstChild)
                  this.what_h1 = this.what_hh1
                  this.what_hh1 = null
                  this[`setWhere_${this.what_h1}`]('h1')
                }
              }
            }
            div1 = this.$refs.container_h2
            if (!div1.firstChild) {
              if (!this.whereConsole) {
                div1.appendChild(this.pane_console.$el)
              } else if (!this.whereWorkspace) {
                div1.appendChild(this.pane_workspace.$el)
              } else if (!this.whereTurtle) {
                div1.appendChild(this.pane_turtle.$el)
              } else {
                div2 = this.$refs.container_hh2
                if (div2.firstChild) {
                  div1.appendChild(div2.firstChild)
                  this.what_h2 = this.what_hh2
                  this.what_hh2 = null
                  this[`setWhere_${this.what_h2}`]('h2')
                }
              }
            }
          }
        }
      },
      what_f (newValue, oldValue) {
        console.error('what_f', newValue, oldValue)
        if (newValue !== oldValue) {
          var component = this.$refs[`pane_${newValue}`]
          if (component) {
            var div = this.$refs.container_f
            while (div.firstChild) {
              div.removeChild(div.firstChild)
            }
            div.appendChild(component.$el)
            component.$el.style.display = ''
          } else {
            console.error('UNKNOWN', newValue)
          }
        }
      }
    }
  }
</script>

<style>
  #pane-content {
    position: absolute;
    top: 3rem;
    height: calc(100% - 3rem);
    width: calc(100% - 0.5rem);
    padding: 0;
  }
  /* tablets and desktop */
  #pane-content {
    top: 3rem;
    height: calc(100% - 3rem);
    min-width: 300px;
  }
  @media only screen and (max-width: 890px) {
    /* tablets and desktop */
      #pane-content {
      top: calc(3rem + 1 * 2.5rem);
      height: calc(100% - (3rem + 1 * 2.5rem));
    }
  }
  @media only screen and (max-width: 495px) {
    /* tablets and desktop */
      #pane-content {
      top: calc(3rem + 2 * 2.5rem);
      height: calc(100% - (3rem + 2 * 2.5rem));
    }
  }
  @media only screen and (max-width: 340px) {
    /* tablets and desktop */
      #pane-content {
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

  .eyo-workbench .container {
    padding: 0;
    margin:0;
    width: 100%;
    height: 100%;
    background-color: transparent;
  }
  .eyo-workbench .management {
    border-radius: 0.25rem 0.25rem 0 0;
    background-color: #6c757d;
  }
</style>
