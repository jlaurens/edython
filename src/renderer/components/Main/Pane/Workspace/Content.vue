<template>
  <div
    class="content"
    ref="el_content">
    <div
      id="eyo-workspace-content"
      ref="el_inner">
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
        <b-btn-toolbar
          id="eyo-flyout-switcher"
          class="phantom"
          ref="phantom"
          justify
          >
          <b-btn-group>&nbsp;</b-btn-group>
        </b-btn-toolbar>
        <b-btn-toolbar
          class="eyo-flyout-toolbar-inner"
          ref="toolbar">
          <b-btn-group>
            <b-dd
              id="eyo-flyout-dropdown-general"
              variant="secondary"
              class="eyo-dropdown"
              boundary="viewport">
              <template
                slot="button-content">Blocs</template>
              <b-dd-item-button
                v-for="item in levels"
                @click="selectedCategory = item"
                :style="{fontFamily: $$.eYo.Font.familySans}"
                :key="item.content"
              >{{item.content}}</b-dd-item-button>
              <b-dd-divider></b-dd-divider>
              <b-dd-item-button
                v-for="item in data_categories"
                @click="selectedCategory = item"
                :style="{fontFamily: $$.eYo.Font.familySans}"
                :key="item.content"
              >{{item.content}}</b-dd-item-button>
              <b-dd-divider></b-dd-divider>
              <b-dd-item-button
                v-for="item in code_categories"
                @click="selectedCategory = item"
                :style="{fontFamily: $$.eYo.Font.familySans}"
                :key="item.content"
              >{{item.content}}</b-dd-item-button>
              </b-dd>
            <b-dd
              id="eyo-flyout-dropdown-module"
              variant="secondary"
              class="eyo-dropdown"
              boundary="viewport">
              <template
                slot="button-content">Module&nbsp;</template>
              <b-dd-item-button
                v-for="item in modules"
                @click="selectedCategory = item"
                :style="{fontFamily: $$.eYo.Font.familySans}"
                :key="item.content"
                >{{item.content}}</b-dd-item-button>
            </b-dd>
          </b-btn-group>
        </b-btn-toolbar>
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
        selectedCategory_: undefined,
        resizeSensor: null,
        resizeSensorTB: null,
        sliding: 0
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
      model.data_categories = [
        model.items.math,
        model.items.text,
        model.items.list
      ]
      model.code_categories = [
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
      ...mapState('UI', [
        'selectedMode'
      ]),
      canBasic () {
        return this.selectedCategory && this.selectedCategory.in_module && ((this.selectedMode !== eYo.App.TUTORIAL && this.selectedMode !== eYo.App.BASIC) || !this.isBasic)
      },
      selectedCategory: {
        get () {
          return this.selectedCategory_
        },
        set (newValue) {
          if (this.isBasic && newValue.basic) {
            newValue = newValue.basic
          } else if (newValue.full) {
            newValue = newValue.full
          }
          var oldValue = this.selectedCategory_
          this.selectedCategory_ = newValue
          if (!oldValue || (newValue !== oldValue)) {
            var content = this.$refs.el_inner
            if (content) {
              var el = content.getElementsByClassName('eyo-flyout')[0]
              eYo.Tooltip.hideAll(el)
              this.setFlyoutCategory(newValue.key)
              this.label = newValue.label
            }
          }
          this.$$update()
        }
      },
      controlDiv () {
        return this.controlDiv_
      }
    },
    watch: {
      sliding (newValue, oldValue) {
        var div = this.controlDiv
        if (div) {
          if (newValue) {
            goog.dom.classlist.add(div, 'busy')
          } else {
            goog.dom.classlist.remove(div, 'busy')
          }
        }
      },
      scaleFactor (newValue, oldValue) {
        this.$$resize()
      },
      flyoutClosed (newValue, oldValue) {
        if (newValue !== oldValue && eYo.App.flyout) {
          if (this.sliding) {
            this.$nextTick(() => {
              this.flyoutClosedDidChange_(newValue)
            })
          }
          this.flyoutClosedDidChange_(newValue)
        }
      },
      flyoutCategory (newValue, oldValue) {
        var item = this.items[newValue]
        if (eYo.App.workspace && eYo.App.flyout && item) { // this.workspace is necessary
          var list = eYo.App.flyout.eyo.getList(newValue)
          if (list && list.length) {
            this.$nextTick(() => {
              eYo.App.flyout.show(list)
              eYo.App.selectedCategory = item
              eYo.App.isBasic = !item.basic
            })
          }
        }
      },
      // whenever `isBasic` changes, this function will run
      isBasic (newValue, oldValue) {
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
      flyoutClosedDidChange_ (newValue) {
        ++this.sliding
        if (newValue) {
          if (this.$$uninstallToolbar()) {
            this.$nextTick(() => {
              if (this.$$uninstallToolbar()) {
                eYo.App.flyout.eyo.doSlide(true)
              }
            })
          }
        } else {
          this.$nextTick(() => {
            eYo.App.flyout.eyo.doSlide(false)
          })
        }
      },
      willUnplace () { // this is necessary due to the scale feature
        if (this.resizeSensor) {
          this.resizeSensor.detach()
          this.resizeSensor = null
        }
        if (this.resizeSensorTB) {
          this.resizeSensorTB.detach()
          this.resizeSensorTB = null
        }
      },
      didPlace () { // this is necessary due to the scale feature
        this.resizeSensor && this.resizeSensor.detach()
        this.resizeSensor = new ResizeSensor(
          this.$refs.el_content,
          this.$$resize.bind(this)
        )
        this.resizeSensorTB && this.resizeSensorTB.detach()
        this.resizeSensorTB = new ResizeSensor(
          this.$refs.phantom.$el,
          this.$$update.bind(this)
        )
        this.$$update()
      },
      $$update (e) {
        var phantom = this.$refs.phantom.$el
        var toolbar = this.$refs.toolbar.$el
        if (!toolbar) {
          console.error('NO TOOLBAR ?')
          return
        }
        var rect = phantom.getBoundingClientRect()
        var width = phantom.offsetWidth
        // toolbar.style.width = `${phantom.offsetWidth}px`
        // toolbar.style.left = `0px`
        // toolbar.style.top = `0px`
        // toolbar.style.display = rect.width ? '' : 'none'
        var style = `
          width:${width}px;
          left:0px;
          top:0px;
        `
        toolbar.setAttribute('style', style)
        toolbar.style.display = rect.width ? '' : 'none'
        var parent = toolbar.parentNode
        parent.style.left = `${rect.left}px`
        parent.style.top = `${rect.top}px`
        var scaleX = Math.floor(0.5 + 1000 * (rect.right - rect.left) / width) / 1000
        if (scaleX !== 1) {
          parent.style.transform = `scale(${scaleX})`
        } else {
          parent.style.transform = ''
        }
        this.$nextTick(() => {
          this.$$resize(e)
        })
      },
      $$resize (e) {
        var content = this.$refs.el_content
        var top = content.offsetTop
        var left = content.offsetLeft
        var w = content.offsetWidth
        var h = content.offsetHeight
        var newW = w / this.scaleFactor
        var newH = h / this.scaleFactor
        var delta = this.oldRect ? Math.abs(this.oldRect.top - top) + Math.abs(this.oldRect.left - left) + Math.abs(this.oldRect.width - newW) + Math.abs(this.oldRect.height - newH) : 1
        if (delta > 0.005) {
          if (!this.oldRect) {
            this.oldRect = {} // webpack reload
          }
          this.oldRect.top = top
          this.oldRect.left = left
          this.oldRect.width = newW
          this.oldRect.height = newH
          var inner = this.$refs.el_inner
          inner.style.position = 'relative'
          inner.style.width = `${newW}px`
          inner.style.height = `${newH}px`
          inner.style.left = `${(w - newW) / 2}px`
          inner.style.top = `${(h - newH) / 2}px`
          inner.style.overflow = 'auto'
          this.$refs.el_inner.style.transform = `scale(${this.scaleFactor.toString().replace(',', '.')})`
          if (Blockly && eYo.App.workspace) {
            Blockly.svgResize(eYo.App.workspace)
            if (eYo.App.flyout) {
              eYo.App.flyout.reflow() // flyout may not exist while debugging
            }
          }
          this.$$update(e)
        }
      },
      $$installToolbar () {
        var toolbar = this.$refs.toolbar.$el
        var phantom = this.$refs.phantom.$el
        if (toolbar.parentNode === phantom.parentNode) {
          this.$emit('install-toolbar', toolbar, true)
          phantom.style.display = ''
          toolbar.style.display = 'none'
        }
        if (toolbar.parentNode === phantom.parentNode) {
          console.error('$$installToolbar FAILED')
        }
        return toolbar.parentNode !== phantom.parentNode
      },
      $$uninstallToolbar () {
        var toolbar = this.$refs.toolbar.$el
        var phantom = this.$refs.phantom.$el
        if (toolbar.parentNode !== phantom.parentNode) {
          this.$emit('install-toolbar', toolbar, true)
          phantom.style.display = 'none'
          phantom.parentNode.insertBefore(toolbar, phantom)
          toolbar.style.display = ''
        }
        if (toolbar.parentNode !== phantom.parentNode) {
          console.error('$$uninstallToolbar FAILED')
        }
        return toolbar.parentNode === phantom.parentNode
      },
      $$installControl () {
        var oldSvg = document.getElementById('eyo-flyout-control-image')
        var newSvg = this.$refs.svg_control_image_v.$el
        if (oldSvg && newSvg) {
          this.controlDiv_ = oldSvg.parentNode
          this.controlDiv_.appendChild(newSvg)
          this.controlDiv_.removeChild(oldSvg)
          // JL: critical section of code,
          // next instruction does not work despite what stackoverflow states
          // oldSvg && newSvg && oldSvg.parentNode.replaceChild(oldSvg, newSvg)
        } else {
          if (newSvg) {
            newSvg.parentNode.removeChild(newSvg)
            console.error('MISSING svg-control-image…')
          }
        }
      }
    },
    mounted () {
      // the workspace
      // there is only one workspace
      if (eYo.App.workspace) {
        // do nothing, the workspace already exists
      } else {
        this.oldRect = {
          top: 0,
          left: 0,
          width: 0,
          height: 0
        } // not a reactive property
        this.$nextTick(() => {
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
          eYo.$$.bus.$on('new-document', () => {
            eYo.App.workspace.clear()
          }
          this.$root.$on('workspace-clean', () => {
            eYo.Events.groupWrap(() => {
              eYo.Do.tryFinally(() => {
                var tops = eYo.App.workspace.topBlocks_.filter(block => !block.eyo.isControl)
                tops.forEach(block => eYo.deleteBlock(block, true))
              })
            })
          })
          eYo.$$.bus.$on('workspace-tidy-up', (kvargs) => {
            eYo.Events.groupWrap(() => {
              eYo.Do.tryFinally(() => {
                eYo.App.workspace.eyo.tidyUp(kvargs)
              })
            })
          })
          eYo.App.workspace.render()
          // now the flyout
          this.$nextTick(() => {
            var flyout = eYo.App.flyout = new eYo.Flyout(eYo.App.workspace)
            // Then create the flyout
            flyout.eyo.TOP_OFFSET = 3.5 * eYo.Unit.rem
            // also change it in the css style
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
            flyout.eyo.slide = (closed) => {
              if (!goog.isDef(closed)) {
                closed = !this.flyoutClosed
              }
              this.setFlyoutClosed(closed) // beware of reentrancy
            }
            flyout.eyo.didSlide = (closed) => {
              flyout.eyo.constructor.prototype.didSlide.call(flyout.eyo, closed)
              if (this.sliding) {
                --this.sliding
              }
              if (!closed) {
                this.$$installToolbar()
                this.$$update()
              }
            }
            var svg = flyout.createDom('svg')
            goog.dom.insertSiblingAfter(
              svg,
              eYo.App.workspace.getParentSvg()
            )
            this.$nextTick(() => {
              flyout.init(eYo.App.workspace, this.$refs.switcher) // after the flyout is in dom
              this.$nextTick(() => {
                this.$$installControl()
                eYo.KeyHandler.setup(document)
                this.$nextTick(eYo.App.Document.doNew)
                // window.addEventListener('resize', this.$$resize, false)
                this.$nextTick(() => {
                  this.selectedCategory = this.items.basic
                })
              })
            })
          })
        })
      }
      this.$nextTick(() => {
        this.resizeSensorTB = new ResizeSensor(
          this.$refs.phantom.$el,
          this.$$update.bind(this)
        )
        this.$$installToolbar()
        this.$$update()
      })
      this.$root.$on('toolbar-follow-phantom',
        this.$$update.bind(this)
      )
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
    padding-top: 0.125rem;
    padding-bottom: 0.125rem;
    background: #e3e3e3;
    font-style: italic;
    color: #666666;
    text-align: center;
  }
  #eyo-flyout-toolbar-label .item {
    display: inline-block;
  }
  #eyo-flyout-toolbar-label-check {
    vertical-align: middle;
    position: relative;
    bottom: 0.125rem;
  }
  .eyo-flyout-toolbar {
    padding: 0;
    padding-left: 0.25rem;
  }
  .eyo-flyout-toolbar.btn-toolbar {
    padding: 0;
  }
  .eyo-flyout-toolbar-inner .btn-group {
    width: 100%;
  }
  .eyo-flyout-toolbar-inner .eyo-dropdown.btn-group.b-dropdown.dropdown {
    width: 50%;
  }
  .eyo-flyout-toolbar-inner .eyo-dropdown .btn {
    width: 100%;
    height: 1.75rem;
  }
  #eyo-flyout-toolbar-switcher .phantom {
    height: 1.75rem;
  }
  #eyo-flyout-toolbar-switcher .eyo-round-btn {
    top: 0;
  }
  #eyo-workspace-content .eyo-flyout-control {
    top: -0.125rem;
    border-top-left-radius: 1rem;
    border-bottom-left-radius: 1rem;
    height: 2rem;
  }
  #eyo-workspace-content .eyo-flyout-control left {
    top: -0.125rem;
    border-top-left-radius: 0rem;
    border-bottom-left-radius: 0rem;
    border-top-right-radius: 1rem;
    border-bottom-right-radius: 1rem;
    height: 2rem;
  }
  #eyo-workspace-content {
    width: 100%;
    height: 100%;
  }
</style>
