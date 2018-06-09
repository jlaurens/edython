<template>
  <div id="eyo-panels" v-bind:style="{ paddingTop: this.eYo.FlyoutDelegate.prototype.HEIGHT.toString().replace(',', '.') + 'px' }">
    <div id="eyo-panels-toolbar" v-bind:style="{ fontFamily: eYo.Font.familySans, height: this.eYo.FlyoutDelegate.prototype.HEIGHT.toString().replace(',', '.') + 'px', top: '-'+this.eYo.FlyoutDelegate.prototype.HEIGHT.toString().replace(',', '.') + 'px'}">
      <div id="eyo-panels-toolbar-select" v-bind:style="{ paddingTop: this.eYo.FlyoutDelegate.prototype.MARGIN.toString().replace(',', '.') + 'px', paddingBottom: this.eYo.FlyoutDelegate.prototype.MARGIN.toString().replace(',', '.') + 'px', paddingLeft: this.Blockly.BlockSvg.TAB_WIDTH.toString().replace(',', '.') + 'px', paddingRight: this.Blockly.BlockSvg.TAB_WIDTH.toString().replace(',', '.') + 'px', fontFamily: this.eYo.Font.family,
      fontSize: this.eYo.Font.totalHeight + 'px'
  }">
        <b-dropdown id="eyo-panels-toolbar-dropdown">
          <template slot="button-content">
            {{titles[selected]}}
          </template>
          <b-dropdown-item-button v-on:click="selected = 'console'" v-bind:style="{fontFamily: eYo.Font.familySans, fontSize: eYo.Font.totalHeight}">{{titles.console}}</b-dropdown-item-button>
          <b-dropdown-item-button v-on:click="selected = 'turtle'" v-bind:style="{fontFamily: eYo.Font.familySans, fontSize: eYo.Font.totalHeight}">{{titles.turtle}}</b-dropdown-item-button>
        </b-dropdown>
      </div>
    </div>
    <div id="eyo-panels-content" v-bind:style="{ top: '-'+this.eYo.FlyoutDelegate.prototype.HEIGHT.toString().replace(',', '.') + 'px'}">
      <panel-console v-bind:style="{display: selected === 'console'?'block':'none'}"></panel-console>
      <panel-turtle v-bind:style="{display:selected === 'turtle'?'block':'none'}"></panel-turtle>
    </div>
  </div>
</template>

<script>
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
      'panel-console': PanelConsole,
      'panel-turtle': PanelTurtle
    }
  }
</script>

<style>
  #eyo-panels {
    background-color: white;
    width: 100%;
    height: 100%;
  }
  #eyo-panels-toolbar {
    position: relative;
    background-color:rgba(221,221,221,0.8);
    width: 100%;
  }
  #eyo-panels-toolbar-select {
    height: 100%;
    width: 100%;
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
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    text-align: left;
    padding-top: 0px;
    padding-bottom: 0px;
    vertical-align: baseline;
  }
  #eyo-panels-toolbar-dropdown .btn::after {
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
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
  }
</style>
