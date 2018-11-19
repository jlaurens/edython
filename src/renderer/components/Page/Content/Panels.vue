<template>
  <div id="eyo-panels-area">
    <div id="eyo-panels" ref="divPanels" :style="{width: panelsStyleWidth}">
      <div id="eyo-panels-toolbar" :style="{ fontFamily: $$.eYo.Font.familySans, fontSize: $$.eYo.Font.totalHeight + 'px' }">
        <div id="eyo-panels-toolbar-select">
          <b-dropdown id="eyo-panels-toolbar-dropdown" class="eyo-dropdown">
            <template slot="button-content">
              {{titles[selected]}}
            </template>
            <b-dropdown-item-button v-on:click="selectPanel($$.eYo.App.CONSOLE)" :style="{fontFamily: $$.eYo.Font.familySans, fontSize: $$.eYo.Font.totalHeight + 'px'}">{{titles.console}}</b-dropdown-item-button>
            <b-dropdown-item-button v-on:click="selectPanel($$.eYo.App.TURTLE)" v-bind:style="{fontFamily: $$.eYo.Font.familySans, fontSize: $$.eYo.Font.totalHeight + 'px'}">{{titles.turtle}}</b-dropdown-item-button>
          </b-dropdown>
        </div>
        <b-button id ="eyo-panels-toolbar-restart-python" class="eyo-round-btn" v-on:click="restart()" v-if="selected === $$.eYo.App.CONSOLE" title="Redémarrer l'interpréteur python" 
        v-tippy ><icon-base icon-name="restart" :width="26" :height="26"><icon-restart /></icon-base></b-button>
        <b-button id ="eyo-panels-toolbar-restart-turtle" class="eyo-round-btn" v-on:click="restart()" v-if="selected !== 'console'" title="Effacer les dessins de tortue" 
        v-tippy ><icon-base icon-name="replay" :width="26" :height="26"><icon-restart /></icon-base></b-button>
        <b-button id ="eyo-panels-toolbar-erase-python" class="eyo-round-btn" v-on:click="erase()" title="Effacer la console" 
        v-if="selected === $$.eYo.App.CONSOLE" v-tippy ><icon-base icon-name="erase console" :width="26" :height="26"><icon-erase /></icon-base></b-button>
        <b-button id ="eyo-panels-toolbar-erase-turtle" class="eyo-round-btn" v-on:click="erase()" title="Rejouer l'animation" 
        v-if="selected !== $$.eYo.App.CONSOLE" v-tippy ><icon-base icon-name="replay turtle" :width="26" :height="26"><icon-replay /></icon-base></b-button>
      </div>
      <div id="eyo-panels-content">
        <panel-console :visible="selected === $$.eYo.App.CONSOLE"></panel-console>
        <panel-turtle :visible="selected === $$.eYo.App.TURTLE"></panel-turtle>
      </div>
    </div>
  </div>
</template>

<script>
  import IconBase from '@@/Icon/IconBase.vue'
  import IconRestart from '@@/Icon/IconRestart.vue'
  import IconReplay from '@@/Icon/IconReplay.vue'
  import IconErase from '@@/Icon/IconErase.vue'

  import PanelConsole from './Panel/Console'
  import PanelTurtle from './Panel/Turtle'

  export default {
    name: 'content-panels',
    data: function () {
      return {
        titles: {
          console: 'Console',
          turtle: 'Tortue'
        },
        visible: undefined
      }
    },
    computed: {
      selected: function () {
        return this.$store.state.UI.selectedPanel
      },
      panelsStyleWidth: function () {
        if (this.visible === undefined) {
          this.visible = this.$store.state.UI.panelsVisible
        } else {
          if (this.visible !== this.$store.state.UI.panelsVisible) {
            this.visible = this.$store.state.UI.panelsVisible
            // console.log('change to', this.visible, this.$refs.divPanels.offsetWidth, window.innerWidth)
          }
        }
        return '100%'
      }
    },
    components: {
      PanelConsole,
      PanelTurtle,
      IconBase,
      IconRestart,
      IconReplay,
      IconErase
    },
    methods: {
      erase (arg) {
        this.$$.bus.$emit('erase-' + (arg || this.selected))
      },
      restart (arg) {
        this.$$.bus.$emit('restart-' + (arg || this.selected))
      },
      selectPanel (arg) {
        this.$store.commit('UI_SET_SELECTED_PANEL', arg)
      }
    }
  }
</script>

<style>
  #eyo-panels-area {
    width: 100%;
    height: 100%;
  }
  #eyo-panels {
    height: 100%;
  }
  #eyo-panels-toolbar {
    position: relative;
    width: 100%;
    padding: 0.25rem;
    margin-top: 0;
    margin-bottom: 0.25rem;
  }
  #eyo-panels-toolbar-select {
    height: 100%;
    width: calc(100% - 4rem);
    max-width: 12rem;
  }
  #eyo-panels-toolbar-dropdown {
    box-sizing: border-box;
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    width: 100%;
    height: 100%;
  }
  #eyo-panels-toolbar-dropdown .btn {
    width: 100%;
  }
  .eyo-dropdown .btn {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    text-align: left;
    padding-top: 0px;
    padding-bottom: 0px;
    vertical-align: baseline;
  }
  .eyo-dropdown .btn::after {
    position: absolute;
    right: 0.2rem;
    bottom: 0.25rem;
    opacity: 0.666;
  }
  .dropdown-menu {
    padding: 0;
    margin: 0;
    vertical-align: baseline;
  }
  .dropdown-divider {
    margin: 0px;
  }
  .btn {
    font-size: 1.1rem;
  }
  .dropdown-item {
    font-size: 1.1rem;
    margin: 0;
    vertical-align: baseline;
    padding: 2px 20px 2px 8px;
    white-space: nowrap;
  }
  .dropdown-item:hover {
    background-color: #d6e9f8;
  }
  #eyo-panels-content {
    position: relative;
    width: 100%;
    height: calc(100% - 2.5rem);
  }
  .eyo-round-btn.btn {
    padding: 0px;
    top: 0.25rem;
    right: 0;
    height: 1.75rem;
    width: 1.75rem;
    vertical-align: middle;
    border-radius: 0.875rem;
    color: white;
    position: absolute;
  }
  #eyo-panels-toolbar-restart-python, #eyo-panels-toolbar-restart-turtle {
    right: 0.25rem;
  }
  #eyo-panels-toolbar-erase-turtle,
  #eyo-panels-toolbar-erase-python {
    right: 2.25rem;
  }
</style>
