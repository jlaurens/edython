/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Rendering delegate.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Svg.Field')

goog.require('eYo.Svg')

goog.forwardDeclare('eYo.Field')

// field management

/**
 * Initializes the field SVG ressources.
 * Does nothing if the field's brick has no SVG ressources.
 * Part of the `makeUI` process.
 * @param {!eYo.Field} field
 * @return {?eYo.Field}
 */
eYo.Svg.prototype.fieldInit = function(field) {
  if (field.dom) {
    return
  }
  if (!(field.css_class_ = (field.model && field.model.css_class) || (field.status && `eyo-code-${field.status}`))) {
    field.css_class_ = eYo.Svg.getCssClassForText(field.text)
  }
  var dom = field.owner.dom || field.brick.dom
  if (!dom) {
    throw 'MISSING owner dom'
  }
  var g = dom.svg.group_
  if (!g) { return }
  dom = this.basicInit(field)
  var svg = dom.svg
  if (field.isTextInput) {
    g = svg.group_ = eYo.Svg.newElement('g', {}, g)
    dom.borderRect_ = eYo.Svg.newElement('rect', {
      rx: 4,
      ry: 4,
      x: -eYo.Style.SEP_SPACE_X / 2,
      y: 0,
      height: 16
    }, g)
    /** @type {!Element} */
    svg.textElement_ = eYo.Svg.newElement('text', {
      class: field.css_class,
      y: eYo.Font.totalAscent
    }, g)
  } else {
    g = svg.group_ = svg.textElement_ = eYo.Svg.newElement('text', {
      class: field.css_class,
      y: eYo.Font.totalAscent
    }, g)
  }
  g.dataset && (g.dataset.field = field.name)
  !field.visible && (g.style.display = 'none')
  // add tooltip management here
  this.fieldUpdateEditable(field)
  return field
}

/**
 * Dispose of the given field's rendering resources.
 * @param {!Object} field
 */
eYo.Svg.prototype.fieldDispose = function (field) {
  var svg = field.dom && field.dom.svg
  if (!svg) { return }
  svg.group_ = goog.dom.removeNode(svg.group_)
  this.basicDispose(field)
}

/**
 * Set the location.
 * @param {*} field
 * @param {*} where
 */
eYo.Svg.prototype.fieldMoveTo = function (field, where) {
  var g = field.dom.svg.group_
  g.setAttribute('transform',
  `translate(${where.x}, ${where.y + eYo.Padding.t})`)
}

/**
 * Update the with.
 * @param {*} field
 */
eYo.Svg.prototype.fieldUpdateWidth = function (field) {
  var svg = field.dom.svg
  if (!svg) {
    return
  }
  var width = field.size.width
  svg.borderRect_.setAttribute('width', width + eYo.Style.SEP_SPACE_X)
}

/**
 * Make the given field an error.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.Svg.prototype.fieldMakeError = function (field, yorn) {
  var root = field.dom.svg.group_
  if (root) {
    (yorn
      ? goog.dom.classlist.add
      : goog.dom.classlist.remove)(
      root,
      'eyo-code-reserved'
    )
  }
}

/**
 * Make the given field reserved or not, to emphasize reserved keywords.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.Svg.prototype.fieldMakeReserved = function (field, yorn) {
  var g = field.dom.svg.group_
  if (g) {
    (yorn
    ? goog.dom.classlist.add
    : goog.dom.classlist.remove)(
      g,
      'eyo-code-reserved'
    )
  }
}

/**
 * Add ui attributes to make the given field a placeholder, or not.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.Svg.prototype.fieldMakePlaceholder = function (field, yorn) {
  var g = field.dom.svg.group_
  g && (yorn
    ? goog.dom.classlist.add
    : goog.dom.classlist.remove)(g,
      'eyo-code-comment')
}

/**
 * Make the given field a comment.
 * @param {eYo.Field} field
 * @param {boolean} yorn
 */
eYo.Svg.prototype.fieldMakeComment = function (field, yorn) {
  var g = field.dom.svg.group_
  g && (yorn
    ? goog.dom.classlist.add
    : goog.dom.classlist.remove)(g,
      'eyo-code-comment')
}


/**
 * Whether the field is displayed.
 * @param {!Object} field  the field to query about
 */
eYo.Svg.prototype.fieldDisplayedGet = function (field) {
  var g = field.dom.svg.group_
  return g.style.display !== 'none'
}

/**
 * Display/hide the given field.
 * @param {!Object} field  the field the driver acts on
 * @param {boolean} yorn
 */
eYo.Svg.prototype.fieldDisplayedSet = function (field, yorn) {
  var g = field.dom.svg.group_
  if (yorn) {
    g.removeAttribute('display')
  } else {
    g.style.display = 'none'
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
 * Add or remove the UI indicating if this field is editable or not.
 * @param {!eYo.Field} field
 */
eYo.Svg.prototype.fieldUpdateEditable = function(field) {
  var g = field.dom && field.dom.svg && field.dom.svg.group_
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
  goog.dom.removeChildren(/** @type {!Element} */ (field.dom.textElement_))
}

/**
 * The field text will change.
 * Add a text node to the text element.
 * @param {!Object} field  the node the driver acts on
 */
eYo.Svg.prototype.fieldTextCreate = function (field) {
  var textNode = document.createTextNode(field.text)
  field.dom.textElement_.appendChild(textNode)
}

/**
 * The field text will change.
 * Add a text node to the text element.
 * @param {!Object} field  the node the driver acts on
 */
eYo.Svg.prototype.fieldTextUpdate = function (field) {
  var text = field.dom.svg.textElement_
  // text.textContent = field.text
  goog.dom.removeChildren(/** @type {!Element} */ text)
  var textNode = document.createTextNode(field.text)
  text.appendChild(textNode)
}

/**
 * Set the visual effects of the field.
 * @param {*} field
 */
eYo.Svg.prototype.fieldSetVisualAttribute = function (field) {
  var e = field.dom.textElement_
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
 * Return the absolute coordinates of the top-left corner of this field.
 * The origin $(0,0)$ is the top-left corner of the page body.
 * @return {!eYo.Where} Object with `.x` and `.y` properties.
 * @private
 */
eYo.Svg.prototype.fieldGetAbsoluteWhere_ = function(field) {
  return goog.style.getPageOffset(field.dom.borderRect_)
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

/**
 * Handle a mouse down event on a field.
 * @param {!Event} e Mouse down event.
 * @private
 */
eYo.Svg.onFieldMouseDown_ = function(e) {
  if (this.board && this.brick.isSelected) {
    var gesture = eYo.App.getGesture(e)
    if (gesture) {
      gesture.setStartField(this)
    }
  }
}
