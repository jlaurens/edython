<template>
  <div
    id="pane-content">
    <block-toolbar></block-toolbar>
    <div
      class="eyo-workbench">
      <div
        id="working-area"
        class="eyo-workbench-content"
        :style="workingStyle"
        ref="container_f">
      </div>
      <div
        class="eyo-workbench-toolbars"
        ref="workbench_toolbars_div">
      </div>
    </div>
    <div 
      v-show="false"
      ref="backstage">
      <Split
        @onDrag="onDragSplit"
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
        @onDrag="onDragSplit"
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
        @onDrag="onDragSplit"
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
        @onDrag="onDragSplit"
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
        @change-layout="changeLayout"
        @install-toolbar="installToolbar"></pane-workspace>
      <pane-console1
        ref="pane_console1"
        :where="where_console1"
        @change-layout="changeLayout"
        @install-toolbar="installToolbar"
        @pane-console1-show="makeConsoleVisible"
        @pane-turtle-show="makeVisible('turtle')"></pane-console1>
      <pane-console2
        ref="pane_console2"
        :where="where_console2"
        @change-layout="changeLayout"
        @install-toolbar="installToolbar"></pane-console2>
      <pane-turtle
        ref="pane_turtle"
        :where="where_turtle"
        @change-layout="changeLayout"
        @install-toolbar="installToolbar"></pane-turtle>
      <!--console2-script></console2-script-->
    </div>
    <b-modal
      id="panel-launch"
      ref="elStarting"
      :title="$$t('panel.launch.title')"
      :ok-disabled="!started1"
      @keyup.enter.native="hide()"
      lazy>
      <div><div
        style="display:inline-block;width:calc(64px + 1rem);vertical-align:top;"><img
        src="static/icon_light.svg"
        height="64"
        alt="Edython"/></div><div
          style="display:inline-block;width:calc(100% - 64px - 1rem);">{{$$t('panel.launch.content')}}</div></div>
    </b-modal>
  </div>
</template>

<script>
  import {layoutcfg} from '@@/../store/modules/Layout'
  
  import {mapState, mapMutations} from 'vuex'

  import BlockToolbar from '@@/Toolbar/Block'
  import PaneWorkspace from './Pane/Workspace'
  import PaneConsole1 from './Pane/Console1'
  import PaneConsole2 from './Pane/Console2'
  import PaneTurtle from './Pane/Turtle'
  import Console2Script from './Pane/Console2Script'
  
  export default {
    name: 'pane-content',
    data: function () {
      return {
        footstep: 0,
        maxstep: 2.25
      }
    },
    components: {
      BlockToolbar,
      PaneWorkspace,
      PaneConsole2,
      PaneConsole1,
      PaneTurtle,
      Console2Script
    },
    computed: {
      ...mapState('UI', [
        'displayMode',
        'toolbarBlockVisible'
      ]),
      ...mapState('Page', [
        'toolbarMainHeight'
      ]),
      ...mapState('Layout', [
        'paneLayout'
      ]),
      ...mapState('Layout', layoutcfg.where_whats),
      ...mapState('Layout', layoutcfg.what_wheres),
      ...mapState('Layout', layoutcfg.width_wheres),
      ...mapState('Layout', layoutcfg.height_wheres),
      ...mapState('Py', [
        'started1'
      ]),
      workingStyle () {
        return `top: ${this.footstep - this.maxstep}rem;
        height: calc(100% - ${this.footstep}rem)`
      }
    },
    methods: {
      ...mapMutations('Layout', [
        'setPaneLayout'
      ]),
      ...mapMutations('Layout', layoutcfg.setWhere_whats),
      ...mapMutations('Layout', layoutcfg.setWhat_wheres),
      onDragSplit (size) {
        this.$root.$emit('toolbar-follow-phantom')
      },
      where (what) {
        return this[`where_${what}`]
      },
      what (where) {
        return this[`what_${where}`]
      },
      setWhere (what, where) {
        this[`setWhere_${what}`](where)
        this.$nextTick(() => {
          this.$root.$emit('toolbar-follow-phantom')
        })
        return this
      },
      setWhat (where, what) {
        eYo.App.workspace && Blockly.hideChaff()
        where && this[`setWhat_${where}`](what)
        this.$nextTick(() => {
          this.$root.$emit('toolbar-follow-phantom')
        })
        return this
      },
      container (where) {
        return this.$refs[`container_${where}`]
      },
      pane (what) { // pane is one of 'console1' 'console2', 'workspace', 'turtle', 'h', 'v', 'hh', 'vv'
        return this.$refs[`pane_${what}`]
      },
      installToolbar (toolbar, scaled) {
        var parent = toolbar.parentNode
        var div = this.$refs.workbench_toolbars_div
        if (parent === div) {
          // already installed, unscaled case
          div.removeChild(toolbar)
          return
        } else if (parent) {
          var grand_parent = parent.parentNode
          if (grand_parent === div) {
            div.removeChild(parent)
            parent.removeChild(toolbar)
            return
          }
        }
        // the toolbar was not installed
        // move the toolbar element to the tollbars div.
        if (scaled) {
          // use a fragment
          parent = document.createElement('div')
          goog.dom.classlist.add(parent, 'scaled')
          parent.style.width = '0'
          parent.style.height = '0'
          parent.style.position = 'absolute'
          parent.appendChild(toolbar)
          div.appendChild(parent)
        } else {
          div.appendChild(toolbar)
        }
      },
      changeLayout (opt) {
        try {
          if (opt.layout) {
            opt.how = opt.layout
          }
          if (opt.how === 'revert') {
            this.revertLayout && this.revertLayout()
            return
          }
          var newValue = opt.how
          var oldValue = this.paneLayout
          // console.error('paneLayout', newValue, oldValue)
          if (oldValue === newValue) {
            return
          }
          if (newValue === 'F' && opt.what) {
            this.revertLayout = ((what, where, layout) => {
              return () => {
                this.place(what, where)
                this.changeLayout({how: layout})
              }
            })(opt.what, this.where(opt.what), oldValue)
            this.place(opt.what, 'f')
            return
          }
          if (!newValue) {
            this.place(opt.what, opt.where)
            return
          }
          // switching from full pane mode is quite straightforward
          var panes = layoutcfg.panes
          if (oldValue === 'F') {
            // F -> H or F -> V
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
            } else if (newValue === 'HF') {
              this.place('v', 'f').place('h', 'v1')
            } else if (newValue === 'FH') {
              this.place('v', 'f').place('hh', 'v2')
            } else if (newValue === 'VF') {
              this.place('h', 'f').place('v', 'h1')
            } else if (newValue === 'FV') {
              this.place('h', 'f').place('vv', 'h2')
            } else if (newValue === 'HH') {
              this.place('v', 'f').place('h', 'v1').place('hh', 'v2')
            } else if (newValue === 'VV') {
              this.place('h', 'f').place('v', 'h1').place('vv', 'h2')
            }
            return
          }
          f = (where, wheres) => {
            if (!this[`what_${where}`]) {
              layoutcfg.panes.some((what) => {
                if (wheres.indexOf(this[`where_${what}`]) < 0) {
                  this.place(what, where)
                  return true
                }
              })
            }
          }
          if (oldValue === 'H') {
            if (newValue === 'V') {
              // H -> V: (h1, h2) => (v1 / v2) correspondance in position
              this.switchWhere('h1', 'v1').switchWhere('h2', 'v2')
              this.place('v', 'f')
            } else if (newValue === 'HF') {
              // H -> HF: (h1, h2) => ((h1, h2) / v2)
              this.place('v', 'f').place('h', 'v1')
              f('v2', ['h1', 'h2'])
            } else if (newValue === 'FH') {
              // H -> FH: (h1, h2) -> (v1 / (h1, h2))
              this.switchWhere('h1', 'hh1').switchWhere('h2', 'hh2')
              this.place('hh', 'v2').place('v', 'f')
              f('v1', ['hh1', 'hh2'])
            } else if (newValue === 'VF') {
              // H -> VF: (h1, h2) -> ((h1 / v2) | (v1 / h1), h2)
              if (!this.what_v1 || this.what_v2) {
                this.place(this.what_h1, 'v1')
                f('v2', ['v1', 'h2'])
              } else {
                this.place(this.what_h1, 'v2')
                f('v1', ['v2', 'h2'])
              }
              this.place('v', 'h1')
            } else if (newValue === 'FV') {
              // H -> FV: (h1, h2) -> (h1, (h2 / vv2) | (vv1 / h2))
              if (!this.what_vv1 || this.what_vv2) {
                this.place(this.what_h2, 'vv1')
                f('vv2', ['h1', 'vv1'])
              } else {
                this.place(this.what_h2, 'vv2')
                f('vv1', ['h1', 'vv2'])
              }
              this.place('vv', 'h2')
            } else if (newValue === 'HH') {
              this.place('v', 'f').place('h', 'v1').place('hh', 'v2')
            } else if (newValue === 'VV') {
              this.place('h', 'f').place('v', 'h1').place('vv', 'h2')
            }
          } else if (oldValue === 'V') {
            if (newValue === 'H') {
              // V -> H: (v1 / v2) => (h1, h2)
              this.place('h', 'f')
              this.switchWhere('h1', 'v1').switchWhere('h2', 'v2')
            } else if (newValue === 'HF') {
              // V -> HF: (v1 / v2) -> ((v1, h2) | (h1, v2) / v2)
              if (!this.what_h1 || this.what_h2) {
                this.place(this.what_v1, 'h1')
                f('h2', ['h1', 'v2'])
              } else {
                this.place(this.what_v1, 'h2')
                f('h1', ['h2', 'v2'])
              }
              this.place('h', 'v1')
            } else if (newValue === 'FH') {
              // V -> FH: (v1 / v2) -> (v1 / (v2, hh2))
              if (!this.what_h1 || this.what_h2) {
                this.place(this.what_v2, 'hh1')
                f('hh2', ['hh1', 'v1'])
              } else {
                this.place(this.what_v2, 'hh2')
                f('hh1', ['hh2', 'v1'])
              }
              this.place('hh', 'v2')
            } else if (newValue === 'VF') {
              // V -> VF: (v1 / v2) -> ((v1 / v2), h2)
              this.place('h', 'f').place('v', 'h1')
              f('h2', ['v1', 'v2'])
            } else if (newValue === 'FV') {
              // V -> FV: (v1 / v2) -> (h1, (v1 / v2))
              this.switchWhere('v1', 'vv1').switchWhere('v2', 'vv2')
              this.place('vv', 'h2').place('h', 'f')
              f('h1', ['vv1', 'vv2'])
            } else if (newValue === 'HH') {
              this.place('v', 'f').place('h', 'v1').place('hh', 'v2')
            } else if (newValue === 'VV') {
              this.place('h', 'f').place('v', 'h1').place('vv', 'h2')
            }
          } else if (oldValue === 'HF') {
            if (newValue === 'FH') {
              // HF -> FH: ((h1, h2)/ v2) -> (v2/ (h1, h2))
              this.switchWhere('v1', 'v2')
              this.switchWhere('h1', 'hh1').switchWhere('h2', 'hh2')
              this.place('hh', 'v2')
            } else if (newValue === 'VF') {
              // HF -> VF: ((h1, h2)/ v2) => ((v1 / v2), h2) correspondance in positions
              this.switchWhere('h1', 'v1').switchWhere('h2', 'v2')
              this.place('v', 'h1').place('h', 'f')
            } else if (newValue === 'H') {
              // HF -> H: ((h1, h2)/ v2) -> (h1, h2)
              this.place('h', 'f')
            } else if (newValue === 'V') {
              // HF -> V: ((h1, h2)/ v2) -> (h1 | h2 / v2)
              // opt.what is one of what_h1 or what_h2
              this.place(opt.what, 'v1')
            } else if (newValue === 'FV') {
              this.place('h', 'f').place('vv', 'h2')
            } else if (newValue === 'HH') {
              this.place('v', 'f').place('h', 'v1').place('hh', 'v2')
            } else if (newValue === 'VV') {
              this.place('h', 'f').place('v', 'h1').place('vv', 'h2')
            }
          } else if (oldValue === 'FH') {
            if (newValue === 'HF') {
              // FH -> FH: (v1 /(hh1, hh2)) -> ((hh1, hh2) / v1)
              this.switchWhere('v1', 'v2')
              this.switchWhere('h1', 'hh1').switchWhere('h2', 'hh2')
              this.place('h', 'v1')
            } else if (newValue === 'FV') {
              // FH -> FV: (v1 /(hh1, hh2)) -> (v1, (hh1, hh2))
              this.switchWhere('v1', 'h1')
              this.switchWhere('hh1', 'vv1').switchWhere('hh2', 'vv2')
              this.place('vv', 'h2').place('h', 'f')
            } else if (newValue === 'H') {
              // FH -> H: (v1 /(hh1, hh2)) -> (hh1, hh2)
              this.switchWhere('h1', 'hh1').switchWhere('h2', 'hh2')
              this.place('h', 'f')
            } else if (newValue === 'V') {
              // FH -> V: (v1 /(hh1, hh2)) -> (v1, hh1 | hh2)
              // opt.what is one of what_hh1 or what_hh2
              this.place(opt.what, 'v2')
            } else if (newValue === 'VF') {
              this.place('h', 'f').place('v', 'h1')
            } else if (newValue === 'HH') {
              this.place('v', 'f').place('h', 'v1').place('hh', 'v2')
            } else if (newValue === 'VV') {
              this.place('h', 'f').place('v', 'h1').place('vv', 'h2')
            }
          } else if (oldValue === 'VF') {
            if (newValue === 'FV') {
              // VF -> FV: ((v1 / v2), h2) -> (h2, (v1, v2))
              this.switchWhere('h1', 'h2')
              this.switchWhere('v1', 'vv1').switchWhere('v2', 'vv2')
              this.place('vv', 'h2')
            } else if (newValue === 'H') {
              // VF -> H: ((v1 / v2), h2) -> ((v1 | v2), h2)
              // opt.what is one of what_v1 or what_v2
              this.place(opt.what, 'h1')
            } else if (newValue === 'V') {
              // VF -> V: ((v1 / v2), h2) -> (v1, v2)
              this.place('v', 'f')
            } else if (newValue === 'HF') {
              // VF -> HF: ((v1 / v2), h2) -> ((v1 , v2) / h2)
              this.switchWhere('v1', 'h1')
              this.switchWhere('v2', 'h2')
              this.place('v', 'f').place('h', 'v1')
            } else if (newValue === 'FH') {
              this.place('v', 'f').place('hh', 'v2')
            } else if (newValue === 'HH') {
              this.place('v', 'f').place('h', 'v1').place('hh', 'v2')
            } else if (newValue === 'VV') {
              this.place('h', 'f').place('v', 'h1').place('vv', 'h2')
            }
          } else if (oldValue === 'FV') {
            if (newValue === 'VF') {
              // FV -> VF: (h1, (vv1 / vv2)) -> ((vv1 / vv2), h1)
              this.switchWhere('h1', 'h2')
              this.switchWhere('v1', 'vv1')
              this.switchWhere('v2', 'vv2')
              this.place('v', 'h1')
            } else if (newValue === 'H') {
              // FV -> H: (h1, (vv1 / vv2)) -> (h1, (vv1 | vv2))
              // opt.what is one of what_vv1 or what_vv2
              this.place(opt.what, 'h2')
            } else if (newValue === 'V') {
              // FV -> V: (h1, (vv1 / vv2)) -> (vv1 / vv2)
              this.place('v', 'f')
              this.switchWhere('v1', 'vv1')
              this.switchWhere('v2', 'vv2')
            } else if (newValue === 'FH') {
              // FV -> FH: (h1, (vv1 / vv2))-> (h1 / (vv1, vv2)
              this.place('v', 'f')
              this.switchWhere('h1', 'v1')
              this.switchWhere('hh1', 'vv1').switchWhere('hh2', 'vv2')
              this.place('hh', 'v2')
            } else if (newValue === 'HF') {
              this.place('v', 'f').place('h', 'v1')
            } else if (newValue === 'HH') {
              this.place('v', 'f').place('h', 'v1').place('hh', 'v2')
            } else if (newValue === 'VV') {
              this.place('h', 'f').place('v', 'h1').place('vv', 'h2')
            }
          }
        } finally {
          Object.keys(opt).forEach(where => {
            if (layoutcfg.wheres.indexOf(where) >= 0) {
              this.place(opt[where], where)
            }
          })
          if (newValue) {
            this.setPaneLayout(newValue)
            var available = new Set([
              this.where_workspace,
              this.where_turtle,
              this.where_console1,
              this.where_console2
            ])
            var expected = {
              F: ['f'],
              H: ['h1', 'h2'],
              V: ['v1', 'v2'],
              HF: ['h1', 'h2', 'v2'],
              FH: ['v1', 'hh1', 'hh2'],
              VF: ['v1', 'v2', 'h2'],
              FV: ['h1', 'vv1', 'vv2'],
              HH: ['h1', 'h2', 'hh1', 'hh2'],
              VV: ['v1', 'v2', 'vv1', 'vv2']
            }[newValue]
            if (expected.some(where => !available.has(where))) {
              expected.filter(where => !available.has(where)).forEach((where) => {
                layoutcfg.panes.some(what => {
                  if (!this.isVisible(what)) {
                    this.place(what, where)
                    return true
                  }
                })
              })
            }
          }
        }
      },
      switchWhere (where1, where2) {
        if (where1 !== where2) {
          var what1 = this.what(where1)
          var what2 = this.what(where2)
          this.place(what1, where2).place(what2, where1)
        }
        return this
      },
      switchWhat (what1, what2) {
        if (what1 !== what2) {
          var where1 = this.where(what1)
          var where2 = this.where(what2)
          this.place(what1, where2).place(what2, where1)
        }
        return this
      },
      buddy (where) {
        return {
          h1: 'h2',
          h2: 'h1',
          hh1: 'hh2',
          hh2: 'hh1',
          v1: 'v2',
          v2: 'v1',
          vv1: 'vv2',
          vv2: 'vv1'
        }[where]
      },
      place (what, where) {
        // we move the `what` component to the `where` location
        // start by unbinding before binding
        if (what) {
          var pane_what = this.pane(what)
          var old_where = this.where(what)
          // unbind `what` from its previous location
          if (old_where) {
            // `what` was somewhere else, we will move it
            pane_what && pane_what.willUnplace && pane_what.willUnplace()
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
            var pane_old_what = this.pane(old_what)
            if (pane_old_what) {
              pane_old_what.willUnplace && pane_old_what.willUnplace()
              this.$refs.backstage.appendChild(pane_old_what.$el)
            }
            this.setWhere(old_what, null)
            this.setWhat(where, null)
          }
        }
        // Time to establish a new link
        if (what) {
          if (pane_what) {
            var cont_where = this.container(where)
            if (cont_where) {
              el = pane_what.$el
              cont_where.appendChild(el)
              el.style.display = ''
              this.setWhere(what, where)
              this.setWhat(where, what)
              pane_what.didPlace && pane_what.didPlace()
            } else if (where) {
              console.error('UNKNON location:', where)
            }
          } else if (what) {
            console.error('UNKNON pane/layout:', what)
          }
          // is there something in the other part?
          var buddy = this.buddy(where)
          if (buddy && !this.what(buddy)) {
            // there is nothing in the other pane
            this.place(old_what, buddy)
          }
          // if old_what has no where, move it to the old_where
          if (layoutcfg.panes.indexOf(old_what) >= 0 && !this.where(old_what) && old_where && !this.what(old_where)) {
            // recursive call, only once
            this.place(old_what, old_where)
          }
        }
        return this
      },
      isVisible (what) {
        var where = this[`where_${what}`]
        if (where === 'f') {
          return true
        }
        if (!where) {
          return false
        }
        var x = where.substring(0, 2)
        if (x === 'hh' || x === 'vv') {
          return this.isVisible(x)
        }
        return this.isVisible(x.substring(0, 1))
      },
      makeConsoleVisible () {
        if (this.isVisible('console1') || this.isVisible('console2')) {
          return
        }
        this.makeVisible('console1', true)
      },
      makeVisible (what, second = false) {
        if (this.isVisible(what)) {
          return
        }
        var where = 'f' // where -> place what
        var actual = this.what_f
        var suffix = second ? '2' : '1'
        if (actual === 'h') {
          where = actual + suffix
          actual = this.what(where)
          if (actual === 'v' || actual === 'vv') {
            where = actual + suffix
          } else if (second) {
            this.place(where, 'vv1')
            this.place(what, 'vv2')
            what = 'vv'
          }
        } else if (actual === 'v') {
          where = actual + suffix
          actual = this.what(where)
          if (actual === 'h' || actual === 'hh') {
            where = actual + suffix
          } else if (second) {
            this.place(where, 'hh1')
            this.place(what, 'hh2')
            what = 'hh'
          }
        } else if (second) {
          this.switchWhere('f', 'h1')
          // this is the only case where the layout changes
          this.changeLayout({
            how: 'H',
            where: 'f'
          })
          where = 'h2'
        }
        this.place(what, where)
      }
    },
    mounted () {
      this.$refs.elStarting.show()
      this.footstep = this.toolbarBlockVisible ? this.maxstep : 0
      if (this.paneLayout) {
        // this is not the first time we run the application
        this.changeLayout({
          how: this.paneLayout
        })
        // now we should place the correct stuff at the right place
        layoutcfg.whats.forEach(what => {
          var where = this[`where_${what}`]
          if (where) {
            this.place(what, where)
          }
        })
      }
      if (!layoutcfg.whats.some(what => this.isVisible(what))) {
        this.changeLayout({
          how: 'F',
          what: 'workspace'
        })
      }
      this.$$onOnly('pane-turtle-show', () => {
        this.makeVisible('turtle')
      })
      this.$$onOnly('pane-console1-show', this.makeConsoleVisible.bind(this))
      this.$$onOnly('pane-workspace-visible', () => {
        this.makeVisible('workspace')
      })
      eYo.$$.bus.$on('pane-change-layout', opt => {
        this.changeLayout(opt)
      })
    },
    watch: {
      toolbarBlockVisible (newValue, oldValue) {
        this.footstep = newValue ? 0 : this.maxstep
        eYo.$$.TweenLite.to(this, 1, {
          footstep: this.maxstep - this.footstep,
          onUpdate: () => {
            this.$root.$emit('toolbar-follow-phantom')
          }
        })
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
          } else if (newValue) {
            console.error('UNKNOWN', newValue)
          }
        }
      }
    }
  }
</script>

<style>
  #pane-content {
    height: 100%;
    width: 100%;
    padding: 0;
    min-width: 300px;
  }
  
  #working-area {
    position: relative;
    width: 100%;
    padding: 0.25rem;
    padding-bottom: 0;
  }

  .gutter {
    background-color:transparent;
  }

  .eyo-workbench {
    width: 100%;
    height: 100%;
  }

  .eyo-workbench-toolbars {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 0;
    z-index: 10;
  }

  .eyo-workbench-toolbars .management {
    position: absolute;
  }

  .eyo-workbench-toolbars .scaled {
    z-index: 100;
  }

  .eyo-workbench-content .container {
    padding: 0;
    margin:0;
    width: 100%;
    height: 100%;
    background-color: transparent;
  }
  .eyo-workbench-content .management {
    position: relative;
    left: 0;
    top: 0;
  }
  .eyo-workbench .management {
    border-radius: 0.25rem 0.25rem 0 0;
    background-color: #6c757d;
  }
  .dropdown .dropdown-item {
    padding: 0.25rem;
  }
  #panel-launch .btn-secondary {
    display: none;
  }
  #panel-launch .modal-header .close {
    display: none;
  }
</style>
