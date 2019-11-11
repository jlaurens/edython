var fs = require('fs')
var vm = require('vm')

// all paths here are relative to the project root
// at least where npm is run from the project root

var import_file = (path) => {
  try {
    var code = fs.readFileSync(path)
    vm.runInThisContext(code)  
  } catch(err) {
    console.error('FAILURE', path)
    throw err
  }
}

import_file("src/lib/xregexp-all/xregexp-all.js")
import_file("src/lib/closure-library/closure/goog/base.js")

global.window = {}
global.document = process

// DO NOT EDIT NEXT LINE
// DYNAMIC DEPS START
import_file("src/lib/closure-library/closure/goog/promise/thenable.js")
import_file("src/lib/closure-library/closure/goog/a11y/aria/attributes.js")
import_file("src/lib/closure-library/closure/goog/a11y/aria/roles.js")
import_file("src/lib/closure-library/closure/goog/async/freelist.js")
import_file("src/lib/closure-library/closure/goog/color/names.js")
import_file("src/lib/closure-library/closure/goog/date/datelike.js")
import_file("src/lib/closure-library/closure/goog/debug/error.js")
import_file("src/lib/closure-library/closure/goog/debug/logrecord.js")
import_file("src/lib/closure-library/closure/goog/debug/errorcontext.js")
import_file("src/lib/closure-library/closure/goog/disposable/idisposable.js")
import_file("src/lib/closure-library/closure/goog/dom/htmlelement.js")
import_file("src/lib/closure-library/closure/goog/dom/inputtype.js")
import_file("src/lib/closure-library/closure/goog/dom/nodetype.js")
import_file("src/lib/closure-library/closure/goog/dom/animationframe/polyfill.js")
import_file("src/lib/closure-library/closure/goog/events/eventid.js")
import_file("src/lib/closure-library/closure/goog/fs/url.js")
import_file("src/lib/closure-library/closure/goog/functions/functions.js")
import_file("src/lib/closure-library/closure/goog/fx/transition.js")
import_file("src/lib/closure-library/closure/goog/i18n/datetimepatterns.js")
import_file("src/lib/closure-library/closure/goog/i18n/datetimesymbols.js")
import_file("src/lib/closure-library/closure/goog/i18n/bidi.js")
import_file("src/lib/closure-library/closure/goog/math/affinetransform.js")
import_file("src/lib/closure-library/closure/goog/math/irect.js")
import_file("src/lib/closure-library/closure/goog/math/size.js")
import_file("src/lib/closure-library/closure/goog/object/object.js")
import_file("src/lib/closure-library/closure/goog/positioning/abstractposition.js")
import_file("src/lib/closure-library/closure/goog/promise/resolver.js")
import_file("src/lib/closure-library/closure/goog/reflect/reflect.js")
import_file("src/lib/closure-library/closure/goog/string/string.js")
import_file("src/lib/closure-library/closure/goog/string/stringbuffer.js")
import_file("src/lib/closure-library/closure/goog/string/typedstring.js")
import_file("src/lib/closure-library/closure/goog/ui/buttonside.js")
import_file("src/lib/closure-library/closure/goog/ui/controlcontent.js")
import_file("src/lib/closure-library/closure/goog/ui/datepickerrenderer.js")
import_file("src/lib/closure-library/closure/goog/ui/cssnames.js")
import_file("src/lib/closure-library/closure/goog/ui/idgenerator.js")
import_file("src/lib/closure-library/closure/goog/disposable/disposable.js")
import_file("src/lib/closure-library/closure/goog/a11y/aria/datatables.js")
import_file("src/lib/closure-library/closure/goog/asserts/asserts.js")
import_file("src/lib/closure-library/closure/goog/dom/tagname.js")
import_file("src/lib/closure-library/closure/goog/dom/animationframe/animationframe.js")
import_file("src/lib/closure-library/closure/goog/dom/tags.js")
import_file("src/lib/closure-library/closure/goog/events/listenable.js")
import_file("src/lib/closure-library/closure/goog/labs/useragent/util.js")
import_file("src/lib/closure-library/closure/goog/array/array.js")
import_file("src/lib/closure-library/closure/goog/async/workqueue.js")
import_file("src/lib/closure-library/closure/goog/date/date.js")
import_file("src/lib/closure-library/closure/goog/debug/entrypointregistry.js")
import_file("src/lib/closure-library/closure/goog/debug/logbuffer.js")
import_file("src/lib/closure-library/closure/goog/dom/asserts.js")
import_file("src/lib/closure-library/closure/goog/events/event.js")
import_file("src/lib/closure-library/closure/goog/events/listener.js")
import_file("src/lib/closure-library/closure/goog/labs/useragent/platform.js")
import_file("src/lib/closure-library/closure/goog/string/const.js")
import_file("src/lib/closure-library/closure/goog/dom/classlist.js")
import_file("src/lib/closure-library/closure/goog/events/listenermap.js")
import_file("src/lib/closure-library/closure/goog/html/safescript.js")
import_file("src/lib/closure-library/closure/goog/html/trustedresourceurl.js")
import_file("src/lib/closure-library/closure/goog/i18n/timezone.js")
import_file("src/lib/closure-library/closure/goog/labs/useragent/browser.js")
import_file("src/lib/closure-library/closure/goog/labs/useragent/engine.js")
import_file("src/lib/closure-library/closure/goog/math/math.js")
import_file("src/lib/closure-library/closure/goog/structs/structs.js")
import_file("src/lib/closure-library/closure/goog/async/nexttick.js")
import_file("src/lib/closure-library/closure/goog/color/color.js")
import_file("src/lib/closure-library/closure/goog/html/safeurl.js")
import_file("src/lib/closure-library/closure/goog/i18n/datetimeformat.js")
import_file("src/lib/closure-library/closure/goog/iter/iter.js")
import_file("src/lib/closure-library/closure/goog/math/coordinate.js")
import_file("src/lib/closure-library/closure/goog/structs/trie.js")
import_file("src/lib/closure-library/closure/goog/ui/registry.js")
import_file("src/lib/closure-library/closure/goog/useragent/useragent.js")
import_file("src/lib/closure-library/closure/goog/async/run.js")
import_file("src/lib/closure-library/closure/goog/date/daterange.js")
import_file("src/lib/closure-library/closure/goog/debug/debug.js")
import_file("src/lib/closure-library/closure/goog/dom/browserfeature.js")
import_file("src/lib/closure-library/closure/goog/dom/vendor.js")
import_file("src/lib/closure-library/closure/goog/events/browserfeature.js")
import_file("src/lib/closure-library/closure/goog/events/keycodes.js")
import_file("src/lib/closure-library/closure/goog/html/safestyle.js")
import_file("src/lib/closure-library/closure/goog/math/box.js")
import_file("src/lib/closure-library/closure/goog/structs/map.js")
import_file("src/lib/closure-library/closure/goog/useragent/platform.js")
import_file("src/lib/closure-library/closure/goog/useragent/product.js")
import_file("src/lib/closure-library/closure/goog/promise/promise.js")
import_file("src/lib/closure-library/closure/goog/debug/logger.js")
import_file("src/lib/closure-library/closure/goog/events/eventtype.js")
import_file("src/lib/closure-library/closure/goog/html/safestylesheet.js")
import_file("src/lib/closure-library/closure/goog/math/rect.js")
import_file("src/lib/closure-library/closure/goog/ui/tree/typeahead.js")
import_file("src/lib/closure-library/closure/goog/useragent/product_isversion.js")
import_file("src/lib/closure-library/closure/goog/events/browserevent.js")
import_file("src/lib/closure-library/closure/goog/html/safehtml.js")
import_file("src/lib/closure-library/closure/goog/log/log.js")
import_file("src/lib/closure-library/closure/goog/dom/safe.js")
import_file("src/lib/closure-library/closure/goog/events/events.js")
import_file("src/lib/closure-library/closure/goog/html/uncheckedconversions.js")
import_file("src/lib/closure-library/closure/goog/dom/dom.js")
import_file("src/lib/closure-library/closure/goog/events/eventhandler.js")
import_file("src/lib/closure-library/closure/goog/events/eventtarget.js")
import_file("src/lib/closure-library/closure/goog/timer/timer.js")
import_file("src/lib/closure-library/closure/goog/a11y/aria/aria.js")
import_file("src/lib/closure-library/closure/goog/cssom/cssom.js")
import_file("src/lib/closure-library/closure/goog/dom/tagiterator.js")
import_file("src/lib/closure-library/closure/goog/dom/iframe.js")
import_file("src/lib/closure-library/closure/goog/events/focushandler.js")
import_file("src/lib/closure-library/closure/goog/events/keyhandler.js")
import_file("src/lib/closure-library/closure/goog/style/style.js")
import_file("src/lib/closure-library/closure/goog/ui/defaultdatepickerrenderer.js")
import_file("src/lib/closure-library/closure/goog/ui/selectionmodel.js")
import_file("src/lib/closure-library/closure/goog/dom/nodeiterator.js")
import_file("src/lib/closure-library/closure/goog/style/bidi.js")
import_file("src/lib/closure-library/closure/goog/ui/component.js")
import_file("src/lib/closure-library/closure/goog/ui/containerrenderer.js")
import_file("src/lib/closure-library/closure/goog/ui/modalariavisibilityhelper.js")
import_file("src/lib/closure-library/closure/goog/ui/popupbase.js")
import_file("src/lib/closure-library/closure/goog/fx/dragger.js")
import_file("src/lib/closure-library/closure/goog/positioning/positioning.js")
import_file("src/lib/closure-library/closure/goog/ui/controlrenderer.js")
import_file("src/lib/closure-library/closure/goog/ui/datepicker.js")
import_file("src/lib/closure-library/closure/goog/ui/modalpopup.js")
import_file("src/lib/closure-library/closure/goog/ui/tree/basenode.js")
import_file("src/lib/closure-library/closure/goog/positioning/anchoredposition.js")
import_file("src/lib/closure-library/closure/goog/positioning/clientposition.js")
import_file("src/lib/closure-library/closure/goog/ui/buttonrenderer.js")
import_file("src/lib/closure-library/closure/goog/ui/control.js")
import_file("src/lib/closure-library/closure/goog/ui/dialog.js")
import_file("src/lib/closure-library/closure/goog/ui/menuheaderrenderer.js")
import_file("src/lib/closure-library/closure/goog/ui/menuitemrenderer.js")
import_file("src/lib/closure-library/closure/goog/ui/menuseparatorrenderer.js")
import_file("src/lib/closure-library/closure/goog/ui/paletterenderer.js")
import_file("src/lib/closure-library/closure/goog/ui/tree/treenode.js")
import_file("src/lib/closure-library/closure/goog/positioning/anchoredviewportposition.js")
import_file("src/lib/closure-library/closure/goog/positioning/viewportclientposition.js")
import_file("src/lib/closure-library/closure/goog/ui/container.js")
import_file("src/lib/closure-library/closure/goog/ui/custombuttonrenderer.js")
import_file("src/lib/closure-library/closure/goog/ui/menuheader.js")
import_file("src/lib/closure-library/closure/goog/ui/menuitem.js")
import_file("src/lib/closure-library/closure/goog/ui/nativebuttonrenderer.js")
import_file("src/lib/closure-library/closure/goog/ui/palette.js")
import_file("src/lib/closure-library/closure/goog/ui/separator.js")
import_file("src/lib/closure-library/closure/goog/ui/tree/treecontrol.js")
import_file("src/lib/closure-library/closure/goog/positioning/menuanchoredposition.js")
import_file("src/lib/closure-library/closure/goog/ui/button.js")
import_file("src/lib/closure-library/closure/goog/ui/colorpalette.js")
import_file("src/lib/closure-library/closure/goog/ui/menurenderer.js")
import_file("src/lib/closure-library/closure/goog/ui/menuseparator.js")
import_file("src/lib/closure-library/closure/goog/ui/colorpicker.js")
import_file("src/lib/closure-library/closure/goog/ui/menu.js")
import_file("src/lib/closure-library/closure/goog/ui/menubuttonrenderer.js")
import_file("src/lib/closure-library/closure/goog/ui/popupmenu.js")
import_file("src/lib/closure-library/closure/goog/ui/submenurenderer.js")
import_file("src/lib/closure-library/closure/goog/ui/menubutton.js")
import_file("src/lib/closure-library/closure/goog/ui/submenu.js")
import_file("src/lib/closure-library/closure/goog/ui/select.js")
import_file("src/lib/blockly/core/blocks.js")
import_file("src/lib/blockly/core/css.js")
import_file("src/lib/blockly/core/msg.js")
import_file("src/lib/blockly/core/names.js")
import_file("src/lib/blockly/core/options.js")
import_file("src/lib/blockly/core/constants.js")
import_file("src/lib/blockly/core/ui_menu_utils.js")
import_file("src/lib/blockly/core/bubble_dragger.js")
import_file("src/lib/blockly/core/events.js")
import_file("src/lib/blockly/core/workspace_audio.js")
import_file("src/lib/blockly/core/workspace_dragger.js")
import_file("src/lib/blockly/core/events_abstract.js")
import_file("src/lib/blockly/core/flyout_dragger.js")
import_file("src/lib/blockly/core/block_events.js")
import_file("src/lib/blockly/core/ui_events.js")
import_file("src/lib/blockly/core/variable_events.js")
import_file("src/lib/blockly/core/variable_map.js")
import_file("src/lib/blockly/core/variable_model.js")
import_file("src/lib/blockly/core/touch.js")
import_file("src/lib/blockly/core/workspace.js")
import_file("src/lib/blockly/core/bubble.js")
import_file("src/lib/blockly/core/connection.js")
import_file("src/lib/blockly/core/flyout_button.js")
import_file("src/lib/blockly/core/icon.js")
import_file("src/lib/blockly/core/scrollbar.js")
import_file("src/lib/blockly/core/tooltip.js")
import_file("src/lib/blockly/core/variables.js")
import_file("src/lib/blockly/core/xml.js")
import_file("src/lib/blockly/core/zoom_controls.js")
import_file("src/lib/blockly/core/utils.js")
import_file("src/lib/blockly/core/block_drag_surface.js")
import_file("src/lib/blockly/core/comment.js")
import_file("src/lib/blockly/core/connection_db.js")
import_file("src/lib/blockly/core/grid.js")
import_file("src/lib/blockly/core/rendered_connection.js")
import_file("src/lib/blockly/core/trashcan.js")
import_file("src/lib/blockly/core/variables_dynamic.js")
import_file("src/lib/blockly/core/warning.js")
import_file("src/lib/blockly/core/widgetdiv.js")
import_file("src/lib/blockly/core/workspace_drag_surface_svg.js")
import_file("src/lib/blockly/core/dragged_connection_manager.js")
import_file("src/lib/blockly/core/block_dragger.js")
import_file("src/lib/blockly/core/gesture.js")
import_file("src/lib/blockly/core/field.js")
import_file("src/lib/blockly/core/touch_gesture.js")
import_file("src/lib/blockly/core/field_checkbox.js")
import_file("src/lib/blockly/core/field_date.js")
import_file("src/lib/blockly/core/field_image.js")
import_file("src/lib/blockly/core/field_label.js")
import_file("src/lib/blockly/core/field_textinput.js")
import_file("src/lib/blockly/core/procedures.js")
import_file("src/lib/blockly/core/workspace_svg.js")
import_file("src/lib/blockly/core/contextmenu.js")
import_file("src/lib/blockly/core/field_angle.js")
import_file("src/lib/blockly/core/field_colour.js")
import_file("src/lib/blockly/core/field_dropdown.js")
import_file("src/lib/blockly/core/field_number.js")
import_file("src/lib/blockly/core/input.js")
import_file("src/lib/blockly/core/mutator.js")
import_file("src/lib/blockly/core/inject.js")
import_file("src/lib/blockly/core/extensions.js")
import_file("src/lib/blockly/core/field_variable.js")
import_file("src/lib/blockly/core/block.js")
import_file("src/lib/blockly/core/block_svg.js")
import_file("src/lib/blockly/core/flyout_base.js")
import_file("src/lib/blockly/core/generator.js")
import_file("src/lib/blockly/core/block_render_svg.js")
import_file("src/lib/blockly/core/flyout_horizontal.js")
import_file("src/lib/blockly/core/flyout_vertical.js")
import_file("src/lib/blockly/core/toolbox.js")
import_file("src/lib/blockly/core/blockly.js")
import_file("src/lib/eyo/src/core/eyo.js")
import_file("src/lib/eyo/src/ui/audio.js")
import_file("src/lib/eyo/src/parser/bitset.js")
import_file("src/lib/eyo/src/other/board_dragger.js")
import_file("src/lib/eyo/src/core/change.js")
import_file("src/lib/eyo/src/other/db.js")
import_file("src/lib/eyo/src/core/decorate.js")
import_file("src/lib/eyo/src/ui/dnd.js")
import_file("src/lib/eyo/src/core/do.js")
import_file("src/lib/eyo/Include/errcode.js")
import_file("src/lib/eyo/src/core/ui.js")
import_file("src/lib/eyo/src/application/desk/workspace/board/brick/list.js")
import_file("src/lib/eyo/src/ui/motion.js")
import_file("src/lib/eyo/msg/js/base.js")
import_file("src/lib/eyo/src/application/options.js")
import_file("src/lib/eyo/src/core/property.js")
import_file("src/lib/eyo/src/core/protocol.js")
import_file("src/lib/eyo/src/other/scaler.js")
import_file("src/lib/eyo/src/application/desk/workspace/board/brick/span.js")
import_file("src/lib/eyo/src/core/T3.js")
import_file("src/lib/eyo/src/parser/token.js")
import_file("src/lib/eyo/src/core/font.js")
import_file("src/lib/eyo/src/parser/ast.js")
import_file("src/lib/eyo/src/application/application.js")
import_file("src/lib/eyo/src/application/desk/workspace/board/brick/brick_util/brick_dragger.js")
import_file("src/lib/eyo/src/core/const.js")
import_file("src/lib/eyo/src/ui/css.js")
import_file("src/lib/eyo/src/parser/grammar.js")
import_file("src/lib/eyo/src/core/geometry.js")
import_file("src/lib/eyo/src/parser/node.js")
import_file("src/lib/eyo/src/application/abstract/owned.js")
import_file("src/lib/eyo/src/core/change_count.js")
import_file("src/lib/eyo/src/core/register.js")
import_file("src/lib/eyo/src/other/responder.js")
import_file("src/lib/eyo/src/application/desk/workspace/flyout/section.js")
import_file("src/lib/eyo/src/core/T3_all.js")
import_file("src/lib/eyo/src/core/xre.js")
import_file("src/lib/eyo/src/application/backer.js")
import_file("src/lib/eyo/src/application/desk/workspace/board/board.js")
import_file("src/lib/eyo/src/application/clipboard.js")
import_file("src/lib/eyo/src/application/desk/desk.js")
import_file("src/lib/eyo/src/application/driver/driver.js")
import_file("src/lib/eyo/src/core/events.js")
import_file("src/lib/eyo/src/parser/acceler.js")
import_file("src/lib/eyo/Python/graminit.js")
import_file("src/lib/eyo/src/application/desk/workspace/board/metrics/metrics.js")
import_file("src/lib/eyo/src/model/model.js")
import_file("src/lib/eyo/src/parser/listnode.js")
import_file("src/lib/eyo/src/application/abstract/owned2.js")
import_file("src/lib/eyo/src/application/abstract/pane.js")
import_file("src/lib/eyo/src/parser/tokenizer.js")
import_file("src/lib/eyo/src/application/desk/workspace/scrollbar/scrollbar.js")
import_file("src/lib/eyo/src/application/desk/workspace/scroller/scroller.js")
import_file("src/lib/eyo/src/application/desk/workspace/flyout/search.js")
import_file("src/lib/eyo/src/application/desk/workspace/board/brick/shape.js")
import_file("src/lib/eyo/src/application/abstract/workspace_control.js")
import_file("src/lib/eyo/src/application/desk/workspace/flyout/draft.js")
import_file("src/lib/eyo/src/application/driver/fsls/fsls_application.js")
import_file("src/lib/eyo/src/application/driver/fsls/desk.js")
import_file("src/lib/eyo/src/application/driver/fsls/draft.js")
import_file("src/lib/eyo/src/application/driver/fsls/field.js")
import_file("src/lib/eyo/src/application/driver/fsls/flyout.js")
import_file("src/lib/eyo/src/application/driver/fsls/focus.js")
import_file("src/lib/eyo/src/application/driver/fsls/library.js")
import_file("src/lib/eyo/src/application/driver/fsls/magnet.js")
import_file("src/lib/eyo/src/application/driver/fsls/scroller.js")
import_file("src/lib/eyo/src/application/driver/fsls/search.js")
import_file("src/lib/eyo/src/application/driver/fsls/slot.js")
import_file("src/lib/eyo/src/application/driver/fsls/trashcan.js")
import_file("src/lib/eyo/src/application/driver/fsls/workspace.js")
import_file("src/lib/eyo/src/application/driver/fsls/zoomer.js")
import_file("src/lib/eyo/src/application/driver/fsls/board.js")
import_file("src/lib/eyo/src/application/driver/fsls/brick.js")
import_file("src/lib/eyo/src/application/desk/workspace/board/brick/field/field.js")
import_file("src/lib/eyo/src/application/desk/workspace/flyout/flyout.js")
import_file("src/lib/eyo/src/application/desk/graphic/graphic.js")
import_file("src/lib/eyo/src/application/desk/workspace/board/brick/magnet/magnet.js")
import_file("src/lib/eyo/src/model/array_model.js")
import_file("src/lib/eyo/src/model/bisect_model.js")
import_file("src/lib/eyo/src/model/calendar_model.js")
import_file("src/lib/eyo/src/model/cmath_model.js")
import_file("src/lib/eyo/src/model/collections.abc_model.js")
import_file("src/lib/eyo/src/model/collections_model.js")
import_file("src/lib/eyo/src/model/copy_model.js")
import_file("src/lib/eyo/src/model/datamodel_model.js")
import_file("src/lib/eyo/src/model/datastructures_model.js")
import_file("src/lib/eyo/src/model/datetime_model.js")
import_file("src/lib/eyo/src/model/decimal_model.js")
import_file("src/lib/eyo/src/model/enum_model.js")
import_file("src/lib/eyo/src/model/fractions_model.js")
import_file("src/lib/eyo/src/model/functions_model.js")
import_file("src/lib/eyo/src/model/heapq_model.js")
import_file("src/lib/eyo/src/model/math_model.js")
import_file("src/lib/eyo/src/model/pprint_model.js")
import_file("src/lib/eyo/src/model/random_model.js")
import_file("src/lib/eyo/src/model/reprlib_model.js")
import_file("src/lib/eyo/src/model/statistics_model.js")
import_file("src/lib/eyo/src/model/stdtypes_model.js")
import_file("src/lib/eyo/src/model/string_model.js")
import_file("src/lib/eyo/src/model/turtle_model.js")
import_file("src/lib/eyo/src/model/types_model.js")
import_file("src/lib/eyo/src/model/weakref_model.js")
import_file("src/lib/eyo/src/parser/parser.js")
import_file("src/lib/eyo/src/model/profile.js")
import_file("src/lib/eyo/src/application/desk/template/template.js")
import_file("src/lib/eyo/src/application/desk/terminal/terminal.js")
import_file("src/lib/eyo/src/application/desk/workspace/trashcan/trashcan.js")
import_file("src/lib/eyo/src/application/desk/turtle/turtle.js")
import_file("src/lib/eyo/src/application/desk/variable/variable.js")
import_file("src/lib/eyo/src/application/desk/workspace/workspace.js")
import_file("src/lib/eyo/src/application/desk/workspace/zoomer/zoomer.js")
import_file("src/lib/eyo/src/parser/parsetok.js")
import_file("src/lib/eyo/src/application/driver/dom/dom.js")
import_file("src/lib/eyo/src/application/driver/fsls/fsls.js")
import_file("src/lib/eyo/src/core/data.js")
import_file("src/lib/eyo/src/application/driver/dom/dom_application.js")
import_file("src/lib/eyo/src/application/driver/dom/board.js")
import_file("src/lib/eyo/src/application/driver/dom/brick.js")
import_file("src/lib/eyo/src/application/desk/workspace/board/brick/slot/slot.js")
import_file("src/lib/eyo/src/application/driver/svg/svg.js")
import_file("src/lib/eyo/src/application/desk/workspace/board/brick/brick.js")
import_file("src/lib/eyo/src/application/desk/workspace/board/brick/brick_util/brick_events.js")
import_file("src/lib/eyo/src/application/driver/svg/application.js")
import_file("src/lib/eyo/src/application/driver/svg/board.js")
import_file("src/lib/eyo/src/application/driver/svg/drag.js")
import_file("src/lib/eyo/src/application/driver/svg/brick.js")
import_file("src/lib/eyo/src/application/driver/svg/desk.js")
import_file("src/lib/eyo/src/application/driver/svg/dnd.js")
import_file("src/lib/eyo/src/application/driver/svg/field.js")
import_file("src/lib/eyo/src/application/driver/svg/flyout.js")
import_file("src/lib/eyo/src/application/driver/svg/focus.js")
import_file("src/lib/eyo/src/application/driver/svg/magnet.js")
import_file("src/lib/eyo/src/application/driver/svg/scrollbar.js")
import_file("src/lib/eyo/src/application/driver/svg/scroller.js")
import_file("src/lib/eyo/src/application/driver/svg/search.js")
import_file("src/lib/eyo/src/application/driver/svg/slot.js")
import_file("src/lib/eyo/src/application/driver/svg/trashcan.js")
import_file("src/lib/eyo/src/application/driver/svg/zoomer.js")
import_file("src/lib/eyo/src/application/driver/svg/brick_dragger.js")
import_file("src/lib/eyo/src/brick_py/expr.js")
import_file("src/lib/eyo/src/brick_py/final.js")
import_file("src/lib/eyo/src/ui/brick_ui.js")
import_file("src/lib/eyo/src/application/desk/workspace/board/brick/brick_util/consolidator.js")
import_file("src/lib/eyo/src/application/desk/focus.js")
import_file("src/lib/eyo/src/application/desk/workspace/board/brick/brick_util/python_exporter.js")
import_file("src/lib/eyo/src/application/driver/svg/effect.js")
import_file("src/lib/eyo/src/other/tooltip.js")
import_file("src/lib/eyo/src/brick_py/literal.js")
import_file("src/lib/eyo/src/brick_py/list.js")
import_file("src/lib/eyo/src/brick_py/operator.js")
import_file("src/lib/eyo/src/brick_py/range.js")
import_file("src/lib/eyo/src/brick_py/starred.js")
import_file("src/lib/eyo/src/application/desk/workspace/flyout/library.js")
import_file("src/lib/eyo/src/application/desk/workspace/board/brick/brick_util/navigate.js")
import_file("src/lib/eyo/src/brick_py/argument.js")
import_file("src/lib/eyo/src/brick_py/comp.js")
import_file("src/lib/eyo/src/brick_py/stmt.js")
import_file("src/lib/eyo/closure-library/menuitemrenderer.js")
import_file("src/lib/eyo/src/brick_py/group.js")
import_file("src/lib/eyo/src/brick_py/import.js")
import_file("src/lib/eyo/src/brick_py/primary.js")
import_file("src/lib/eyo/src/module/brick_string.js")
import_file("src/lib/eyo/src/brick_py/yield.js")
import_file("src/lib/eyo/closure-library/menuitem.js")
import_file("src/lib/eyo/src/brick_py/assignment.js")
import_file("src/lib/eyo/src/module/brick_cmath.js")
import_file("src/lib/eyo/src/brick_py/control.js")
import_file("src/lib/eyo/src/module/brick_decimal.js")
import_file("src/lib/eyo/src/module/brick_fractions.js")
import_file("src/lib/eyo/src/module/brick_functions.js")
import_file("src/lib/eyo/src/brick_py/lambda.js")
import_file("src/lib/eyo/src/module/brick_math.js")
import_file("src/lib/eyo/src/brick_py/proc.js")
import_file("src/lib/eyo/src/module/brick_random.js")
import_file("src/lib/eyo/src/module/brick_statistics.js")
import_file("src/lib/eyo/src/module/brick_stdtypes.js")
import_file("src/lib/eyo/src/brick_py/try.js")
import_file("src/lib/eyo/src/module/brick_turtle.js")
import_file("src/lib/eyo/src/other/menu_manager.js")
import_file("src/lib/eyo/closure-library/menurenderer.js")
import_file("src/lib/eyo/src/application/desk/workspace/board/brick/brick_util/node_brick.js")
import_file("src/lib/eyo/closure-library/menu.js")
import_file("src/lib/eyo/src/application/desk/workspace/board/brick/brick_util/xml.js")
import_file("src/lib/eyo/src/other/demo.js")
import_file("src/lib/eyo/closure-library/menubuttonrenderer.js")
import_file("src/lib/eyo/closure-library/popupmenu.js")
import_file("src/lib/eyo/closure-library/submenurenderer.js")
import_file("src/lib/eyo/src/other/key_handler.js")
import_file("src/lib/eyo/closure-library/submenu.js")
import_file("src/lib/eyo/src/application/desk/workspace/flyout/flyout-toolbar.js")
// DYNAMIC DEPS END
