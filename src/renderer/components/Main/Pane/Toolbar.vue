<template>
  <b-btn-toolbar
    class="management"
    justify>
    <b-btn-group>&nbsp;</b-btn-group>
    <b-btn-group>
        <b-dd
        class="eyo-dropdown"
        :text="localized(what)">
        <b-dd-item-button
          v-for="pane in panes"
          v-on:click="selectedPane = pane"
          :key="pane"
          class="eyo-code">{{$$t(`block.pane.${pane.replace(/(^|\s)\S/g, l => l.toUpperCase())}`)}}</b-dd-item-button>
        <b-dd-divider></b-dd-divider>
        <b-dd-item-button
          v-for="layout in layouts"
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
</template>

<script>
  //  import BlockLayout from '@@/Util/BlockLayout.vue'
  import IconBase from '@@/Icon/IconBase.vue'
  import IconLayout from '@@/Icon/IconLayout.vue'
  import IconMenu from '@@/Icon/IconMenu.vue'

  import {mapState, mapMutations} from 'vuex'
  import {layoutcfg} from '@@/../store/modules/Layout'

  export default {
    name: 'eyo-workspace-management-toolbar',
    data: function () {
      return {
        selectedPane_: 'console1',
        selectedLayout_: 'F',
        chosen_: 'A',
        revertLayout: undefined
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
      }
    },
    computed: {
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
            this.$emit('change-layout', {
              what: newValue,
              where: this.where
            })
          })
        }
      },
      panes () {
        return layoutcfg.panes.filter(s => s !== this.what)
      },
      selectedLayout: {
        get () {
          return this.paneLayout
        },
        set (newValue) {
          this.$nextTick(() => {
            this.$emit('change-layout', {what: this.what, how: newValue})
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
          // console.error('NO CFG for position', this.paneLayout, this.where, Ls)
        }
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
      },
      ...mapState('Layout', [
        'paneLayout'
      ]),
      ...mapState('Layout', layoutcfg.where_whats)
    },
    methods: {
      localized (s) {
        return this.$$t(`block.pane.${s.replace(/(^|\s)\S/g, l => l.toUpperCase())}`)
      },
      choose (choice) {
        var do_it = {
          'console1.restart': () => {
            eYo.$$.bus.$emit('console1-restart')
          },
          'console1.erase': () => {
            eYo.$$.bus.$emit('console1-erase')
          },
          'console2.restart': () => {
            eYo.$$.bus.$emit('console2-restart')
          },
          'console2.erase': () => {
            eYo.$$.bus.$emit('console2-erase')
          },
          'turtle.replay': () => {
            eYo.$$.bus.$emit('turtle-replay')
          },
          'turtle.erase': () => {
            eYo.$$.bus.$emit('turtle-erase')
          },
          'turtle.scrollToVisible': () => {
            eYo.$$.bus.$emit('turtle-scroll')
          },
          'workspace.scaleReset': this.workspaceScaleReset,
          'workspace.scaleUp': this.workspaceScaleUp,
          'workspace.scaleUpBig': this.workspaceScaleUpBig,
          'workspace.scaleDown': this.workspaceScaleDown,
          'workspace.scaleDownBig': this.workspaceScaleDownBig,
          'console2.scaleReset': this.console2ScaleReset,
          'console2.scaleUp': this.console2ScaleUp,
          'console2.scaleUpBig': this.console2ScaleUpBig,
          'console2.scaleDown': this.console2ScaleDown,
          'console2.scaleDownBig': this.console2ScaleDownBig,
          'console1.scaleReset': this.console1ScaleReset,
          'console1.scaleUp': this.console1ScaleUp,
          'console1.scaleUpBig': this.console1ScaleUpBig,
          'console1.scaleDown': this.console1ScaleDown,
          'console1.scaleDownBig': this.console1ScaleDownBig,
          'turtle.scaleReset': this.turtleScaleReset,
          'turtle.scaleUp': this.turtleScaleUp,
          'turtle.scaleUpBig': this.turtleScaleUpBig,
          'turtle.scaleDown': this.turtleScaleDown,
          'turtle.scaleDownBig': this.turtleScaleDownBig
        }[choice]
        do_it()
      },
      title (choice) {
        return this.$$t(`block.pane.content.${choice}`) || this.$$t(`block.pane.content.${choice.split('.').pop()}`)
      },
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
      })
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
</style>
