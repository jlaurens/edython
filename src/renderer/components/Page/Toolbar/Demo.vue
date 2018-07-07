<template>
  <b-dropdown id="eyo-toolbar-dropdown-demo" class="eyo-dropdown" title="Démo" v-on:show="doShow()" v-on:hidden="doHidden()">
    <template slot="button-content">
      <icon-base :width="32" :height="32" icon-name="demo"><icon-demo /></icon-base>
    </template>
    <b-dropdown-item-button v-for="(demo, index) in demos" :key="demo.title" v-on:click="doSelect(index)" :style="{fontFamily: $$.eYo.Font.familySans, fontSize: $$.eYo.Font.totalHeight + 'px'}">{{demo.title}}</b-dropdown-item-button>
  </b-dropdown>
</template>

<script>
  import IconBase from '@@/IconBase.vue'
  import IconDemo from '@@/Icon/IconDemo.vue'
  
  import demoBasicHello from '@static/demo/basic/hello.xml'
  import demoBasicHelloYou from '@static/demo/basic/hello-you.xml'
  import demoBasicSumOfIntegers from '@static/demo/basic/sum-of-integers.xml'
  import demoBasicFiftyDices from '@static/demo/basic/fifty-dices.xml'
  import demoBasicList from '@static/demo/basic/list.xml'
  import demoBasicListEdit from '@static/demo/basic/list-edit.xml'
  /** eslint-disable no-webpack-loader-syntax */
  import demoBasicDebug from '@static/demo/basic/debug.eyox'
  
  export default {
    name: 'page-toolbar-demo',
    data: function () {
      return {
        demos: [
          {
            title: 'Bonjour le monde!',
            xml: demoBasicHello
          }, {
            title: 'Bonjour ...',
            xml: demoBasicHelloYou
          }, {
            title: 'Somme des entiers',
            xml: demoBasicSumOfIntegers
          }, {
            title: '50 dés',
            xml: demoBasicFiftyDices
          }, {
            title: 'Liste',
            xml: demoBasicList
          }, {
            title: 'Liste (Édition)',
            xml: demoBasicListEdit
          }, {
            title: 'Debug',
            xml: demoBasicDebug
          }
        ]
      }
    },
    components: {
      IconBase,
      IconDemo
    },
    mounted: function () {
      // add the tippy by hand if it does already exists
      var el = document.getElementById('eyo-toolbar-dropdown-demo')
      el._tippy || window.tippy(el, eYo.Tooltip.options)
      goog.asserts.assert(el._tippy)
    },
    methods: {
      doSelect (index) {
        var demo = this.demos[index]
        if (demo) {
          // console.log(index, demo.xml)
          var parser = new DOMParser()
          var dom = parser.parseFromString(demo.xml, 'application/xml')
          // console.log(dom)
          eYo.App.workspace.eyo.fromDom(dom)
        }
      },
      doShow () {
        var el = document.getElementById('eyo-toolbar-dropdown-demo')
        !el._tippy.state.visible || el._tippy.hide()
        el._tippy.state.enabled = false
        eYo.Tooltip.hideAll(eYo.App.workspace.flyout_.svgGroup_)
      },
      doHidden () {
        var el = document.getElementById('eyo-toolbar-dropdown-demo')
        el._tippy.state.enabled = true
      }
    }
  }
</script>
