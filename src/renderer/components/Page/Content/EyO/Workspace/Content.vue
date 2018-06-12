<template>
  <div id="eyo-workspace-content">
    <b-dropdown id="eyo-flyout-dropdown" class="eyo-dropdown">
      <template slot="button-content">
        {{titles[selected]}}
      </template>
      <b-dropdown-item-button v-on:click="selected = 'basic'" v-bind:style="{fontFamily: eYo.Font.familySans}">{{titles.basic}}</b-dropdown-item-button>
      <b-dropdown-item-button v-on:click="selected = 'intermediate'" v-bind:style="{fontFamily: eYo.Font.familySans}">{{titles.intermediate}}</b-dropdown-item-button>
      <b-dropdown-item-button v-on:click="selected = 'advanced'" v-bind:style="{fontFamily: eYo.Font.familySans}">{{titles.advanced}}</b-dropdown-item-button>
      <b-dropdown-item-button v-on:click="selected = 'expert'" v-bind:style="{fontFamily: eYo.Font.familySans}">{{titles.expert}}</b-dropdown-item-button>
      <b-dropdown-divider></b-dropdown-divider>
      <b-dropdown-item-button v-on:click="selected = 'branching'" v-bind:style="{fontFamily: eYo.Font.familySans}">{{titles.branching}}</b-dropdown-item-button>
      <b-dropdown-item-button v-on:click="selected = 'looping'" v-bind:style="{fontFamily: eYo.Font.familySans}">{{titles.looping}}</b-dropdown-item-button>
      <b-dropdown-item-button v-on:click="selected = 'function'" v-bind:style="{fontFamily: eYo.Font.familySans}">{{titles.function}}</b-dropdown-item-button>
    </b-dropdown>
  </div>
</template>

<script>
  export default {
    name: 'eyo-workspace-content',
    data: function () {
      return {
        selected: 'basic',
        titles: {
          basic: eYo.Msg.BASIC,
          intermediate: eYo.Msg.INTERMEDIATE,
          advanced: eYo.Msg.ADVANCED,
          expert: eYo.Msg.EXPERT,
          branching: eYo.Msg.BRANCHING,
          looping: eYo.Msg.LOOPING,
          function: eYo.Msg.FUNCTION
        },
        workspace: null,
        flyout: null
      }
    },
    watch: {
      // whenever question changes, this function will run
      selected: function (newValue, oldValue) {
        this.doSelect(newValue)
      }
    },
    methods: {
      doSelect: function (category) {
        if (this.workspace && this.flyout) {
          var list = this.workspace.eyo.getFlyoutsForCategory(category)
          if (list.length) {
            this.flyout.show(list)
          }
        }
      }
    },
    mounted: function () {
      var options = {
        collapse: true,
        comments: false,
        disable: true,
        maxBlocks: Infinity,
        trashcan: true,
        horizontalLayout: false,
        toolboxPosition: 'start',
        css: true,
        media: 'static/media/',
        rtl: false,
        scrollbars: true,
        sounds: true,
        oneBasedIndex: true
      }
      eYo.App.flyoutDropDown = document.getElementById('eyo-flyout-dropdown')
      goog.dom.removeNode(eYo.App.flyoutDropDown)
      this.workspace = eYo.App.workspace = Blockly.inject('eyo-workspace-content', options)
      eYo.setup(eYo.App.workspace)
      eYo.App.workspace.eyo.options = {
        noLeftSeparator: true,
        noDynamicList: false
      }
      eYo.KeyHandler.setup(document)
      var b = eYo.DelegateSvg.newBlockReady(eYo.App.workspace, eYo.T3.Stmt.start_stmt)
      b.render()
      b.moveBy(50, 150)
      var flyout = new eYo.Flyout(eYo.App.workspace)
      goog.dom.insertSiblingAfter(
        flyout.createDom('svg'), eYo.App.workspace.getParentSvg())
      // workspace.flyout_ = flyout does not work, flyout too big
      flyout.init(eYo.App.workspace)
      flyout.autoClose = false
      Blockly.Events.disable()
      try {
        flyout.show(eYo.DelegateSvg.T3s)//, seYo.T3.Expr.key_datum, eYo.T3.Stmt.if_part
      } catch (err) {
        console.log(err)
      } finally {
        Blockly.Events.enable()
      }
      // eYo.App.workspace.flyout_ = flyout
      this.flyout = eYo.App.flyout = flyout
      this.doSelect(this.selected)
      this.workspace.render()
      var self = this
      eYo.App.bus.$on('new-document', function () {
        self.workspace.clear()
      })
    }
  }
</script>

<style>
  #eyo-workspace-content {
    margin: 0;
    padding: 0;
    border-radius: 0px;
    height: 100%;
  }
  .eyo-flyout-select {
    opacity: 1;
  }
  #eyo-flyout-dropdown {
    opacity: 1;
    width: 100%;
    height: 100%;
  }
  #eyo-flyout-dropdown .btn {
    width: 100%;
  }
</style>
