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
          <icon-layout :keyx="layout"/></icon-base></b-dd-item-button>
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
        selectedPane_: 'console',
        selectedLayout_: 'F',
        chosen_: 'A'
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
          console: [
            'console.restart',
            'console.erase'
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
          console: [
            'console.scaleReset',
            'console.scaleUp',
            'console.scaleDown'
          ],
          turtle: [
            'turtle.scaleReset',
            'turtle.scaleUp',
            'turtle.scaleDown'
          ],
          workspace: [
            'workspace.scaleReset',
            'workspace.scaleUp',
            'workspace.scaleDown'
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
          'console.restart': () => {
            eYo.$$.bus.$emit('console-restart')
          },
          'console.erase': () => {
            eYo.$$.bus.$emit('console-erase')
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
          'workspace.scaleDown': this.workspaceScaleDown,
          'console.scaleReset': this.consoleScaleReset,
          'console.scaleUp': this.consoleScaleUp,
          'console.scaleDown': this.consoleScaleDown,
          'turtle.scaleReset': this.turtleScaleReset,
          'turtle.scaleUp': this.turtleScaleUp,
          'turtle.scaleDown': this.turtleScaleDown
        }[choice]
        do_it()
      },
      title (choice) {
        return this.$$t(`block.pane.content.${choice}`) || this.$$t(`block.pane.content.${choice.split('.').pop()}`)
      },
      ...mapMutations('Workspace', {
        workspaceScaleUp: 'scaleUp',
        workspaceScaleDown: 'scaleDown',
        workspaceScaleReset: 'scaleReset'
      }),
      ...mapMutations('Console', {
        consoleScaleUp: 'scaleUp',
        consoleScaleDown: 'scaleDown',
        consoleScaleReset: 'scaleReset'
      }),
      ...mapMutations('Turtle', {
        turtleScaleUp: 'scaleUp',
        turtleScaleDown: 'scaleDown',
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
