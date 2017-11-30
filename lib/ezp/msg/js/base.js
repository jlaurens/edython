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
 * @fileoverview Workspace override.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict';

goog.provide('ezP.Msg');

goog.require('ezP');

/** @export */ ezP.Msg.RENAME_VARIABLE = "Renommer";
/** @export */ ezP.Msg.REPLACE_VARIABLE = "Remplacer par";
/** @export */ ezP.Msg.NEW_VARIABLE = "Nouvelle variable";
/** @export */ ezP.Msg.DELETE_UNUSED_VARIABLES = "Nettoyer";

/** @export */ ezP.Msg.RENAME_VARIABLE_TITLE = "Renommer la variable '%1' en :";
