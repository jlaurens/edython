<template>
  <b-btn-toolbar
    class="management"
    ref="phantom"
    justify>
    <b-btn-toolbar
      class="management"
      ref="toolbar"
      justify>
      <b-btn-group>&nbsp;</b-btn-group>
      <b-btn-group>
        <b-dd
        class="eyo-dropdown"
        :text="toolbarTitle">
        <b-dd-item-button
          v-if="isWorkspace"
          v-on:click="$root.$emit('document-rename')"
          class="eyo-code"
          :title="$$t('brick.pane.tooltip.document-rename')"
          v-tippy>{{$$t('brick.pane.content.document-rename')}}</b-dd-item-button>
        <b-dd-divider
          v-if="isWorkspace"></b-dd-divider>
        <b-dd-item-button
          v-for="pane in panes"
          v-on:click="selectedPane = pane"
          :key="pane"
          class="eyo-code">{{$$t(`brick.pane.${pane.replace(/(^|\s)\S/g, l => l.toUpperCase())}`)}}</b-dd-item-button>
        <b-dd-divider></b-dd-divider>
        <b-dd-item-button
          v-for="layout in layouts"
          :key="layout"
          v-on:click="selectedLayout = layout">
          <icon-base
            :width="24"
            :height="24"
            :icon-name="layout">
            <icon-layout
              :keyx="layout"/></icon-base></b-dd-item-button>
        <b-dd-divider
          v-if="revertLayout"></b-dd-divider>
        <b-dd-item-button
          v-if="revertLayout"
          v-on:click="selectedLayout = 'revert'">
          <icon-base
          :width="24"
          :height="24"
          icon-name="revertLayout">
          <icon-layout :keyx="revertLayout"/></icon-base></b-dd-item-button>
        </b-dd>
      </b-btn-group>
      <b-dd
        class="eyo-dropdown-tools"
        right>
        <template>
          <icon-base
          :width="24"
          :height="24"
          icon-name="tools"
          slot="button-content">
          <icon-menu/></icon-base>
        </template>
        <b-dd-item-button
          v-for="choice in choices"
          v-on:click="choose(choice)"
          :key="choice"
          class="eyo-code"
          :title="localizedTooltip(choice)"
          v-tippy
        >{{title(choice)}}</b-dd-item-button>
        <b-dd-divider
          v-if="choices.length"></b-dd-divider>
        <b-dd-item-button
          v-for="choice in scaleChoices"
          v-on:click="choose(choice)"
          :key="choice"
          class="eyo-code"
        >{{title(choice)}}</b-dd-item-button>
      </b-dd>
    </b-btn-toolbar>
  </b-btn-toolbar>
</template>

<script>
  //  import BlockLayout from '@@/Util/BlockLayout.vue'
  import IconBase from '@@/Icon/IconBase.vue'
  import IconLayout from '@@/Icon/IconLayout.vue'
  import IconMenu from '@@/Icon/IconMenu.vue'

  import {mapState, mapMutations} from 'vuex'
  import {layoutcfg} from '@@/../store/modules/Layout'

  var ResizeSensor = require('css-element-queries/src/ResizeSensor')

  export default {
    name: 'eyo-workspace-management-toolbar',
    data: function () {
      return {
        selectedPane_: 'console1',
        selectedLayout_: 'F',
        chosen_: 'A',
        revertLayout: undefined,
        resizeSensor: undefined
      }
    },
    components: {
      IconBase,
      IconLayout,
      IconMenu
    },
    props: {
      /** This is where the toolbar is located */
      where: {
        type: String,
        default: 'f' /* One of layoutcfg.wheres */
      },
      what: {
        type: String,
        default: undefined /* One of layoutcfg.panes */
      },
      phantom: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      ...mapState('Document', [
        'path'
      ]),
      ...mapState('Layout', [
        'paneLayout'
      ]),
      ...mapState('Layout', layoutcfg.where_whats),
      isWorkspace () {
        return this.what === 'workspace'
      },
      baseName () {
        var x = this.path
        if (x) {
          x = x.split('/')
          x = x[x.length - 1]
          x = x.split('.')
          return x[0]
        }
        return this.$$t('message.document.Untitled')
      },
      toolbarTitle () {
        if (this.isWorkspace) {
          return `${this.localized(this.what)} - ${this.baseName}`
        } else {
          return this.localized(this.what)
        }
      },
      selectedPane: {
        get () {
          return {
            f: this.what_f,
            h1: this.what_h1,
            h2: this.what_h2,
            hh1: this.what_hh1,
            hh2: this.what_hh2,
            v1: this.what_v1,
            v2: this.what_v2,
            vv1: this.what_vv1,
            vv2: this.what_vv2
          }[this.where] // this is reactive ?
        },
        set (newValue) {
          this.$nextTick(() => {
            this.changeLayout({
              what: newValue,
              where: this.where
            })
          })
        }
      },
      panes () {
        return layoutcfg.panes.filter(s => s !== this.what && s !== 'console2')
      },
      selectedLayout: {
        get () {
          return this.paneLayout
        },
        set (newValue) {
          this.$nextTick(() => {
            this.changeLayout({
              what: this.what,
              how: newValue
            })
            this.$root.$emit('toolbar-follow-phantom')
          })
          this.revertLayout = (newValue === 'F') && this.paneLayout
        }
      },
      layouts () {
        if (this.where) {
          var Ls = layoutcfg.fromLayout[this.paneLayout]
          if (Ls) {
            if (goog.isArray(Ls[this.where])) {
              return Ls[this.where]
            }
            if (goog.isArray(Ls)) {
              return Ls
            }
          }
          // Problem of synchronization : `this.paneLayout` may not be consistent
          // console.error('NO CFG...', this.where, Ls)
        }
        // console.error('For paneLayout', this.paneLayout)
        return []
      },
      choices () {
        return {
          console1: [
            'console1.restart',
            'console1.erase'
          ],
          console2: [
            'console2.restart',
            'console2.erase'
          ],
          turtle: [
            'turtle.replay',
            'turtle.erase',
            'turtle.scrollToVisible'
          ],
          workspace: [
            'workspace.clean'
          ]
        }[this.what]
      },
      scaleChoices () {
        return {
          console1: [
            'console1.scaleReset',
            'console1.scaleUp',
            'console1.scaleDown',
            'console1.scaleUpBig',
            'console1.scaleDownBig'
          ],
          console2: [
            'console2.scaleReset',
            'console2.scaleUp',
            'console2.scaleDown',
            'console2.scaleUpBig',
            'console2.scaleDownBig'
          ],
          turtle: [
            'turtle.scaleReset',
            'turtle.scaleUp',
            'turtle.scaleDown',
            'turtle.scaleUpBig',
            'turtle.scaleDownBig'
          ],
          workspace: [
            'workspace.scaleReset',
            'workspace.scaleUp',
            'workspace.scaleDown',
            'workspace.scaleUpBig',
            'workspace.scaleDownBig'
          ]
        }[this.what]
      }
    },
    mounted () {
      this.$nextTick(() => {
        this.resizeSensor = new ResizeSensor(
          this.$refs.phantom.$el,
          this.$$update.bind(this)
        )
        this.$emit('install-toolbar',
          this.$refs.toolbar.$el
        )
        this.$$update()
      })
      this.$$onOnly('toolbar-follow-phantom',
        this.$$update.bind(this)
      )
    },
    methods: {
      ...mapMutations('Workspace', {
        workspaceScaleUp: 'scaleUp',
        workspaceScaleUpBig: 'scaleUpBig',
        workspaceScaleDown: 'scaleDown',
        workspaceScaleDownBig: 'scaleDownBig',
        workspaceScaleReset: 'scaleReset'
      }),
      ...mapMutations('Console1', {
        console1ScaleUp: 'scaleUp',
        console1ScaleUpBig: 'scaleUpBig',
        console1ScaleDown: 'scaleDown',
        console1ScaleDownBig: 'scaleDownBig',
        console1ScaleReset: 'scaleReset'
      }),
      ...mapMutations('Console2', {
        console2ScaleUp: 'scaleUp',
        console2ScaleUpBig: 'scaleUpBig',
        console2ScaleDown: 'scaleDown',
        console2ScaleDownBig: 'scaleDownBig',
        console2ScaleReset: 'scaleReset'
      }),
      ...mapMutations('Turtle', {
        turtleScaleUp: 'scaleUp',
        turtleScaleUpBig: 'scaleUpBig',
        turtleScaleDown: 'scaleDown',
        turtleScaleDownBig: 'scaleDownBig',
        turtleScaleReset: 'scaleReset'
      }),
      localized (s) {
        return this.$$t(`brick.pane.${s.replace(/(^|\s)\S/g, l => l.toUpperCase())}`)
      },
      localizedTooltip (s) {
        // console.log(s) BUG: never called
        return this.$$t(`brick.pane.tooltip.${s.replace(/(^|\s)\S/g, l => l.toUpperCase())}`)
      },
      choose (choice) {
        var do_it = {
          'console1.restart': () => {
            this.$root.$emit('console1-restart')
          },
          'console1.erase': () => {
            this.$root.$emit('console1-erase')
          },
          'console2.restart': () => {
            this.$root.$emit('console2-restart')
          },
          'console2.erase': () => {
            this.$root.$emit('console2-erase')
          },
          'turtle.replay': () => {
            this.$root.$emit('turtle-replay')
          },
          'turtle.erase': () => {
            this.$root.$emit('turtle-erase')
          },
          'turtle.scrollToVisible': () => {
            this.$root.$emit('turtle-scroll')
          },
          'workspace.clean': () => {
            this.$root.$emit('workspace-clean')
          },
          'workspace.scaleReset': () => {
            this.workspaceScaleReset()
            this.$nextTick(() => {
              this.$root.$emit('toolbar-follow-phantom')
            })
          },
          'workspace.scaleUp': () => {
            this.workspaceScaleUp()
            this.$nextTick(() => {
              this.$root.$emit('toolbar-follow-phantom')
            })
          },
          'workspace.scaleUpBig': () => {
            this.workspaceScaleUpBig()
            this.$nextTick(() => {
              this.$root.$emit('toolbar-follow-phantom')
            })
          },
          'workspace.scaleDown': () => {
            this.workspaceScaleDown()
            this.$nextTick(() => {
              this.$root.$emit('toolbar-follow-phantom')
            })
          },
          'workspace.scaleDownBig': () => {
            this.workspaceScaleDownBig()
            this.$nextTick(() => {
              this.$root.$emit('toolbar-follow-phantom')
            })
          },
          'console2.scaleReset': this.console2ScaleReset.bind(this),
          'console2.scaleUp': this.console2ScaleUp.bind(this),
          'console2.scaleUpBig': this.console2ScaleUpBig.bind(this),
          'console2.scaleDown': this.console2ScaleDown.bind(this),
          'console2.scaleDownBig': this.console2ScaleDownBig.bind(this),
          'console1.scaleReset': this.console1ScaleReset.bind(this),
          'console1.scaleUp': this.console1ScaleUp.bind(this),
          'console1.scaleUpBig': this.console1ScaleUpBig.bind(this),
          'console1.scaleDown': this.console1ScaleDown.bind(this),
          'console1.scaleDownBig': this.console1ScaleDownBig.bind(this),
          'turtle.scaleReset': this.turtleScaleReset.bind(this),
          'turtle.scaleUp': this.turtleScaleUp.bind(this),
          'turtle.scaleUpBig': this.turtleScaleUpBig.bind(this),
          'turtle.scaleDown': this.turtleScaleDown.bind(this),
          'turtle.scaleDownBig': this.turtleScaleDownBig.bind(this)
        }[choice]
        do_it()
      },
      title (choice) {
        return this.$$t(`brick.pane.content.${choice}`) || this.$$t(`brick.pane.content.${choice.split('.').pop()}`)
      },
      changeLayout (args) {
        this.$emit('change-layout', args)
      },
      $$update () {
        var phantom = this.$refs.phantom.$el
        var invisible = !(phantom.offsetWidth || phantom.offsetHeight || phantom.getClientRects().length)
        var toolbar = this.$refs.toolbar.$el
        toolbar.style.display = invisible ? 'none' : ''
        if (!invisible) {
          var rect = phantom.getBoundingClientRect() // in viewport coordinates, may be fractional
          var change = 0
          var oldValue = toolbar.offsetWidth // in viewport coordinates, must be integer ?
          var newValue = phantom.offsetWidth
          var delta = newValue - oldValue
          if (delta) {
            toolbar.style.width = `${newValue}px`
            // console.log(`width: ${oldValue} -> ${newValue}`, toolbar.style.width)
            change = Math.max(Math.round(Math.abs(delta)), change)
          }
          oldValue = toolbar.offsetLeft
          newValue = rect.left
          delta = newValue - oldValue
          if (delta) {
            toolbar.style.left = `${newValue}px`
            // console.log(`left: ${oldValue} -> ${newValue}`, toolbar.style.left, toolbar.offsetLeft)
            change = Math.max(Math.round(Math.abs(delta)), change)
          }
          oldValue = toolbar.offsetTop
          newValue = rect.top
          delta = newValue - oldValue
          if (delta) {
            toolbar.style.top = `${newValue}px`
            // console.log(`top: ${oldValue} -> ${newValue}`, toolbar.style.top, toolbar.offsetTop)
            change = Math.max(Math.round(Math.abs(delta)), change)
          }
          var bigChange = change > 1 // 1 can come out from rounding ±0.5
          var more = bigChange || this.wasBigChange
          this.wasBigChange = bigChange
          if (more) {
            this.$nextTick(() => {
              this.$root.$emit('toolbar-follow-phantom')
            })
          }
        }
      }
    }
  }
</script>

<style>
  .eyo-workbench .management.btn-toolbar {
    height: 1.75rem;
    padding: 0;
  }
  .eyo-workbench .management.btn-toolbar .eyo-dropdown .btn {
    padding-right: 1rem;
  }
  .eyo-workbench button.btn:focus {
    outline: none;
  }
  .eyo-workbench .management .layout .dropdown-item {
    vertical-align: middle;
    line-height: 0.75rem;
    padding:0;
    text-align: center;
  }
  .eyo-workbench .mw-4rem>.dropdown-menu {
    width: calc(0.75 * 5rem); /**/
    min-width: calc(0.75 * 5rem);
  }
  .eyo-workbench .eyo-dropdown-tools .btn {
    padding: 0 0.5rem;
  }
  .eyo-flyout-toolbar .dropdown-menu {
    height: auto;
    overflow: auto;
    overflow-x: hidden;
  }
</style>
