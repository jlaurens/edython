<template>
  <b-dd
    id="eyo-toolbar-dropdown-demo"
    class="eyo-dropdown"
    :title="$$t('toolbar.tooltip.demo')"
    @show="doShow()"
    @hidden="doHidden()"
  >
    <template
      slot="button-content"
    >
      <icon-base
        :width="32"
        :height="32"
        icon-name="demo"
      >
        <icon-demo
          :on="on"
        />
      </icon-base>
    </template>
    <b-dd-item-button
      v-for="(demo, index) in demos"
      :key="demo.title"
      :style="{fontFamily: $$.eYo.Font.familySans, fontSize: $$.eYo.Font.totalHeight + 'px'}"
      @click="doSelect(index)"
    >
      {{ demo.title }}
    </b-dd-item-button>
  </b-dd>
</template>

<script>
import IconBase from '@@/Icon/IconBase.vue'
import IconDemo from '@@/Icon/IconDemo.vue'
  
import demoBasicHello from '@static/demo/basic/hello.xml'
import demoBasicHelloYou from '@static/demo/basic/hello-you.xml'
import demoBasicTestingAndBranching from '@static/demo/basic/testing_and_branching.xml'
import demoBasicTurtle from '@static/demo/basic/turtle.xml'
import demoBasicTurtleStar from '@static/demo/basic/turtle-star.xml'
import demoBasicTurtleSpiralStar from '@static/demo/basic/turtle-spiral-star.xml'
import demoBasicTurtleFour from '@static/demo/basic/turtle-four.xml'
import demoBasicTurtleHilbert from '@static/demo/basic/turtle-hilbert.xml'
import demoBasicTurtlePythagorasTree from '@static/demo/basic/turtle-pythagoras-tree.xml'
import demoBasicTurtleCardioid from '@static/demo/basic/turtle-cardioid.xml'
import demoBasicSumOfIntegers from '@static/demo/basic/sum-of-integers.xml'
import demoBasicPrimes from '@static/demo/basic/primes.xml'
import demoBasicFiftyDices from '@static/demo/basic/fifty-dices.xml'
import demoBasicList from '@static/demo/basic/list.xml'
import demoBasicListEdit from '@static/demo/basic/list-edit.xml'
import demoBasicPlural from '@static/demo/basic/plural.xml'
import demoBasicLetters from '@static/demo/basic/letters.xml'
  
export default {
  name: 'PageToolbarDemo',
  components: {
    IconBase,
    IconDemo
  },
  data () {
    return {
      on: 0.5,
      demos: [
        {
          title: this.$$t('toolbar.demo.basic.hello_world'),
          xml: demoBasicHello
        }, {
          title: this.$$t('toolbar.demo.basic.hello_you'),
          xml: demoBasicHelloYou
        }, {
          title: this.$$t('toolbar.demo.basic.testing_and_branching'),
          xml: demoBasicTestingAndBranching
        }, {
          title: this.$$t('toolbar.demo.basic.turtle'),
          xml: demoBasicTurtle
        }, {
          title: this.$$t('toolbar.demo.basic.turtle_star'),
          xml: demoBasicTurtleStar
        }, {
          title: this.$$t('toolbar.demo.basic.turtle_spiral_star'),
          xml: demoBasicTurtleSpiralStar
        }, {
          title: this.$$t('toolbar.demo.basic.turtle_four'),
          xml: demoBasicTurtleFour
        }, {
          title: this.$$t('toolbar.demo.basic.turtle_Hilbert'),
          xml: demoBasicTurtleHilbert
        }, {
          title: this.$$t('toolbar.demo.basic.turtle_Pythagoras_tree'),
          xml: demoBasicTurtlePythagorasTree
        }, {
          title: this.$$t('toolbar.demo.basic.turtle_cardioid'),
          xml: demoBasicTurtleCardioid
        }, {
          title: this.$$t('toolbar.demo.basic.sum_of_integers'),
          xml: demoBasicSumOfIntegers
        }, {
          title: this.$$t('toolbar.demo.basic.primes'),
          xml: demoBasicPrimes
        }, {
          title: this.$$t('toolbar.demo.basic.fifty_dices'),
          xml: demoBasicFiftyDices
        }, {
          title: this.$$t('toolbar.demo.basic.list'),
          xml: demoBasicList
        }, {
          title: this.$$t('toolbar.demo.basic.list_edit'),
          xml: demoBasicListEdit
        }, {
          title: this.$$t('toolbar.demo.basic.plural'),
          xml: demoBasicPlural
        }, {
          title: this.$$t('toolbar.demo.basic.letters'),
          xml: demoBasicLetters
        }
      ]
    }
  },
  mounted: function () {
    // add the tippy by hand if it does already exists
    var el = document.getElementById('eyo-toolbar-dropdown-demo')
    el._tippy || window.tippy(el, eYo.tooltip.options)
    goog.asserts.assert(el._tippy)
    this.flashInterval = setInterval(() => {
      this.flash()
    }, 2000)
  },
  methods: {
    displayMode () {
      return this.$store.state.UI.displayMode
    },
    flash () {
      this.on = 0
      eYo.$$.TweenLite.to(this, 0.5, {on: 1})
      if (this.flashInterval) {
        if (eYo.App.workspace) {
          var topBlocks = eYo.App.workspace.topBlocks_
          if (!topBlocks.length) {
            return
          }
          if (topBlocks.length === 1) {
            if (topBlocks[0].childBlocks_.length === 0) {
              return
            }
          }
          clearInterval(this.flashInterval)
        }
      }
    },
    doSelect (index) {
      var demo = this.demos[index]
      if (demo) {
        this.$root.$emit('pane-workspace-visible')
        this.$nextTick(() => {
          var str = demo.xml
          var parser = new DOMParser()
          var dom = parser.parseFromString(str, 'application/xml')
          var w = eYo.App.workspace
          var ids = w.eyo.fromDom(dom)
          // problem of code reuse
          eYo.App.doDomToPref(dom)
          // select the first created brick that is a control
          this.$nextTick(() => {
            eYo.Selected.selectOneBlockOf(ids.map(id => w.getBlockById(id)), true)
          })
        })
      }
    },
    doShow () {
      var el = document.getElementById('eyo-toolbar-dropdown-demo')
      !el._tippy.state.visible || el._tippy.hide()
      el._tippy.state.enabled = false
      eYo.tooltip.hideAll(eYo.App.workspace.flyout_.svgGroup_)
    },
    doHidden () {
      var el = document.getElementById('eyo-toolbar-dropdown-demo')
      el._tippy.state.enabled = true
    }
  }
}
</script>
