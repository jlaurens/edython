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

goog.require('eYo')


goog.provide('eYo.Style')
goog.provide('eYo.Font')
goog.provide('eYo.Padding')

goog.require('eYo')

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
  return function () {
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
  eYo.Css.insertRuleAt(null)
})

eYo.setup.register(() => {
  eYo.Css.insertRuleAt(
    `.eyoMainBackground {
      stroke-width: 5;
      stroke: none;
    }
  `)
}, 'OVERRIDE')

eYo.setup.register(() => {
  eYo.Css.insertRuleAt(
    `.eyo-brick .blocklyText,
    .eyo-var,
    .eyo-label,
    .eyo-code,
    .eyo-code-reserved,
    .eyo-code-builtin,
    .eyo-code-comment,
    .eyo-code-placeholder,
    .eyo-sharp-group{
      ${eYo.Font.style};
    }`
  )
  eYo.Css.insertRuleAt(
    `.eyo-error.eyo-path-selected,
    .eyo-error.eyo-path-hilighted,
    .eyo-error.eyo-path-shape,
    .eyo-error.eyo-path-contour,
    .eyo-error.eyo-path-inner {
      stroke:${eYo.Style.Path.Error.colour};
      stroke-width: ${eYo.Style.Path.Error.width}px;
    }`
  )
  eYo.Css.insertRuleAt(
    `.eyo-path-selected,
    .eyo-path-hilighted {
      stroke: ${eYo.Style.Path.Hilighted.colour};
      fill: none;
    }`
  )
  eYo.Css.insertRuleAt(
    `.eyo-path-hilighted {
      stroke-width: ${eYo.Style.Path.Hilighted.width}px;
    }`
  )
  eYo.Css.insertRuleAt(
    `.eyo-select .eyo-path-contour.eyo-error,
    .eyo-select .eyo-path-inner.eyo-error {
      stroke: ${eYo.Style.Path.Error.colour};
    }`
  )
  eYo.Css.insertRuleAt(
    `.eyo-checkbox-icon-rect {
      stroke: ${eYo.Shape.Style.colour.light};
      stroke-width: ${eYo.Shape.Style.width.light}px;
      fill: white;
    }`
  )
  eYo.Css.insertRuleAt(
    `.eyo-checkbox-icon-rect {
      stroke: ${eYo.Shape.Style.colour.light};
      stroke-width: ${eYo.Shape.Style.width.light}px;
      fill: white;
    }`
  )
  eYo.Css.insertRuleAt(
    `.eyo-medium .eyo-checkbox-icon-rect {
      stroke: ${eYo.Shape.Style.colour.medium};
      stroke-width: ${eYo.Shape.Style.width.medium}px;
      fill: white;
    }`
  )
  eYo.Css.insertRuleAt(
    `.eyo-dark .eyo-checkbox-icon-rect {
      stroke: ${eYo.Shape.Style.colour.dark};
      stroke-width: ${eYo.Shape.Style.width.dark}px;
      fill: white;
    }`
  )
  eYo.Css.insertRuleAt(
    `.eyo-locked.eyo-path-contour,
    .eyo-locked.eyo-path-inner,
    .eyo-locked.eyo-path-shape,
    .eyo-locked.eyo-edit,
    .eyo-locked.eyo-edit{
      display: none
    }`
  )
  eYo.Css.insertRuleAt(
    `.eyo-path-shape {
      stroke: none;
      fill: white;
      fill-opacity:0.92
    }`
  )
  eYo.Css.insertRuleAt(
    `.eyo-path-bbox {
      stroke: ${eYo.Style.Path.bbox_colour};
      stroke-width: ${eYo.Shape.Style.width.light}px;
      fill: none;
    }`
  )
  eYo.Css.insertRuleAt(
    `.eyo-inner .eyo-path-shape {
      stroke: none;
      fill-opacity:0
    }`
  )
  eYo.Css.insertRuleAt(
    `.eyo-stmt.eyo-inner .eyo-path-shape {
      stroke: none;
      fill-opacity:0.92;
    }`
  )
  eYo.Css.insertRuleAt(
    `.eyo-path-contour,
    .eyo-path-inner,
    .eyo-path-collapsed,
    .eyo-path-play-contour {
      stroke: ${eYo.Shape.Style.colour.light};
      stroke-width: ${eYo.Shape.Style.width.light}px;
      fill: none;
      pointer-events: all;
      stroke-linejoin="round";
    }`
  )
  eYo.Css.insertRuleAt(
    `.eyo-medium .eyo-path-contour,
    .eyo-medium .eyo-path-inner,
    .eyo-medium .eyo-path-collapsed,
    .eyo-medium .eyo-path-play-contour {
      stroke: ${eYo.Shape.Style.colour.medium};
      stroke-width: ${eYo.Shape.Style.width.medium}px;
      fill: none;
      pointer-events: all;
      stroke-linejoin="round";
    }`
  )
  eYo.Css.insertRuleAt(
    `.eyo-dark .eyo-path-contour,
    .eyo-dark .eyo-path-inner,
    .eyo-dark .eyo-path-collapsed,
    .eyo-dark .eyo-path-play-contour {
      stroke: ${eYo.Shape.Style.colour.dark};
      stroke-width: ${eYo.Shape.Style.width.dark}px;
      fill: none;
      pointer-events: all;
      stroke-linejoin="round";
    }`
  )
  eYo.Css.insertRuleAt(
    `.eyo-path-selected {
      pointer-events: none;
    }`
  )
  eYo.Css.insertRuleAt(
    `.eyo-inner.eyo-expr .eyo-path-contour,
    .eyo-inner.eyo-expr .eyo-path-collapsed {
      stroke: ${eYo.Shape.Style.inner_colour.light};
    }`
  )
  eYo.Css.insertRuleAt(
    `.eyo-medium .eyo-inner.eyo-expr .eyo-path-contour,
    .eyo-medium .eyo-inner.eyo-expr .eyo-path-collapsed {
      stroke: ${eYo.Shape.Style.inner_colour.medium};
    }`
  )
  eYo.Css.insertRuleAt(
    `.eyo-dark .eyo-inner.eyo-expr .eyo-path-contour,
    .eyo-dark .eyo-inner.eyo-expr .eyo-path-collapsed {
      stroke: ${eYo.Shape.Style.inner_colour.dark};
    }`
  )
   // When the selected brick is a statement
  // only the following and suite statements are highlighted
  // the expression statements are selected only when the parent
  // is a selected statement, or the parent is an highlighted expression
  // eyo-expr selector for expressions
  // eyo-stmt selector for statements
  // eyo-inner when there is a parent or not
  // Find the proper selectors
  // When an expression is selected
  eYo.Css.insertRuleAt(
    `.eyo-select.eyo-expr .eyo-path-contour,
    .eyo-select.eyo-stmt .eyo-path-contour,
    .eyo-select.eyo-expr .eyo-path-inner {
      stroke: ${eYo.Style.Path.Hilighted.colour};
    }`
  )
  // When a statement is selected, select only statements
  eYo.Css.insertRuleAt(
    `.eyo-select.eyo-stmt>.eyo-path-contour,
    .eyo-select.eyo-stmt>.eyo-path-inner {
      stroke: ${eYo.Style.Path.Hilighted.colour};
    }`
  )
  //, .eyo-select.eyo-stmt *:not(.eyo-expr)>.eyo-path-contour,
  // .eyo-select.eyo-stmt *:not(.eyo-expr)>.eyo-path-inner

  // When a statement is selected, select only expressions of that statement
  eYo.Css.insertRuleAt(
    `.eyo-select.eyo-stmt>.eyo-expr .eyo-path-contour,
    .eyo-select.eyo-stmt>.eyo-expr .eyo-path-inner {
      stroke: ${eYo.Style.Path.Hilighted.colour};
    }`
  )
  eYo.Css.insertRuleAt(
    `.eyo-start-path {
      fill: rgba(240, 240, 240, 0.97);
    }`
  )
  eYo.Css.insertRuleAt(
    `.eyo-path-play-contour {
      fill: rgba(255, 255, 255, 0.8);
    }`
  )
  eYo.Css.insertRuleAt(
    `.eyo-none {
      stroke: none;
      fill: none;
    }`
  )
  eYo.Css.insertRuleAt(
    `.eyo-edit {
      stroke: none;
      stroke-width:${eYo.Style.Edit.width}px;
      fill: none;
    }`
  )
  eYo.Css.insertRuleAt(
    `.eyo-select>g>g>.eyo-edit,
    .eyo-select>g>.eyo-edit {
      stroke: ${eYo.Shape.Style.colour.light};
    }`
  )
  eYo.Css.insertRuleAt(
    `.eyo-medium .eyo-select>g>g>.eyo-edit,
    .eyo-select>g>.eyo-edit {
      stroke: ${eYo.Shape.Style.colour.medium};
    }`
  )
  eYo.Css.insertRuleAt(
    `.eyo-dark .eyo-select>g>g>.eyo-edit,
    .eyo-select>g>.eyo-edit {
      stroke: ${eYo.Shape.Style.colour.dark};
    }`
  )
  eYo.Css.insertRuleAt(
    `rect.eyo-editing,
    .eyo-locked .eyo-edit,
    .eyo-select>g.eyo-locked>g>.eyo-edit,
    .eyo-select>g.eyo-locked>.eyo-edit {
      stroke: none;
    }`
  )
  eYo.Css.insertRuleAt(
    `.eyo-path-dotted {
      stroke: ${eYo.Shape.Style.colour.light};
      stroke-width: ${(eYo.Shape.Style.width.light * 1.5)}px;
      stroke-linecap: round;
      stroke-dasharray: 0 ${eYo.Font.space / 2};
    }`
  )
  eYo.Css.insertRuleAt(
    `.eyo-no-path {
      display: none;
    }`,
    5
  )
  eYo.Css.insertRuleAt(
    `.eyo-code-emph {
      font-weight: bold;
    }`
  )
  eYo.Css.insertRuleAt(
    `.eyo-code-reserved,
    .eyo-code-builtin,
    .eyo-sharp-group {
      font-weight: bold!important;
      color: rgba(0, 84, 147, 0.75)!important;
      fill: rgba(0, 84, 147, 0.75)!important;
    }`
  )
  eYo.Css.insertRuleAt(
    `.eyo-code-builtin {
      font-weight: bold;
      color: rgba(60, 0, 145, 0.75);
      fill: rgba(60, 0, 145, 0.75);
    }`
  )
  eYo.Css.insertRuleAt(
    `.eyo-menuitem-disabled .eyo-code-reserved {
      color: rgba(60, 0, 145, 0.3);
      fill: rgba(0, 84, 147, 0.3);
    }`
  )
  eYo.Css.insertRuleAt(
    `.eyo-menuitem-disabled .eyo-code-builtin {
      font-weight: bold;
      color: rgba(60, 0, 145, 0.3);
      fill: rgba(60, 0, 145, 0.3);
    }`
  )
  eYo.Css.insertRuleAt(
    `.eyo-code-placeholder,
    .eyo-code-comment {
      font-style: oblique;
    }`
  )
  eYo.Css.insertRuleAt(
    `.eyo-start>g>.eyo-code-comment {
      font-style: normal;
      font-weight: bold;
    }`
  )
  eYo.Css.insertRuleAt(
    `.eyo-start>text.eyo-code-reserved.eyo-label {
      opacity:0;
    }`
  )
  eYo.Css.insertRuleAt(
    `.eyo-code-placeholder {
      fill: rgba(0, 0, 0, 0.4);
    }`
  )
  eYo.Css.insertRuleAt(
    `input-code-error {
      color: red;
    }`
  )
  eYo.Css.insertRuleAt(
    `text.eyo-code-error {
      fill: red;
    }`
  )
  eYo.Css.insertRuleAt(
    `text.eyo-code-comment {
      fill: rgba(42, 132, 45, 0.8);
    }`
  )
  eYo.Css.insertRuleAt(
    `.eyo-code-disabled {
      color: #ccc;
    }`
  )
  eYo.Css.insertRuleAt(
    `.blocklyHighlightedConnectionPath{
      stroke: ${eYo.Style.Path.Hilighted.colour};
      stroke-width: ${eYo.Style.Path.Hilighted.width}px;
      fill: none;
    }`
  )
  eYo.Css.insertRuleAt(
      `.blocklyHighlightedConnectionPathH{
        fill: ${eYo.Style.Path.Hilighted.colour};
        stroke: none;
    }`
  )
}, 'Style')

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
 * Set the cursor to be displayed when over something draggable.
 * See See https://github.com/google/blockly/issues/981 for context.
 * @param {Blockly.Css.Cursor} cursor Enum.
 * @deprecated April 2017.
 */
Blockly.Css.setCursor = function(cursor) {
  console.warn('Deprecated call to Blockly.Css.setCursor.' +
    'See https://github.com/google/blockly/issues/981 for context');
}

/**
 * Large stylesheet added by Blockly.Css.inject.
 * @type {Element}
 * @private
 */
Blockly.Css.styleSheet_ = null;

/**
 * Path to media directory, with any trailing slash removed.
 * @type {string}
 * @private
 */
Blockly.Css.mediaPath_ = '';

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
Blockly.Css.inject = function(hasCss, pathToMedia) {
  // Only inject the CSS once.
  if (Blockly.Css.styleSheet_) {
    return;
  }
  // Placeholder for cursor rule.  Must be first rule (index 0).
  var text = '.blocklyDraggable {}\n';
  if (hasCss) {
    text += Blockly.Css.CONTENT.join('\n');
  }
  // Strip off any trailing slash (either Unix or Windows).
  Blockly.Css.mediaPath_ = pathToMedia.replace(/[\\\/]$/, '');
  text = text.replace(/<<<PATH>>>/g, Blockly.Css.mediaPath_);
  // Inject CSS tag at start of head.
  var cssNode = document.createElement('style');
  document.head.insertBefore(cssNode, document.head.firstChild);

  var cssTextNode = document.createTextNode(text);
  cssNode.appendChild(cssTextNode);
  Blockly.Css.styleSheet_ = cssNode.sheet;
}

/**
 * Array making up the CSS content for Blockly.
 */
Blockly.Css.CONTENT = [
  '.injectionDiv {', /* -> eyo-workspace-container */
    'height: 100%;',
    'position: relative;',
    'overflow: hidden;', /* So blocks in drag surface disappear at edges */
    'touch-action: none',
  '}',

  `.eyo-workspace {
  }`, /* UNUSED */

  '.blocklyMainBackground {',
    'stroke-width: 1;',
    'stroke: #c6c6c6;',  /* Equates to #ddd due to border being off-pixel. */
  '}',

  `.eyo-trash {
  }`, /* UNUSED */

  `.eyo-brick-canvas {
  }`, /* */

  '.blocklyWsDragSurface {',
    'display: none;',
    'position: absolute;',
    'top: 0;',
    'left: 0;',
  '}',
  /* Added as a separate rule with multiple classes to make it more specific
    than a bootstrap rule that selects svg:root. See issue #1275 for context.
  */
  '.blocklyWsDragSurface.blocklyOverflowVisible {',
    'overflow: visible;',
  '}',

  '.blocklyBlockDragSurface {',
    'display: none;',
    'position: absolute;',
    'top: 0;',
    'left: 0;',
    'right: 0;',
    'bottom: 0;',
    'overflow: visible !important;',
    'z-index: 50;', /* Display below toolbox, but above everything else. */
  '}',
  '.blocklySvg {',
  'background-color: #fff;',
  'outline: none;',
  'overflow: hidden;',  /* IE overflows by default. */
  'position: absolute;',
  'display: block;',
  '}',









  '.blocklyNonSelectable {',
    'user-select: none;',
    '-moz-user-select: none;',
    '-ms-user-select: none;',
    '-webkit-user-select: none;',
  '}',

 
  '.blocklyTooltipDiv {',
    'background-color: #ffffc7;',
    'border: 1px solid #ddc;',
    'box-shadow: 4px 4px 20px 1px rgba(0,0,0,.15);',
    'color: #000;',
    'display: none;',
    'font-family: sans-serif;',
    'font-size: 9pt;',
    'opacity: .9;',
    'padding: 2px;',
    'position: absolute;',
    'z-index: 100000;', /* big value for bootstrap3 compatibility */
  '}',

  '.blocklyResizeSE {',
    'cursor: se-resize;',
    'fill: #aaa;',
  '}',

  '.blocklyResizeSW {',
    'cursor: sw-resize;',
    'fill: #aaa;',
  '}',

  '.blocklyResizeLine {',
    'stroke: #888;',
    'stroke-width: 1;',
  '}',

  '.blocklyHighlightedConnectionPath {',
    'fill: none;',
    'stroke: #fc3;',
    'stroke-width: 4px;',
  '}',

  '.blocklyPathLight {',
    'fill: none;',
    'stroke-linecap: round;',
    'stroke-width: 1;',
  '}',

  '.blocklySelected>.blocklyPath {',
    'stroke: #fc3;',
    'stroke-width: 3px;',
  '}',

  '.blocklySelected>.blocklyPathLight {',
    'display: none;',
  '}',

  '.blocklyDraggable {',
    /* backup for browsers (e.g. IE11) that don't support grab */
    'cursor: url("<<<PATH>>>/handopen.cur"), auto;',
    'cursor: grab;',
    'cursor: -webkit-grab;',
  '}',

   '.blocklyDragging {',
    /* backup for browsers (e.g. IE11) that don't support grabbing */
    'cursor: url("<<<PATH>>>/handclosed.cur"), auto;',
    'cursor: grabbing;',
    'cursor: -webkit-grabbing;',
  '}',
  /* Changes cursor on mouse down. Not effective in Firefox because of
    https://bugzilla.mozilla.org/show_bug.cgi?id=771241 */
  '.blocklyDraggable:active {',
    /* backup for browsers (e.g. IE11) that don't support grabbing */
    'cursor: url("<<<PATH>>>/handclosed.cur"), auto;',
    'cursor: grabbing;',
    'cursor: -webkit-grabbing;',
  '}',
  /* Change the cursor on the whole drag surface in case the mouse gets
     ahead of block during a drag. This way the cursor is still a closed hand.
   */
  '.blocklyBlockDragSurface .blocklyDraggable {',
    /* backup for browsers (e.g. IE11) that don't support grabbing */
    'cursor: url("<<<PATH>>>/handclosed.cur"), auto;',
    'cursor: grabbing;',
    'cursor: -webkit-grabbing;',
  '}',

  '.blocklyDragging.blocklyDraggingDelete {',
    'cursor: url("<<<PATH>>>/handdelete.cur"), auto;',
  '}',

  '.blocklyToolboxDelete {',
    'cursor: url("<<<PATH>>>/handdelete.cur"), auto;',
  '}',

  '.blocklyToolboxGrab {',
    'cursor: url("<<<PATH>>>/handclosed.cur"), auto;',
    'cursor: grabbing;',
    'cursor: -webkit-grabbing;',
  '}',

  '.blocklyDragging>.blocklyPath,',
  '.blocklyDragging>.blocklyPathLight {',
    'fill-opacity: .8;',
    'stroke-opacity: .8;',
  '}',

  '.blocklyDragging>.blocklyPathDark {',
    'display: none;',
  '}',

  '.blocklyDisabled>.blocklyPath {',
    'fill-opacity: .5;',
    'stroke-opacity: .5;',
  '}',

  '.blocklyDisabled>.blocklyPathLight,',
  '.blocklyDisabled>.blocklyPathDark {',
    'display: none;',
  '}',

  '.blocklyText {',
    'cursor: default;',
    'fill: #fff;',
    'font-family: sans-serif;',
    'font-size: 11pt;',
  '}',

  '.blocklyNonEditableText>text {',
    'pointer-events: none;',
  '}',

  '.blocklyNonEditableText>rect,',
  '.blocklyEditableText>rect {',
    'fill: #fff;',
    'fill-opacity: .6;',
  '}',

  '.blocklyNonEditableText>text,',
  '.blocklyEditableText>text {',
    'fill: #000;',
  '}',

  '.blocklyEditableText:hover>rect {',
    'stroke: #fff;',
    'stroke-width: 2;',
  '}',

  '.blocklyFlyout {',
    'position: absolute;',
    'z-index: 20;',
  '}',
  '.blocklyFlyoutButton {',
    'fill: #888;',
    'cursor: default;',
  '}',

  '.blocklyFlyoutButtonShadow {',
    'fill: #666;',
  '}',

  '.blocklyFlyoutButton:hover {',
    'fill: #aaa;',
  '}',

  '.blocklyFlyoutLabel {',
    'cursor: default;',
  '}',

  '.blocklyFlyoutLabelBackground {',
    'opacity: 0;',
  '}',

  '.blocklyFlyoutLabelText {',
    'fill: #000;',
  '}',

  /*
    Don't allow users to select text.  It gets annoying when trying to
    drag a block and selected text moves instead.
  */
  '.blocklySvg text, .blocklyBlockDragSurface text {',
    'user-select: none;',
    '-moz-user-select: none;',
    '-ms-user-select: none;',
    '-webkit-user-select: none;',
    'cursor: inherit;',
  '}',

  '.blocklyHidden {',
    'display: none;',
  '}',

  '.blocklyFieldDropdown:not(.blocklyHidden) {',
    'display: block;',
  '}',

  '.blocklyIconGroup {',
    'cursor: default;',
  '}',

  '.blocklyIconGroup:not(:hover),',
  '.blocklyIconGroupReadonly {',
    'opacity: .6;',
  '}',

  '.blocklyIconShape {',
    'fill: #00f;',
    'stroke: #fff;',
    'stroke-width: 1px;',
  '}',

  '.blocklyIconSymbol {',
    'fill: #fff;',
  '}',

  '.blocklyMinimalBody {',
    'margin: 0;',
    'padding: 0;',
  '}',

  '.blocklyCommentTextarea {',
    'background-color: #ffc;',
    'border: 0;',
    'outline: 0;',
    'margin: 0;',
    'padding: 2px;',
    'resize: none;',
    'display: block;',
    'overflow: hidden;',
  '}',

  '.blocklyHtmlInput {',
    'border: none;',
    'border-radius: 4px;',
    'font-family: sans-serif;',
    'height: 100%;',
    'margin: 0;',
    'outline: none;',
    'padding: 0 1px;',
    'width: 100%',
  '}',

  '.blocklyMutatorBackground {',
    'fill: #fff;',
    'stroke: #ddd;',
    'stroke-width: 1;',
  '}',

  '.blocklyFlyoutBackground {',
    'fill: #ddd;',
    'fill-opacity: .8;',
  '}',

  '.blocklyTransparentBackground {',
    'opacity: 0;',
  '}',

  '.blocklyMainWorkspaceScrollbar {',
    'z-index: 20;',
  '}',

  '.blocklyFlyoutScrollbar {',
    'z-index: 30;',
  '}',

  '.blocklyScrollbarHorizontal, .blocklyScrollbarVertical {',
    'position: absolute;',
    'outline: none;',
  '}',

  '.blocklyScrollbarBackground {',
    'opacity: 0;',
  '}',

  '.blocklyScrollbarHandle {',
    'fill: #ccc;',
  '}',

  '.blocklyScrollbarBackground:hover+.blocklyScrollbarHandle,',
  '.blocklyScrollbarHandle:hover {',
    'fill: #bbb;',
  '}',

  '.blocklyZoom>image {',
    'opacity: .4;',
  '}',

  '.blocklyZoom>image:hover {',
    'opacity: .6;',
  '}',

  '.blocklyZoom>image:active {',
    'opacity: .8;',
  '}',

  /* Darken flyout scrollbars due to being on a grey background. */
  /* By contrast, workspace scrollbars are on a white background. */
  '.blocklyFlyout .blocklyScrollbarHandle {',
    'fill: #bbb;',
  '}',

  '.blocklyFlyout .blocklyScrollbarBackground:hover+.blocklyScrollbarHandle,',
  '.blocklyFlyout .blocklyScrollbarHandle:hover {',
    'fill: #aaa;',
  '}',

  '.blocklyInvalidInput {',
    'background: #faa;',
  '}',

  '.blocklyAngleCircle {',
    'stroke: #444;',
    'stroke-width: 1;',
    'fill: #ddd;',
    'fill-opacity: .8;',
  '}',

  '.blocklyAngleMarks {',
    'stroke: #444;',
    'stroke-width: 1;',
  '}',

  '.blocklyAngleGauge {',
    'fill: #f88;',
    'fill-opacity: .8;',
  '}',

  '.blocklyAngleLine {',
    'stroke: #f00;',
    'stroke-width: 2;',
    'stroke-linecap: round;',
    'pointer-events: none;',
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

  /* Override the default Closure URL. */
  '.blocklyWidgetDiv .goog-option-selected .goog-menuitem-checkbox,',
  '.blocklyWidgetDiv .goog-option-selected .goog-menuitem-icon {',
    'background: url(<<<PATH>>>/sprites.png) no-repeat -48px -16px !important;',
  '}',

  /* Category tree in Toolbox. */
  '.blocklyToolboxDiv {',
    'background-color: #ddd;',
    'overflow-x: visible;',
    'overflow-y: auto;',
    'position: absolute;',
    'user-select: none;',
    '-moz-user-select: none;',
    '-ms-user-select: none;',
    '-webkit-user-select: none;',
    'z-index: 70;', /* so blocks go under toolbox when dragging */
    '-webkit-tap-highlight-color: transparent;', /* issue #1345 */
  '}',

  '.blocklyTreeRoot {',
    'padding: 4px 0;',
  '}',

  '.blocklyTreeRoot:focus {',
    'outline: none;',
  '}',

  '.blocklyTreeRow {',
    'height: 22px;',
    'line-height: 22px;',
    'margin-bottom: 3px;',
    'padding-right: 8px;',
    'white-space: nowrap;',
  '}',

  '.blocklyHorizontalTree {',
    'float: left;',
    'margin: 1px 5px 8px 0;',
  '}',

  '.blocklyHorizontalTreeRtl {',
    'float: right;',
    'margin: 1px 0 8px 5px;',
  '}',

  '.blocklyToolboxDiv[dir="RTL"] .blocklyTreeRow {',
    'margin-left: 8px;',
  '}',

  '.blocklyTreeRow:not(.blocklyTreeSelected):hover {',
    'background-color: #e4e4e4;',
  '}',

  '.blocklyTreeSeparator {',
    'border-bottom: solid #e5e5e5 1px;',
    'height: 0;',
    'margin: 5px 0;',
  '}',

  '.blocklyTreeSeparatorHorizontal {',
    'border-right: solid #e5e5e5 1px;',
    'width: 0;',
    'padding: 5px 0;',
    'margin: 0 5px;',
  '}',


  '.blocklyTreeIcon {',
    'background-image: url(<<<PATH>>>/sprites.png);',
    'height: 16px;',
    'vertical-align: middle;',
    'width: 16px;',
  '}',

  '.blocklyTreeIconClosedLtr {',
    'background-position: -32px -1px;',
  '}',

  '.blocklyTreeIconClosedRtl {',
    'background-position: 0 -1px;',
  '}',

  '.blocklyTreeIconOpen {',
    'background-position: -16px -1px;',
  '}',

  '.blocklyTreeSelected>.blocklyTreeIconClosedLtr {',
    'background-position: -32px -17px;',
  '}',

  '.blocklyTreeSelected>.blocklyTreeIconClosedRtl {',
    'background-position: 0 -17px;',
  '}',

  '.blocklyTreeSelected>.blocklyTreeIconOpen {',
    'background-position: -16px -17px;',
  '}',

  '.blocklyTreeIconNone,',
  '.blocklyTreeSelected>.blocklyTreeIconNone {',
    'background-position: -48px -1px;',
  '}',

  '.blocklyTreeLabel {',
    'cursor: default;',
    'font-family: sans-serif;',
    'font-size: 16px;',
    'padding: 0 3px;',
    'vertical-align: middle;',
  '}',

  '.blocklyToolboxDelete .blocklyTreeLabel {',
    'cursor: url("<<<PATH>>>/handdelete.cur"), auto;',
  '}',

  '.blocklyTreeSelected .blocklyTreeLabel {',
    'color: #fff;',
  '}',

  /* Copied from: goog/css/colorpicker-simplegrid.css */
  /*
   * Copyright 2007 The Closure Library Authors. All Rights Reserved.
   *
   * Use of this source code is governed by the Apache License, Version 2.0.
   * See the COPYING file for details.
   */

  /* Author: pupius@google.com (Daniel Pupius) */

  /*
    Styles to make the colorpicker look like the old gmail color picker
    NOTE: without CSS scoping this will override styles defined in palette.css
  */
  '.blocklyWidgetDiv .goog-palette {',
    'outline: none;',
    'cursor: default;',
  '}',

  '.blocklyWidgetDiv .goog-palette-table {',
    'border: 1px solid #666;',
    'border-collapse: collapse;',
  '}',

  '.blocklyWidgetDiv .goog-palette-cell {',
    'height: 13px;',
    'width: 15px;',
    'margin: 0;',
    'border: 0;',
    'text-align: center;',
    'vertical-align: middle;',
    'border-right: 1px solid #666;',
    'font-size: 1px;',
  '}',

  '.blocklyWidgetDiv .goog-palette-colorswatch {',
    'position: relative;',
    'height: 13px;',
    'width: 15px;',
    'border: 1px solid #666;',
  '}',

  '.blocklyWidgetDiv .goog-palette-cell-hover .goog-palette-colorswatch {',
    'border: 1px solid #FFF;',
  '}',

  '.blocklyWidgetDiv .goog-palette-cell-selected .goog-palette-colorswatch {',
    'border: 1px solid #000;',
    'color: #fff;',
  '}',

  /* Copied from: goog/css/menu.css */
  /*
   * Copyright 2009 The Closure Library Authors. All Rights Reserved.
   *
   * Use of this source code is governed by the Apache License, Version 2.0.
   * See the COPYING file for details.
   */

  /**
   * Standard styling for menus created by goog.ui.MenuRenderer.
   *
   * @author attila@google.com (Attila Bodis)
   */

  '.blocklyWidgetDiv .goog-menu {',
    'background: #fff;',
    'border-color: #ccc #666 #666 #ccc;',
    'border-style: solid;',
    'border-width: 1px;',
    'cursor: default;',
    'font: normal 13px Arial, sans-serif;',
    'margin: 0;',
    'outline: none;',
    'padding: 4px 0;',
    'position: absolute;',
    'overflow-y: auto;',
    'overflow-x: hidden;',
    'max-height: 100%;',
    'z-index: 20000;',  /* Arbitrary, but some apps depend on it... */
  '}',

  /* Copied from: goog/css/menuitem.css */
  /*
   * Copyright 2009 The Closure Library Authors. All Rights Reserved.
   *
   * Use of this source code is governed by the Apache License, Version 2.0.
   * See the COPYING file for details.
   */

  /**
   * Standard styling for menus created by goog.ui.MenuItemRenderer.
   *
   * @author attila@google.com (Attila Bodis)
   */

  /**
   * State: resting.
   *
   * NOTE(mleibman,chrishenry):
   * The RTL support in Closure is provided via two mechanisms -- "rtl" CSS
   * classes and BiDi flipping done by the CSS compiler.  Closure supports RTL
   * with or without the use of the CSS compiler.  In order for them not
   * to conflict with each other, the "rtl" CSS classes need to have the #noflip
   * annotation.  The non-rtl counterparts should ideally have them as well, but,
   * since .goog-menuitem existed without .goog-menuitem-rtl for so long before
   * being added, there is a risk of people having templates where they are not
   * rendering the .goog-menuitem-rtl class when in RTL and instead rely solely
   * on the BiDi flipping by the CSS compiler.  That's why we're not adding the
   * #noflip to .goog-menuitem.
   */
  '.blocklyWidgetDiv .goog-menuitem {',
    'color: #000;',
    'font: normal 13px Arial, sans-serif;',
    'list-style: none;',
    'margin: 0;',
     /* 28px on the left for icon or checkbox; 7em on the right for shortcut. */
    'padding: 4px 7em 4px 28px;',
    'white-space: nowrap;',
  '}',

  /* BiDi override for the resting state. */
  /* #noflip */
  '.blocklyWidgetDiv .goog-menuitem.goog-menuitem-rtl {',
     /* Flip left/right padding for BiDi. */
    'padding-left: 7em;',
    'padding-right: 28px;',
  '}',

  /* If a menu doesn't have checkable items or items with icons, remove padding. */
  '.blocklyWidgetDiv .goog-menu-nocheckbox .goog-menuitem,',
  '.blocklyWidgetDiv .goog-menu-noicon .goog-menuitem {',
    'padding-left: 12px;',
  '}',

  /*
   * If a menu doesn't have items with shortcuts, leave just enough room for
   * submenu arrows, if they are rendered.
   */
  '.blocklyWidgetDiv .goog-menu-noaccel .goog-menuitem {',
    'padding-right: 20px;',
  '}',

  '.blocklyWidgetDiv .goog-menuitem-content {',
    'color: #000;',
    'font: normal 13px Arial, sans-serif;',
  '}',

  /* State: disabled. */
  '.blocklyWidgetDiv .goog-menuitem-disabled .goog-menuitem-accel,',
  '.blocklyWidgetDiv .goog-menuitem-disabled .goog-menuitem-content {',
    'color: #ccc !important;',
  '}',

  '.blocklyWidgetDiv .goog-menuitem-disabled .goog-menuitem-icon {',
    'opacity: 0.3;',
    'filter: alpha(opacity=30);',
  '}',

  /* State: hover. */
  '.blocklyWidgetDiv .goog-menuitem-highlight,',
  '.blocklyWidgetDiv .goog-menuitem-hover {',
    'background-color: #d6e9f8;',
     /* Use an explicit top and bottom border so that the selection is visible',
      * in high contrast mode. */
    'border-color: #d6e9f8;',
    'border-style: dotted;',
    'border-width: 1px 0;',
    'padding-bottom: 3px;',
    'padding-top: 3px;',
  '}',

  /* State: selected/checked. */
  '.blocklyWidgetDiv .goog-menuitem-checkbox,',
  '.blocklyWidgetDiv .goog-menuitem-icon {',
    'background-repeat: no-repeat;',
    'height: 16px;',
    'left: 6px;',
    'position: absolute;',
    'right: auto;',
    'vertical-align: middle;',
    'width: 16px;',
  '}',

  /* BiDi override for the selected/checked state. */
  /* #noflip */
  '.blocklyWidgetDiv .goog-menuitem-rtl .goog-menuitem-checkbox,',
  '.blocklyWidgetDiv .goog-menuitem-rtl .goog-menuitem-icon {',
     /* Flip left/right positioning. */
    'left: auto;',
    'right: 6px;',
  '}',

  '.blocklyWidgetDiv .goog-option-selected .goog-menuitem-checkbox,',
  '.blocklyWidgetDiv .goog-option-selected .goog-menuitem-icon {',
     /* Client apps may override the URL at which they serve the sprite. */
    'background: url(//ssl.gstatic.com/editor/editortoolbar.png) no-repeat -512px 0;',
  '}',

  /* Keyboard shortcut ("accelerator") style. */
  '.blocklyWidgetDiv .goog-menuitem-accel {',
    'color: #999;',
     /* Keyboard shortcuts are untranslated; always left-to-right. */
     /* #noflip */
    'direction: ltr;',
    'left: auto;',
    'padding: 0 6px;',
    'position: absolute;',
    'right: 0;',
    'text-align: right;',
  '}',

  /* BiDi override for shortcut style. */
  /* #noflip */
  '.blocklyWidgetDiv .goog-menuitem-rtl .goog-menuitem-accel {',
     /* Flip left/right positioning and text alignment. */
    'left: 0;',
    'right: auto;',
    'text-align: left;',
  '}',

  /* Mnemonic styles. */
  '.blocklyWidgetDiv .goog-menuitem-mnemonic-hint {',
    'text-decoration: underline;',
  '}',

  '.blocklyWidgetDiv .goog-menuitem-mnemonic-separator {',
    'color: #999;',
    'font-size: 12px;',
    'padding-left: 4px;',
  '}',

  /* Copied from: goog/css/menuseparator.css */
  /*
   * Copyright 2009 The Closure Library Authors. All Rights Reserved.
   *
   * Use of this source code is governed by the Apache License, Version 2.0.
   * See the COPYING file for details.
   */

  /**
   * Standard styling for menus created by goog.ui.MenuSeparatorRenderer.
   *
   * @author attila@google.com (Attila Bodis)
   */

  '.blocklyWidgetDiv .goog-menuseparator {',
    'border-top: 1px solid #ccc;',
    'margin: 4px 0;',
    'padding: 0;',
  '}',

  ''
];
