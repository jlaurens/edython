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

goog.provide('EZP.Constants');

goog.require('EZP');

EZP.Constants = EZP.Constants || {};

EZP.Constants.val = {
  ANY: 'ezp_val_any',
  SET: 'ezp_val_get',
  TEXT: 'ezp_val_text',
  BOOL: 'ezp_val_bool',
  TUPLE: 'ezp_val_tuple',
  RANGE: 'ezp_val_range'
};

EZP.Constants.stt = {
  ANY: 'ezp_stt_any',
  SET: 'ezp_stt_set',
  PRINT: 'ezp_stt_print'
};

EZP.Constants.grp = {
  ANY: 'ezp_grp_any',
  IF: 'ezp_grp_if',
  ELIF: 'ezp_grp_elif',
  ELSE: 'ezp_grp_else',
  FOR: 'ezp_grp_for',
  WHILE: 'ezp_val_while'
};

// Connection types
EZP.C10nType = EZP.C10nType || {};

EZP.C10nType.val = {
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
elif    O     O     X     O     O
else    O     O     X     X     O
loop    O     O     X     O     O
*/

EZP.C10nType.stt = {
  after_any: [0],
  before_any: [0],
  after_if: [0, 1, 2],
  before_if: [0],
  after_elif: [0, 2],
  before_elif: [1],
  after_else: [0],
  before_else: [2, 3],
  before_if_else: [2],
  before_loop_else: [3],
  after_loop: [0, 3],
  before_loop: [0]
};
