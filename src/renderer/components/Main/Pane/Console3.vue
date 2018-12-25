<template>
  <div
    class="eyo-wrapper"
    ref="wrapper">
    <toolbar
      :where="where"
      what="console3"
      v-on="$listeners"></toolbar>
    <div
      class="content"
      ref="elContent">
      <textarea
        id="eyo-console3-area"
        ref="elInner"
        rows=20
        v-bind:style="{fontFamily: $$.eYo.Font.familyMono, fontSize: $$.eYo.Font.totalAscent + 'px'}"></textarea>
    </div>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  import Toolbar from './Toolbar'
  var ResizeSensor = require('css-element-queries/src/ResizeSensor')
  export default {
    name: 'panel-console3',
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
      ...mapGetters('Console3', [
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
        if (w && h) {
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
      didPlace () { // this is necessary due to the scale feature
        this.resizeSensor = new ResizeSensor(this.$refs.elContent, () => {
          console.log('console3', this.$refs.elContent.clientWidth, this.$refs.elContent.clientHeight)
          this.$$resize()
        })
        this.$$resize()
      }
    },
    mounted () {
      this.$nextTick(() => {
        this.$$resize()
      })
    }
  }
</script>

<style>
  #eyo-console3-area {
    background-color:#000;
    color:#fff;
    font-family: monospace;
    font-size:1.0rem;
    overflow:auto;
    width: 100%;
    height: calc(100% - 2px); /* include border */
  }
  #eyo-console3-area:focus {
    outline: none;
  }
  
</style>
