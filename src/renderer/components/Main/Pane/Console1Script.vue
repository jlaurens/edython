<template>
  <script type="text/python3">
from browser import console as console_js
# console_js.log('%%% importing console module ???')
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
                if not window.eYo.Py.canRunTurtleScript():
                    import turtle
                    turtle.restart()
                    print('Turtle restarted')
                if self.setup is None:
                    print('Initializing turtle...')
                    self.setup = True
                try:
                    import turtle
                    Edython.el = document['eyo-turtle-canvas-wrapper']
                    turtle.set_defaults(turtle_canvas_wrapper=Edython.el)
                    panel = document['eyo-panel-turtle']
                    if panel.clientWidth == 0:
                        window.eYo.emit('pane-turtle-show')
                    turtle.set_defaults(canvwidth=panel.clientWidth)
                    turtle.set_defaults(canvheight=panel.clientHeight)
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
                print('Turtle restarted')
            else:
                print('turtle module not imported.')

        def turtleReplayScene(self):
            if 'turtle' in sys.modules:
                import turtle
                turtle.replay_scene()
            else:
                print('turtle module not imported.')

    class Status():
        MAIN =  1
        BLOCK = 2
        STRING3 = 3
    
    class Console():
        ns = {
            'credits':credits,
            'copyright':copyright,
            'license':license,
            '__name__':'__main__',
            'edython': Edython()
        }
        # execution namespace
        
        def __init__(self):
            sys.stdout.write = sys.stderr.write = lambda data: self.write(data)
    
        def write(self, data):
            window.eYo.emit('console1-write', str(data))
    
        def restart(self):
            self.ns = {
                'credits':credits,
                'copyright':copyright,
                'license':license,
                '__name__':'__main__',
                'edython': Edython()
            }
            window.eYo.asyncEmit('console1-restarted')

        def execute(self, currentLine):
            K = window.eYo.Key
            ans = [K.MAIN]
            try:
                _ = self.ns['_'] = eval(currentLine, self.ns)
                if _ is not None:
                    ans.append(repr(_) + '\n')
            except IndentationError:
                console_js.log('IndentationError')
                ans[0] = K.BLOCK
            except SyntaxError as msg:
                console_js.log('SyntaxError')
                s = str(msg)
                if s == 'invalid syntax : triple string end not found' or \
                    s.startswith('Unbalanced bracket'):
                    ans[0] = K.STRING3
                elif s == 'eval() argument must be an expression':
                    try:
                        exec(currentLine, self.ns)
                    except:
                        traceback.print_exc()
                elif s == 'decorator expects function':
                    ans[0] = K.BLOCK
                else:
                    traceback.print_exc()
            except:
                console_js.log('Other error')
                traceback.print_exc()
            finally:
                return ans

        def runScript(self, id, src):
            t = time.perf_counter()
            try:
                exec(src, self.ns)
                self.state = 1
            except Exception as exc:
                traceback.print_exc(file=sys.stderr)
                self.state = 0
            finally:
                t = time.perf_counter() - t
                window.eYo.asyncEmit('console1-complete', id, round(t * 100000)/100)
        console_js.log('INLINE really done')
    
    window.eYo.Py.console1 = Console()
    window.eYo.asyncEmit('console1-started')
</script>
</template>

<script>
export default {
  name: 'panel-console1-script',
  mounted: function () {
    eYo.Py.canRunTurtleScript = () => {
      var el = document.getElementById('eyo-turtle-canvas-wrapper')
      //   if (el) {
      //     while (el.firstChild) {
      //       el.removeChild(el.firstChild)
      //     }
      //   }
      return !el || !el.children.length
    }
  },
  methods: {
    restart () {
      eYo.Py.console1 && eYo.Py.console1.__class__.restart(eYo.Py.console1)
    },
    eraseTurtle (id) {
      eYo.Py.console1 && eYo.Py.console1.__class__.runScript(eYo.Py.console1, id || '', `if edython is not None:
    edython.turtleRestart()
else:
    print('Nothing to do...')
`)
    },
    replayTurtle (id) {
      eYo.Py.console1 && eYo.Py.console1.__class__.runScript(eYo.Py.console1, id || '', `if edython is not None:
  edython.turtleReplayScene()
else:
  print('Nothing to do...')
`)
    },
    $$execute (currentLine) {
      var ans = eYo.Py.console1.__class__.execute(eYo.Py.console1, currentLine)
      console.log('$$execute', ans)
      return {
        status: ans[0],
        _: (ans[1]) || null
      }
    },
    asyncRunScript (id, code) {
      this.$nextTick(() => {
        eYo.Py.console1.__class__.runScript(eYo.Py.console1, id, code)
      })
    }
  }
}
</script>

<style>
</style>
