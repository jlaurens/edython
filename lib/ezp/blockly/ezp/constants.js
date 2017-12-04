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
 * @name ezP.Const
 * @namespace
 **/
goog.provide('ezP.Const');

goog.require('ezP');

ezP.Const = ezP.Const || {};

ezP.Const.val = {
  DEFAULT:'ezp_val',
  ANY:    'ezp_val_any',
  GET:    'ezp_val_get',
  TEXT:   'ezp_val_text',
  TFN:    'ezp_val_tfn',
  OP:     'ezp_val_op',
  UNRY:   'ezp_val_unry',
  BOOL:   'ezp_val_bool',
  TUPLE:  'ezp_val_tuple',
  RANGE:  'ezp_val_range',
  MINUS:  'ezp_val_minus'
};

ezP.Const.stt = {
  DEFAULT:'ezp_stt',
  ANY:    'ezp_stt_any',
  SET:    'ezp_stt_set',
  PRINT:  'ezp_stt_print',
  BCP:    'ezp_stt_bcp'
};

ezP.Const.grp = {
  DEFAULT:'ezp_grp',
  ANY:    'ezp_grp_any',
  IF:     'ezp_grp_if',
  ELIF:   'ezp_grp_elif',
  ELSE:   'ezp_grp_else',
  FOR:    'ezp_grp_for',
  WHILE:  'ezp_grp_while',
  WITH:   'ezp_grp_with'
};

ezP.Const.prc = {
  DEFAULT:'ezp_prc',
  ANY:    'ezp_prc_any',
  DEF:    'ezp_prc_def'
};

ezP.Const.ctl = {
  DEFAULT:'ezp_ctl',
  MAIN:   'ezp_ctl_main'
};

// Connection types
ezP.Check = ezP.Check || {};

ezP.Check.val = {
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
ezP.Check.type = {
  any_all: 0,
  if_elif: 1,
  if_elif_bounded: 2,
  if_else: 3,
  loop_else: 4
};
ezP.Check.stt = {
  none: [-1],
  after_any: [ezP.Check.type.any_all],
  before_any: [ezP.Check.type.any_all],
  after_if: [ezP.Check.type.any_all,
    ezP.Check.type.if_elif,
    ezP.Check.type.if_else],
  before_if: [ezP.Check.type.any_all],
  after_elif: [ezP.Check.type.any_all,
    ezP.Check.type.if_elif,
    ezP.Check.type.if_else],
  before_elif: [ezP.Check.type.if_elif],
  after_else: [ezP.Check.type.any_all],
  before_else: [ezP.Check.type.if_else,
    ezP.Check.type.loop_else],
  before_if_else: [ezP.Check.type.if_else],
  before_loop_else: [ezP.Check.type.loop_else],
  after_loop: [ezP.Check.type.any_all,
    ezP.Check.type.loop_else],
  before_loop: [ezP.Check.type.any_all]
};
