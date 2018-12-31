<template>
  <div
    class="eyo-wrapper"
    ref="wrapper">
    <toolbar
      :where="where"
      what="turtle"
      v-on="$listeners"></toolbar>
    <div
      class="content"
      ref="elContent">
      <div
        id="eyo-panel-turtle"
        class="eyo-panel-turtle"
        ref="elInner">
        <div
          id="eyo-turtle-canvas-wrapper"
          ref="elCanvas"></div>
      </div>
    </div>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  import Toolbar from './Toolbar'
  var ResizeSensor = require('css-element-queries/src/ResizeSensor')
  export default {
    name: 'panel-turtle',
    components: {
      Toolbar
    },
    data: function () {
      return {
        resizeSensor: null
      }
    },
    props: {
      where: {
        type: String,
        default: undefined
      }
    },
    computed: {
      ...mapGetters('Turtle', [
        'scaleFactor'
      ])
    },
    watch: {
      scaleFactor (newValue, oldValue) {
        this.$$resize()
      }
    },
    methods: {
      $$resize: function (e) {
        var content = this.$refs.elContent
        var w = content.offsetWidth
        var h = content.offsetHeight
        if (h && w) {
          var newW = w / this.scaleFactor
          var newH = h / this.scaleFactor
          var style = this.$refs.elInner.style
          style.position = 'relative'
          style.width = `${newW}px`
          style.height = `${newH}px`
          style.left = `${(w - newW) / 2}px`
          style.top = `${(h - newH) / 2}px`
          style.overflow = 'auto'
          style.transform = `scale(${this.scaleFactor.toString().replace(',', '.')})`
        }
      },
      willUnplace () { // this is necessary due to the scale feature
        if (this.resizeSensor) {
          this.resizeSensor.detach()
          this.resizeSensor = null
        }
      },
      didPlace () {
        this.resizeSensor && this.resizeSensor.detach()
        this.resizeSensor = new ResizeSensor(this.$refs.elContent, () => {
          console.log('TURTLE', this.$refs.elContent.clientWidth, this.$refs.elContent.clientHeight)
          this.$$resize()
        })
        this.$$resize()
      },
      scrollToVisible () {
        var canvas = this.$refs.elCanvas
        // find an svg element inside
        var nodes = canvas.getElementsByTagName('svg')
        if (nodes.length) {
          var svg = nodes[0]
          nodes = svg.getElementsByTagName('g')
          if (nodes.length) {
            var transform = nodes[0].getAttribute('transform')
            var m = /translate\s*\(\s*([^\s,)]+)[ ,]+([^\s,)]+)/.exec(transform)
            if (m) {
              var x0 = parseInt(m[1])
              if (!isNaN(x0)) {
                var y0 = parseInt(m[2])
                if (isNaN(y0)) {
                  y0 = x0
                }
                var x1 = canvas.offsetWidth / 2
                var y1 = canvas.offsetHeight / 2
                var inner = this.$refs.elInner
                if (x1 < x0) {
                  inner.scrollLeft = x0 - x1
                }
                if (y1 < y0) {
                  inner.strollTop = y0 - y1
                }
              }
            }
          }
        }
      }
    },
    mounted () {
      this.$nextTick(() => {
        this.$$resize()
        // eslint-disable-next-line no-new
        new ResizeSensor(this.$refs.elContent, () => {
          this.$$resize()
        })
      })
      eYo.$$.bus.$on('turtle-scroll', this.scrollToVisible)
    }
  }
</script>

<style>
  .eyo-wrapper .content {
    margin-top: 0.25rem;
    padding: 0;
    height: calc(100% - 2.25rem);
  }
  .eyo-wrapper .eyo-panel-turtle {
    background-color: aliceblue;
    margin-top: 0.25rem;
    padding: 0;
    height: 100%;
    overflow: auto;
  }
  #eyo-turtle-canvas-wrapper {
    width: 100%;
    height: 100%;
    min-width: 1000px;
    min-height: 1000px;
  }
</style>
