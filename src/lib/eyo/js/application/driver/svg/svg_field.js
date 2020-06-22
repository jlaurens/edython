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

eYo.forward('field')

// field management

eYo.svg.newDriverC9r('Field', {
  /**
   * Initializes the field SVG ressources.
   * Does nothing if the field's brick has no SVG ressources.
   * Part of the `initUI` process.
   * @param {eYo.field} field
   * @return {?eYo.field}
   */
  initUI (field) {
    if (field.dom) {
      return
    }
    if (!(field.css_class_ = (field.model && field.model.css_class) || (field.status && `eyo-code-${field.status}`))) {
      field.css_class_ = eYo.svg.getCssClassForText(field.text)
    }
    var dom = field.owner.dom || field.brick.dom
    if (!dom) {
      throw 'MISSING owner dom'
    }
    var g = dom.svg.group_
    if (!g) { return }
    dom = this._initUI(field)
    var svg = dom.svg
    if (field.isTextInput) {
      g = svg.group_ = eYo.svg.newElement('g', {}, g)
      dom.borderRect_ = eYo.svg.newElement('rect', {
        rx: 4,
        ry: 4,
        x: -eYo.style.SEP_SPACE_X / 2,
        y: 0,
        height: 16
      }, g)
      /** @type {!Element} */
      svg.textElement_ = eYo.svg.newElement('text', {
        class: field.css_class,
        y: eYo.font.totalAscent
      }, g)
    } else {
      g = svg.group_ = svg.textElement_ = eYo.svg.newElement('text', {
        class: field.css_class,
        y: eYo.font.totalAscent
      }, g)
    }
    g.dataset && (g.dataset.field = field.name)
    !field.visible && (g.style.display = 'none')
    // add tooltip management here
    this.updateEditable(field)
    return field
  },
  /**
   * Dispose of the given field's rendering resources.
   * @param {Object} field
   */
  disposeUI (field) {
    var svg = field.dom && field.dom.svg
    if (!svg) { return }
    svg.group_ = eYo.dom.removeNode(svg.group_)
    this._disposeUI(field)
  },
})

/**
 * Set the location.
 * @param {*} field
 * @param {*} where
 */
eYo.svg.Field_p.moveTo = function (field, where) {
  var g = field.dom.svg.group_
  g.setAttribute('transform',
    `translate(${where.x}, ${where.y + eYo.padding.t})`)
}

/**
 * Update the with.
 * @param {*} field
 */
eYo.svg.Field_p.updateWidth = function (field) {
  var svg = field.dom.svg
  if (!svg) {
    return
  }
  var width = field.size.width
  svg.borderRect_.setAttribute('width', width + eYo.style.SEP_SPACE_X)
}

/**
 * Make the given field an error.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.svg.Field_p.makeError = function (field, yorn) {
  var root = field.dom.svg.group_
  if (root) {
    (yorn
      ? eYo.dom.classlist.add
      : eYo.dom.classlist.remove)(
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
eYo.svg.Field_p.makeReserved = function (field, yorn) {
  var g = field.dom.svg.group_
  if (g) {
    (yorn
      ? eYo.dom.classlist.add
      : eYo.dom.classlist.remove)(
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
eYo.svg.Field_p.makePlaceholder = function (field, yorn) {
  var g = field.dom.svg.group_
  g && (yorn
    ? eYo.dom.classlist.add
    : eYo.dom.classlist.remove)(g,
    'eyo-code-comment')
}

/**
 * Make the given field a comment.
 * @param {eYo.field} field
 * @param {boolean} yorn
 */
eYo.svg.Field_p.makeComment = function (field, yorn) {
  var g = field.dom.svg.group_
  g && (yorn
    ? eYo.dom.classlist.add
    : eYo.dom.classlist.remove)(g,
    'eyo-code-comment')
}


/**
 * Whether the field is displayed.
 * @param {Object} field  the field to query about
 */
eYo.svg.Field_p.displayedGet = function (field) {
  var g = field.dom.svg.group_
  return g.style.display !== 'none'
}

/**
 * Display/hide the given field.
 * @param {Object} field  the field the driver acts on
 * @param {boolean} yorn
 */
eYo.svg.Field_p.displayedSet = function (field, yorn) {
  var g = field.dom.svg.group_
  if (yorn) {
    g.removeAttribute('display')
  } else {
    g.style.display = 'none'
  }
}

/**
 * Display/hide the given field.
 * @param {Object} field  the field the driver acts on
 * @param {boolean} yorn
 */
eYo.svg.Field_p.displayedUpdate = function (field) {
  this.displayedSet(field, field.visible)
}

/**
 * Add or remove the UI indicating if this field is editable or not.
 * @param {eYo.field} field
 */
eYo.svg.Field_p.updateEditable = function(field) {
  var g = field.dom && field.dom.svg && field.dom.svg.group_
  if (!field.editable || !g) {
    // Not editable or already disposed
    return
  }
  if (field.brick.editable) {
    eYo.dom.classlist.add(g, 'eyo-editable-text')
    eYo.dom.classlist.remove(g, 'eyo-non-editable-text')
    g.style.cursor = 'text'
  } else {
    eYo.dom.classlist.add(g, 'eyo-non-editable-text')
    eYo.dom.classlist.remove(g, 'eyo-editable-text')
    g.style.cursor = ''
  }
};

/**
 * The field text will change.
 * Remove the children of the text element.
 * @param {Object} field  the node the driver acts on
 */
eYo.svg.Field_p.textRemove = function (field) {
  eYo.dom.removeChildren(/** @type {!Element} */ (field.dom.textElement_))
}

/**
 * The field text will change.
 * Add a text node to the text element.
 * @param {Object} field  the node the driver acts on
 */
eYo.svg.Field_p.textCreate = function (field) {
  var textNode = document.createTextNode(field.text)
  field.dom.textElement_.appendChild(textNode)
}

/**
 * The field text will change.
 * Add a text node to the text element.
 * @param {Object} field  the node the driver acts on
 */
eYo.svg.Field_p.textUpdate = function (field) {
  var text = field.dom.svg.textElement_
  // text.textContent = field.text
  eYo.dom.removeChildren(/** @type {!Element} */ text)
  var textNode = document.createTextNode(field.text)
  text.appendChild(textNode)
}

/**
 * Set the visual effects of the field.
 * @param {*} field
 */
eYo.svg.Field_p.setVisualAttribute = function (field) {
  var e = field.dom.textElement_
  if (e) {
    var f = txt => {
      switch (eYo.t3.profile.get(txt, null).raw) {
      case eYo.t3.expr.reserved_identifier:
      case eYo.t3.expr.reserved_keyword:
      case eYo.t3.expr.known_identifier:
        return 'eyo-code-reserved'
      case eYo.t3.expr.builtin__name:
        return 'eyo-code-builtin'
      default:
        return 'eyo-code'
      }
    }
    eYo.dom.classlist.removeAll(e, eYo.dom.classlist.get(e))
    eYo.dom.classlist.add(e, f(field.text))
  }
}

/**
 * Return the absolute coordinates of the top-left corner of this field.
 * The origin $(0,0)$ is the top-left corner of the page body.
 * @return {!eYo.geom.Point} Object with `.x` and `.y` properties.
 * @private
 */
eYo.svg.Field_p.getAbsoluteWhere_ = function(field) {
  return goog.style.getPageOffset(field.dom.borderRect_)
}

/**
 * Non-breaking space.
 * @const
 */
eYo.svg.NBSP = '\u00A0';

/**
 * Get the text from this field as displayed on screen.  Differs from the original text due to non breaking spaces.
 * @return {string} Displayed text.
 * @private
 */
eYo.svg.Field_p.getDisplayText_ = function(field) {
  var text = field.text_
  if (!text) {
    // Prevent the field from disappearing if empty.
    return eYo.svg.NBSP;
  }
  // Replace whitespaces with non-breaking spaces so the text doesn't collapse.
  return text.replace(/\s/g, eYo.svg.NBSP);
}

/**
 * Handle a mouse down event on a field.
 * @param {Event} e Mouse down event.
 * @private
 */
eYo.svg.onFieldMouseDown_ = function(e) { // eslint-disable-line
  if (this.board && this.brick.hasFocus) {
    this.app.motion.setStartField(this)
  }
}
