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
 * @fileoverview Extends connections.
 * Insert a class between Blockly.Connection and Blockly.REnderedConnection
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict';

goog.provide('EZP.RenderedConnection');

goog.require('Blockly.RenderedConnection');
goog.require('Blockly.Connection');

goog.require('EZP.Constants');

/**
 * Class for a connection between blocks that may be rendered on screen.
 * @param {!Blockly.Block} source The block establishing this connection.
 * @param {number} type The type of the connection.
 * @extends {Blockly.Connection}
 * @constructor
 */
EZP.Connection = function(source, type) {
  EZP.Connection.superClass_.constructor.call(this, source, type);
  this.isSeparatorEZP = false;
};
goog.inherits(EZP.Connection, Blockly.Connection);

EZP.inherits(Blockly.RenderedConnection, EZP.Connection);

EZP.Connection.prototype.highlight = Blockly.RenderedConnection.prototype.highlight;

/**
 * Add highlighting around this connection.
 */
Blockly.RenderedConnection.prototype.highlight = function() {
  var ezp = this.sourceBlock_.ezp;
  if (ezp) {
    ezp.highlightConnection(this);
    return;
  }
  Blockly.RenderedConnection.superClass_.highlight.call(this);
};

/**
 * For EZP blocks.
 * @param {!Blockly.Connection} otherConnection Connection to compare against.
 * @override
 */
EZP.Connection.prototype.connect = function(otherConnection) {
  EZP.Connection.superClass_.connect.call(this, otherConnection);
  if (this.isSuperior()) {
    var superior = this;
    var inferior = otherConnection;
  } else {
    var superior = otherConnection;
    var inferior = this;
  }
  if (inferior.check_ == EZP.C10nType.stt.before_else) {
    if (superior.check_ == EZP.C10nType.stt.after_if) {
      inferior.check_ = EZP.C10nType.stt.before_if_else;
    } else if (superior.check_ == EZP.C10nType.stt.after_loop) {
      inferior.check_ = EZP.C10nType.stt.before_loop_else;
    }
  }
};

/**
 * For EZP blocks.
 * @override
 */
EZP.Connection.prototype.disconnect = function() {
  var otherConnection = this.targetConnection;
  EZP.Connection.superClass_.disconnect.call(this);
  if (this.isSuperior()) {
    var superior = this;
    var inferior = otherConnection;
  } else {
    var superior = otherConnection;
    var inferior = this;
  }
  if (inferior.check_ == EZP.C10nType.stt.before_if_else ||
      inferior.check_ == EZP.C10nType.stt.before_loop_else) {
    inferior.check_ = EZP.C10nType.stt.before_else;
  }
};
