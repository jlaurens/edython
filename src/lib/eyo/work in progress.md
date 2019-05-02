JL
OK: looking for getSvgRoot() in blockly
OK: remove getSvgRoot reference
OK: bringToFront
OK: manage field visibility
OK: manage slot visibility
OK: remove *.driver.group_
OK: change definitionWithBlock -> definitionWithNode
OK: BUG: right/next for simple statements, right/suite for compound statement
OK: Moving left, right and suite statement connections out of input
OK: Fix checkType_: input connection must not be a statement connection!!!

comprehension2Block
comp_for2Block

? Add an uncheck_ to the connections helpers

drawInputRight should move

connection's delegate `target` returns an eyo whereas other's `target` returns a block.
Change ui.isVisible to a property

Where is block.rendered used in Blockly ?
set at the top of the `render` method.

Where is getConnections_ used ?
Is it used with a 'all_ = false' parameter?
ANS: in
--- Blockly.WorkspaceSvg.prototype.paste
--- Blockly.BlockSvg.prototype.moveConnections_
--- Blockly.BlockSvg.prototype.bumpNeighbours_
--- Blockly.DraggedConnectionManager.prototype.initAvailableConnections_
  --- Blockly.DraggedConnectionManager constructor, which means that the block's rendered = true (most certainly and it is a BlockSvg instance)
  In that case, false is ignored.

Bad blockly design.

Blockly.BlockSvg.prototype.translate ?
Rendered property should move to the ui renderer
Move disabled property to the delegate

* BUG: io.isLastInStatement in eYo.UI.prototype.drawPending_ is always undefined

* Change the variant for the subtype in c8n.sourceBlock_.eyo.variant_p, in slot's consolidate method')

* convert print statement to print expression and conversely, top blocks only

* No eYo.Xml.CALL !!!! *MEANING?*

* no_cond not tested, in delegate_svg_lambba

* Use a modifier field for * and ** (instead of await and async too)

* Use eYo.Events.setGroup(...)

* implement async and await, see above awaitable and asyncable

* move onMouseDown_ and onMouseUp_ to eyo

* change the svg workspace canvas to a svg.group_

* remove block.svgPath_

* move getRelativeToSurfaceXY(…) -> ….eyo.ui.xyInSurface

* who is using the block's `translate` method ? This should be moved to the ui property.s