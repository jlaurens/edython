/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Board override.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.o4t.newNS('changeCount')

//<<< mochai: Basic
//... chai.assert(eYo.o4t.changeCount)
//... chai.assert(eYo.o4t.changeCount.merge)
//>>>

eYo.o4t.changeCount.modelDeclare({
  //<<< mochai: eYo.o4t.changeCount.modelDeclare
  //... var ns = eYo.o4t.newNS()
  //... ns.makeBaseC9r()
  //... eYo.o4t.changeCount.merge(ns.BaseC9r_p)
  properties: {
    changeCount: 0,
    //<<< mochai: changeCount
    //... var o = new ns.BaseC9r('foo', onr)
    //... chai.expect(o).property('changeCount_p')
    //>>>
  },
  methods: {
    /**
     * If the event is not a UI event,
     * adds 1 to change count on redo,
     * removes 2 on undo.
     * Order of params does not matter.
     * @param {Boolean} [redo] - defaults to `true`
     * @param {Event} [event]
     */
    updateChangeCount (redo, event) {
      //<<< mochai: updateChangeCount
      //... var o = new ns.BaseC9r('foo', onr)
      //... chai.assert(o.updateChangeCount)
      if (redo === true) {
        var what = 1
        //... var o = new ns.BaseC9r('foo', onr)
        //... o.updateChangeCount(true)
        //... chai.expect(o.changeCount).equal(1)
        //... o.updateChangeCount(true)
        //... chai.expect(o.changeCount).equal(2)
      } else if (redo === false) {
        what = -1
        //... o.updateChangeCount(false)
        //... chai.expect(o.changeCount).equal(1)
        //... o.updateChangeCount(false)
        //... chai.expect(o.changeCount).equal(0)
      } else {
        [redo, event] = [event, redo]
        what = !eYo.isDef(redo) || redo ? 1 : -1
        //... o.updateChangeCount()
        //... chai.expect(o.changeCount).equal(1)
      }
      if (!event || !event.isUI) {
        this.changeCount_ += what
        //... var event = {}
        //... var o = new ns.BaseC9r('foo', onr)
        //... o.updateChangeCount(event)
        //... chai.expect(o.changeCount).equal(1)
        //... o.updateChangeCount(true, event)
        //... chai.expect(o.changeCount).equal(2)
        //... o.updateChangeCount(false, event)
        //... chai.expect(o.changeCount).equal(1)
        //... o.resetChangeCount()
        //... chai.expect(o.changeCount).equal(0)
        //... o.updateChangeCount(event)
        //... chai.expect(o.changeCount).equal(1)
        //... o.updateChangeCount(event, true)
        //... chai.expect(o.changeCount).equal(2)
        //... o.updateChangeCount(event, false)
        //... chai.expect(o.changeCount).equal(1)
        //... o.resetChangeCount()
        //... chai.expect(o.changeCount).equal(0)
        //... event.isUI = true
        //... o.updateChangeCount(event)
        //... chai.expect(o.changeCount).equal(0)
        //... o.updateChangeCount(event, true)
        //... chai.expect(o.changeCount).equal(0)
        //... o.updateChangeCount(event, false)
        //... chai.expect(o.changeCount).equal(0)
        //... o.resetChangeCount()
        //... chai.expect(o.changeCount).equal(0)
      }
      //>>>
    },
    /**
     * Resets the change count to 0.
     */
    resetChangeCount () {
      //<<< mochai: resetChangeCount
      //... var o = new ns.BaseC9r('foo', onr)
      //... chai.assert(o.resetChangeCount)
      //... o.updateChangeCount()
      //... chai.expect(o.changeCount).equal(1)
      //... o.resetChangeCount()
      //... chai.expect(o.changeCount).equal(0)
      this.changeCount_ = 0
      //>>>
    }
  },
  //>>>
})
