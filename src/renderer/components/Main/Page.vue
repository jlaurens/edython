<template>
  <div id="pane-content">
    <block-toolbar></block-toolbar>
    <div
      id="working-area"
      class="eyo-workbench"
      :style="style"
      ref="container_f">
    </div>
    <div 
      v-show="false"
      ref="backstage">
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
  </div>
</template>

<script>
  import {layoutcfg} from '@@/../store/modules/Layout'
  
  import {mapState, mapMutations} from 'vuex'

  import BlockToolbar from '@@/Toolbar/Block'
  import PaneWorkspace from './Pane/Workspace'
  import PaneConsole from './Pane/Console'
  import PaneTurtle from './Pane/Turtle'
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
      switchWhere (where1, where2) {
        if (where1 !== where2) {
          var what1 = this.what(where1)
          var what2 = this.what(where2)
          this.place(what1, where2)
          this.place(what2, where1)
        }
      },
      switchWhat (what1, what2) {
        if (what1 !== what2) {
          var where1 = this.where(what1)
          var where2 = this.where(what2)
          this.place(what1, where2)
          this.place(what2, where1)
        }
      },
      place (what, where) {
        // we move the `what` component to the `where` location
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
                // we put the pane in the backstage
                // it is not visible but still in the dom such that
                // it can be edited in the background
                this.$refs.backstage.appendChild(el.firstChild)
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
              this.$refs.backstage.appendChild(comp_old_what.$el)
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
          // is there something in the other part?
          var buddy = {
            h1: 'h2',
            h2: 'h1',
            hh1: 'hh2',
            hh2: 'hh1',
            v1: 'v2',
            v2: 'v1',
            vv1: 'vv2',
            vv2: 'vv1'
          }[where]
          if (buddy && !this.what(buddy)) {
            // there is nothing in the other pane
            this.place(old_what, buddy)
          }
        }
      },
      makeVisible (what) {
        var where = 'f' // where to place what
        var actual = this.what_f
        if (what === actual) {
          return
        }
        if (actual === 'h') {
          if (this.what_h1 === what) {
            return
          }
          where = 'h1'
          if (this.what_h1 === 'v') {
            if (this.what_v1 === what || this.what_v2 === what) {
              return
            }
            where = 'v1'
          }
          if (this.what_h2 === what) {
            return
          }
          if (this.what_h2 === 'v') {
            if (this.what_vv1 === what || this.what_vv2 === what) {
              return
            }
          }
        } else if (actual === 'v') {
          if (this.what_v1 === what) {
            return
          }
          where = 'v1'
          if (this.what_v1 === 'h') {
            if (this.what_h1 === what || this.what_h2 === what) {
              return
            }
            where = 'h1'
          }
          if (this.what_v2 === what) {
            return
          }
          if (this.what_v2 === 'h') {
            if (this.what_hh1 === what || this.what_hh2 === what) {
              return
            }
          }
        }
        this.place(what, where)
      }
    },
    mounted () {
      this.step = this.toolbarBlockVisible ? this.max : 0
      this.changeLayout({how: 'F', what: 'workspace'})
      eYo.makeTurtleVisible = () => {
        console.error('Trying hard...')
        this.makeVisible('turtle')
      }
      eYo.$$.bus.$on('make-pane-workspace-visible', () => {
        this.makeVisible('workspace')
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
              // this is not a pane, merely a wrapper component
              what_old = null
            }
            this.place(hv, 'f')
            var hv1 = `${hv}1`
            var what1 = this.what(hv1)
            if (panes.indexOf(what1) < 0) {
              this.place(what_old, hv1)
              // now there is something in place hv1
              what1 = what_old
              // and nothing to eventually place somewhere
              what_old = null
            }
            var hv2 = `${hv}2`
            var what2 = this.what(hv2)
            if (panes.indexOf(what2) < 0) {
              this.place(what_old, hv2)
              // now there is something in place hv2
              what2 = what_old
              // and nothing to eventually place somewhere
              what_old = null
            }
            if (!what1) {
              what1 = this.what(`${hv}${hv}1`)
              if (panes.indexOf(what1) < 0) {
                what1 = panes.filter(s => s !== what2)[0]
              }
              this.place(what1, hv1)
            }
            if (!what2) {
              what2 = this.what(`${hv}${hv}2`)
              if (panes.indexOf(what2) < 0) {
                what2 = panes.filter(s => s !== what1)[0]
              }
              this.place(what2, hv2)
            }
          }
          if (newValue === 'H') {
            f('h')
          } else if (newValue === 'V') {
            f('v')
          }
        } else {
          var current
          if (oldValue === 'H') {
            if (newValue === 'V') {
              // H to V: h1 to v1, h2 to v2
              this.place('v', 'f')
              this.switchWhere('h1', 'v1')
              this.switchWhere('h2', 'v2')
            } else if (newValue === 'HF') {
              // H to HF
              this.place('v', 'f')
              this.place('h', 'v1')
              if (!this.what_v2) {
                layoutcfg.panes.some((what) => {
                  if (['h1', 'h2'].indexOf(this[`where_${what}`]) < 0) {
                    this.place(what, 'v2')
                    return true
                  }
                })
              }
            } else if (newValue === 'FH') {
              // H to FH
              this.place('v', 'f')
              this.switchWhere('h1', 'hh1')
              this.switchWhere('h2', 'hh2')
              this.place('hh', 'v2')
              if (!this.what_v1) {
                layoutcfg.panes.some((what) => {
                  if (['hh1', 'hh2'].indexOf(this[`where_${what}`]) < 0) {
                    this.place(what, 'v1')
                    return true
                  }
                })
              }
            } else if (newValue === 'VF') {
              // H to HF
              current = this.what_h1
              this.place('v', 'h1')
              this.place(current, 'v1')
              if (!this.what_v2) {
                layoutcfg.panes.some((what) => {
                  if (['v1', 'h2'].indexOf(this[`where_${what}`]) < 0) {
                    this.place(what, 'v2')
                    return true
                  }
                })
              }
            } else if (newValue === 'FV') {
              // H to FH
              current = this.what_h2
              this.place('vv', 'h2')
              this.place(current, 'vv1')
              if (!this.what_vv2) {
                layoutcfg.panes.some((what) => {
                  if (['h1', 'vv1'].indexOf(this[`where_${what}`]) < 0) {
                    this.place(what, 'vv2')
                    return true
                  }
                })
              }
            }
          } else if (oldValue === 'V') {
            if (newValue === 'H') {
              // H to V: h1 to v1, h2 to v2
              this.place('h', 'f')
              this.switchWhere('h1', 'v1')
              this.switchWhere('h2', 'v2')
            } else if (newValue === 'HF') {
              // V to HF
              current = this.what_v1
              this.place('h', 'v1')
              this.place(current, 'h1')
              if (!this.what_h2) {
                layoutcfg.panes.some((what) => {
                  if (['h1', 'v2'].indexOf(this[`where_${what}`]) < 0) {
                    this.place(what, 'h2')
                    return true
                  }
                })
              }
            } else if (newValue === 'FH') {
              // V to FH
              current = this.what_v2
              this.place('hh', 'v2')
              this.place(current, 'hh1')
              if (!this.what_hh2) {
                layoutcfg.panes.some((what) => {
                  if (['hh1', 'v1'].indexOf(this[`where_${what}`]) < 0) {
                    this.place(what, 'hh2')
                    return true
                  }
                })
              }
            } else if (newValue === 'VF') {
              // V to VF
              this.place('h', 'f')
              this.place('v', 'h1')
              if (!this.what_h2) {
                layoutcfg.panes.some((what) => {
                  if (['v1', 'v2'].indexOf(this[`where_${what}`]) < 0) {
                    this.place(what, 'h2')
                    return true
                  }
                })
              }
            } else if (newValue === 'FV') {
              // V to FV
              this.place('h', 'f')
              this.place('vv', 'h2')
              this.switchWhere('v1', 'vv1')
              this.switchWhere('v2', 'vv2')
              if (!this.what_h1) {
                layoutcfg.panes.some((what) => {
                  if (['vv1', 'vv2'].indexOf(this[`where_${what}`]) < 0) {
                    this.place(what, 'h1')
                    return true
                  }
                })
              }
            }
          }
        }
      },
      what_f (newValue, oldValue) {
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
