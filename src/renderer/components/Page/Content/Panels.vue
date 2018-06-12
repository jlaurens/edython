<template>
  <div id="eyo-panels">
    <div id="eyo-panels-toolbar" :style="{ fontFamily: eYo.Font.familySans,
    fontSize: this.eYo.Font.totalHeight + 'px'
  }">
      <div id="eyo-panels-toolbar-select">
        <b-dropdown id="eyo-panels-toolbar-dropdown" class="eyo-dropdown">
          <template slot="button-content">
            {{titles[selected]}}
          </template>
          <b-dropdown-item-button v-on:click="selected = 'console'" :style="{fontFamily: eYo.Font.familySans, fontSize: eYo.Font.totalHeight + 'px'}">{{titles.console}}</b-dropdown-item-button>
          <b-dropdown-item-button v-on:click="selected = 'turtle'" v-bind:style="{fontFamily: eYo.Font.familySans, fontSize: eYo.Font.totalHeight}">{{titles.turtle}}</b-dropdown-item-button>
        </b-dropdown>
      </div>
      <b-button id ="eyo-panels-toolbar-restart" class="eyo-round-btn" v-bind:style="{fontFamily: eYo.Font.familySans, fontSize: eYo.Font.totalHeight + 'px'}" v-on:click="restart()" :disabled="selected !== 'console'" ><icon-base icon-name="restart"><icon-restart /></icon-base></b-button>
      <b-button id ="eyo-panels-toolbar-erase" class="eyo-round-btn" v-bind:style="{fontFamily: eYo.Font.familySans, fontSize: eYo.Font.totalHeight + 'px'}" v-on:click="erase()" :disabled="selected !== 'console'" ><icon-base icon-name="erase"><icon-erase /></icon-base></b-button>
  </div>
    <div id="eyo-panels-content">
      <panel-console v-bind:style="{ display: selected === 'console'? 'block': 'none'}"></panel-console>
      <panel-turtle v-bind:style="{ display: selected === 'turtle'? 'block': 'none'}"></panel-turtle>
    </div>
  </div>
</template>

<script>
  import IconBase from '../../IconBase.vue'
  import IconRestart from '../../Icon/IconRestart.vue'
  import IconErase from '../../Icon/IconErase.vue'

  import PanelConsole from './Panel/Console'
  import PanelTurtle from './Panel/Turtle'

  export default {
    name: 'content-panels',
    data: function () {
      return {
        selected: 'console',
        titles: {
          console: 'Console',
          turtle: 'Tortue'
        }
      }
    },
    components: {
      PanelConsole,
      PanelTurtle,
      IconBase,
      IconRestart,
      IconErase
    },
    mounted: function () {
      var self = this
      eYo.App.bus.$on('new-document', function () {
        self.restart('console')
        self.restart('turtle')
      })
    },
    methods: {
      erase: function (arg) {
        eYo.App.bus.$emit('erase-' + (arg || this.selected))
      },
      restart: function (arg) {
        eYo.App.bus.$emit('restart-' + (arg || this.selected))
      }
    }
  }
</script>

<style>
  #eyo-panels {
    width: 100%;
    height: 100%;
  }
  #eyo-panels-toolbar {
    position: relative;
    width: 100%;
    padding: 0.25rem;
    margin-top: 0.25rem;
    margin-bottom: 0.25rem;
  }
  #eyo-panels-toolbar-select {
    height: 100%;
    width: calc(100% - 4rem);
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
    right: 5px;
    bottom: 5px;
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
    width: 100%;
    height: calc(100% - 2.5rem);
  }
  .eyo-round-btn {
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
  #eyo-panels-toolbar-restart {
    right: 0.25rem;
  }
  #eyo-panels-toolbar-erase {
    right: 2.25rem;
  }
</style>
