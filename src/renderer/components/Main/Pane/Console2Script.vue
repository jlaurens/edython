<template>
  <script type="text/python3">
from browser import console as console_js
print('%%% importing console module ???')
try:
    import consoleJL
    console_js('SUCCESS')
except:
    console_js.log('BIG FAILURE, INLINE CODE')
    import sys
    import time
    import traceback
    
    from browser import window, document
    
    _credits = """    Thanks to CWI, CNRI, BeOpen.com, Zope Corporation and a cast of thousands
        for supporting Python development.  See www.python.org for more information."""
    
    _copyright = """Copyright (c) 2012, Pierre Quentel pierre.quentel@gmail.com
    All Rights Reserved.
    
    Copyright (c) 2001-2013 Python Software Foundation.
    All Rights Reserved.
    
    Copyright (c) 2000 BeOpen.com.
    All Rights Reserved.
    
    Copyright (c) 1995-2001 Corporation for National Research Initiatives.
    All Rights Reserved.
    
    Copyright (c) 1991-1995 Stichting Mathematisch Centrum, Amsterdam.
    All Rights Reserved."""
    
    _license = """Copyright (c) 2012, Pierre Quentel pierre.quentel@gmail.com
    All rights reserved.
    
    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are met:
    
    Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer. Redistributions in binary
    form must reproduce the above copyright notice, this list of conditions and
    the following disclaimer in the documentation and/or other materials provided
    with the distribution.
    Neither the name of the <ORGANIZATION> nor the names of its contributors may
    be used to endorse or promote products derived from this software without
    specific prior written permission.
    
    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
    AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
    IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
    ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
    LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
    CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
    SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
    INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
    CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
    ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
    POSSIBILITY OF SUCH DAMAGE.
    """
    
    def represented(repr):
        def decorator(f):
            def decorated(): print(repr)
            decorated.__repr__ = lambda: repr
            return decorated
        return decorator
    
    @represented(_credits)
    def credits(): pass
    
    @represented(_copyright)
    def copyright(): pass
    
    @represented(_license)
    def license(): pass
    
    class Edython:
        el = None
        setup = None

        def turtleSetup(self):
            if 'turtle' in sys.modules:
                if self.setup is None:
                    print('Initializing turtle...')
                    self.setup = True
                try:
                    import turtle
                    Edython.el = document['eyo-turtle-canvas-wrapper']
                    # turtle.restart() this won't work
                    turtle.set_defaults(turtle_canvas_wrapper=Edython.el)
                    panel = document['eyo-panel-turtle']
                    if panel.clientWidth == 0:
                        console_js.error('Pliz, show turtle panel')
                        window.eYo.Do.makeTurtlePaneVisible()
                    turtle.set_defaults(canvwidth=panel.clientWidth)
                    turtle.set_defaults(canvheight=panel.clientHeight)
                    # turtle.restart() # this won't work either
                    print('Turtle available and set up...')
                    console_js.log('Turtle available...', panel.clientWidth, panel.clientHeight)
                except KeyError as e:
                    print(f'Build error: Missing #{e}')
            else:
                print('import turtle module first', )

        def turtleRestart(self):
            if 'turtle' in sys.modules:
                import turtle
                turtle.restart()

        def turtleReplayScene(self):
            if 'turtle' in sys.modules:
                import turtle
                turtle.replay_scene()

    class Status():
        MAIN =  1
        BLOCK = 2
        STRING3 = 3
    
    class Console():
        _status = Status.MAIN  # or Status.BLOCK if typing inside a block
        history = []
        current = 0
        elmt = None
        ns = {
            'credits':credits,
            'copyright':copyright,
            'license':license,
            '__name__':'__main__',
            'edython': Edython()
        }
        # execution namespace
        
        def __init__(self, elmt, callback = None):
            self.elmt = elmt
            assert self.elmt is not None, 'No element for id '+id
            self.callback = callback
            sys.stdout.write = sys.stderr.write = lambda data: self.write(data)
            self.elmt.bind('keypress', lambda e: self._myKeyPress(e))
            self.elmt.bind('keydown', lambda e: self._myKeyDown(e))
            self.elmt.bind('click', lambda e: self._cursorToEnd(e))
            console_js.log('Console available...')
            self.restart()
    
        def write(self, data):
            if self.elmt is not None:
                self.elmt.value += str(data)
            else:
                console_js.error(data)
    
        def erase(self):
            self.flush()
            self._prompt()
            self.elmt.focus()
            self._cursorToEnd()
    
        def restart(self):
            self.ns = {
                'credits':credits,
                'copyright':copyright,
                'license':license,
                '__name__':'__main__',
                'edython': Edython()
            }
            self.flush()
            #v = sys.implementation.version
            #self.write("Edython uses Brython %s.%s.%s on %s %s\n" % ( v[0], v[1], v[2], window.navigator.appName, window.navigator.appVersion))
            self.write('Type "copyright", "credits" or "license" for more information.\n')
            self._prompt()
            self.elmt.focus()
            self._cursorToEnd()

        def _prompt(self):
            self.write('>>> ')
    
        def _suite(self):
            self.write('... ')
    
        def _newline(self):
            self.write('\n')
    
        def flush(self):
            self.elmt.value = ''
    
        def _cursorToEnd(self, *args):
            pos = len(self.elmt.value)
            self.elmt.setSelectionRange(pos, pos)
            self.elmt.scrollTop = self.elmt.scrollHeight
    
        def _get_col(self):
            # returns the column num of cursor
            sel = self.elmt.selectionStart
            lines = self.elmt.value.split('\n')
            for line in lines[:-1]:
                sel -= len(line) + 1
            return sel
    
        def _myKeyPress(self, event):
            if event.keyCode == 9:  # tab key
                event.preventDefault()
                self.write('    ')
            elif event.keyCode == 13:  # return
                src = self.elmt.value
                if self._status == Status.MAIN:
                    currentLine = src[src.rfind('>>>') + 4:]
                elif self._status == Status.STRING3:
                    currentLine = src[src.rfind('>>>') + 4:]
                    currentLine = currentLine.replace('\n... ', '\n')
                else:
                    currentLine = src[src.rfind('...') + 4:]
                if self._status == Status.MAIN and not currentLine.strip():
                    self.write('\n>>> ')
                    event.preventDefault()
                    return
                self.write('\n')
                self.history.append(currentLine)
                self.current = len(self.history)
                if self._status == Status.MAIN or self._status == Status.STRING3:
                    try:
                        _ = self.ns['_'] = eval(currentLine, self.ns)
                        if _ is not None:
                            self.write(repr(_)+'\n')
                        self._prompt()
                        self._status = Status.MAIN
                    except IndentationError:
                        self._suite()
                        self._status = Status.BLOCK
                    except SyntaxError as msg:
                        if str(msg) == 'invalid syntax : triple string end not found' or \
                            str(msg).startswith('Unbalanced bracket'):
                            self._suite()
                            self._status = Status.STRING3
                        elif str(msg) == 'eval() argument must be an expression':
                            try:
                                exec(currentLine, self.ns)
                            except:
                                traceback.print_exc()
                            self._prompt()
                            self._status = Status.MAIN
                        elif str(msg) == 'decorator expects function':
                            self._suite()
                            self._status = Status.BLOCK
                        else:
                            traceback.print_exc()
                            self._prompt()
                            self._status = Status.MAIN
                    except:
                        traceback.print_exc()
                        self._prompt()
                        self._status = Status.MAIN
                elif currentLine == "":  # end of block
                    block = src[src.rfind('>>>') + 4:].splitlines()
                    block = [block[0]] + [b[4:] for b in block[1:]]
                    block_src = '\n'.join(block)
                    # status must be set before executing code in globals()
                    self._status = Status.MAIN
                    try:
                        _ = exec(block_src, self.ns)
                        if _ is not None:
                            print(repr(_))
                    except:
                        traceback.print_exc()
                    self._prompt()
                else:
                    self._suite()
    
                self._cursorToEnd(event)
                event.preventDefault()
    
        def _myKeyDown(self, event):
            if event.keyCode == 37:  # left arrow
                sel = self._get_col()
                if sel < 5:
                    event.preventDefault()
                    event.stopPropagation()
            elif event.keyCode == 36:  # line start
                pos = self.elmt.selectionStart
                col = self._get_col()
                self.elmt.setSelectionRange(pos - col + 4, pos - col + 4)
                event.preventDefault()
            elif event.keyCode == 38:  # up
                if self.current > 0:
                    pos = self.elmt.selectionStart
                    col = self._get_col()
                    # remove self.current line
                    self.elmt.value = self.elmt.value[:pos - col + 4]
                    self.current -= 1
                    self.write(self.history[self.current])
                event.preventDefault()
            elif event.keyCode == 40:  # down
                if self.current < len(self.history) - 1:
                    pos = self.elmt.selectionStart
                    col = self._get_col()
                    # remove self.current line
                    self.elmt.value = self.elmt.value[:pos - col + 4]
                    self.current += 1
                    self.write(self.history[self.current])
                event.preventDefault()
            elif event.keyCode == 8:  # backspace
                src = self.elmt.value
                lstart = src.rfind('\n')
                if (lstart == -1 and len(src) < 5) or (len(src) - lstart < 6):
                    event.preventDefault()
                    event.stopPropagation()
                    
        def runScript(self, id, src, restart = False, flush = False):
            if flush:
                self.flush()
            else:
                self._newline()
            self.time = 0
            t0 = time.perf_counter()
            try:
                exec(src, self.ns)
                self.state = 1
            except Exception as exc:
                traceback.print_exc(file=sys.stderr)
                self.state = 0
            finally:
                self.time = time.perf_counter() - t0
                self.write('Terminé en ' + str(round(self.time * 100000)/100) + ' ms\n')
                self._prompt()
                self._cursorToEnd()
                if self.callback is not None:
                    self.callback(self)
        print('INLINE really done')
    
    window.eYo.Py.console2 = Console(document['eyo-console2-area'])
    console_js.log('%%% importing console module: done')

</script>
</template>

<script>
export default {
  name: 'panel-console2-script',
  mounted: function () {
    eYo.$$.bus.$on('console2-erase', this.eraseConsole)
    this.$root.$on('console2-restart', this.restartConsole)
    this.$root.$on('turtle-replay', this.replayTurtle)
    this.$root.$on('turtle-erase', this.eraseTurtle)
    eYo.$$.bus.$on('new-document', this.restartAll)
  },
  methods: {
    restartConsole () {
      eYo.Py.console2 && eYo.Py.console2.__class__.restart(eYo.Py.console2)
    },
    eraseConsole () {
      eYo.Py.console2 && eYo.Py.console2.__class__.erase(eYo.Py.console2)
    },
    eraseTurtle () {
      eYo.Py.console2 && eYo.Py.console2.__class__.runScript(eYo.Py.console2, '', 'if edython is not None: edython.turtleRestart()')
    },
    replayTurtle () {
      eYo.Py.console2 && eYo.Py.console2.__class__.runScript(eYo.Py.console2, '', 'if edython is not None: edython.turtleReplayScene()')
    },
    restartAll () {
      this.eraseTurtle()
      this.restartConsole() // this must be last
    }
  }
}
eYo.DelegateSvg.prototype.runScript2 = function () {
  var p = new window.eYo.Py.Exporter()
  var code = p.export(this.block_, {is_deep: true})
  console.log('CODE', code)
  eYo.Py.console2 && eYo.Py.console2.__class__.runScript(window.eYo.Py.console2, '', code)
}
</script>

<style>
</style>
