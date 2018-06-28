<template>
  <div id="eyo-workspace-content">
      <icon-base id="svg-control-image-v" icon-name="triangle"><icon-triangle /></icon-base>
      <b-dropdown id="eyo-flyout-dropdown" class="eyo-dropdown"  v-on:show="doShow()">
      <template slot="button-content">
        {{selected.content}}
      </template>
      <b-dropdown-item-button v-for="item in levels" v-on:click="selected = item" v-bind:style="{fontFamily: $eYo.Font.familySans}">{{item.content}}</b-dropdown-item-button>
      <b-dropdown-divider></b-dropdown-divider>
      <b-dropdown-item-button v-for="item in categories" v-on:click="selected = item" v-bind:style="{fontFamily: $eYo.Font.familySans}">{{item.content}}</b-dropdown-item-button>
      <b-dropdown-divider></b-dropdown-divider>
      <b-dropdown-header v-bind:style="{fontFamily: $eYo.Font.familySans}">{{modulesContent}}</b-dropdown-header>
      <b-dropdown-item-button v-for="item in modules" v-on:click="selected = item" v-bind:style="{fontFamily: $eYo.Font.familySans}">{{item.content}}</b-dropdown-item-button>
    </b-dropdown>
  </div>
</template>

<script>
  import IconBase from '../../../../IconBase.vue'
  import IconTriangle from '../../../../Icon/IconTriangle.vue'
  import IconBug from '../../../../Icon/IconBug.vue'

  export default {
    name: 'eyo-workspace-content',
    components: {
      IconBase,
      IconTriangle,
      IconBug
    },
    data: function () {
      var model = {
        items: {},
        workspace: null,
        flyout: null
      }
      var F = function (name) {
        model.items[name] = {
          name: name,
          content: eYo.Msg[name.toUpperCase()]
        }
      }
      F('basic')
      F('intermediate')
      F('expert')
      F('advanced')
      F('math')
      F('text')
      F('list')
      F('branching')
      F('looping')
      F('function')
      var moduleF = function (name) {
        model.items[name + '__module'] = {
          name: name,
          content: name
        }
      }
      moduleF('math')
      moduleF('random')
      moduleF('turtle')
      model.selected = model.items.basic
      model.levels = [
        model.items.basic,
        model.items.intermediate,
        model.items.advanced,
        model.items.expert
      ]
      model.categories = [
        model.items.math,
        model.items.text,
        model.items.list,
        model.items.branching,
        model.items.looping,
        model.items.function
      ]
      model.modules = [
        model.items.math__module,
        model.items.random__module,
        model.items.turtle__module
      ]
      model.modulesContent = 'modules'
      return model
    },
    watch: {
      // whenever `selected` changes, this function will run
      selected: function (newValue, oldValue) {
        this.doSelect(newValue)
      }
    },
    methods: {
      doSelect: function (item) {
        var category = item.name
        if (this.workspace && this.flyout) {
          var list = this.flyout.eyo.getList(category)
          if (list && list.length) {
            this.flyout.show(list)
          }
        }
      },
      doShow () {
        var el = document.getElementById('eyo-workspace-content').getElementsByClassName('eyo-flyout')[0]
        eYo.Tooltip.hideAll(el)
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
      this.$$.bus.$on('new-document', function () {
        self.workspace.clear()
      })
      var oldSvg = document.getElementById('svg-control-image')
      var newSvg = document.getElementById('svg-control-image-v')
      oldSvg.parentNode.appendChild(newSvg)
      newSvg.parentNode.removeChild(oldSvg)
      // JL: critical section of code,
      // next instruction does not work despite what stackoverflow states
      // oldSvg && newSvg && oldSvg.parentNode.replaceChild(oldSvg, newSvg)
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
  .eyo-flyout-control {
    vertical-align: middle;
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
