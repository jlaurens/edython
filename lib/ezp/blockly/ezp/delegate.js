/**
 * @license
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Block delegates for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict';

goog.provide('ezP.TupleConsolidator');

goog.require('ezP.Helper');
goog.require('ezP.Block');

/**
 * Class for a Block Delegate.
 * Not normally called directly, ezP.Delegate.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.Delegate = function(prototypeName)  {
  ezP.Delegate.superClass_.constructor.call(this);
};
goog.inherits(ezP.Delegate, ezP.Helper);
/**
 * Delegate manager.
 * @param {?string} prototypeName Name of the language object containing
 */
ezP.Delegate.Manager = function() {
  var me = {};
  var ctors = {};
  /**
   * Delegate creator.
   * @param {?string} prototypeName Name of the language object containing
   */
  me.create = function(prototypeName)  {
    var ctor = ctors[prototypeName];
    if (ctor !== undefined) {
      return new ctor(prototypeName);
    }
    var Ks = prototypeName.split('_');
    if (Ks[0] == 'ezp') {
      while (Ks.length>1) {
        Ks.splice(-1,1);
        var name = Ks.join('_');
        ctor = ctors[name];
        if (ctor !== undefined) {
          ctors[prototypeName] = ctor;
          return new ctor(prototypeName);
        }
      }
      ctors[prototypeName] = ezP.Delegate;
      return new ezP.Delegate(prototypeName);
    }
    return undefined;
  };
  /**
   * Delegate registrator.
   * @param {?string} prototypeName Name of the language object containing
   * @param {Object} constructor
   */
  me.register = function(prototypeName,ctor) {
    ctors[prototypeName] = ctor;
  }
  return me;
}();

/**
 * Initialize a block. Nothing to do yet.
 * @param {!Blockly.Block} block to be initialized..
 * @extends {Blockly.Block}
 * @constructor
 */
ezP.Delegate.prototype.init = function(block)  {
};

/**
 * Whether the block has a previous statement.
 * @param {!Block} block.
 * @private
 */
ezP.Delegate.prototype.hasPreviousStatement_ = function(block) {
  var c10n = block.previousConnection;
  return c10n && c10n.isConnected()
    && c10n.targetBlock().nextConnection == c10n.targetConnection;
};

/**
 * Whether the block has a next statement.
 * @param {!Block} block.
 * @private
 */
ezP.Delegate.prototype.hasNextStatement_ = function(block) {
  return block.nextConnection && block.nextConnection.isConnected();
};

/**
 * @param {!Block} block.
 * @return {Number} The max number of inputs. null for unlimited.
 * @private
 */
ezP.Delegate.prototype.getInputTupleMax = function(block,grp) {
  return null;
}

ezP.Delegate.prototype.tupleConsolidate = function(block) {
  var C = this.tupleConsolidator;
  if (!C) {
    C = this.tupleConsolidator = new ezP.TupleConsolidator_();
  }
  C(block);
}

ezP.TupleConsolidator_ = function() {
  var block;
  var list, i, input; // list of inputs, index, element at index
  var tuple, grp, n, sep; // ezPython data, group, index, separator
  var start, end, connected, max;
  var hidden;
  var c10n;
  var getCurrent = function(_) {
    if (input = list[i]) {
      tuple = input.ezpTuple
      c10n = input.connection;
      goog.asserts.assert(!tuple || c10n, 'Tuple item with no connection');
      return input;
    }
    return tuple = c10n = null;
  }
  var getNext = function() {
    ++i;
    return getCurrent();
  }
  var rewind = function(_) {
    n = 0;
    i = start;
    return getCurrent();
  }
  var isTuple = function() {
    return input && (tuple = input.ezpTuple);
  }
  var iToPlaceholder = function() {
    do {
      if (isTuple() && !tuple.isSeparator) {
        return input;
      }
      if (i<end) {
        getNext();
        continue;
      }
      input = null;
      break;
    } while (true);
    return null;
  }
  var disposeNotAtI = function(not_i) {
    list[not_i].dispose();
    list.splice(not_i,1);
    --end;
  };
  var disposeAtI = function() {
    list[i].dispose();
    list.splice(i,1);
    --end;
    getCurrent();
  };
  var disposeFromI = function(bound) {
    bound = Math.min(bound,end);
    while (i<bound) {
      disposeNotAtI(i);
      --bound;
    }
    getCurrent();
    return
  };
  var disposeToI = function(bound) {
    bound = Math.max(bound,start);
    while (bound<i) {
      disposeNotAtI(bound);
      --i;
    }
    return
  };
  var insertPlaceholderAtI = function() {
    c10n = block.makeConnection_(Blockly.INPUT_VALUE);
    input = new Blockly.Input(Blockly.INPUT_VALUE, '_', block, c10n);
    list.splice(i,0,input);
    ++end;
    tuple = input.ezpTuple = {};
  };
  var insertSeparatorAtI = function() {
    insertPlaceholderAtI();
    tuple.isSeparator = true;
  };
  var doFinalizeSeparator = function(extreme) {
    tuple.grp = grp;
    tuple.n = n;
    tuple.sep = sep;
    input.name = 'S9P_'+grp+'_'+n;
    tuple.isSeparator = c10n.isSeparatorEZP = true;
    c10n.setHidden(hidden);
    if (extreme) {
      tuple.hidden = hidden;
      while(input.fieldRow.length) {
        input.fieldRow.shift().dispose();
      }
    } else if (!input.fieldRow.length) {
      input.appendField(new ezP.FieldLabel(sep || ','));
    }
  };
  var doFinalizePlaceholder = function() {
    tuple.grp = grp;
    tuple.n = n;
    tuple.sep = sep;
    input.name = 'TUPLE_'+grp+'_'+n++;
    tuple.isSeparator = c10n.isSeparatorEZP = false;
  };
  var doGroup = function() {
    // group bounds and connected
    n = 0;
    sep = tuple.sep || ',';
    connected = 0;
    start = i;
    var removeSep = false;
    var placeholder;
    do {
      if (c10n.isConnected()) {
        ++connected;
        removeSep = tuple.isSeparator = false;
      } else if (removeSep) {
        disposeNotAtI(i--);
      } else if (!tuple.isSeparator) {
        // remove separators before
        while (i>start) {
          if (!list[i-1].ezpTuple.isSeparator) {
            break;
          }
          disposeNotAtI(--i);
        }
        removeSep = tuple.isSeparator = true;
        placeholder = i;
      }
      if (!max || connected < max) {
        if (!getNext() || !isTuple()) {
          break;
        }
      } else {
        while(getNext() && isTuple()) {
          if (c10n.isConnected()) {
            c10n.targetBlock().unplug();
            disposeAtI();
          } else if (removeSep) {
            disposeNotAtI(i--);
          } else if (!tuple.isSeparator) {
            // remove separators before
            while (i>start) {
              if (!list[i-1].ezpTuple.isSeparator) {
                break;
              }
              disposeNotAtI(--i);
            }
            removeSep = tuple.isSeparator = true;
          }
        }
        break;
      }
    } while (true);
    end = i;// this group has index [start, end[
    hidden = max !== null && connected>=max;
    rewind();
    if (connected) {
      if (!tuple.isSeparator) {
        insertSeparatorAtI();
      }
      doFinalizeSeparator(true);
      while(n<connected) {
        getNext();
        while(tuple.isSeparator) {
          disposeAtI();
        }
        doFinalizePlaceholder();
        getNext();
        if (!tuple || !tuple.isSeparator) {
          insertSeparatorAtI();
        }
        doFinalizeSeparator(i == end-1);
      }
      while (getNext() && isTuple()) {
        disposeAtI();
      }
    } else if (placeholder != undefined) {
      i = placeholder;
      getCurrent();
      tuple.isSeparator = false;
      disposeToI(start);
      getNext();
      disposeFromI(end);
    } else {
      disposeToI(start);
      insertPlaceholderAtI();
      getNext();
    }
  }
  var consolidator = function(block_) {
    block = block_
    var ezp = block.ezp;
    if (!ezp) {
      return;
    }
    list = block.inputList;
    i = start = end = 0;
    tuple = grp = n = sep = input = undefined;
    rewind();
    do {
      if (isTuple()) {
        grp = 0;
        max = ezp.getInputTupleMax(block,grp);
        doGroup();
        do {
          tuple = grp = n = sep = input = undefined;
          if (isTuple()) {
            ++grp;
            max = ezp.getInputTupleMax(block,grp);
            doGroup();
          }
        } while (getNext());
        return;
      }
    } while (getNext());
  }
  return consolidator;
};

/**
 * Fetches the named input object.
 * @param {!Blockly.Block} block.
 * @param {string} name The name of the input.
 * @return {Blockly.Input} The input object, or null if input does not exist.
 * The undefined return value for the default block getInput implementation.
 */
ezP.Delegate.prototype.getInputTuple_ = function(block, name) {
  if(!name.length) {
    return null;
  }
  var L = name.split('_');
  if (L.length != 3 || L[0] !='TUPLE') {
    return null;
  }
  var grp = parseInt(L[1]);
  if (grp == NaN) {
    return null;
  }
  var n = parseInt(L[2]);
  if (n == NaN) {
    return null;
  }
  if (n>=this.getInputTupleMax(block,grp)) {
    return null;
  }
  this.tupleConsolidate(block);
  var list = block.inputList;
  var i = 0, input;
  while ((input = list[i])) {
    var tuple = input.ezpTuple;
    if (tuple && tuple.grp == grp) {
      var connected = 0;
      var start = i;
      do {
        if (!tuple.isSeparator) {
          if (tuple.n == n) {
            return input;
          }
          ++connected;
        }
      } while((input = list[++i]) && (tuple = input.ezpTuple) && tuple.n == n);
      var max = this.getInputTupleMax(block,grp);
      if (max !== null && connected>=max) {
        return null;
      }
      var end = i;
      if (end == start+1) {
        c10n = block.makeConnection_(Blockly.INPUT_VALUE);
        input = new Blockly.Input(Blockly.INPUT_VALUE,'S9P_'+grp+'_1', block, c10n);
        tuple = input.ezpTuple = {grp: grp, n: 0, sep: tuple.sep, isSeparator:true};
        list.splice(end,0,input);
        ++end;
        c10n = block.makeConnection_(Blockly.INPUT_VALUE);
        input = new Blockly.Input(Blockly.INPUT_VALUE,'S9P_'+grp+'_'+n, block, c10n);
        tuple = input.ezpTuple = {grp: grp, n: n, sep: tuple.sep, isSeparator:true};
        list.splice(start,0,input);
        ++end;
      }
      c10n = block.makeConnection_(Blockly.INPUT_VALUE);
      input = new Blockly.Input(Blockly.INPUT_VALUE,'S9P_'+grp+'_'+(n+1), block, c10n);
      tuple = input.ezpTuple = {grp: grp, n: n+1, sep: tuple.sep, isSeparator:true};
      input.appendField(new Blockly.FieldLabel(tuple.sep||','));
      list.splice(end,0,input);
      c10n = block.makeConnection_(Blockly.INPUT_VALUE);
      input = new Blockly.Input(Blockly.INPUT_VALUE,name, block, c10n);
      tuple = input.ezpTuple = {grp: grp, n: n, sep: tuple.sep};
      list.splice(end,0,input);
      return input;
    }
  }
  return null;
};

/**
 * The default implementation does nothing.
 * @param {!Blockly.Block} block.
 * @param {boolean} hidden True if connections are hidden.
 * @override
 */
ezP.Delegate.prototype.setConnectionsHidden = function(block, hidden) {
};

/**
 * Return all ezp variables referenced by this block.
 * @return {!Array.<string>} List of variable names.
 */
ezP.Delegate.prototype.getVars = function(block) {
  var vars = [];
  for (var i = 0, input; input = block.inputList[i]; i++) {
    for (var j = 0, field; field = input.fieldRow[j]; j++) {
      if (field instanceof ezP.FieldVariable) {
        vars.push(field.getText());
      }
    }
  }
  return vars;
};
