/**
 * edython
 *
 * Copyright 2020 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview namspace for all the view objects.
 * View object are displayed unless for a faceless application.
 * This is a widget that contains other views.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * @name {eYo.view}
 * @namespace
 */
eYo.widget.makeNS(eYo, 'view')

/**
 * @name {eYo.view.List}
 * @namespace
 * Manage a list of views.
 */
eYo.o3d.makeC9r(eYo.view, 'List', {
})

/**
 * @name{eYo.view.Dflt}
 * @constructor
 * Widgets with UI capabilities.
 */
eYo.view.makeDflt({
  properties: {
    views: {
      value () {
        return new eYo.view.List(this)
      }
    }
  }
})

/**
 * Declare the given model.
 * @param {Object} model - Object, like for |makeC9r|.
 */
eYo.view.Dlgt_p.modelDeclare = function (model) {
  eYo.view.Dlgt_p.SuperC9r_p.modelDeclare.call(this, model)
  model.views && (this.views__ = model.views)
}

/**
 * Make the ui.
 * Default implementation calls the inherited method
 * and forwards to the views.
 */
eYo.view.Dflt_p.doInitUI = function (...args) {
  eYo.view.Dlgt_p.SuperC9r_p.doInitUI.call(this, ...args)
  this.viewForEach(v => v.doInitUI(...args))
}

/**
 * Dispose of the ui.
 * Default implementation forwards to the views
 * and calls the inherited method.
 */
eYo.view.Dflt_p.doDisposeUI = function (...args) {
  this.viewForEach(v => v.doDisposeUI(...args))
  eYo.view.Dlgt_p.SuperC9r_p.doDisposeUI.call(this, ...args)
}

/**
 * Properties to handle views are owned by a view list but
 * their parent is the owner of the view list.
 * 
 */