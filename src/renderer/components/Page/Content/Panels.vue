<template>
  <div id="content-panels">
    <div id="eyo-panels-toolbar" v-bind:style="{ height: this.eYo.FlyoutDelegate.prototype.HEIGHT.toString().replace(',', '.') + 'px' }">
      <div id="eyo-panels-toolbar-select" v-bind:style="{ paddingTop: this.eYo.FlyoutDelegate.prototype.MARGIN.toString().replace(',', '.') + 'px', paddingBottom: this.eYo.FlyoutDelegate.prototype.MARGIN.toString().replace(',', '.') + 'px', paddingLeft: this.Blockly.BlockSvg.TAB_WIDTH.toString().replace(',', '.') + 'px', paddingRight: this.Blockly.BlockSvg.TAB_WIDTH.toString().replace(',', '.') + 'px'}">
        <b-dropdown id="eyo-panels-toolbar-dropdown" text="Dropdown Button">
          <b-dropdown-item>First Action</b-dropdown-item>
          <b-dropdown-item>Second Action</b-dropdown-item>
          <b-dropdown-item>Third Action</b-dropdown-item>
          <b-dropdown-divider></b-dropdown-divider>
          <b-dropdown-item>Something else here...</b-dropdown-item>
          <b-dropdown-item disabled>Disabled action</b-dropdown-item>
        </b-dropdown>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'content-panels',
    mounted: function () {
      console.log('MOUNTED PANELS', this.Blockly.BlockSvg.TAB_WIDTH)
    }
  }
</script>

<style>
  #content-panels {
    background-color: white;
    height: 100%;
  }
  #eyo-panels-toolbar {
    background-color: #DDD;
    opacity: 0.8;
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
  }
  #eyo-panels-toolbar-dropdown .btn::after {
    position: absolute;
    right: 5px;
    bottom: 5px;
  }
</style>
