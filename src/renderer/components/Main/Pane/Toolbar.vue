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
    class="eyo-dropdown-tools">
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
      v-on:click="chosen = choice"
      :key="choice"
      class="eyo-code">{{choice}}</b-dd-item-button>
    </b-dd>
  </b-btn-toolbar>
</template>

<script>
  //  import BlockLayout from '@@/Util/BlockLayout.vue'
  import IconBase from '@@/Icon/IconBase.vue'
  import IconLayout from '@@/Icon/IconLayout.vue'
  import IconMenu from '@@/Icon/IconMenu.vue'

  import {mapState} from 'vuex'

  export default {
    name: 'eyo-workspace-management-toolbar',
    data: function () {
      return {
        selectedPane_: 'console',
        selectedLayout_: 'f',
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
        default: 'f' /* One of 'f', 'v1', 'v2', 'vv1', 'vv2', 'h1', 'h2', 'hh1', 'hh2' */
      },
      what: {
        type: String,
        default: undefined
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
          this.$emit('change-layout', {
            what: newValue,
            where: this.where
          })
        }
      },
      panes () {
        return [
          'console',
          'workspace',
          'turtle'
        ].filter(s => s !== this.what)
      },
      selectedLayout: {
        get () {
          return this.paneLayout
        },
        set (newValue) {
          this.$emit('change-layout', {how: newValue})
        }
      },
      layouts () {
        return [
          'f',
          'h',
          'v' /*,
          'fh',
          'hf',
          'vf',
          'fv',
          'hh',
          'vv' */
        ].filter(s => s !== this.paneLayout)
      },
      chosen: {
        get () {
          return this.chosen_
        },
        set (newValue) {
          this.chosen_ = newValue
        }
      },
      choices () {
        return [
          'A', 'B', 'C'
        ]
      },
      ...mapState('Layout', [
        'paneLayout',
        'what_f',
        'what_h1',
        'what_h2',
        'what_hh1',
        'what_hh2',
        'what_v1',
        'what_v2',
        'what_vv1',
        'what_vv2'
      ])
    },
    methods: {
      localized (s) {
        return this.$$t(`block.pane.${s.replace(/(^|\s)\S/g, l => l.toUpperCase())}`)
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
</style>
