<template>
  <div id="eyo-workspace-content">
    <icon-base id="svg-control-image-v" icon-name="triangle"><icon-triangle /></icon-base>
    <div id="eyo-flyout-toolbar-switcher">
      <b-button-group id="eyo-flyout-switcher">
        <b-dropdown id="eyo-flyout-dropdown-general" class="eyo-dropdown"  v-on:show="doShow()">
          <template slot="button-content">Blocs</template>
          <b-dropdown-item-button v-for="item in levels" v-on:click="selectedCategory = item" v-bind:style="{fontFamily: $$.eYo.Font.familySans}" :key="item.content">{{item.content}}</b-dropdown-item-button>
          <b-dropdown-divider></b-dropdown-divider>
          <b-dropdown-item-button v-for="item in categories" v-on:click="selectedCategory = item" v-bind:style="{fontFamily: $$.eYo.Font.familySans}" :key="item.content">{{item.content}}</b-dropdown-item-button>
        </b-dropdown>
        <b-dropdown id="eyo-flyout-dropdown-module" class="eyo-dropdown"  v-on:show="doShow()">
          <template slot="button-content">Module&nbsp;</template>
          <b-dropdown-item-button v-for="item in modules" v-on:click="selectedCategory = item" v-bind:style="{fontFamily: $$.eYo.Font.familySans}" :key="item.content">{{item.content}}</b-dropdown-item-button>
        </b-dropdown>
      </b-button-group>
      <div id="eyo-flyout-toolbar-label">
        {{label}}
        <b-form-checkbox id="eyo-flyout-toolbar-label-check"
                        v-model="isBasic"
                        value="basic"
                        unchecked-value=""
                        v-if="canBasic"
                        button-variant="light">
          basic
        </b-form-checkbox>
      </div>
    </div>
  </div>
</template>

<script>
  import IconBase from '@@/IconBase.vue'
  import IconTriangle from '@@/Icon/IconTriangle.vue'
  import IconBug from '@@/Icon/IconBug.vue'

  export default {
    key: 'eyo-workspace-content',
    components: {
      IconBase,
      IconTriangle,
      IconBug
    },
    data: function () {
      var model = {
        items: {},
        workspace: null,
        flyout: null,
        label: '...',
        isBasic: true,
        selectedCategory: undefined
      }
      var Msg = eYo.Msg
      var F = function (name) {
        model.items[name] = {
          key: name,
          content: Msg[name.toUpperCase()],
          in_category: true,
          label: 'Blocs ' + Msg[name.toUpperCase()]
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
        var content = 'basic_' + name
        var basic_module = content + '__module'
        model.items[basic_module] = {
          key: basic_module,
          content: content,
          in_module: true,
          label: 'Module ' + name
        }
        var module = name + '__module'
        model.items[module] = {
          key: module,
          content: name,
          in_module: true,
          label: 'Module ' + name,
          basic: model.items[basic_module]
        }
        model.items[basic_module].full = model.items[module]
      }
      moduleF('turtle')
      moduleF('math')
      moduleF('random')
      moduleF('cmath')
      moduleF('decimal')
      moduleF('fraction')
      moduleF('statistics')
      moduleF('string')
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
        model.items.turtle__module,
        model.items.math__module,
        model.items.decimal__module,
        model.items.fraction__module,
        model.items.statistics__module,
        model.items.random__module,
        model.items.cmath__module,
        model.items.string__module
      ]
      return model
    },
    computed: {
      flyoutClosed: function () {
        return this.$store.state.UI.flyoutClosed
      },
      flyoutCategory: function () {
        return this.$store.state.UI.flyoutCategory
      },
      canBasic () {
        return this.selectedCategory && this.selectedCategory.in_module
      }
    },
    watch: {
      flyoutClosed: function (newValue, oldValue) {
        this.flyout && this.flyout.eyo.doSlide(newValue)
      },
      flyoutCategory: function (newValue, oldValue) {
        console.log(newValue, oldValue)
        var item = this.items[newValue]
        if (this.workspace && this.flyout && item) { // this.workspace is necessary
          var list = this.flyout.eyo.getList(newValue)
          if (list && list.length) {
            this.flyout.show(list)
            this.selectedCategory = (this.isBasic && item.basic) || item
          }
        }
      },
      // whenever `selectedCategory` changes, this function will run
      selectedCategory: function (newValue, oldValue) {
        if (newValue) {
          this.$store.commit('UI_SET_FLYOUT_CATEGORY', newValue.key)
          this.label = newValue.label
        }
      },
      // whenever `selectedCategory` changes, this function will run
      isBasic: function (newValue, oldValue) {
        var item = this.selectedCategory
        if (newValue && item.basic) {
          this.selectedCategory = item.basic
        } else if (!newValue && item.full) {
          this.selectedCategory = item.full
        }
      }
    },
    methods: {
      doShow () {
        var el = document.getElementById('eyo-workspace-content').getElementsByClassName('eyo-flyout')[0]
        eYo.Tooltip.hideAll(el)
      }
    },
    mounted () {
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
      var workspace = this.workspace = eYo.App.workspace = Blockly.inject('eyo-workspace-content', staticOptions)
      eYo.setup(workspace)
      workspace.eyo.options = {
        noLeftSeparator: true,
        noDynamicList: false
      }
      // Get what will replace the old flyout selector
      eYo.App.flyoutToolbarSwitcher = document.getElementById('eyo-flyout-toolbar-switcher')
      goog.dom.removeNode(eYo.App.flyoutToolbarSwitcher)
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
        flyout.show(eYo.DelegateSvg.T3s)//, eYo.T3.Expr.key_datum, eYo.T3.Stmt.if_part
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
  #eyo-flyout-toolbar-switcher {
    position: relative;
    width: 100%;
  }
  #eyo-flyout-switcher {
    width: 100%;
  }
  #eyo-flyout-switcher .btn {
    width: 100%;
    padding-top: 0;
    padding-bottom: 0;
  }
  #eyo-flyout-toolbar-label {
    width: 100;
    padding: 0.25rem;
    background: #e3e3e3;
    font-style: italic;
    color: #666666;
    text-align: center;
  }
  #eyo-flyout-switcher .eyo-dropdown.btn-group.b-dropdown.dropdown {
    width: 50%;
  }
  #eyo-flyout-toolbar-switcher .eyo-round-btn {
    top: 0;
  }
</style>
