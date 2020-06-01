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

eYo.require('style')

/**
 * @name eYo.css
 * @namespace
 */

eYo.makeNS('css', {
  Cursor: {
    OPEN: 'handopen',
    CLOSED: 'handclosed',
    DELETE: 'handdelete'
    },
  },
)

eYo.forward('geom')
eYo.forward('font')
//g@@g.forwardDeclare('g@@g.cssom');

eYo.css.insertRuleAt = (() => {
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
    while (eYo.isStr(arguments[i])) {
      rule.push(arguments[i])
      ++i
    }
    if (eYo.isNum(arguments[i])) {
      var at = arguments[i]
    }
    if (rule.length) {
      goog.cssom.addCssRule(sheet, rule.join(''), at)
    }
  }
})()

 /**
 * Setup the font style, amongst others.
 */
;(static_ => {
  eYo.setup.register(() => {
    eYo.css.insertRuleAt(`@font-face {
  font-family: 'DejaVuSansMono';
  src: local('☺'),url(${static_}/font/DejaVuSansMono.woff') format('woff');
  font-weight: normal;
  font-style: normal;
}`)
  eYo.css.insertRuleAt(`@font-face {
  font-family: 'DejaVuSansMono';
  src: local('☺'), url('${static_}/font/DejaVuSansMono-Bold.woff')format('woff');
  font-weight: bold;
  font-style: normal;
}`)
    eYo.css.insertRuleAt(`@font-face {
  font-family: 'DejaVuSansMono';
  src: local('☺'),url('${static_}/font/DejaVuSansMono-Oblique.woff')format('woff');
  font-weight: normal;
  font-style: oblique;
}`)
    eYo.css.insertRuleAt(`@font-face {
  font-family: 'DejaVuSansMono';
  src: local('☺'),url('${static_}/font/DejaVuSansMono-BoldOblique.woff')format('woff');
  font-weight: bold;
  font-style: oblique;
}`)
  })
})(window.__static || 'static')

eYo.setup.register(-1, () => {
  eYo.css.insertRuleAt('body {background: orange;}')
})

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
eYo.css.inject = (hasCss, pathToMedia) => {
  // Placeholder for cursor rule.  Must be first rule (index 0).
  var text = '[eYo.$]-draggable {}\n'
  if (hasCss) {
    text += eYo.css.CONTENT(pathToMedia).join('\n')
  }
  // Inject CSS tag at start of head.
  var cssNode = document.createElement('style');
  document.head.insertBefore(cssNode, document.head.firstChild);

  var cssTextNode = document.createTextNode(text);
  cssNode.appendChild(cssTextNode)
}

/**
 * Array making up the CSS content for Edython.
 */
eYo.css.CONTENT = path => {
  return [/* So bricks in drag surface disappear at edges */
    `#eyo-desk {
  height: 100%;
  position: relative;
  overflow: hidden; 
  touch-action: none;
  background: orange;
}`,
    `[eYo.$]-board {
}`, /* UNUSED */

    `[eYo.$]-trash {
}`, /* UNUSED */

    `[eYo.$]-brick-canvas {
}`, /* */

    '[eYo.$]-board-drag-surface {',
      'display: none;',
      'position: absolute;',
      'top: 0;',
      'left: 0;',
    '}',
    /* Added as a separate rule with multiple classes to make it more specific
      than a bootstrap rule that selects svg:root. See issue #1275 for context.
    */
    `[eYo.$]-board-drag-surface[eYo.$]-overflow-visible {
  overflow: visible;
}
[eYo.$]-flyout-scroolbar {
  z-index: 30;
}
[eYo.$]-zoom>image {
  opacity: .4;
}
[eYo.$]-zoom>image:hover {
  opacity: .6;
}
[eYo.$]-zoom>image:active {
  opacity: .8;
}`,
    /* IE overflows by default. */
    `[eYo.$]-svg {
  background-color: #fff;
  outline: none;
  overflow: hidden;
  position: absolute;
  display: block;
}`,
  /* Display below flyout, but above everything else. */
    `[eYo.$]-brick-drag-surface {
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
    `[eYo.$]-brick-drag-surface [eYo.$]-draggable {
  cursor: url("${path}/handclosed.cur"), auto;
  cursor: grabbing;
  cursor: -webkit-grabbing;
}`,
    /*
    Don't allow users to select text.  It gets annoying when trying to
    drag a block and selected text moves instead.
    */
  `[eYo.$]-svg text, [eYo.$]-brick-drag-surface text {
  user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -webkit-user-select: none;
  cursor: inherit;
}`,
    `[eYo.$]-dragging[eYo.$]-dragging-delete {
  cursor: url("${path}/handdelete.cur"), auto;
}`,





  //HERE
    '.blocklyNonSelectable {',
      'user-select: none;',
      '-moz-user-select: none;',
      '-ms-user-select: none;',
      '-webkit-user-select: none;',
    '}',

    '[eYo.$]-draggable {',
      /* backup for browsers (e.g. IE11) that don't support grab */
      'cursor: url("${path}/handopen.cur"), auto;',
      'cursor: grab;',
      'cursor: -webkit-grab;',
    '}',

    '[eYo.$]-dragging {',
      /* backup for browsers (e.g. IE11) that don't support grabbing */
      'cursor: url("${path}/handclosed.cur"), auto;',
      'cursor: grabbing;',
      'cursor: -webkit-grabbing;',
    '}',
    /* Changes cursor on mouse down. Not effective in Firefox because of
      https://bugzilla.mozilla.org/show_bug.cgi?id=771241 */
    '[eYo.$]-draggable:active {',
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

    '[eYo.$]-flyout-background {',
      'fill: #ddd;',
      'fill-opacity: .8;',
    '}',

    '[eYo.$]-transparent-background {',// used
      'opacity: 0;',
    '}',

    `[eYo.$]-main-board-scrollbar {
  z-index: 20;
}`,

    '[eYo.$]-scrollbar-horizontal, [eYo.$]-scrollbar-vertical {',
      'position: absolute;',
      'outline: none;',
    '}',

    '[eYo.$]-scrollbar-background {',
      'opacity: 0;',
    '}',

    '[eYo.$]-scrollbar-handle {',
      'fill: #ccc;',
    '}',

    '[eYo.$]-scrollbar-background:hover+[eYo.$]-scrollbar-handle,',
    '[eYo.$]-scrollbar-handle:hover {',
      'fill: #bbb;',
    '}',

    /* Darken flyout scrollbars due to being on a grey background. */
    /* By contrast, board scrollbars are on a white background. */
    '.blocklyFlyout [eYo.$]-scrollbar-handle {',
      'fill: #bbb;',
    '}',

    '.blocklyFlyout [eYo.$]-scrollbar-background:hover+[eYo.$]-scrollbar-handle,',
    '.blocklyFlyout [eYo.$]-scrollbar-handle:hover {',
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
      'max-height: 300px !important;',
    '}',
    `[eYo.$]-flyout {
  position: absolute;
  z-index: 20;
}`,
    `[eYo.$]-flyout-background {
  fill: #ddd;
  fill-opacity: .8;
  pointer-events: all;
}`,
    `[eYo.$]-flyout-scrollbar {
  z-index: 30;
}`,
    `[eYo.$]-flyout-toolbar {
  position: absolute;
  pointer-events: all;
  height: 3.5rem;
  padding: 0;
  padding-left: 0.25rem;
  margin: 0;
  background: rgba(221,221,221,0.8);
}`,
    `[eYo.$]-flyout-toolbar-general {
  position: absolute;
  pointer-events: all;
  height: 2rem;
  padding: 0.125rem;
  width: 100%;
  margin: 0;
}`,
    `[eYo.$]-flyout-toolbar-module {
  position: absolute;
  pointer-events: all;
  height: 1.75rem;
  padding: 0.125rem;
  margin: 0;
  margin-top: 2.25rem;
  width: 100%;
}`,
    `[eYo.$]-flyout-select-general,
[eYo.$]-flyout-select-module {
  height: 100%;
  width: 100%;
  padding-left: 0.25rem;
  padding-right:0.25rem;
  margin: 0
}`,
    `[eYo.$]-flyout-control {
  background: #ddd;
  opacity: 0.79;
  height: 50%;
  width: 1.25rem;
  position: absolute;
  top: 0px;
}`,
    (radius =>
      `[eYo.$]-flyout-control left {
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
[eYo.$]-flyout-control {
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
    `[eYo.$]-flyout-control-image {
  width: 1.125rem;
  height: 2.25rem;
}
[eYo.$]-flyout-control-image path {
  fill: white;
}
[eYo.$]-flyout-control-image path:hover {
  fill:black;
  fill-opacity: 0.075;
}
[eYo.$]-flash [eYo.$]-flyout-control-image path,
[eYo.$]-flash [eYo.$]-flyout-control-image path:hover {
  fill:black;
  fill-opacity:0.2;
}
[eYo.$]-flyout-toolbar [eYo.$]-menu-button {
  background: #952276;
  box-shadow: 0px 3px 8px #888;
  border:0;
}
[eYo.$]-flyout-toolbar [eYo.$]-menu-button:hover {
  box-shadow: 0px 2px 6px #444;
}
[eYo.$]-menu-button-outer-box {
  padding-left: 10px;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  -moz-box-sizing: border-box;
  -webkit-box-sizing: border-box;
}
[eYo.$]-menu-button-inner-box {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  -moz-box-sizing: border-box;
  -webkit-box-sizing: border-box;
  padding-right: 30px;
}
[eYo.$]-flyout-toolbar [eYo.$]-menu-button-caption {
  color: white;
  vertical-align: middle;
}
[eYo.$]-menu-button-dropdown svg {
  position: absolute;
  top: 0px;
  width: 12px;
  height: 6px;
}
[eYo.$]-menu-button-dropdown-image {
  fill: white;
}`,
    `.eyoMainBackground {
  stroke-width: 5;
  stroke: none;
}
[eYo.$]-brick .blocklyText,
[eYo.$]-var,
[eYo.$]-label,
[eYo.$]-code,
[eYo.$]-code-reserved,
[eYo.$]-code-builtin,
[eYo.$]-code-comment,
[eYo.$]-code-placeholder,
[eYo.$]-sharp-group{
  ${eYo.font.Style};
}
[eYo.$]-error[eYo.$]-path-selected,
[eYo.$]-error[eYo.$]-path-hilighted,
[eYo.$]-error[eYo.$]-path-shape,
[eYo.$]-error[eYo.$]-path-contour,
[eYo.$]-error[eYo.$]-path-inner {
  stroke:${eYo.style.path.Error.Colour};
  stroke-width: ${eYo.style.path.Error.width}px;
}
[eYo.$]-path-selected,
[eYo.$]-path-hilighted {
  stroke: ${eYo.style.path.Hilighted.Colour};
  fill: none;
}
[eYo.$]-path-hilighted {
  stroke-width: ${eYo.style.path.Hilighted.width}px;
}
[eYo.$]-select [eYo.$]-path-contour[eYo.$]-error,
[eYo.$]-select [eYo.$]-path-inner[eYo.$]-error {
  stroke: ${eYo.style.path.Error.Colour};
}
[eYo.$]-checkbox-icon-rect {
  stroke: ${eYo.shape.style.Colour.light};
  stroke-width: ${eYo.shape.style.width.light}px;
  fill: white;
}
[eYo.$]-checkbox-icon-rect {
  stroke: ${eYo.shape.style.Colour.light};
  stroke-width: ${eYo.shape.style.width.light}px;
  fill: white;
}
[eYo.$]-medium [eYo.$]-checkbox-icon-rect {
  stroke: ${eYo.shape.style.Colour.medium};
  stroke-width: ${eYo.shape.style.width.medium}px;
  fill: white;
}
[eYo.$]-dark [eYo.$]-checkbox-icon-rect {
  stroke: ${eYo.shape.style.Colour.dark};
  stroke-width: ${eYo.shape.style.width.dark}px;
  fill: white;
}
[eYo.$]-locked[eYo.$]-path-contour,
[eYo.$]-locked[eYo.$]-path-inner,
[eYo.$]-locked[eYo.$]-path-shape,
[eYo.$]-locked[eYo.$]-edit,
[eYo.$]-locked[eYo.$]-edit{
  display: none
}
[eYo.$]-path-shape {
  stroke: none;
  fill: white;
  fill-opacity:0.92
}
[eYo.$]-path-bbox {
  stroke: ${eYo.style.path.Bbox_colour};
  stroke-width: ${eYo.shape.style.width.light}px;
  fill: none;
}
[eYo.$]-inner [eYo.$]-path-shape {
  stroke: none;
  fill-opacity:0
}
[eYo.$]-stmt[eYo.$]-inner [eYo.$]-path-shape {
  stroke: none;
  fill-opacity:0.92;
}
[eYo.$]-path-contour,
[eYo.$]-path-inner,
[eYo.$]-path-collapsed,
[eYo.$]-path-play-contour {
  stroke: ${eYo.shape.style.Colour.light};
  stroke-width: ${eYo.shape.style.width.light}px;
  fill: none;
  pointer-events: all;
  stroke-linejoin: round;
}
[eYo.$]-medium [eYo.$]-path-contour,
[eYo.$]-medium [eYo.$]-path-inner,
[eYo.$]-medium [eYo.$]-path-collapsed,
[eYo.$]-medium [eYo.$]-path-play-contour {
  stroke: ${eYo.shape.style.Colour.medium};
  stroke-width: ${eYo.shape.style.width.medium}px;
  fill: none;
  pointer-events: all;
  stroke-linejoin: round;
}
[eYo.$]-dark [eYo.$]-path-contour,
[eYo.$]-dark [eYo.$]-path-inner,
[eYo.$]-dark [eYo.$]-path-collapsed,
[eYo.$]-dark [eYo.$]-path-play-contour {
  stroke: ${eYo.shape.style.Colour.dark};
  stroke-width: ${eYo.shape.style.width.dark}px;
  fill: none;
  pointer-events: all;
  stroke-linejoin: round;
}
[eYo.$]-path-selected {
  pointer-events: none;
}
[eYo.$]-inner[eYo.$]-expr [eYo.$]-path-contour,
[eYo.$]-inner[eYo.$]-expr [eYo.$]-path-collapsed {
  stroke: ${eYo.shape.style.inner_colour.light};
}
[eYo.$]-medium [eYo.$]-inner[eYo.$]-expr [eYo.$]-path-contour,
[eYo.$]-medium [eYo.$]-inner[eYo.$]-expr [eYo.$]-path-collapsed {
  stroke: ${eYo.shape.style.inner_colour.medium};
}
[eYo.$]-dark [eYo.$]-inner[eYo.$]-expr [eYo.$]-path-contour,
[eYo.$]-dark [eYo.$]-inner[eYo.$]-expr [eYo.$]-path-collapsed {
  stroke: ${eYo.shape.style.inner_colour.dark};
}`,
    `[eYo.$]-code-emph {
  font-weight: bold;
}
[eYo.$]-code-reserved,
[eYo.$]-code-builtin,
[eYo.$]-sharp-group {
  font-weight: bold!important;
  color: rgba(0, 84, 147, 0.75)!important;
  fill: rgba(0, 84, 147, 0.75)!important;
}
[eYo.$]-code-builtin {
  font-weight: bold;
  color: rgba(60, 0, 145, 0.75);
  fill: rgba(60, 0, 145, 0.75);
}`,
    `[eYo.$]-start>g>[eYo.$]-code-comment {
  font-style: normal;
  font-weight: bold;
}
[eYo.$]-start-path {
  fill: rgba(240, 240, 240, 0.97);
}
[eYo.$]-path-play-contour {
  fill: rgba(255, 255, 255, 0.8);
}
[eYo.$]-start>text[eYo.$]-code-reserved[eYo.$]-label {
  opacity:0;
}
[eYo.$]-code-placeholder {
  fill: rgba(0, 0, 0, 0.4);
}
input-code-error {
  color: red;
}
text[eYo.$]-code-error {
  fill: red;
}
text[eYo.$]-code-comment {
  fill: rgba(42, 132, 45, 0.8);
}
[eYo.$]-code-disabled {
  color: #ccc;
}`,
    `[eYo.$]-select[eYo.$]-expr [eYo.$]-path-contour,
[eYo.$]-select[eYo.$]-stmt [eYo.$]-path-contour,
[eYo.$]-select[eYo.$]-expr [eYo.$]-path-inner {
  stroke: ${eYo.style.path.Hilighted.Colour};
}
[eYo.$]-select[eYo.$]-stmt>[eYo.$]-path-contour,
[eYo.$]-select[eYo.$]-stmt>[eYo.$]-path-inner,
[eYo.$]-select[eYo.$]-stmt>[eYo.$]-expr [eYo.$]-path-contour,
[eYo.$]-select[eYo.$]-stmt>[eYo.$]-expr [eYo.$]-path-inner {
  stroke: ${eYo.style.path.Hilighted.Colour};
}
[eYo.$]-code-placeholder,
[eYo.$]-code-comment {
  font-style: oblique;
}
[eYo.$]-hilighted-magnet-path{
  stroke: ${eYo.style.path.Hilighted.Colour};
  stroke-width: ${eYo.style.path.Hilighted.width}px;
  fill: none;
}`,
`[eYo.$]-main-board-background {
  fill: green;
}`,
`[eYo.$]-board-dragger-background {
  fill: rgba(255, 0, 127, 0.3)
}`,
`[eYo.$]-main-board-background[eYo.$]-draft {
  fill: gainsboro;
}`,
`#eyo-desk svg { pointer-events: none; }
#eyo-desk svg * { pointer-events: all; }
`,
  ]
}
