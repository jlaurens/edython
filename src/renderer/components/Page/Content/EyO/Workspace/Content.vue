<template>
  <div id="eyo-workspace-content">
    <icon-base id="svg-control-image-v" icon-name="triangle"><icon-triangle /></icon-base>
    <b-dropdown id="eyo-flyout-dropdown-general" class="eyo-dropdown"  v-on:show="doShow()">
      <template slot="button-content">
        {{selectedCategory && selectedCategory.in_category ? selectedCategory.content : 'blocs'}}
      </template>
      <b-dropdown-item-button v-for="item in levels" v-on:click="selectedCategory = item" v-bind:style="{fontFamily: $$.eYo.Font.familySans}">{{item.content}}</b-dropdown-item-button>
      <b-dropdown-divider></b-dropdown-divider>
      <b-dropdown-item-button v-for="item in categories" v-on:click="selectedCategory = item" v-bind:style="{fontFamily: $$.eYo.Font.familySans}">{{item.content}}</b-dropdown-item-button>
    </b-dropdown>
    <b-dropdown id="eyo-flyout-dropdown-module" class="eyo-dropdown"  v-on:show="doShow()">
    <template slot="button-content">
        {{selectedCategory && selectedCategory.in_module ? selectedCategory.content : 'modules'}}
    </template>
    <b-dropdown-item-button v-for="item in modules" v-on:click="selectedCategory = item" v-bind:style="{fontFamily: $$.eYo.Font.familySans}">{{item.content}}</b-dropdown-item-button>
  </b-dropdown>
  </div>
</template>

<script>
  import IconBase from '@@/IconBase.vue'
  import IconTriangle from '@@/Icon/IconTriangle.vue'
  import IconBug from '@@/Icon/IconBug.vue'

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
          content: eYo.Msg[name.toUpperCase()],
          in_category: true
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
      var moduleF = function (name, content) {
        model.items[name + '__module'] = {
          name: name + '__module',
          content: content || name,
          in_module: true
        }
      }
      moduleF('basic_math', 'math (basic)')
      moduleF('math')
      moduleF('basic_random', 'random (basic)')
      moduleF('random')
      moduleF('basic_turtle', 'turtle (basic)')
      moduleF('turtle')
      moduleF('cmath')
      model.selectedCategory = undefined
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
        model.items.basic_math__module,
        model.items.math__module,
        model.items.basic_random__module,
        model.items.random__module,
        model.items.basic_turtle__module,
        model.items.turtle__module,
        model.items.cmath__module
      ]
      return model
    },
    computed: {
      flyoutClosed: function () {
        return this.$store.state.UI.flyoutClosed
      },
      flyoutCategory: function () {
        return this.$store.state.UI.flyoutCategory
      }
    },
    watch: {
      flyoutClosed: function (newValue, oldValue) {
        this.flyout && this.flyout.eyo.doSlide(newValue)
      },
      flyoutCategory: function (newValue, oldValue) {
        var item = this.items[newValue]
        if (this.workspace && this.flyout && item) { // this.workspace is necessary
          var list = this.flyout.eyo.getList(newValue)
          if (list && list.length) {
            this.flyout.show(list)
            this.selectedCategory = item
          }
        }
      },
      // whenever `selectedCategory` changes, this function will run
      selectedCategory: function (newValue, oldValue) {
        if (newValue) {
          this.$store.commit('UI_SET_FLYOUT_CATEGORY', newValue.name)
        }
      }
    },
    methods: {
      doShow () {
        var el = document.getElementById('eyo-workspace-content').getElementsByClassName('eyo-flyout')[0]
        this.$$.eYo.Tooltip.hideAll(el)
      }
    },
    mounted: function () {
      // the workspace
      var staticOptions = {
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
      var workspace = this.workspace = this.$$.eYo.App.workspace = Blockly.inject('eyo-workspace-content', staticOptions)
      eYo.setup(workspace)
      workspace.eyo.options = {
        noLeftSeparator: true,
        noDynamicList: false
      }
      // Get what will replace the old flyout selector
      this.$$.eYo.App.flyoutDropDownGeneral = document.getElementById('eyo-flyout-dropdown-general')
      this.$$.eYo.App.flyoutDropDownModule = document.getElementById('eyo-flyout-dropdown-module')
      goog.dom.removeNode(this.$$.eYo.App.flyoutDropDownGeneral)
      goog.dom.removeNode(this.$$.eYo.App.flyoutDropDownModule)
      // First remove the old flyout selector
      var flyout = new eYo.Flyout(eYo.App.workspace)
      goog.dom.insertSiblingAfter(
        flyout.createDom('svg'),
        eYo.App.workspace.getParentSvg()
      )
      // Then create the flyout
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
      var store = this.$store
      flyout.eyo.slide = function (closed) {
        if (!goog.isDef(closed)) {
          closed = !store.state.UI.flyoutClosed
        }
        store.commit('UI_SET_FLYOUT_CLOSED', closed) // beware of reentrancy
      }
      var oldSvg = document.getElementById('svg-control-image')
      var newSvg = document.getElementById('svg-control-image-v')
      oldSvg.parentNode.appendChild(newSvg)
      newSvg.parentNode.removeChild(oldSvg)
      // JL: critical section of code,
      // next instruction does not work despite what stackoverflow states
      // oldSvg && newSvg && oldSvg.parentNode.replaceChild(oldSvg, newSvg)
      eYo.KeyHandler.setup(document)
      var self = this
      this.$$.bus.$on('new-document', function () {
        self.workspace.clear()
      })
      this.selectedCategory = this.items.basic
      this.workspace.render()
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
  #eyo-flyout-dropdown-general, #eyo-flyout-dropdown-module {
    opacity: 1;
    width: 100%;
    height: 100%;
  }
  #eyo-flyout-dropdown-general .btn, #eyo-flyout-dropdown-module .btn {
    width: 100%;
  }
</style>
