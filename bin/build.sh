#/usr/bin/env bash
cd "$(dirname "$0")/.."
echo "Working directory: $(pwd)"
mkdir -p build/base
#
#"src/lib/eyo/block"
COMPILER="$(find bin/compiler-latest -name closure-compiler-v*.jar)"
#java -jar "$COMPILER" --help
rm build/base/edython.js

GIT_HEAD="$(git rev-list HEAD | wc -l | sed -e 's/^[ \t]*//')"
TODAY="$(date -u)"
# In the next command, the '--js ...' lines
# with no indentation are built automatically
# by helper/tool3.py
java -jar "$COMPILER"\
  --warning_level DEFAULT \
  --define="goog.global.CLOSURE_NO_DEPS=true"\
  --define="eYo.Version.GIT_HEAD='$GIT_HEAD'"\
  --define="eYo.Version.BUILD_DATE='$TODAY'"\
  --externs "src/lib/externs/xregexp.js"\
  --js "src/lib/closure-library/closure/goog/base.js" \
--js "src/lib/closure-library/closure/goog/promise/thenable.js" \
--js "src/lib/closure-library/closure/goog/a11y/aria/attributes.js" \
--js "src/lib/closure-library/closure/goog/a11y/aria/roles.js" \
--js "src/lib/closure-library/closure/goog/async/freelist.js" \
--js "src/lib/closure-library/closure/goog/color/names.js" \
--js "src/lib/closure-library/closure/goog/date/datelike.js" \
--js "src/lib/closure-library/closure/goog/debug/error.js" \
--js "src/lib/closure-library/closure/goog/debug/logrecord.js" \
--js "src/lib/closure-library/closure/goog/debug/errorcontext.js" \
--js "src/lib/closure-library/closure/goog/disposable/idisposable.js" \
--js "src/lib/closure-library/closure/goog/dom/htmlelement.js" \
--js "src/lib/closure-library/closure/goog/dom/inputtype.js" \
--js "src/lib/closure-library/closure/goog/dom/nodetype.js" \
--js "src/lib/closure-library/closure/goog/dom/animationframe/polyfill.js" \
--js "src/lib/closure-library/closure/goog/events/eventid.js" \
--js "src/lib/closure-library/closure/goog/fs/url.js" \
--js "src/lib/closure-library/closure/goog/functions/functions.js" \
--js "src/lib/closure-library/closure/goog/fx/transition.js" \
--js "src/lib/closure-library/closure/goog/i18n/datetimepatterns.js" \
--js "src/lib/closure-library/closure/goog/i18n/datetimesymbols.js" \
--js "src/lib/closure-library/closure/goog/i18n/bidi.js" \
--js "src/lib/closure-library/closure/goog/math/irect.js" \
--js "src/lib/closure-library/closure/goog/math/size.js" \
--js "src/lib/closure-library/closure/goog/object/object.js" \
--js "src/lib/closure-library/closure/goog/positioning/abstractposition.js" \
--js "src/lib/closure-library/closure/goog/promise/resolver.js" \
--js "src/lib/closure-library/closure/goog/reflect/reflect.js" \
--js "src/lib/closure-library/closure/goog/string/string.js" \
--js "src/lib/closure-library/closure/goog/string/stringbuffer.js" \
--js "src/lib/closure-library/closure/goog/string/typedstring.js" \
--js "src/lib/closure-library/closure/goog/ui/buttonside.js" \
--js "src/lib/closure-library/closure/goog/ui/controlcontent.js" \
--js "src/lib/closure-library/closure/goog/ui/datepickerrenderer.js" \
--js "src/lib/closure-library/closure/goog/ui/cssnames.js" \
--js "src/lib/closure-library/closure/goog/ui/idgenerator.js" \
--js "src/lib/closure-library/closure/goog/disposable/disposable.js" \
--js "src/lib/closure-library/closure/goog/a11y/aria/datatables.js" \
--js "src/lib/closure-library/closure/goog/asserts/asserts.js" \
--js "src/lib/closure-library/closure/goog/dom/tagname.js" \
--js "src/lib/closure-library/closure/goog/dom/animationframe/animationframe.js" \
--js "src/lib/closure-library/closure/goog/dom/tags.js" \
--js "src/lib/closure-library/closure/goog/events/listenable.js" \
--js "src/lib/closure-library/closure/goog/labs/useragent/util.js" \
--js "src/lib/closure-library/closure/goog/array/array.js" \
--js "src/lib/closure-library/closure/goog/async/workqueue.js" \
--js "src/lib/closure-library/closure/goog/date/date.js" \
--js "src/lib/closure-library/closure/goog/debug/entrypointregistry.js" \
--js "src/lib/closure-library/closure/goog/debug/logbuffer.js" \
--js "src/lib/closure-library/closure/goog/dom/asserts.js" \
--js "src/lib/closure-library/closure/goog/events/event.js" \
--js "src/lib/closure-library/closure/goog/events/listener.js" \
--js "src/lib/closure-library/closure/goog/labs/useragent/platform.js" \
--js "src/lib/closure-library/closure/goog/string/const.js" \
--js "src/lib/closure-library/closure/goog/crypt/crypt.js" \
--js "src/lib/closure-library/closure/goog/dom/classlist.js" \
--js "src/lib/closure-library/closure/goog/events/listenermap.js" \
--js "src/lib/closure-library/closure/goog/html/safescript.js" \
--js "src/lib/closure-library/closure/goog/html/trustedresourceurl.js" \
--js "src/lib/closure-library/closure/goog/i18n/timezone.js" \
--js "src/lib/closure-library/closure/goog/labs/useragent/browser.js" \
--js "src/lib/closure-library/closure/goog/labs/useragent/engine.js" \
--js "src/lib/closure-library/closure/goog/math/math.js" \
--js "src/lib/closure-library/closure/goog/structs/structs.js" \
--js "src/lib/closure-library/closure/goog/async/nexttick.js" \
--js "src/lib/closure-library/closure/goog/color/color.js" \
--js "src/lib/closure-library/closure/goog/html/safeurl.js" \
--js "src/lib/closure-library/closure/goog/i18n/datetimeformat.js" \
--js "src/lib/closure-library/closure/goog/iter/iter.js" \
--js "src/lib/closure-library/closure/goog/math/coordinate.js" \
--js "src/lib/closure-library/closure/goog/structs/trie.js" \
--js "src/lib/closure-library/closure/goog/ui/registry.js" \
--js "src/lib/closure-library/closure/goog/useragent/useragent.js" \
--js "src/lib/closure-library/closure/goog/async/run.js" \
--js "src/lib/closure-library/closure/goog/date/daterange.js" \
--js "src/lib/closure-library/closure/goog/debug/debug.js" \
--js "src/lib/closure-library/closure/goog/dom/browserfeature.js" \
--js "src/lib/closure-library/closure/goog/dom/vendor.js" \
--js "src/lib/closure-library/closure/goog/events/browserfeature.js" \
--js "src/lib/closure-library/closure/goog/events/keycodes.js" \
--js "src/lib/closure-library/closure/goog/html/safestyle.js" \
--js "src/lib/closure-library/closure/goog/math/box.js" \
--js "src/lib/closure-library/closure/goog/structs/map.js" \
--js "src/lib/closure-library/closure/goog/useragent/platform.js" \
--js "src/lib/closure-library/closure/goog/useragent/product.js" \
--js "src/lib/closure-library/closure/goog/promise/promise.js" \
--js "src/lib/closure-library/closure/goog/debug/logger.js" \
--js "src/lib/closure-library/closure/goog/events/eventtype.js" \
--js "src/lib/closure-library/closure/goog/html/safestylesheet.js" \
--js "src/lib/closure-library/closure/goog/math/rect.js" \
--js "src/lib/closure-library/closure/goog/ui/tree/typeahead.js" \
--js "src/lib/closure-library/closure/goog/useragent/product_isversion.js" \
--js "src/lib/closure-library/closure/goog/events/browserevent.js" \
--js "src/lib/closure-library/closure/goog/html/safehtml.js" \
--js "src/lib/closure-library/closure/goog/log/log.js" \
--js "src/lib/closure-library/closure/goog/dom/safe.js" \
--js "src/lib/closure-library/closure/goog/events/events.js" \
--js "src/lib/closure-library/closure/goog/html/uncheckedconversions.js" \
--js "src/lib/closure-library/closure/goog/dom/dom.js" \
--js "src/lib/closure-library/closure/goog/events/eventhandler.js" \
--js "src/lib/closure-library/closure/goog/events/eventtarget.js" \
--js "src/lib/closure-library/closure/goog/timer/timer.js" \
--js "src/lib/closure-library/closure/goog/a11y/aria/aria.js" \
--js "src/lib/closure-library/closure/goog/cssom/cssom.js" \
--js "src/lib/closure-library/closure/goog/dom/tagiterator.js" \
--js "src/lib/closure-library/closure/goog/dom/iframe.js" \
--js "src/lib/closure-library/closure/goog/events/focushandler.js" \
--js "src/lib/closure-library/closure/goog/events/keyhandler.js" \
--js "src/lib/closure-library/closure/goog/style/style.js" \
--js "src/lib/closure-library/closure/goog/ui/defaultdatepickerrenderer.js" \
--js "src/lib/closure-library/closure/goog/ui/selectionmodel.js" \
--js "src/lib/closure-library/closure/goog/dom/nodeiterator.js" \
--js "src/lib/closure-library/closure/goog/style/bidi.js" \
--js "src/lib/closure-library/closure/goog/ui/component.js" \
--js "src/lib/closure-library/closure/goog/ui/containerrenderer.js" \
--js "src/lib/closure-library/closure/goog/ui/modalariavisibilityhelper.js" \
--js "src/lib/closure-library/closure/goog/ui/popupbase.js" \
--js "src/lib/closure-library/closure/goog/fx/dragger.js" \
--js "src/lib/closure-library/closure/goog/positioning/positioning.js" \
--js "src/lib/closure-library/closure/goog/ui/controlrenderer.js" \
--js "src/lib/closure-library/closure/goog/ui/datepicker.js" \
--js "src/lib/closure-library/closure/goog/ui/modalpopup.js" \
--js "src/lib/closure-library/closure/goog/ui/tree/basenode.js" \
--js "src/lib/closure-library/closure/goog/positioning/anchoredposition.js" \
--js "src/lib/closure-library/closure/goog/positioning/clientposition.js" \
--js "src/lib/closure-library/closure/goog/ui/buttonrenderer.js" \
--js "src/lib/closure-library/closure/goog/ui/control.js" \
--js "src/lib/closure-library/closure/goog/ui/dialog.js" \
--js "src/lib/closure-library/closure/goog/ui/menuheaderrenderer.js" \
--js "src/lib/closure-library/closure/goog/ui/menuitemrenderer.js" \
--js "src/lib/closure-library/closure/goog/ui/menuseparatorrenderer.js" \
--js "src/lib/closure-library/closure/goog/ui/paletterenderer.js" \
--js "src/lib/closure-library/closure/goog/ui/tree/treenode.js" \
--js "src/lib/closure-library/closure/goog/positioning/anchoredviewportposition.js" \
--js "src/lib/closure-library/closure/goog/positioning/viewportclientposition.js" \
--js "src/lib/closure-library/closure/goog/ui/container.js" \
--js "src/lib/closure-library/closure/goog/ui/custombuttonrenderer.js" \
--js "src/lib/closure-library/closure/goog/ui/menuheader.js" \
--js "src/lib/closure-library/closure/goog/ui/menuitem.js" \
--js "src/lib/closure-library/closure/goog/ui/nativebuttonrenderer.js" \
--js "src/lib/closure-library/closure/goog/ui/palette.js" \
--js "src/lib/closure-library/closure/goog/ui/separator.js" \
--js "src/lib/closure-library/closure/goog/ui/tree/treecontrol.js" \
--js "src/lib/closure-library/closure/goog/positioning/menuanchoredposition.js" \
--js "src/lib/closure-library/closure/goog/ui/button.js" \
--js "src/lib/closure-library/closure/goog/ui/colorpalette.js" \
--js "src/lib/closure-library/closure/goog/ui/menurenderer.js" \
--js "src/lib/closure-library/closure/goog/ui/menuseparator.js" \
--js "src/lib/closure-library/closure/goog/ui/colorpicker.js" \
--js "src/lib/closure-library/closure/goog/ui/menu.js" \
--js "src/lib/closure-library/closure/goog/ui/menubuttonrenderer.js" \
--js "src/lib/closure-library/closure/goog/ui/popupmenu.js" \
--js "src/lib/closure-library/closure/goog/ui/submenurenderer.js" \
--js "src/lib/closure-library/closure/goog/ui/menubutton.js" \
--js "src/lib/closure-library/closure/goog/ui/submenu.js" \
--js "src/lib/closure-library/closure/goog/ui/select.js" \
--js "src/lib/blockly/core/blocks.js" \
--js "src/lib/blockly/core/css.js" \
--js "src/lib/blockly/core/msg.js" \
--js "src/lib/blockly/core/names.js" \
--js "src/lib/blockly/core/options.js" \
--js "src/lib/blockly/core/constants.js" \
--js "src/lib/blockly/core/ui_menu_utils.js" \
--js "src/lib/blockly/core/bubble_dragger.js" \
--js "src/lib/blockly/core/events.js" \
--js "src/lib/blockly/core/workspace_audio.js" \
--js "src/lib/blockly/core/workspace_dragger.js" \
--js "src/lib/blockly/core/events_abstract.js" \
--js "src/lib/blockly/core/flyout_dragger.js" \
--js "src/lib/blockly/core/block_events.js" \
--js "src/lib/blockly/core/ui_events.js" \
--js "src/lib/blockly/core/variable_events.js" \
--js "src/lib/blockly/core/variable_map.js" \
--js "src/lib/blockly/core/variable_model.js" \
--js "src/lib/blockly/core/touch.js" \
--js "src/lib/blockly/core/workspace.js" \
--js "src/lib/blockly/core/bubble.js" \
--js "src/lib/blockly/core/connection.js" \
--js "src/lib/blockly/core/flyout_button.js" \
--js "src/lib/blockly/core/icon.js" \
--js "src/lib/blockly/core/scrollbar.js" \
--js "src/lib/blockly/core/tooltip.js" \
--js "src/lib/blockly/core/variables.js" \
--js "src/lib/blockly/core/xml.js" \
--js "src/lib/blockly/core/zoom_controls.js" \
--js "src/lib/blockly/core/utils.js" \
--js "src/lib/blockly/core/block_drag_surface.js" \
--js "src/lib/blockly/core/comment.js" \
--js "src/lib/blockly/core/connection_db.js" \
--js "src/lib/blockly/core/grid.js" \
--js "src/lib/blockly/core/rendered_connection.js" \
--js "src/lib/blockly/core/trashcan.js" \
--js "src/lib/blockly/core/variables_dynamic.js" \
--js "src/lib/blockly/core/warning.js" \
--js "src/lib/blockly/core/widgetdiv.js" \
--js "src/lib/blockly/core/workspace_drag_surface_svg.js" \
--js "src/lib/blockly/core/dragged_connection_manager.js" \
--js "src/lib/blockly/core/block_dragger.js" \
--js "src/lib/blockly/core/gesture.js" \
--js "src/lib/blockly/core/field.js" \
--js "src/lib/blockly/core/touch_gesture.js" \
--js "src/lib/blockly/core/field_checkbox.js" \
--js "src/lib/blockly/core/field_date.js" \
--js "src/lib/blockly/core/field_image.js" \
--js "src/lib/blockly/core/field_label.js" \
--js "src/lib/blockly/core/field_textinput.js" \
--js "src/lib/blockly/core/procedures.js" \
--js "src/lib/blockly/core/workspace_svg.js" \
--js "src/lib/blockly/core/contextmenu.js" \
--js "src/lib/blockly/core/field_angle.js" \
--js "src/lib/blockly/core/field_colour.js" \
--js "src/lib/blockly/core/field_dropdown.js" \
--js "src/lib/blockly/core/field_number.js" \
--js "src/lib/blockly/core/input.js" \
--js "src/lib/blockly/core/mutator.js" \
--js "src/lib/blockly/core/inject.js" \
--js "src/lib/blockly/core/extensions.js" \
--js "src/lib/blockly/core/field_variable.js" \
--js "src/lib/blockly/core/block.js" \
--js "src/lib/blockly/core/block_svg.js" \
--js "src/lib/blockly/core/flyout_base.js" \
--js "src/lib/blockly/core/generator.js" \
--js "src/lib/blockly/core/block_render_svg.js" \
--js "src/lib/blockly/core/flyout_horizontal.js" \
--js "src/lib/blockly/core/flyout_vertical.js" \
--js "src/lib/blockly/core/toolbox.js" \
--js "src/lib/blockly/core/blockly.js" \
--js "src/lib/eyo/core/eyo.js" \
--js "src/lib/eyo/core/decorate.js" \
--js "src/lib/eyo/block/delegate_svg_final.js" \
--js "src/lib/eyo/block/signature.js" \
--js "src/lib/eyo/core/const.js" \
--js "src/lib/eyo/msg/js/base.js" \
--js "src/lib/eyo/core/T3.js" \
--js "src/lib/eyo/core/font.js" \
--js "src/lib/eyo/block/helper.js" \
--js "src/lib/eyo/core/T3_all.js" \
--js "src/lib/eyo/core/data.js" \
--js "src/lib/eyo/core/do.js" \
--js "src/lib/eyo/core/data-test.js" \
--js "src/lib/eyo/blockly/events.js" \
--js "src/lib/eyo/core/Field.js" \
--js "src/lib/eyo/core/ui.js" \
--js "src/lib/eyo/protocol/protocol.js" \
--js "src/lib/eyo/block/delegate.js" \
--js "src/lib/eyo/core/geometry.js" \
--js "src/lib/eyo/protocol/change_count.js" \
--js "src/lib/eyo/protocol/register.js" \
--js "src/lib/eyo/blockly/rendered_connection.js" \
--js "src/lib/eyo/blockly/field_helper.js" \
--js "src/lib/eyo/model/model.js" \
--js "src/lib/eyo/core/shape.js" \
--js "src/lib/eyo/closure-library/menuitemrenderer.js" \
--js "src/lib/eyo/model/cmath_model.js" \
--js "src/lib/eyo/model/datamodel_model.js" \
--js "src/lib/eyo/model/datastructures_model.js" \
--js "src/lib/eyo/model/decimal_model.js" \
--js "src/lib/eyo/model/fractions_model.js" \
--js "src/lib/eyo/model/functions_model.js" \
--js "src/lib/eyo/model/math_model.js" \
--js "src/lib/eyo/model/random_model.js" \
--js "src/lib/eyo/model/statistics_model.js" \
--js "src/lib/eyo/model/stdtypes_model.js" \
--js "src/lib/eyo/model/string_model.js" \
--js "src/lib/eyo/model/turtle_model.js" \
--js "src/lib/eyo/model/profile.js" \
--js "src/lib/eyo/block/content.js" \
--js "src/lib/eyo/closure-library/menuitem.js" \
--js "src/lib/eyo/closure-library/menurenderer.js" \
--js "src/lib/eyo/blockly/field_textinput.js" \
--js "src/lib/eyo/closure-library/menu.js" \
--js "src/lib/eyo/blockly/input.js" \
--js "src/lib/eyo/closure-library/menubuttonrenderer.js" \
--js "src/lib/eyo/closure-library/popupmenu.js" \
--js "src/lib/eyo/closure-library/submenurenderer.js" \
--js "src/lib/eyo/closure-library/submenu.js" \
--js "src/lib/eyo/blockly/block.js" \
--js "src/lib/eyo/workspace/flyout-toolbar.js" \
--js "src/lib/eyo/blockly/field_label.js" \
--js "src/lib/eyo/blockly/bugfix.js" \
--js "src/lib/eyo/block/slot.js" \
--js "src/lib/eyo/block/delegate_svg.js" \
--js "src/lib/eyo/blockly/block_svg.js" \
--js "src/lib/eyo/block/consolidator.js" \
--js "src/lib/eyo/block/delegate_svg_expr.js" \
--js "src/lib/eyo/block/delegate_svg_starred.js" \
--js "src/lib/eyo/block/draw.js" \
--js "src/lib/eyo/workspace/key_handler.js" \
--js "src/lib/eyo/block/python_exporter.js" \
--js "src/lib/eyo/workspace/tooltip.js" \
--js "src/lib/eyo/block/delegate_svg_literal.js" \
--js "src/lib/eyo/block/delegate_svg_list.js" \
--js "src/lib/eyo/block/delegate_svg_operator.js" \
--js "src/lib/eyo/workspace/flyout-category.js" \
--js "src/lib/eyo/workspace/menu_manager.js" \
--js "src/lib/eyo/block/delegate_svg_argument.js" \
--js "src/lib/eyo/block/delegate_svg_comp.js" \
--js "src/lib/eyo/block/delegate_svg_stmt.js" \
--js "src/lib/eyo/workspace/flyout.js" \
--js "src/lib/eyo/block/delegate_svg_control.js" \
--js "src/lib/eyo/block/delegate_svg_group.js" \
--js "src/lib/eyo/block/delegate_svg_import.js" \
--js "src/lib/eyo/block/delegate_svg_primary.js" \
--js "src/lib/eyo/module/delegate_svg_string.js" \
--js "src/lib/eyo/block/delegate_svg_yield.js" \
--js "src/lib/eyo/block/delegate_svg_range.js" \
--js "src/lib/eyo/block/delegate_svg_assignment.js" \
--js "src/lib/eyo/module/delegate_svg_cmath.js" \
--js "src/lib/eyo/module/delegate_svg_decimal.js" \
--js "src/lib/eyo/module/delegate_svg_fraction.js" \
--js "src/lib/eyo/block/delegate_svg_lambda.js" \
--js "src/lib/eyo/module/delegate_svg_math.js" \
--js "src/lib/eyo/block/delegate_svg_print.js" \
--js "src/lib/eyo/block/delegate_svg_proc.js" \
--js "src/lib/eyo/module/delegate_svg_statistics.js" \
--js "src/lib/eyo/block/delegate_svg_try.js" \
--js "src/lib/eyo/module/delegate_svg_turtle.js" \
--js "src/lib/eyo/module/delegate_svg_random.js" \
--js "src/lib/eyo/block/development.js" \
--js "src/lib/eyo/block/xml.js" \
--js "src/lib/eyo/workspace/app.js" \
--js "src/lib/eyo/workspace/demo.js" \
--js "src/lib/eyo/blockly/workspace.js" \
--js "src/lib/eyo/blockly/workspace_svg.js" \
  --js_output_file "build/base/edython.js"\
  -O BUNDLE
# Next setting is used to prevent the closure library
# to load the deps.js file. This makes sense while
# we manage the real list of closure files used
# without requiring help from goog tools.
# See the tool1 and tool2 helper scripts in the bin folder.
# This may change in the future if the build process is clean.
# At least it "works" on both web and electron versions.
# JL 05/17/2018. Better solution wanted.
perl -pi -e 's/goog.global.CLOSURE_NO_DEPS;/goog.global.CLOSURE_NO_DEPS = true;/g' build/base/edython.js
echo "File created:"
ls -al build/base/edython.js
exit 0

java -jar "$COMPILER"\
  --warning_level VERBOSE \
  --js "src/lib/closure-library/closure/goog/**.js"\
  --js "!src/lib/closure-library/closure/goog/**_test.js"\

#  --js_output_file "build/base/edython.js"

#  --entry_point "src/lib/eyo/entry.js"

##goog.array, goog.math.Coordinate
exit

Basic Usage:
 --compilation_level (-O) VAL           : Specifies the compilation level to
                                          use. Options: BUNDLE, WHITESPACE_ONLY,
                                          SIMPLE (default), ADVANCED (default:
                                          SIMPLE (default), ADVANCED (default:
                                          SIMPLE)
 --env [BROWSER | CUSTOM]               : Determines the set of builtin externs
                                          to load. Options: BROWSER, CUSTOM.
                                          Defaults to BROWSER. (default:
                                          BROWSER)
 --externs VAL                          : The file containing JavaScript
                                          externs. You may specify multiple
 --js VAL                               : The JavaScript filename. You may
                                          specify multiple. The flag name is
                                          optional, because args are
                                          interpreted as files by default. You
                                          may also use minimatch-style glob
                                          patterns. For example, use
                                          --js='**.js' --js='!**_test.js' to
                                          recursively include all js files that
                                          do not end in _test.js
 --js_output_file VAL                   : Primary output filename. If not
                                          specified, output is written to
                                          stdout (default: )
 --language_in VAL                      : Sets the language spec to which input
                                          sources should conform. Options:
                                          ECMASCRIPT3, ECMASCRIPT5,
                                          ECMASCRIPT5_STRICT, ECMASCRIPT6_TYPED
                                          (experimental), ECMASCRIPT_2015,
                                          ECMASCRIPT_2016, ECMASCRIPT_2017,
                                          ECMASCRIPT_NEXT (default:
                                          ECMASCRIPT_2017)
 --language_out VAL                     : Sets the language spec to which
                                          output should conform. Options:
                                          ECMASCRIPT3, ECMASCRIPT5,
                                          ECMASCRIPT5_STRICT, ECMASCRIPT6_TYPED
                                          (experimental), ECMASCRIPT_2015,
                                          ECMASCRIPT_2016, ECMASCRIPT_2017,
                                          ECMASCRIPT_NEXT, NO_TRANSPILE
                                          (default: ECMASCRIPT5)
 --warning_level (-W) [QUIET | DEFAULT  : Specifies the warning level to use.
 | VERBOSE]                               Options: QUIET, DEFAULT, VERBOSE
                                          (default: DEFAULT)


Warning and Error Management:
 --conformance_configs VAL              : A list of JS Conformance
                                          configurations in text protocol
                                          buffer format.
 --error_format [STANDARD | JSON]       : Specifies format for error messages.
                                          (default: STANDARD)
 --extra_annotation_name VAL            : A whitelist of tag names in JSDoc.
                                          You may specify multiple
 --hide_warnings_for VAL                : If specified, files whose path
                                          contains this string will have their
                                          warnings hidden. You may specify
                                          multiple.
 --jscomp_error VAL                     : Make the named class of warnings an
                                          error. Must be one of the error group
                                          items. '*' adds all supported.
 --jscomp_off VAL                       : Turn off the named class of warnings.
                                          Must be one of the error group items.
                                          '*' adds all supported.
 --jscomp_warning VAL                   : Make the named class of warnings a
                                          normal warning. Must be one of the
                                          error group items. '*' adds all
                                          supported.
 --new_type_inf                         : Checks for type errors using the new
                                          type inference algorithm. (default:
                                          false)
 --strict_mode_input                    : Assume input sources are to run in
                                          strict mode. (default: true)
 --warnings_whitelist_file VAL          : A file containing warnings to
                                          suppress. Each line should be of the
                                          form
                                          <file-name>:<line-number>?
                                          <warning-description> (default: )

Available Error Groups: accessControls, ambiguousFunctionDecl,
    checkRegExp, checkTypes, checkVars, conformanceViolations, const,
    constantProperty, deprecated, deprecatedAnnotations, duplicateMessage, es3,
    es5Strict, externsValidation, fileoverviewTags, functionParams, globalThis,
    internetExplorerChecks, invalidCasts, misplacedTypeAnnotation,
    missingGetCssName, missingOverride, missingPolyfill, missingProperties,
    missingProvide, missingRequire, missingReturn, moduleLoad, msgDescriptions,
    newCheckTypes, nonStandardJsDocs, missingSourcesWarnings,
    reportUnknownTypes, suspiciousCode, strictCheckTypes,
    strictMissingProperties, strictModuleDepCheck, strictPrimitiveOperators,
    typeInvalidation, undefinedNames, undefinedVars, unknownDefines,
    unusedLocalVariables, unusedPrivateMembers, uselessCode, useOfGoogBase,
    underscore, visibility

Output:
 --assume_function_wrapper              : Enable additional optimizations based
                                          on the assumption that the output
                                          will be wrapped with a function
                                          wrapper.  This flag is used to
                                          indicate that "global" declarations
                                          will not actually be global but
                                          instead isolated to the compilation
                                          unit. This enables additional
                                          optimizations. (default: false)
 --export_local_property_definitions    : Generates export code for local
                                          properties marked with @export
                                          (default: false)
 --formatting [PRETTY_PRINT |           : Specifies which formatting options,
 PRINT_INPUT_DELIMITER | SINGLE_QUOTES]   if any, should be applied to the
                                          output JS. Options: PRETTY_PRINT,
                                          PRINT_INPUT_DELIMITER, SINGLE_QUOTES
 --generate_exports                     : Generates export code for those
                                          marked with @export (default: false)
 --isolation_mode [NONE | IIFE]         : If set to IIFE the compiler output
                                          will follow the form:
                                            (function(){%output%)).call(this);
                                          Options: NONE, IIFE (default: NONE)
 --output_wrapper VAL                   : Interpolate output into this string
                                          at the place denoted by the marker
                                          token %output%. Use marker token
                                          %output|jsstring% to do js string
                                          escaping on the output. Consider
                                          using the --isolation_mode flag
                                          instead. (default: )
 --output_wrapper_file VAL              : Loads the specified file and passes
                                          the file contents to the
                                          --output_wrapper flag, replacing the
                                          value if it exists. This is useful if
                                          you want special characters like
                                          newline in the wrapper. (default: )
 --rename_prefix_namespace VAL          : Specifies the name of an object that
                                          will be used to store all non-extern
                                          globals
 --rename_variable_prefix VAL           : Specifies a prefix that will be
                                          prepended to all variables.


Dependency Management:
 --dependency_mode [NONE | LOOSE |      : Specifies how the compiler should
 STRICT]                                  determine the set and order of files
                                          for a compilation. Options: NONE the
                                          compiler will include all src files
                                          in the order listed, STRICT files
                                          will be included and sorted by
                                          starting from namespaces or files
                                          listed by the --entry_point flag -
                                          files will only be included if they
                                          are referenced by a goog.require or
                                          CommonJS require or ES6 import, LOOSE
                                          same as with STRICT but files which
                                          do not goog.provide a namespace and
                                          are not modules will be automatically
                                          added as --entry_point entries.
                                          Defaults to NONE. (default: NONE)
 --entry_point VAL                      : A file or namespace to use as the
                                          starting point for determining which
                                          src files to include in the
                                          compilation. ES6 and CommonJS modules
                                          are specified as file paths (without
                                          the extension). Closure-library
                                          namespaces are specified with a
                                          "goog:" prefix. Example:
                                          --entry_point=goog:goog.Promise


JS Modules:
 --js_module_root VAL                   : Path prefixes to be removed from ES6
                                          & CommonJS modules.
 --module_resolution [BROWSER | NODE |  : Specifies how the compiler locates
 WEBPACK]                                 modules. BROWSER requires all module
                                          imports to begin with a '.' or '/'
                                          and have a file extension. NODE uses
                                          the node module rules. WEBPACK looks
                                          up modules from a special lookup map.
                                          (default: BROWSER)
 --package_json_entry_names VAL         : Ordered list of entries to look for
                                          in package.json files when processing
                                          modules with the NODE module
                                          resolution strategy (i.e.
                                          esnext:main,browser,main). Defaults
                                          to a list with the following entries:
                                          "browser", "module", "main".
 --process_common_js_modules            : Process CommonJS modules to a
                                          concatenable form. (default: false)


Library and Framework Specific:
 --angular_pass                         : Generate $inject properties for
                                          AngularJS for functions annotated
                                          with @ngInject (default: false)
 --dart_pass                            : Rewrite Dart Dev Compiler output to
                                          be compiler-friendly. (default: false)
 --force_inject_library VAL             : Force injection of named runtime
                                          libraries. The format is <name> where
                                          <name> is the name of a runtime
                                          library. Possible libraries include:
                                          base, es6_runtime, runtime_type_check
 --inject_libraries                     : Allow injecting runtime libraries.
                                          (default: true)
 --polymer_pass                         : Equivalent to --polymer_version=1
                                          (default: false)
 --process_closure_primitives           : Processes built-ins from the Closure
                                          library, such as goog.require(),
                                          goog.provide(), and goog.exportSymbol(
                                          ). True by default. (default: true)
 --rewrite_polyfills                    : Rewrite ES6 library calls to use
                                          polyfills provided by the compiler's
                                          runtime. (default: true)


Code Splitting:
 --module VAL                           : A JavaScript module specification.
                                          The format is <name>:<num-js-files>[:[
                                          <dep>,...][:]]]. Module names must be
                                          unique. Each dep is the name of a
                                          module that this module depends on.
                                          Modules must be listed in dependency
                                          order, and JS source files must be
                                          listed in the corresponding order.
                                          Where --module flags occur in
                                          relation to --js flags is
                                          unimportant. <num-js-files> may be
                                          set to 'auto' for the first module if
                                          it has no dependencies. Provide the
                                          value 'auto' to trigger module
                                          creation from CommonJSmodules.
 --module_output_path_prefix VAL        : Prefix for filenames of compiled JS
                                          modules. <module-name>.js will be
                                          appended to this prefix. Directories
                                          will be created as needed. Use with
                                          --module (default: ./)
 --module_wrapper VAL                   : An output wrapper for a JavaScript
                                          module (optional). The format is
                                          <name>:<wrapper>. The module name
                                          must correspond with a module
                                          specified using --module. The wrapper
                                          must contain %s as the code
                                          placeholder. Alternately, %output%
                                          can be used in place of %s. %n% can
                                          be used to represent a newline. The
                                          %basename% placeholder can also be
                                          used to substitute the base name of
                                          the module output file.


Reports:
 --create_source_map VAL                : If specified, a source map file
                                          mapping the generated source files
                                          back to the original source file will
                                          be output to the specified path. The
                                          %outname% placeholder will expand to
                                          the name of the output file that the
                                          source map corresponds to. (default: )
 --output_manifest VAL                  : Prints out a list of all the files in
                                          the compilation. If --dependency_mode=
                                          STRICT or LOOSE is specified, this
                                          will not include files that got
                                          dropped because they were not
                                          required. The %outname% placeholder
                                          expands to the JS output file. If
                                          you're using modularization, using
                                          %outname% will create a manifest for
                                          each module. (default: )
 --output_module_dependencies VAL       : Prints out a JSON file of
                                          dependencies between modules.
                                          (default: )
 --property_renaming_report VAL         : File where the serialized version of
                                          the property renaming map produced
                                          should be saved (default: )
 --source_map_include_content           : Includes sources content into source
                                          map. Greatly increases the size of
                                          source maps but offers greater
                                          portability (default: false)
 --source_map_input VAL                 : Source map locations for input files,
                                          separated by a '|', (i.e.
                                          input-file-path|input-source-map)
 --source_map_location_mapping VAL      : Source map location mapping separated
                                          by a '|' (i.e. filesystem-path|webserv
                                          er-path)
 --variable_renaming_report VAL         : File where the serialized version of
                                          the variable renaming map produced
                                          should be saved (default: )


Miscellaneous:
 --charset VAL                          : Input and output charset for all
                                          files. By default, we accept UTF-8 as
                                          input and output US_ASCII (default: )
 --checks_only (--checks-only)          : Don't generate output. Run checks,
                                          but no optimization passes. (default:
                                          false)
 --define (--D, -D) VAL                 : Override the value of a variable
                                          annotated @define. The format is
                                          <name>[=<val>], where <name> is the
                                          name of a @define variable and <val>
                                          is a boolean, number, or a
                                          single-quoted string that contains no
                                          single quotes. If [=<val>] is
                                          omitted, the variable is marked true
 --help                                 : Displays this message on stdout and
                                          exit (default: true)
 --third_party                          : Check source validity but do not
                                          enforce Closure style rules and
                                          conventions (default: false)
 --use_types_for_optimization           : Enable or disable the optimizations
                                          based on available type information.
                                          Inaccurate type annotations may
                                          result in incorrect results.
                                          (default: true)
 --version                              : Prints the compiler version to stdout
                                          and exit. (default: false)
