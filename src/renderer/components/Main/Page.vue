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
      ref="pane_h"><!-- top row -->
      <SplitArea
        :size="width_h1"
        ref="h1">
        <div
          class="container"
          ref="container_h1"></div>
      </SplitArea>
      <SplitArea
        :size="width_h2"
        ref="h2">
        <div
          class="container"
          ref="container_h2"></div>
      </SplitArea>
    </Split>
    <Split
      @onDrag="onDrag"
      ref="pane_hh"><!-- bottom row -->
      <SplitArea
        :size="width_hh1"
        ref="hh1">
        <div
          class="container"
          ref="container_hh1"></div>
      </SplitArea>
      <SplitArea
        :size="width_hh2"
        ref="hh2">
        <div
          class="container"
          ref="container_hh2"></div>
      </SplitArea>
    </Split>
    <Split
      @onDrag="onDrag"
      ref="pane_v"
      direction="vertical"><!-- left column -->
      <SplitArea
        :size="height_v1"
        ref="v1">
        <div
          class="container"
          ref="container_v1"></div>
      </SplitArea>
      <SplitArea
        :size="height_v2"
        ref="v2">
        <div
          class="container"
          ref="container_v2"></div>
      </SplitArea>
    </Split>
    <Split
      @onDrag="onDrag"
      ref="pane_vv"
      direction="vertical"><!-- right column -->
      <SplitArea
        :size="height_vv1"
        ref="vv1">
        <div
          class="container"
          ref="container_vv1"></div>
      </SplitArea>
      <SplitArea
        :size="height_vv2"
        ref="vv2">
        <div
          class="container"
          ref="container_vv2"></div>
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
  import {layoutcfg} from '@@/../store/modules/Layout'
  
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
        'paneLayout'
      ]),
      ...mapState('Layout', layoutcfg.where_whats),
      ...mapState('Layout', layoutcfg.what_wheres),
      ...mapState('Layout', layoutcfg.width_wheres),
      ...mapState('Layout', layoutcfg.height_wheres)
    },
    methods: {
      onDrag (size) {
        eYo.$$.bus.$emit('size-did-change')
      },
      ...mapMutations('Layout', [
        'setPaneLayout'
      ]),
      ...mapMutations('Layout', layoutcfg.setWhere_whats),
      ...mapMutations('Layout', layoutcfg.setWhat_wheres),
      where (what) {
        return this[`where_${what}`]
      },
      what (where) {
        return this[`what_${where}`]
      },
      setWhere (what, where) {
        this[`setWhere_${what}`](where)
      },
      setWhat (where, what) {
        this[`setWhat_${where}`](what)
      },
      container (where) {
        return this.$refs[`container_${where}`]
      },
      pane (what) { // pane is one of 'console', 'workspace', 'turtle', 'h', 'v', 'hh', 'vv'
        return this.$refs[`pane_${what}`]
      },
      changeLayout (opt) {
        if (opt.how === 'F' && opt.what) {
          this.place(opt.what, 'f')
        }
        if (opt.how) {
          this.setPaneLayout(opt.how)
        }
        if (opt.where) {
          this.place(opt.what, opt.where)
        }
      },
      place (what, where) {
        // we move the `what` component to the `where` location
        console.error('bind', where, what)
        // start by unbinding before binding
        if (what) {
          var old_where = this.where(what)
          // unbind `what` from its previous location
          if (old_where) {
            // `what` was somewhere else, we will move it
            var cont_old_where = this.container(old_where)
            if (cont_old_where) {
              var el = cont_old_where
              while (el.firstChild) {
                el.removeChild(el.firstChild)
              }
              this.setWhat(old_where, null)
              this.setWhere(what, null)
            }
          }
        }
        // idem for the other side
        if (where) {
          var old_what = this.what(where)
          if (old_what) {
            // there was something where we plan to move `what`
            var comp_old_what = this.pane(old_what)
            if (comp_old_what) {
              el = comp_old_what.$el
              var parent = el.parentNode
              parent && parent.removeChild(el)
            }
            this.setWhere(old_what, null)
            this.setWhat(where, null)
          }
        }
        // Time to establish a new link
        if (what) {
          var pane_what = this.pane(what)
          if (pane_what) {
            var cont_where = this.container(where)
            if (cont_where) {
              el = pane_what.$el
              cont_where.appendChild(el)
              el.style.display = ''
              this.setWhere(what, where)
              this.setWhat(where, what)
              eYo.$$.bus.$emit('size-did-change')
            } else {
              console.error('UNKNON location:', where)
            }
          } else {
            console.error('UNKNON pane/layout:', what)
          }
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
      // We must keep them in the dom because we really need the elements
      this.$nextTick(() => {
        layoutcfg.whats.map(s => 'pane_' + s).forEach(p => {
          var el = this.$refs[p].$el
          var parent = el.parentNode
          parent && parent.removeChild(el)
        })
        this.changeLayout({how: 'F', what: 'workspace'})
      })
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
      paneLayout (newValue, oldValue) {
        // console.error('paneLayout', newValue, oldValue)
        if (oldValue === newValue) {
          return
        }
        // switching to full pane mode is straightforward
        var panes = layoutcfg.panes
        if (oldValue === 'F') {
          var f = (hv) => {
            var what_old = this.what('f')
            if (panes.indexOf(what_old) < 0) {
              what_old = null
            }
            this.place(hv, 'f')
            var hv1 = `${hv}1`
            var what1 = this.what(hv1)
            if (panes.indexOf(what1) < 0) {
              this.place(what_old, hv1)
              what1 = null
              what_old = null
            }
            var hv2 = `${hv}2`
            var what2 = this.what(hv2)
            if (panes.indexOf(what2) < 0) {
              this.place(what_old, hv2)
              what2 = null
              what_old = null
            }
            if (!what1) {
              var what11 = this.what(`${hv}${hv}1`)
              if (panes.indexOf(what11) < 0) {
                what11 = panes.filter(s => s !== what2)[0]
              }
              this.place(what11, hv1)
              what1 = what11
            }
            if (!what2) {
              var what22 = this.what(`${hv}${hv}2`)
              if (panes.indexOf(what22) < 0) {
                what22 = panes.filter(s => s !== what2)[0]
              }
              this.place(what22, hv2)
              what2 = what22
            }
          }
          if (newValue === 'H') {
            f('h')
          } else if (newValue === 'V') {
            f('v')
          }
        } else {

        }
      },
      what_f (newValue, oldValue) {
        console.error('WHATCHED what_f', newValue, oldValue)
        if (newValue !== oldValue) {
          var comp_new = this.$refs[`pane_${newValue}`]
          if (comp_new) {
            var div = this.$refs.container_f
            while (div.firstChild) {
              div.removeChild(div.firstChild)
            }
            div.appendChild(comp_new.$el)
            comp_new.$el.style.display = ''
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
