/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Css utils.
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

/**
 * @name eYo.Css
 * @namespace
 */
goog.provide('eYo.Css')

goog.require('eYo.Style')


goog.forwardDeclare('eYo.Unit')
goog.forwardDeclare('eYo.font-face')
goog.forwardDeclare('eYo.Shape')
goog.forwardDeclare('goog.cssom');

eYo.Css.insertRuleAt = (() => {
  var style, sheet
  var getSheet = () => {
    if (!sheet) {
      // style = document.createElement('style')
      // //document.head.appendChild(style)// only once
      // document.head.insertBefore(style, document.head.firstChild)
      // sheet = style.sheet
      style = document.createElement('style')
      document.head.insertBefore(style, document.head.firstChild)
      sheet = style.sheet
    }
    return sheet
  }
  return function () { // arguments array is required
    var sheet = getSheet()
    if (arguments.length === 0) {
      return
    }
    var rule = []
    var i = 0
    while (goog.isString(arguments[i])) {
      rule.push(arguments[i])
      ++i
    }
    if (goog.isNumber(arguments[i])) {
      var at = arguments[i]
    }
    if (rule.length) {
      goog.cssom.addCssRule(sheet, rule.join(''), at)
    }
  }
})()

eYo.setup.register(-1, () => {
  eYo.Css.insertRuleAt('body {background: orange;}')
})

/**
 * List of cursors.
 * @enum {string}
 */
eYo.Css.Cursor = {
  OPEN: 'handopen',
  CLOSED: 'handclosed',
  DELETE: 'handdelete'
}

/**
 * Large stylesheet added by Blockly.Css.inject.
 * @type {Element}
 * @private
 */
Blockly.Css.styleSheet_ = null;

/**
 * Inject the CSS into the DOM.  This is preferable over using a regular CSS
 * file since:
 * a) It loads synchronously and doesn't force a redraw later.
 * b) It speeds up loading by not blocking on a separate HTTP transfer.
 * c) The CSS content may be made dynamic depending on init options.
 * @param {boolean} hasCss If false, don't inject CSS
 *     (providing CSS becomes the document's responsibility).
 * @param {string} pathToMedia Path from page to the Blockly media directory.
 */
eYo.Css.inject = (hasCss, pathToMedia) => {
  // Placeholder for cursor rule.  Must be first rule (index 0).
  var text = '.eyo-draggable {}\n'
  if (hasCss) {
    text += eYo.Css.CONTENT(pathToMedia).join('\n')
  }
  // Inject CSS tag at start of head.
  var cssNode = document.createElement('style');
  document.head.insertBefore(cssNode, document.head.firstChild);

  var cssTextNode = document.createTextNode(text);
  cssNode.appendChild(cssTextNode);
  Blockly.Css.styleSheet_ = cssNode.sheet;
  Blockly.Css.inject = eYo.Do.nothing
}

/**
 * Array making up the CSS content for Edython.
 */
eYo.Css.CONTENT = path => {
  return [/* So bricks in drag surface disappear at edges */
    `#eyo-desk {
  height: 100%;
  position: relative;
  overflow: hidden; 
  touch-action: none;
  background: orange;
}`,
    `.eyo-board {
}`, /* UNUSED */

    `.eyo-trash {
}`, /* UNUSED */

    `.eyo-brick-canvas {
}`, /* */

    '.eyo-board-drag-surface {',
      'display: none;',
      'position: absolute;',
      'top: 0;',
      'left: 0;',
    '}',
    /* Added as a separate rule with multiple classes to make it more specific
      than a bootstrap rule that selects svg:root. See issue #1275 for context.
    */
    `.eyo-board-drag-surface.eyo-overflow-visible {
  overflow: visible;
}
.eyo-flyout-scroolbar {
  z-index: 30;
}
.eyo-zoom>image {
  opacity: .4;
}
.eyo-zoom>image:hover {
  opacity: .6;
}
.eyo-zoom>image:active {
  opacity: .8;
}`,
    /* IE overflows by default. */
    `.eyo-svg {
  background-color: #fff;
  outline: none;
  overflow: hidden;
  position: absolute;
  display: block;
}`,
  /* Display below toolbox, but above everything else. */
    `.eyo-brick-drag-surface {
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: visible !important;
  z-index: 50;
}`,
    /* Change the cursor on the whole drag surface in case the mouse gets
      ahead of block during a drag. This way the cursor is still a closed hand.
    */
    /* backup for browsers (e.g. IE11) that don't support grabbing */
    `.eyo-brick-drag-surface .eyo-draggable {
  cursor: url("${path}/handclosed.cur"), auto;
  cursor: grabbing;
  cursor: -webkit-grabbing;
}`,
    /*
    Don't allow users to select text.  It gets annoying when trying to
    drag a block and selected text moves instead.
    */
  `.eyo-svg text, .eyo-brick-drag-surface text {
  user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -webkit-user-select: none;
  cursor: inherit;
}`,
    `.eyo-dragging.eyo-dragging-delete {
  cursor: url("${path}/handdelete.cur"), auto;
}`,





  //HERE
    '.blocklyNonSelectable {',
      'user-select: none;',
      '-moz-user-select: none;',
      '-ms-user-select: none;',
      '-webkit-user-select: none;',
    '}',

    '.eyo-draggable {',
      /* backup for browsers (e.g. IE11) that don't support grab */
      'cursor: url("${path}/handopen.cur"), auto;',
      'cursor: grab;',
      'cursor: -webkit-grab;',
    '}',

    '.eyo-dragging {',
      /* backup for browsers (e.g. IE11) that don't support grabbing */
      'cursor: url("${path}/handclosed.cur"), auto;',
      'cursor: grabbing;',
      'cursor: -webkit-grabbing;',
    '}',
    /* Changes cursor on mouse down. Not effective in Firefox because of
      https://bugzilla.mozilla.org/show_bug.cgi?id=771241 */
    '.eyo-draggable:active {',
      /* backup for browsers (e.g. IE11) that don't support grabbing */
      'cursor: url("${path}/handclosed.cur"), auto;',
      'cursor: grabbing;',
      'cursor: -webkit-grabbing;',
    '}',

    '.blocklyFlyout {',
      'position: absolute;',
      'z-index: 20;',
    '}',

    '.blocklyHidden {',
      'display: none;',
    '}',

    '.eyo-flyout-background {',
      'fill: #ddd;',
      'fill-opacity: .8;',
    '}',

    '.eyo-transparent-background {',// used
      'opacity: 0;',
    '}',

    `.eyo-main-board-scrollbar {
  z-index: 20;
}`,

    '.eyo-scrollbar-horizontal, .eyo-scrollbar-vertical {',
      'position: absolute;',
      'outline: none;',
    '}',

    '.eyo-scrollbar-background {',
      'opacity: 0;',
    '}',

    '.eyo-scrollbar-handle {',
      'fill: #ccc;',
    '}',

    '.eyo-scrollbar-background:hover+.eyo-scrollbar-handle,',
    '.eyo-scrollbar-handle:hover {',
      'fill: #bbb;',
    '}',

    /* Darken flyout scrollbars due to being on a grey background. */
    /* By contrast, board scrollbars are on a white background. */
    '.blocklyFlyout .eyo-scrollbar-handle {',
      'fill: #bbb;',
    '}',

    '.blocklyFlyout .eyo-scrollbar-background:hover+.eyo-scrollbar-handle,',
    '.blocklyFlyout .eyo-scrollbar-handle:hover {',
      'fill: #aaa;',
    '}',

    '.blocklyInvalidInput {',
      'background: #faa;',
    '}',

    '.blocklyContextMenu {',
      'border-radius: 4px;',
    '}',

    '.blocklyDropdownMenu {',
      'padding: 0 !important;',
      /* max-height value is same as the constant
      * Blockly.FieldDropdown.MAX_MENU_HEIGHT defined in field_dropdown.js. */
      'max-height: 300px !important;',
    '}',
    `.eyo-flyout {
  position: absolute;
  z-index: 20;
}`,
    `.eyo-flyout-background {
  fill: #ddd;
  fill-opacity: .8;
  pointer-events: all;
}`,
    `.eyo-flyout-scrollbar {
  z-index: 30;
}`,
    `.eyo-flyout-toolbar {
  position: absolute;
  pointer-events: all;
  height: 3.5rem;
  padding: 0;
  padding-left: 0.25rem;
  margin: 0;
  background: rgba(221,221,221,0.8);
}`,
    `.eyo-flyout-toolbar-general {
  position: absolute;
  pointer-events: all;
  height: 2rem;
  padding: 0.125rem;
  width: 100%;
  margin: 0;
}`,
    `.eyo-flyout-toolbar-module {
  position: absolute;
  pointer-events: all;
  height: 1.75rem;
  padding: 0.125rem;
  margin: 0;
  margin-top: 2.25rem;
  width: 100%;
}`,
    `.eyo-flyout-select-general,
.eyo-flyout-select-module {
  height: 100%;
  width: 100%;
  padding-left: 0.25rem;
  padding-right:0.25rem;
  margin: 0
}`,
    `.eyo-flyout-control {
  background: #ddd;
  opacity: 0.79;
  height: 50%;
  width: 1.25rem;
  position: absolute;
  top: 0px;
}`,
    (radius =>
      `.eyo-flyout-control left {
  border-top-right-radius:${radius};
  border-bottom-right-radius:${radius};
  -webkit-border-top-right-radius:${radius};
  -webkit-border-bottom-right-radius:${radius};
  -moz-border-radius-topright:${radius};
  -moz-border-radius-bottomright:${radius};
  border-top-right-radius:${radius};
  border-bottom-right-radius:${radius};
  right: -1.25rem;
}
.eyo-flyout-control {
  border-top-left-radius:${radius};
  border-bottom-left-radius:${radius};
  -webkit-border-top-left-radius:${radius};
  -webkit-border-bottom-left-radius:${radius};
  -moz-border-radius-topleft:${radius};
  -moz-border-radius-bottomleft:${radius};
  border-top-left-radius:${radius};
  border-bottom-left-radius:${radius};
  left: -1.25rem;
}`
    )('1.125rem;'),
    `.eyo-flyout-control-image {
  width: 1.125rem;
  height: 2.25rem;
}
.eyo-flyout-control-image path {
  fill: white;
}
.eyo-flyout-control-image path:hover {
  fill:black;
  fill-opacity: 0.075;
}
.eyo-flash .eyo-flyout-control-image path,
.eyo-flash .eyo-flyout-control-image path:hover {
  fill:black;
  fill-opacity:0.2;
}
.eyo-flyout-toolbar .eyo-menu-button {
  background: #952276;
  box-shadow: 0px 3px 8px #888;
  border:0;
}
.eyo-flyout-toolbar .eyo-menu-button:hover {
  box-shadow: 0px 2px 6px #444;
}
.eyo-menu-button-outer-box {
  padding-left: 10px;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  -moz-box-sizing: border-box;
  -webkit-box-sizing: border-box;
}
.eyo-menu-button-inner-box {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  -moz-box-sizing: border-box;
  -webkit-box-sizing: border-box;
  padding-right: 30px;
}
.eyo-flyout-toolbar .eyo-menu-button-caption {
  color: white;
  vertical-align: middle;
}
.eyo-menu-button-dropdown svg {
  position: absolute;
  top: 0px;
  width: 12px;
  height: 6px;
}
.eyo-menu-button-dropdown-image {
  fill: white;
}`,
    `.eyoMainBackground {
  stroke-width: 5;
  stroke: none;
}
.eyo-brick .blocklyText,
.eyo-var,
.eyo-label,
.eyo-code,
.eyo-code-reserved,
.eyo-code-builtin,
.eyo-code-comment,
.eyo-code-placeholder,
.eyo-sharp-group{
  ${eYo.Font.style};
}
.eyo-error.eyo-path-selected,
.eyo-error.eyo-path-hilighted,
.eyo-error.eyo-path-shape,
.eyo-error.eyo-path-contour,
.eyo-error.eyo-path-inner {
  stroke:${eYo.Style.Path.Error.colour};
  stroke-width: ${eYo.Style.Path.Error.width}px;
}
.eyo-path-selected,
.eyo-path-hilighted {
  stroke: ${eYo.Style.Path.Hilighted.colour};
  fill: none;
}
.eyo-path-hilighted {
  stroke-width: ${eYo.Style.Path.Hilighted.width}px;
}
.eyo-select .eyo-path-contour.eyo-error,
.eyo-select .eyo-path-inner.eyo-error {
  stroke: ${eYo.Style.Path.Error.colour};
}
.eyo-checkbox-icon-rect {
  stroke: ${eYo.Shape.Style.colour.light};
  stroke-width: ${eYo.Shape.Style.width.light}px;
  fill: white;
}
.eyo-checkbox-icon-rect {
  stroke: ${eYo.Shape.Style.colour.light};
  stroke-width: ${eYo.Shape.Style.width.light}px;
  fill: white;
}
.eyo-medium .eyo-checkbox-icon-rect {
  stroke: ${eYo.Shape.Style.colour.medium};
  stroke-width: ${eYo.Shape.Style.width.medium}px;
  fill: white;
}
.eyo-dark .eyo-checkbox-icon-rect {
  stroke: ${eYo.Shape.Style.colour.dark};
  stroke-width: ${eYo.Shape.Style.width.dark}px;
  fill: white;
}
.eyo-locked.eyo-path-contour,
.eyo-locked.eyo-path-inner,
.eyo-locked.eyo-path-shape,
.eyo-locked.eyo-edit,
.eyo-locked.eyo-edit{
  display: none
}
.eyo-path-shape {
  stroke: none;
  fill: white;
  fill-opacity:0.92
}
.eyo-path-bbox {
  stroke: ${eYo.Style.Path.bbox_colour};
  stroke-width: ${eYo.Shape.Style.width.light}px;
  fill: none;
}
.eyo-inner .eyo-path-shape {
  stroke: none;
  fill-opacity:0
}
.eyo-stmt.eyo-inner .eyo-path-shape {
  stroke: none;
  fill-opacity:0.92;
}
.eyo-path-contour,
.eyo-path-inner,
.eyo-path-collapsed,
.eyo-path-play-contour {
  stroke: ${eYo.Shape.Style.colour.light};
  stroke-width: ${eYo.Shape.Style.width.light}px;
  fill: none;
  pointer-events: all;
  stroke-linejoin: round;
}
.eyo-medium .eyo-path-contour,
.eyo-medium .eyo-path-inner,
.eyo-medium .eyo-path-collapsed,
.eyo-medium .eyo-path-play-contour {
  stroke: ${eYo.Shape.Style.colour.medium};
  stroke-width: ${eYo.Shape.Style.width.medium}px;
  fill: none;
  pointer-events: all;
  stroke-linejoin: round;
}
.eyo-dark .eyo-path-contour,
.eyo-dark .eyo-path-inner,
.eyo-dark .eyo-path-collapsed,
.eyo-dark .eyo-path-play-contour {
  stroke: ${eYo.Shape.Style.colour.dark};
  stroke-width: ${eYo.Shape.Style.width.dark}px;
  fill: none;
  pointer-events: all;
  stroke-linejoin: round;
}
.eyo-path-selected {
  pointer-events: none;
}
.eyo-inner.eyo-expr .eyo-path-contour,
.eyo-inner.eyo-expr .eyo-path-collapsed {
  stroke: ${eYo.Shape.Style.inner_colour.light};
}
.eyo-medium .eyo-inner.eyo-expr .eyo-path-contour,
.eyo-medium .eyo-inner.eyo-expr .eyo-path-collapsed {
  stroke: ${eYo.Shape.Style.inner_colour.medium};
}
.eyo-dark .eyo-inner.eyo-expr .eyo-path-contour,
.eyo-dark .eyo-inner.eyo-expr .eyo-path-collapsed {
  stroke: ${eYo.Shape.Style.inner_colour.dark};
}`,
    `.eyo-code-emph {
  font-weight: bold;
}
.eyo-code-reserved,
.eyo-code-builtin,
.eyo-sharp-group {
  font-weight: bold!important;
  color: rgba(0, 84, 147, 0.75)!important;
  fill: rgba(0, 84, 147, 0.75)!important;
}
.eyo-code-builtin {
  font-weight: bold;
  color: rgba(60, 0, 145, 0.75);
  fill: rgba(60, 0, 145, 0.75);
}`,
    `.eyo-start>g>.eyo-code-comment {
  font-style: normal;
  font-weight: bold;
}
.eyo-start-path {
  fill: rgba(240, 240, 240, 0.97);
}
.eyo-path-play-contour {
  fill: rgba(255, 255, 255, 0.8);
}
.eyo-start>text.eyo-code-reserved.eyo-label {
  opacity:0;
}
.eyo-code-placeholder {
  fill: rgba(0, 0, 0, 0.4);
}
input-code-error {
  color: red;
}
text.eyo-code-error {
  fill: red;
}
text.eyo-code-comment {
  fill: rgba(42, 132, 45, 0.8);
}
.eyo-code-disabled {
  color: #ccc;
}`,
    `.eyo-select.eyo-expr .eyo-path-contour,
.eyo-select.eyo-stmt .eyo-path-contour,
.eyo-select.eyo-expr .eyo-path-inner {
  stroke: ${eYo.Style.Path.Hilighted.colour};
}
.eyo-select.eyo-stmt>.eyo-path-contour,
.eyo-select.eyo-stmt>.eyo-path-inner,
.eyo-select.eyo-stmt>.eyo-expr .eyo-path-contour,
.eyo-select.eyo-stmt>.eyo-expr .eyo-path-inner {
  stroke: ${eYo.Style.Path.Hilighted.colour};
}
.eyo-code-placeholder,
.eyo-code-comment {
  font-style: oblique;
}
.eyo-hilighted-magnet-path{
  stroke: ${eYo.Style.Path.Hilighted.colour};
  stroke-width: ${eYo.Style.Path.Hilighted.width}px;
  fill: none;
}`,
`.eyo-main-board-background {
  fill: green;
}`,
`.eyo-board-dragger-background {
  fill: rgba(255, 0, 127, 0.3)
}`,
`.eyo-main-board-background.eyo-draft {
  fill: gainsboro;
}`,
`#eyo-desk svg { pointer-events: none; }
#eyo-desk svg * { pointer-events: all; }
`,
  ]
}
