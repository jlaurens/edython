/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Rendering delegate.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Svg.Field')

goog.require('eYo.Svg')

// field management
/**
 * Prepare the given label field.
 * @param {!eYo.Field} field  Label field to be prepared.
 */
eYo.Svg.prototype.fieldInit = function (field) {
  if (field.svg) {
    return
  }
  var svg = field.svg = {}
  // Build the DOM.
  svg.textElement_ = eYo.Svg.newElement('text',
  {
    class: eyo.isLabel ? 'eyo-label' : field.css_class,
    y: eYo.Font.totalAscent
  }, null)
  if (eyo.isTextInput) {
    svg.group_ = eYo.Svg.newElement('g', {}, null)
    svg.borderRect_ = eYo.Svg.newElement('rect',
      { class: 'eyo-none',
        rx: 0,
        ry: 0,
        x: -eYo.Style.Edit.padding_h,
        y: -eYo.Style.Edit.padding_v,
        height: eYo.Font.height + 2 * eYo.Style.Edit.padding_v},
      svg.group_)
    svg.editRect_ = eYo.Svg.newElement('rect',
      { class: 'eyo-edit',
        rx: eYo.Style.Edit.radius,
        ry: eYo.Style.Edit.radius,
        x: -eYo.Style.Edit.padding_h - (eyo.left_space ? eYo.Unit.x : 0),
        y: -eYo.Style.Edit.padding_v,
        height: eYo.Unit.y + 2 * eYo.Style.Edit.padding_v},
      svg.group_)
    field.mouseDownWrapper_ =
      eYo.Svg.bindEventWithChecks_(svg.group_, 'mousedown', field, field.onMouseDown_
      )
  } else {
    svg.group_ = svg.textElement_
  }
  ;(field.slot || field.brick.ui).svg.group_.appendChild(svg.group_)
  if (field.css_class) {
    goog.dom.classlist.add(svg.textElement_, eYo.Do.valueOf(field.css_class, field))
  }
  if (field.isLabel) {
    // Configure the field to be transparent with respect to tooltips.
    svg.textElement_.tooltip = field.brick
    Blockly.Tooltip.bindMouseEvents(svg.textElement_)
  }
  this.fieldDisplayedUpdate(field)
}

/**
 * Dispose of the given field's rendering resources.
 * @param {!Object} field
 */
eYo.Svg.prototype.fieldDispose = function (field) {
  var g = field.svg && field.svg.group_
  if (!g) {
    // Field has already been disposed
    return;
  }
  if (field.mouseDownWrapper_) {
    eYo.Svg.unbindEvent_(field.mouseDownWrapper_)
    field.mouseDownWrapper_ = null
  }
  goog.dom.removeNode(g)
  field.svg = undefined
}

/**
 * Set the location.
 * @param {*} field
 * @param {*} where
 */
eYo.Svg.prototype.fieldPositionSet = function (field, where) {
  var g = field.svg.group_
  g.setAttribute('transform',
  `translate(${where.x}, ${where.y + eYo.Padding.t})`)
}

/**
 * Update the with.
 * @param {*} field
 */
eYo.Svg.prototype.fieldUpdateWidth = function (field) {
  var svg = field.svg
  if (!svg) {
    return
  }
  var width = field.size.width
  svg.borderRect_.setAttribute('width', width + eYo.Style.SEP_SPACE_X)
  var r = svg.editRect_
  r && (r.setAttribute('width', width + 2 * eYo.Style.Edit.padding_h + (field.left_space ? eYo.Unit.x : 0)))
}

/**
 * Make the given field an error.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.Svg.prototype.fieldMakeError = function (field, yorn) {
  var root = field.svg.group_
  if (root) {
    ;(yorn ? goog.dom.classlist.add : goog.dom.classlist.remove)(root, 'eyo-code-reserved')
  }
}

/**
 * Make the given field reserved or not, to emphasize reserved keywords.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.Svg.prototype.fieldMakeReserved = function (field, yorn) {
  var root = field.svg.group_
  if (root) {
    if (yorn) {
      goog.dom.classlist.add(root, 'eyo-code-reserved')
    } else {
      goog.dom.classlist.remove(root, 'eyo-code-reserved')
    }
  }
}

/**
 * Add ui attributes to make the given field a placeholder, or not.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.Svg.prototype.fieldMakePlaceholder = function (field, yorn) {
  var root = field.svg.group_
  if (root) {
    if (yorn) {
      goog.dom.classlist.add(root, 'eyo-code-placeholder')
    } else {
      goog.dom.classlist.remove(root, 'eyo-code-placeholder')
    }
  }
}

/**
 * Make the given field a comment.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.Svg.prototype.fieldMakeComment = function (field, yorn) {
  var root = field.svg.group_
  root && (yorn ? goog.dom.classlist.add: goog.dom.classlist.remove)(root, 'eyo-code-comment')
}


/**
 * Whether the field is displayed.
 * @param {!Object} field  the field to query about
 */
eYo.Svg.prototype.fieldDisplayedGet = function (field) {
  var g = field.svg.group_
  return g.style.display !== 'none'
}

/**
 * Display/hide the given field.
 * @param {!Object} field  the field the driver acts on
 * @param {boolean} yorn
 */
eYo.Svg.prototype.fieldDisplayedSet = function (field, yorn) {
  var g = field.svg.group_
  if (yorn) {
    g.removeAttribute('display')
  } else {
    g.setAttribute('display', 'none')
  }
}

/**
 * Display/hide the given field.
 * @param {!Object} field  the field the driver acts on
 * @param {boolean} yorn
 */
eYo.Svg.prototype.fieldDisplayedUpdate = function (field) {
  this.fieldDisplayedSet(field, field.visible)
}

/**
 * Initializes the field SVG ressources.
 * Does nothing if the field's brick has no SVG ressources.
 * Part of the `beReady` process.
 * @param {!eYo.Field} field
 * @return {?eYo.Field}
 */
eYo.Svg.prototype.fieldInit = function(field) {
  if (!(field.css_class_ = (field.model && field.model.css_class) || (field.status && `eyo-code-${field.status}`))) {
    field.css_class_ = eYo.Svg.getCssClassForText(field.text)
  }
  var svg = field.owner.svg || field.brick.ui.svg
  if (!svg) { return }
  var g = svg.group_
  if (!g) { return }
  if (field.svg) {
    // Field has already been initialized once.
    return;
  }
  svg = field.svg = {}
  g = svg.group_ = eYo.Svg.newElement('g', {}, g)
  !field.visible && (g.style.display = 'none')
  svg.borderRect_ = eYo.Svg.newElement('rect', {
    rx: 4,
    ry: 4,
    x: -eYo.Style.SEP_SPACE_X / 2,
    y: 0,
    height: 16
  }, g)
  /** @type {!Element} */
  svg.textElement_ = eYo.Svg.newElement('text', {
    class: 'blocklyText',
    y: field.size_.height - 12.5
  }, g)
  field.mouseDownWrapper_ =
      eYo.Svg.bindEventWithChecks_(
          g, 'mousedown', field, field.onMouseDown_)
  this.fieldUpdateEditable(field)
  return field
}

/**
 * Add or remove the UI indicating if this field is editable or not.
 * @param {!eYo.Field} field
 */
eYo.Svg.prototype.fieldUpdateEditable = function(field) {
  var g = field.svg && field.svg.group_
  if (!field.editable || !g) {
    // Not editable or already disposed
    return
  }
  if (field.brick.editable) {
    goog.dom.classlist.add(g, 'eyo-editable-text')
    goog.dom.classlist.remove(g, 'eyo-non-editable-text')
    g.style.cursor = 'text'
  } else {
    goog.dom.classlist.add(g, 'eyo-non-editable-text')
    goog.dom.classlist.remove(g, 'eyo-editable-text')
    g.style.cursor = ''
  }
};

/**
 * The field text will change.
 * Remove the children of the text element.
 * @param {!Object} field  the node the driver acts on
 */
eYo.Svg.prototype.fieldTextRemove = function (field) {
  goog.dom.removeChildren(/** @type {!Element} */ (field.svg.textElement_))
}

/**
 * The field text will change.
 * Add a text node to the text element.
 * @param {!Object} field  the node the driver acts on
 */
eYo.Svg.prototype.fieldTextCreate = function (field) {
  var textNode = document.createTextNode(field.text)
  field.svg.textElement_.appendChild(textNode)
}

/**
 * The field text will change.
 * Add a text node to the text element.
 * @param {!Object} field  the node the driver acts on
 */
eYo.Svg.prototype.fieldTextUpdate = function (field) {
  field.svg.textElement_.textContent = field.text
}

/**
 * Set the visual effects of the field.
 * @param {*} field
 */
eYo.Svg.prototype.fieldSetVisualAttribute = function (field) {
  var e = field.svg.textElement_
  if (e) {
    var f = txt => {
      switch (eYo.T3.Profile.get(txt, null).raw) {
        case eYo.T3.Expr.reserved_identifier:
        case eYo.T3.Expr.reserved_keyword:
        case eYo.T3.Expr.known_identifier:
          return 'eyo-code-reserved'
        case eYo.T3.Expr.builtin__name:
          return 'eyo-code-builtin'
        default:
          return 'eyo-code'
      }
    }
    goog.dom.classlist.removeAll(e, goog.dom.classlist.get(e))
    goog.dom.classlist.add(e, f(field.text))
  }
}

/**
 * Update the inline editor.
 * @param {*} field
 */
eYo.Svg.prototype.fieldInlineEditorUpdate = function (field) {
  var svg = field.svg
  var g = svg && svg.group_
  if (g) {
    var div = Blockly.WidgetDiv.DIV
    if (div.style.display !== 'none') {
      var bBox = g.getBBox()
      div.style.width = (bBox.width + eYo.Unit.x - (field.left_space ? eYo.Unit.x : 0) - eYo.Style.Edit.padding_h) * field.workspace_.scale + 'px'
      div.style.height = bBox.height * field.workspace_.scale + 'px'
      var xy = this.fieldGetAbsoluteXY_(field)
      div.style.left = (xy.x - eYo.EditorOffset.x + eYo.Style.Edit.padding_h) + 'px'
      div.style.top = (xy.y - eYo.EditorOffset.y) + 'px'
      field.brick.changeWrap() // force rendering
    }
  }
}

/**
 * Return the absolute coordinates of the top-left corner of this field.
 * The origin $(0,0)$ is the top-left corner of the page body.
 * @return {!goog.math.Coordinate} Object with `.x` and `.y` properties.
 * @private
 */
eYo.Svg.prototype.fieldGetAbsoluteXY_ = function(field) {
  return goog.style.getPageOffset(field.svg.borderRect_)
}

/**
 * Non-breaking space.
 * @const
 */
eYo.Svg.NBSP = '\u00A0';

/**
 * Get the text from this field as displayed on screen.  Differs from the original text due to non breaking spaces.
 * @return {string} Displayed text.
 * @private
 */
eYo.Svg.prototype.fieldGetDisplayText_ = function(field) {
  var text = field.text_
  if (!text) {
    // Prevent the field from disappearing if empty.
    return eYo.Svg.NBSP;
  }
  // Replace whitespaces with non-breaking spaces so the text doesn't collapse.
  return text.replace(/\s/g, eYo.Svg.NBSP);
}
