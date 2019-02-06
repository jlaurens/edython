<template>
  <div
    class="eyo-wrapper"
    ref="wrapper">
    <toolbar
      :where="where"
      what="console1"
      v-on="$listeners"></toolbar>
    <div
      class="content"
      ref="elContent">
      <textarea
        id="eyo-console1-area"
        ref="output"
        rows=20
        :style="{fontFamily: $$.eYo.Font.familyMono, fontSize: $$.eYo.Font.totalAscent + 'px'}"
      ></textarea>
    </div>
    <console1-script
     ref="console"
    ></console1-script>
  </div>
</template>

<script>
  import Console1Script from './Console1Script'

  import {mapState, mapGetters, mapMutations} from 'vuex'
  import Toolbar from './Toolbar'
  var ResizeSensor = require('css-element-queries/src/ResizeSensor')
  export default {
    name: 'panel-console1',
    components: {
      Toolbar,
      Console1Script
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
      ...mapGetters('Console1', [
        'scaleFactor'
      ]),
      ...mapState('Py', [
        'running1'
      ])
    },
    watch: {
      scaleFactor (newValue, oldValue) {
        this.$$resize()
      }
    },
    methods: {
      ...mapMutations('Py', [
        'setStarted1',
        'setRunning1'
      ]),
      getLastSuiteIndex () { // assume that there is at least one occurrence
        var str = this.$refs.output.value
        var i = str.indexOf('\n...', (this.lastPromptIndex_ || 0) + 4)
        while (true) {
          if (i < 0) {
            break
          }
          this.lastSuiteIndex_ = i + 1
          i = str.indexOf('\n...', i + 5)
        }
        return this.lastSuiteIndex_
      },
      getLastPromptIndex () { // assume that there is at least one occurrence
        var str = this.$refs.output.value
        var i = str.indexOf('\n>>>', (this.lastPromptIndex_ || 0) + 4)
        while (true) {
          if (i < 0) {
            break
          }
          this.lastPromptIndex_ = i + 1
          i = str.indexOf('\n>>>', i + 5)
        }
        return this.lastPromptIndex_
      },
      $$resize: function (e) {
        var content = this.$refs.elContent
        var w = content.clientWidth
        var h = content.clientHeight
        if (w && h) {
          var newW = w / this.scaleFactor
          var newH = h / this.scaleFactor
          var style = this.$refs.output.style
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
        this.resizeSensor = new ResizeSensor(
          this.$refs.elContent,
          this.$$resize.bind(this)
        )
        this.$$resize()
      },
      $$cut_or_paste (event) {
        // do not cut or paste after the last prompt
        var output = this.$refs.output
        if (output.selectionStart < this.getLastPromptIndex() + 4) {
          event.preventDefault()
          event.stopPropagation()
        }
      },
      $$cursorToEnd () {
        this.$nextTick(() => {
          var output = this.$refs.output
          var pos = output.value.length
          output.setSelectionRange(pos, pos)
          output.scrollTop = output.scrollHeight
          output.blur()
          output.focus()
        })
      },
      $$click (event) {
        var output = this.$refs.output
        if (output.selectionStart >= output.selectionEnd) {
          this.$$cursorToEnd()
        }
      },
      $$keypress (event) {
        var output = this.$refs.output
        if (event.keyCode === 9) { // tab key
          event.preventDefault()
          this.$$write('    ')
        } else if (event.keyCode === 13) { // return
          var i = this.getLastPromptIndex() + 4
          var src = output.value
          if (this.status_ === eYo.Key.MAIN) {
            var currentLine = src.substring(i)
          } else if (this.status_ === eYo.Key.STRING3) {
            currentLine = src.substring(i)
            currentLine = currentLine.replace(/^... /, '')
          } else {
            i = this.getLastSuiteIndex() + 4
            currentLine = src.substring(i)
          }
          console.error('currentLine', currentLine)
          if (this.status_ === eYo.Key.MAIN && !currentLine.trim()) {
            this.$$write('\n>>> ')
            event.preventDefault()
            return
          }
          this.$$newline()
          console.log('this.history_.push', currentLine)
          this.history_.push(currentLine)
          this.current_ = this.history_.length
          if (this.status_ === eYo.Key.MAIN || this.status_ === eYo.Key.STRING3) {
            var ans = this.$refs.console.$$execute(currentLine)
            if (ans._) {
              this.$$write(ans._)
            }
            if (ans.status === eYo.Key.BLOCK) {
              this.$$suite()
              this.status_ = ans.status
            } else {
              this.$$prompt()
              this.status_ = ans.status
            }
          } else if (currentLine === '') { // end of block
            var block_src = src.substring(this.getLastPromptIndex() + 4).replace(/\n..../, '\n')
            this.status_ = eYo.Key.MAIN
            ans = this.$refs.console.$$execute(block_src)
            if (ans._) {
              this.$$write(ans._)
            }
            this.$$prompt()
          } else {
            this.$$suite()
          }
          this.$$cursorToEnd(event)
          event.preventDefault()
        } else {
          if (output.selectionStart < this.getLastPromptIndex() + 4) {
            this.$$cursorToEnd()
          }
        }
      },
      $$get_col () {
        // returns the column num of the insertion caret
        var output = this.$refs.output
        var i = output.value.lastIndexOf('\n') + 1
        return output.selectionStart - i
      },
      $$keydown (event) {
        var output = this.$refs.output
        if (event.keyCode === 37) { // left arrow
          if (this.$$get_col() < 5) {
            event.preventDefault()
            event.stopPropagation()
          }
        } else if (event.keyCode === 36) { // line start
          var pos = output.selectionStart - this.$$get_col() + 4
          output.setSelectionRange(pos, pos)
          event.preventDefault()
        } else if (event.keyCode === 38) { // up
          if (this.current_ > 0) {
            pos = output.selectionStart - this.$$get_col() + 4
            // remove this.current_ line
            output.value = output.value.substring(0, pos)
            this.current_ -= 1
            this.$$write(this.history_[this.current_])
          }
          event.preventDefault()
        } else if (event.keyCode === 40) { // down
          if (this.current_ < this.history_.length - 1) {
            pos = output.selectionStart - this.$$get_col() + 4
            // remove this.current_ line
            output.value = output.value.substring(0, pos)
            this.current_ += 1
            this.$$write(this.history_[this.current_])
          }
          event.preventDefault()
        } else if (event.keyCode === 8) { // backspace
          var src = output.value
          var lstart = src.lastIndexOf('\n')
          if ((lstart === -1 && src.length < 5) || (src.length - lstart < 6)) {
            event.preventDefault()
            event.stopPropagation()
          }
        }
      },
      $$writeWaiting () {
        this.$refs.output.value += this.waitingData.join('')
        this.waitingData = []
        this.$$cursorToEnd()
      },
      $$write (data) {
        if (!this.waitingData.length) {
          this.$root.$nextTick(this.$$writeWaiting.bind(this))
        }
        this.waitingData.push(String(data))
      },
      $$suite () {
        this.$$write('... ')
      },
      $$prompt () {
        this.$$write('>>> ')
      },
      $$newline () {
        this.$$write('\n')
      },
      complete (id, time) {
        console.log('complete', this.running1)
        this.$$write(this.$$t('message.complete_in_ms').replace('%%%time%%%', String(time)) + '\n')
        this.$$prompt()
        this.$$cursorToEnd()
        this.setRunning1(false)
        var eyo = eYo.Selected.eyo
        if (eyo && eyo.id === id) {
          this.$nextTick(eYo.Selected.chooseNext)
        }
      },
      restartConsole () {
        this.$refs.console.restart()
      },
      restartOutput () {
        this.eraseConsole(this.$$t('message.console_output_heading'))
      },
      eraseConsole (message) {
        this.waitingData = []
        this.$nextTick(() => {
          this.$refs.output.value = message
            ? message + '\n'
            : ''
          this.$$prompt()
          this.$$cursorToEnd()
        })
      },
      restartAll () {
        this.eraseTurtle()
        this.restartConsole() // this must be last, once
      },
      eraseTurtle (id) {
        this.$refs.console.eraseTurtle(id)
      },
      replayTurtle (id) {
        this.$refs.console.replayTurtle(id)
      }
    },
    mounted () {
      this.waitingData = []
      this.$nextTick(() => {
        this.$$resize()
      })
      this.$$onOnly('console1-erase',
        this.eraseConsole.bind(this)
      )
      this.$$onOnly('console1-restart',
        this.restartConsole.bind(this)
      )
      this.$$onOnly('console1-newline',
        this.$$newline.bind(this)
      )
      this.$$onOnly('console1-restarted',
        this.restartOutput.bind(this)
      )
      this.$$onOnly('console1-started', () => {
        this.setStarted1(true)
        this.restartOutput()
      })
      this.$$onOnly('will-run-script', (root) => {
        this.$nextTick(() => {
          root.runScript()
        })
      })
      this.$$onOnly('console1-write', (str) => {
        this.$$write(str)
      })
      this.$$onOnly('console1-complete', this.complete.bind(this))
      this.$$onOnly('console1-run-script', (id, code, restart) => {
        this.setRunning1(true)
        if (restart) {
          this.restartOutput()
        } else {
          this.$$newline()
        }
        window.setTimeout(() => {
          this.$refs.console.asyncRunScript(id, code)
        }, 200) // $nextTick is too rapid
      })
      eYo.$$.bus.$on('new-document',
        this.restartAll.bind(this)
      )
      this.$$onOnly('turtle-replay',
        this.replayTurtle.bind(this)
      )
      this.$$onOnly('turtle-erase',
        this.eraseTurtle.bind(this)
      )
      this.history_ = []
      this.current_ = 0
      this.status_ = eYo.Key.MAIN
      var output = this.$refs.output
      output.addEventListener('keypress', this.$$keypress.bind(this))
      output.addEventListener('keydown', this.$$keydown.bind(this))
      output.addEventListener('click', this.$$click.bind(this))
      output.addEventListener('paste', this.$$cut_or_paste.bind(this))
      output.addEventListener('cut', this.$$cut_or_paste.bind(this))
    }
  }
  /**
   * @param {!String} id
   * @param {?Boolean} restart
   */
  eYo.DelegateSvg.prototype.runScript = function (id, restart) {
    if (!goog.isDef(restart) && this === this.root && this.restart_p) {
      restart = !this.previous
    }
    // Does this block need the console or the turtle ?
    var p = new eYo.Py.Exporter()
    var code = p.export(this.block_, {is_deep: true})
    if (p.use_turtle) {
      eYo.emit('pane-turtle-show')
    } else if (p.use_print) {
      eYo.emit('pane-console1-show')
    }
    eYo.asyncEmit('console1-run-script', id || this.id, code, restart)
  }
</script>

<style>
  #eyo-console1-area {
    background-color:#000;
    color:#fff;
    font-family: monospace;
    font-size:1.0rem;
    overflow:auto;
    width: 100%;
    height: 100%;
  }
  #eyo-console1-area:focus {
    outline: none;
  }
  
</style>
