<template>
  <div
    class="content"
    ref="elContent">
    <div
      id="eyo-workspace-content"
      ref="elInner">
      <div
        v-show="false">
        <icon-base
          ref="svg_control_image_v"
          icon-name="triangle"
        ><icon-triangle /></icon-base>
      </div>
      <div
        id="eyo-flyout-toolbar-switcher"
        ref="switcher">
        <b-btn-group
          id="eyo-flyout-switcher"
          >
          <b-dd
            id="eyo-flyout-dropdown-general"
            variant="secondary"
            class="eyo-dropdown">
            <template
              slot="button-content">Blocs</template>
            <b-dd-item-button
              v-for="item in levels"
              @click="selectCategory(item)"
              :style="{fontFamily: $$.eYo.Font.familySans}"
              :key="item.content"
            >{{item.content}}</b-dd-item-button>
            <b-dd-divider></b-dd-divider>
            <b-dd-item-button
              v-for="item in categories"
              @click="selectCategory(item)"
              :style="{fontFamily: $$.eYo.Font.familySans}"
              :key="item.content"
              >{{item.content}}</b-dd-item-button>
          </b-dd>
          <b-dd
            id="eyo-flyout-dropdown-module"
            variant="secondary"
            class="eyo-dropdown">
            <template
              slot="button-content">Module&nbsp;</template>
            <b-dd-item-button
              v-for="item in modules"
              @click="selectCategory(item)"
              :style="{fontFamily: $$.eYo.Font.familySans}"
              :key="item.content"
              >{{item.content}}</b-dd-item-button>
          </b-dd>
        </b-btn-group>
        <div
          id="eyo-flyout-toolbar-label">
          <div
            class="item">{{label}}</div>
          <div
            v-if="canBasic"
            class="item">
            <input
              type="checkbox"
              id="eyo-flyout-toolbar-label-check"
              v-model="isBasic">
            {{$$t('message.flyout.basic')}}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {mapState, mapGetters, mapMutations} from 'vuex'
  import ResizeSensor from 'css-element-queries/src/ResizeSensor'

  import IconBase from '@@/Icon/IconBase.vue'
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
        label: '...',
        isBasic: true,
        selectedCategory: undefined,
        resizeSensor: null
      }
      var Msg = eYo.Msg
      var F = (name) => {
        model.items[name] = {
          key: name,
          content: Msg[name.toUpperCase()],
          in_category: true,
          label: this.$$t('message.flyout.blocks').replace('{{key}}', Msg[name.toUpperCase()])
        }
        if (!Msg[name.toUpperCase()]) {
          console.error('MISSING eYo.Msg.' + name.toUpperCase())
        }
      }
      F('basic')
      F('intermediate')
      F('advanced')
      F('expert')
      F('math')
      F('text')
      F('list')
      F('branching')
      F('looping')
      F('function')
      var moduleF = (name) => {
        var content = 'basic_' + name
        var basic_module = content + '__module'
        model.items[basic_module] = {
          key: basic_module,
          content: content,
          in_module: true,
          label: this.$$t('message.flyout.module').replace('{{key}}', name)
        }
        var module = name + '__module'
        model.items[module] = {
          key: module,
          content: name,
          in_module: true,
          label: this.$$t('message.flyout.module').replace('{{key}}', name),
          basic: model.items[basic_module]
        }
        model.items[basic_module].full = model.items[module]
      }
      moduleF('turtle')
      moduleF('math')
      moduleF('random')
      moduleF('cmath')
      moduleF('decimal') // broken in brython https://github.com/brython-dev/brython/issues/989
      moduleF('fractions')
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
        // model.items.decimal__module,
        model.items.fractions__module,
        model.items.statistics__module,
        model.items.random__module,
        model.items.cmath__module,
        model.items.string__module
      ]
      return model
    },
    computed: {
      ...mapState('Workspace', [
        'flyoutCategory',
        'flyoutClosed'
      ]),
      ...mapGetters('Workspace', [
        'scaleFactor'
      ]),
      ...mapState('UI', {
        selectedMode: state => state.selectedMode
      }),
      canBasic () {
        return this.selectedCategory && this.selectedCategory.in_module && ((this.selectedMode !== eYo.App.TUTORIAL && this.selectedMode !== eYo.App.BASIC) || !this.isBasic)
      }
    },
    watch: {
      scaleFactor (newValue, oldValue) {
        this.$$resize()
      },
      flyoutClosed (newValue, oldValue) {
        eYo.App.flyout && eYo.App.flyout.eyo.doSlide(newValue)
      },
      flyoutCategory (newValue, oldValue) {
        var item = this.items[newValue]
        if (eYo.App.workspace && eYo.App.flyout && item) { // this.workspace is necessary
          var list = eYo.App.flyout.eyo.getList(newValue)
          if (list && list.length) {
            eYo.App.flyout.show(list)
            eYo.App.selectedCategory = item
            eYo.App.isBasic = !item.basic
          }
        }
      },
      // whenever `selectedCategory` changes, this function will run
      selectedCategory: function (newValue, oldValue) {
        if (!oldValue || (newValue !== oldValue)) {
          var content = this.$refs.elInner
          if (content) {
            var el = content.getElementsByClassName('eyo-flyout')[0]
            eYo.Tooltip.hideAll(el)
            this.setFlyoutCategory(newValue.key)
            this.label = newValue.label
          }
        }
      },
      // whenever `isBasic` changes, this function will run
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
      ...mapMutations('Workspace', [
        'setFlyoutCategory',
        'setFlyoutClosed'
      ]),
      willUnplace () { // this is necessary due to the scale feature
        if (this.resizeSensor) {
          this.resizeSensor.detach()
          this.resizeSensor = null
        }
      },
      didPlace () { // this is necessary due to the scale feature
        this.resizeSensor && this.resizeSensor.detach()
        this.resizeSensor = new ResizeSensor(this.$refs.elContent, () => {
          this.$$resize()
        })
        this.$$resize()
      },
      $$resize: function (e) {
        var content = this.$refs.elContent
        var w = content.offsetWidth
        var h = content.offsetHeight
        var newW = w / this.scaleFactor
        var newH = h / this.scaleFactor
        var inner = this.$refs.elInner
        inner.style.position = 'relative'
        inner.style.width = `${newW}px`
        inner.style.height = `${newH}px`
        inner.style.left = `${(w - newW) / 2}px`
        inner.style.top = `${(h - newH) / 2}px`
        inner.style.overflow = 'auto'
        this.$refs.elInner.style.transform = `scale(${this.scaleFactor.toString().replace(',', '.')})`
        if (Blockly && eYo.App.workspace) {
          Blockly.svgResize(eYo.App.workspace)
        }
      },
      selectCategory (item) {
        if (this.isBasic && item.basic) {
          item = item.basic
        } else if (item.full) {
          item = item.full
        }
        this.selectedCategory = item
      }
    },
    mounted () {
      // the workspace
      // there is only one workspace
      if (eYo.App.workspace) {
        // do nothing, the workspace already exists
      } else {
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
          sounds: false,
          oneBasedIndex: true
        }
        // var el = document.getElementById('eyo-workspace-content')
        // if (!el) {
        //   console.error('WHAT THE HELL?')
        // }
        var workspace = eYo.App.workspace = Blockly.inject('eyo-workspace-content', staticOptions)
        if (!workspace) {
          console.error('Injection failure')
          return
        }
        // console.warn('WORKSPACE INSTALLED')
        eYo.setup(workspace)
        workspace.eyo.options = {
          noLeftSeparator: true,
          noDynamicList: false
        }
        // Get what will replace the old flyout selector
        eYo.App.flyoutToolbarSwitcher = this.$refs.switcher
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
        // Blockly.Events.disable()
        // try {
        //   flyout.show(eYo.DelegateSvg.T3s)//, eYo.T3.Expr.key_datum, eYo.T3.Stmt.if_part
        // } catch (err) {
        //   console.log(err)
        // } finally {
        //   Blockly.Events.enable()
        // }
        // eYo.App.workspace.flyout_ = flyout
        eYo.App.flyout = flyout
        flyout.eyo.slide = (closed) => {
          if (!goog.isDef(closed)) {
            closed = !this.flyoutClosed
          }
          this.setFlyoutClosed(closed) // beware of reentrancy
        }
        this.$nextTick(() => {
          // sometimes the `oldSvg` is not found
          var oldSvg = document.getElementById('svg-control-image')
          var newSvg = this.$refs.svg_control_image_v.$el
          if (oldSvg && newSvg) {
            oldSvg.parentNode.appendChild(newSvg)
            newSvg.parentNode.removeChild(oldSvg)
            // JL: critical section of code,
            // next instruction does not work despite what stackoverflow states
            // oldSvg && newSvg && oldSvg.parentNode.replaceChild(oldSvg, newSvg)
          } else {
            if (newSvg) {
              newSvg.parentNode.removeChild(newSvg)
            }
            console.error('MISSING svg-control-image…')
          }
        })
        eYo.KeyHandler.setup(document)
        eYo.$$.bus.$on('new-document', () => {
          eYo.App.workspace.clear()
        })
        this.selectedCategory = this.items.basic
        eYo.App.workspace.render()
        this.$nextTick(eYo.App.Document.doNew)
        // window.addEventListener('resize', this.$$resize, false)
        this.$nextTick(() => {
          // eYo.$$.bus.$on('size-did-change', this.$$resize)
          this.$$resize()
        })
      }
    }
  }
</script>

<style>
  .eyo-flyout-select {
    opacity: 1;
  }
  .eyo-flyout-control {
    vertical-align: middle;
  }
  .eyo-flyout-toolbar {
    padding: 0;
    padding-right: 0.25rem;
    line-height: 1.2;
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
    width: 100%;
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
  #eyo-workspace-content .eyo-flyout-control {
    top: -0.125rem;
    border-top-right-radius: 1rem;
    border-bottom-right-radius: 1rem;
    height: 2rem;
  }
  #eyo-flyout-toolbar-label .item {
    display: inline-block;
    height:2rem;
  }
  #eyo-flyout-toolbar-label-check {
    vertical-align: middle;
    position: relative;
    bottom: 0.125rem;
  }
  #eyo-workspace-content {
    width: 100%;
    height: 100%;
  }
</style>
