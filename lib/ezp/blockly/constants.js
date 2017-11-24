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
 * @fileoverview Constants for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict';

/**
 * @name EZP.Constants
 * @namespace
 **/
goog.provide('EZP.Constants');

goog.require('EZP');

EZP.Constants = EZP.Constants || {};

EZP.Constants.val = {
  ANY: 'ezp_val',
  GET: 'ezp_val_get',
  TEXT: 'ezp_val_text',
  BOOL: 'ezp_val_bool',
  TUPLE: 'ezp_val_tuple',
  RANGE: 'ezp_val_range'
};

EZP.Constants.stt = {
  ANY: 'ezp_stt',
  SET: 'ezp_stt_set',
  PRINT: 'ezp_stt_print'
};

EZP.Constants.grp = {
  ANY: 'ezp_grp',
  IF: 'ezp_grp_if',
  ELIF: 'ezp_grp_elif',
  ELSE: 'ezp_grp_else',
  FOR: 'ezp_grp_for',
  WHILE: 'ezp_grp_while'
};

// Connection types
EZP.Check = EZP.Check || {};

EZP.Check.val = {
  require_any: [0],
  provide_any: [0]
};

/*
In the first column the statement before.
X means that the statement is forbidden
for example, there must not be 2 consecutive else clauses.
        any   if    elif  else  loop
any     O     O     X     X     O
if      O     O     O     O     O
elif    O     O     O     O     O
else    O     O     X     X     O
loop    O     O     X     O     O
*/
/* bounded means elif and else groups
 * any means everything else,
 * loop means for or while
 * all means everything. */
EZP.Check.type = {
  any_all: 0,
  if_elif: 1,
  if_elif_bounded: 2,
  if_else: 3,
  loop_else: 4
};
EZP.Check.stt = {
  none: [-1],
  after_any: [EZP.Check.type.any_all],
  before_any: [EZP.Check.type.any_all],
  after_if: [EZP.Check.type.any_all,
    EZP.Check.type.if_elif,
    EZP.Check.type.if_else],
  before_if: [EZP.Check.type.any_all],
  after_elif: [EZP.Check.type.any_all,
    EZP.Check.type.if_elif,
    EZP.Check.type.if_else],
  before_elif: [EZP.Check.type.if_elif],
  after_else: [EZP.Check.type.any_all],
  before_else: [EZP.Check.type.if_else,
    EZP.Check.type.loop_else],
  before_if_else: [EZP.Check.type.if_else],
  before_loop_else: [EZP.Check.type.loop_else],
  after_loop: [EZP.Check.type.any_all,
    EZP.Check.type.loop_else],
  before_loop: [EZP.Check.type.any_all]
};
