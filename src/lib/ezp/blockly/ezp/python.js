/**
 * ezPython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview General python support.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.Python')

goog.require('ezP')

/*
 * List of all the python keywords as given by
 * import keyword; print(keyword.kwlist)
 * as of Python 3.5.
 * @const{!array} of arrays of keyworks gathered by length
 * @author{Jérôme LAURENS}
 *
 */
ezP.Python.KWs = [[], [],
  ['as', 'if', 'in', 'is', 'or'],
  ['and', 'def', 'del', 'for', 'not', 'try'],
  ['None', 'True', 'elif', 'else', 'from', 'pass', 'with'],
  ['False', 'break', 'class', 'raise', 'while', 'yield'],
  ['assert', 'except', 'global', 'import', 'lambda', 'return'],
  ['finally'],
  ['continue', 'finally', 'nonlocal']]

/**
 * Whereas a string is a python keyword.
 * @param {string} type The type of the connection.
 */
ezP.Python.isKeyword = function (s) {
  var KWs = ezP.Python.KWs[s.length]
  return KWs && KWs.indexOf(s) >= 0
}

goog.require('ezP.Delegate')

/**
 * Convert the block to python code.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @constructor
 */
ezP.Delegate.prototype.toPython = function (block) {
  goog.asserts.assert(false, 'Missing toPython implementation for '+block.type)
}

goog.require('ezP.DelegateSvg')

/**
 * Convert the block to python code.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @return some python code
 */
ezP.DelegateSvg.prototype.toPythonExpression = function (block) {
  var components = []
  this.toPythonExpressionComponents(block, components)
  return components.join('')
}

/**
 * Convert the block to python code components.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @param {!array} components the array of python code strings, will be joined to make the code.
 * @return the last element of components
 */
ezP.DelegateSvg.prototype.toPythonExpressionComponents = function (block, components) {
  var last = components[components.length-1]
  var c8n, target
  var FFF = function(x, is_operator) {
    if (x.length) {
      if (is_operator) {
        x = ' ' + x + ' '
      } else {
        if (last && last.length) {
          var mustSeparate = last[last.length-1].match(/[,;:]/)
          var maySeparate = mustSeparate || ezP.XRE.id_continue.test(last[last.length-1])
        }
        if (mustSeparate || (maySeparate && ezP.XRE.id_continue.test(x[0]))) {
          components.push(' ')
        }
      }
      components.push(x)
      last = x
    }
    return true
  }
  var FF = function(field, is_operator) {
    return field && FFF(field.getText(), is_operator)
  }
  var doOneModel = function(D) {
    if (!D) {
      return
    }
    FF(D.fields.prefix)
    FF(D.fields.label)
    FF(D.fields.start)
    FF(D.fields.identifier) || FF(D.fields.input) || FF(D.fields.comment) || FF(D.fields.number) || FF(D.fields.string) || FF(D.fields.longString) || FF(D.fields.operator, true)
    if ((c8n = D.input.connection)) {
      if ((target = c8n.targetBlock())) {
        FFF(target.ezp.toPythonExpression(target))
      } else if (!c8n.ezp.optional_) {
        last = '<MISSING '+D.input.name+'>'
        components.push(last)
      }
    }
    FF(D.fields.end)
  }
  doOneModel(this.ui.i_1)
  doOneModel(this.ui.i_2)
  doOneModel(this.ui.i_3)
  return last
}

/**
 * Convert the block to python code.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python, a statement block.
 * @param {!string}indent, the indentation level for the .
 * @return some python code
 */
ezP.DelegateSvg.prototype.toPythonStatement = function (block, indent, is_deep) {
  var components = []
  this.toPythonStatementComponents(block, components, indent, is_deep)
  return components.join('\n')
}

/**
 * Convert the block to python code components.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @param {!array} components the array of python code strings, will be joined to make the code.
 * @return None
 */
ezP.DelegateSvg.prototype.toPythonStatementComponents = function (block, components, indent, is_deep) {
  var Cs = []
  if (block.disabled && indent.indexOf('#') < 0) {
    indent += '# '
  }
  components.push(indent+this.toPythonExpression(block))
  if (this.ui.suite) {
    var input = this.ui.suite.input
    if (input) {
      var c8n = input.connection
      if (c8n) {
        var target = c8n.targetBlock()
        if (target && !target.ezp.toPythonStatementComponents(target, components, indent+'    ', true) || !target && !c8n.ezp.optional_) {
          components.push(indent+'    <MISSING '+input.name+'>')
        }
      }
    }
  }
  if (is_deep && block.nextConnection) {
    var target = block.nextConnection.targetBlock()
    if (target) {
      var out = target.ezp.toPythonStatementComponents(target, components, indent, true)
    }
  }
  return out || (!block.disabled && block.type !== ezP.T3.Stmt.comment_stmt)
}

goog.require('ezP.DelegateSvg.Expr')

/**
 * Convert the block to python code.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @return some python code
 */
ezP.DelegateSvg.Expr.prototype.toPython = function (block, is_deep) {
  return this.toPythonExpression(block)
}

goog.require('ezP.DelegateSvg.List')

/**
 * Convert the block to python code components.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @param {!array} components the array of python code strings, will be joined to make the code.
 * @return the last element of components
 */
ezP.DelegateSvg.List.prototype.toPythonExpressionComponents = function (block, components) {
  this.consolidate(block)
  var last = components[components.length-1]
  var e8r = block.ezp.inputEnumerator(block)
  while (e8r.next()) {
    var c8n = e8r.here.connection
    if (c8n) {
      var target = c8n.targetBlock()
      if (target) {
        last = target.ezp.toPythonExpressionComponents(target, components)
        // NEWLINE
      } else if (!c8n.ezp.optional_ && !c8n.ezp.s7r_) {
        last = '<MISSING ELEMENT>'
        components.push(last)
        // NEWLINE
      } else {
        for (var j = 0, field; (field = e8r.here.fieldRow[j++]);) {
          var x = field.getText()
          if (x.length) {
            if (last && last.length) {
              var mustSeparate = last[last.length-1].match(/[,;:]/)
              var maySeparate = mustSeparate || ezP.XRE.id_continue.test(last[last.length-1])
            }
            if (mustSeparate || (maySeparate && ezP.XRE.id_continue.test(x[0]))) {
              components.push(' ')
            }
            components.push(x)
            last = x              
          }
        }
      }
    }
  }
  return last
}

goog.require('ezP.DelegateSvg.Stmt')

/**
 * Convert the block to python code.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @return some python code
 */
ezP.DelegateSvg.Stmt.prototype.toPython = function (block, is_deep) {
  return this.toPythonStatement(block, '', is_deep)
}

goog.require('ezP.DelegateSvg.Control')

/**
 * Convert the block to python code.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @constructor
 */
ezP.DelegateSvg.Control.prototype.toPython = function (block, is_deep) {
  return this.toPythonStatement(block, '', is_deep)
}
