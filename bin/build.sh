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
echo 'console.log("edython library available")' >> build/base/edython.js
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
--js "closure-library/closure/goog/color/names.js" \
--js "closure-library/closure/goog/debug/error.js" \
--js "closure-library/closure/goog/dom/htmlelement.js" \
--js "closure-library/closure/goog/dom/nodetype.js" \
--js "closure-library/closure/goog/fs/url.js" \
--js "closure-library/closure/goog/i18n/bidi.js" \
--js "closure-library/closure/goog/math/irect.js" \
--js "closure-library/closure/goog/math/size.js" \
--js "closure-library/closure/goog/object/object.js" \
--js "closure-library/closure/goog/reflect/reflect.js" \
--js "closure-library/closure/goog/string/string.js" \
--js "closure-library/closure/goog/string/typedstring.js" \
--js "eyo/js/py/ctokenizer.js" \
--js "eyo/js/test/common.js" \
--js "closure-library/closure/goog/asserts/asserts.js" \
--js "closure-library/closure/goog/dom/tagname.js" \
--js "closure-library/closure/goog/dom/tags.js" \
--js "closure-library/closure/goog/labs/useragent/util.js" \
--js "closure-library/closure/goog/array/array.js" \
--js "closure-library/closure/goog/dom/asserts.js" \
--js "closure-library/closure/goog/labs/useragent/platform.js" \
--js "closure-library/closure/goog/string/const.js" \
--js "closure-library/closure/goog/html/safescript.js" \
--js "closure-library/closure/goog/html/trustedresourceurl.js" \
--js "closure-library/closure/goog/labs/useragent/browser.js" \
--js "closure-library/closure/goog/labs/useragent/engine.js" \
--js "closure-library/closure/goog/math/math.js" \
--js "closure-library/closure/goog/color/color.js" \
--js "closure-library/closure/goog/html/safeurl.js" \
--js "closure-library/closure/goog/math/coordinate.js" \
--js "closure-library/closure/goog/useragent/useragent.js" \
--js "closure-library/closure/goog/dom/browserfeature.js" \
--js "closure-library/closure/goog/dom/vendor.js" \
--js "closure-library/closure/goog/html/safestyle.js" \
--js "closure-library/closure/goog/math/box.js" \
--js "eyo/js/core/eyo/eyo.js" \
--js "closure-library/closure/goog/html/safestylesheet.js" \
--js "closure-library/closure/goog/math/rect.js" \
--js "eyo/js/core/const/const.js" \
--js "eyo/js/core/do/do.js" \
--js "eyo/js/core/errcode/errcode.js" \
--js "eyo/js/core/model/model.js" \
--js "eyo/js/core/more/more.js" \
--js "eyo/js/core/setup/setup.js" \
--js "eyo/js/core/t3/t3.js" \
--js "eyo/js/msg/base.js" \
--js "eyo/js/other/key_handler.js" \
--js "eyo/js/py/ast.js" \
--js "eyo/js/test/chai_extension.js" \
--js "closure-library/closure/goog/html/safehtml.js" \
--js "eyo/js/core/decorate/decorate.js" \
--js "eyo/js/core/t3/t3_all.js" \
--js "eyo/js/core/xre/xre.js" \
--js "closure-library/closure/goog/dom/safe.js" \
--js "closure-library/closure/goog/html/uncheckedconversions.js" \
--js "eyo/js/core/dlgt/dlgt.js" \
--js "closure-library/closure/goog/dom/dom.js" \
--js "eyo/js/core/c9r/c9r.js" \
--js "closure-library/closure/goog/dom/xml.js" \
--js "closure-library/closure/goog/style/style.js" \
--js "eyo/js/core/o3d/o3d.js" \
--js "eyo/js/core/observe/observe.js" \
--js "eyo/js/core/shared/shared.js" \
--js "eyo/js/py/py.js" \
--js "eyo/js/application/desk/workspace/flyout/section.js" \
--js "eyo/js/application/ui/audio.js" \
--js "eyo/js/application/ui/dnd.js" \
--js "eyo/js/core/db/db.js" \
--js "eyo/js/core/many/many.js" \
--js "eyo/js/core/p6y/p6y.js" \
--js "eyo/js/other/dragger.js" \
--js "eyo/js/py/bitset.js" \
--js "eyo/js/py/grammar.js" \
--js "eyo/js/py/node.js" \
--js "eyo/js/py/token.js" \
--js "eyo/js/Python/graminit.js" \
--js "eyo/js/application/desk/board/brick_util/dragger_brick.js" \
--js "eyo/js/application/desk/board/brick_util/node_brick.js" \
--js "eyo/js/application/desk/workspace/flyout/draft.js" \
--js "eyo/js/application/desk/workspace/flyout/search.js" \
--js "eyo/js/core/o4t/o4t.js" \
--js "eyo/js/other/dragger_board.js" \
--js "eyo/js/py/acceler.js" \
--js "eyo/js/py/listnode.js" \
--js "eyo/js/application/desk/board/brick_util/consolidator.js" \
--js "eyo/js/application/driver/driver.js" \
--js "eyo/js/brick/data/data.js" \
--js "eyo/js/brick/dfs/dfs.js" \
--js "eyo/js/core/change_count/change_count.js" \
--js "eyo/js/core/changer/changer.js" \
--js "eyo/js/core/font/font.js" \
--js "eyo/js/core/geom/geom.js" \
--js "eyo/js/core/register/register.js" \
--js "eyo/js/py/parser.js" \
--js "eyo/js/application/desk/board/metrics/metrics.js" \
--js "eyo/js/application/driver/fcls/fcls.js" \
--js "eyo/js/application/view/view.js" \
--js "eyo/js/brick/magnet/magnet.js" \
--js "eyo/js/brick/slot/slot.js" \
--js "eyo/js/brick/span/span.js" \
--js "eyo/js/core/event/event.js" \
--js "eyo/js/core/geom/point.js" \
--js "eyo/js/core/geom/size.js" \
--js "eyo/js/core/style/style.js" \
--js "eyo/js/module/module.js" \
--js "eyo/js/py/parsetok.js" \
--js "eyo/js/py/tokenizer.js" \
--js "eyo/js/application/abstract/control.js" \
--js "eyo/js/application/app.js" \
--js "eyo/js/application/desk/board/board.js" \
--js "eyo/js/application/desk/board/brick_util/brick_events.js" \
--js "eyo/js/application/desk/desk.js" \
--js "eyo/js/application/desk/graphic/graphic.js" \
--js "eyo/js/application/desk/template/template.js" \
--js "eyo/js/application/desk/terminal/terminal.js" \
--js "eyo/js/application/desk/turtle/turtle.js" \
--js "eyo/js/application/desk/variable/variable.js" \
--js "eyo/js/application/desk/workspace/flyout/flyout.js" \
--js "eyo/js/application/desk/workspace/scrollbar/scrollbar.js" \
--js "eyo/js/application/desk/workspace/scroller/scroller.js" \
--js "eyo/js/application/desk/workspace/workspace.js" \
--js "eyo/js/application/driver/dom/dom_dndMngr.js" \
--js "eyo/js/application/driver/fcfl/fcfl.js" \
--js "eyo/js/application/driver/fcls/fcls_application.js" \
--js "eyo/js/application/driver/fcls/fcls_board.js" \
--js "eyo/js/application/driver/fcls/fcls_desk.js" \
--js "eyo/js/application/driver/fcls/fcls_draft.js" \
--js "eyo/js/application/driver/fcls/fcls_field.js" \
--js "eyo/js/application/driver/fcls/fcls_flyout.js" \
--js "eyo/js/application/driver/fcls/fcls_focus.js" \
--js "eyo/js/application/driver/fcls/fcls_library.js" \
--js "eyo/js/application/driver/fcls/fcls_magnet.js" \
--js "eyo/js/application/driver/fcls/fcls_scroller.js" \
--js "eyo/js/application/driver/fcls/fcls_search.js" \
--js "eyo/js/application/driver/fcls/fcls_slot.js" \
--js "eyo/js/application/driver/fcls/fcls_trashcan.js" \
--js "eyo/js/application/driver/fcls/fcls_workspace.js" \
--js "eyo/js/application/driver/fcls/fcls_zoomer.js" \
--js "eyo/js/application/ui/css.js" \
--js "eyo/js/application/ui/motion.js" \
--js "eyo/js/brick/brick/brick.js" \
--js "eyo/js/brick/field/field.js" \
--js "eyo/js/brick/shape/shape.js" \
--js "eyo/js/core/geom/rect.js" \
--js "eyo/js/module/module_array.js" \
--js "eyo/js/module/module_bisect.js" \
--js "eyo/js/module/module_calendar.js" \
--js "eyo/js/module/module_cmath.js" \
--js "eyo/js/module/module_collections.abc.js" \
--js "eyo/js/module/module_collections.js" \
--js "eyo/js/module/module_copy.js" \
--js "eyo/js/module/module_datamodel.js" \
--js "eyo/js/module/module_datastructures.js" \
--js "eyo/js/module/module_datetime.js" \
--js "eyo/js/module/module_decimal.js" \
--js "eyo/js/module/module_enum.js" \
--js "eyo/js/module/module_fractions.js" \
--js "eyo/js/module/module_functions.js" \
--js "eyo/js/module/module_heapq.js" \
--js "eyo/js/module/module_math.js" \
--js "eyo/js/module/module_pprint.js" \
--js "eyo/js/module/module_random.js" \
--js "eyo/js/module/module_reprlib.js" \
--js "eyo/js/module/module_statistics.js" \
--js "eyo/js/module/module_stdtypes.js" \
--js "eyo/js/module/module_string.js" \
--js "eyo/js/module/module_turtle.js" \
--js "eyo/js/module/module_types.js" \
--js "eyo/js/module/module_weakref.js" \
--js "eyo/js/module/profile.js" \
--js "eyo/js/other/scaler.js" \
--js "eyo/js/application/desk/board/brick_util/python_exporter.js" \
--js "eyo/js/application/desk/focus.js" \
--js "eyo/js/application/desk/workspace/flyout/flyout-toolbar.js" \
--js "eyo/js/application/desk/workspace/trashcan/trashcan.js" \
--js "eyo/js/application/desk/workspace/zoomer/zoomer.js" \
--js "eyo/js/application/driver/dom/dom.js" \
--js "eyo/js/application/driver/fcfl/fcfl_board.js" \
--js "eyo/js/application/driver/fcls/fcls_brick.js" \
--js "eyo/js/brick/list/list.js" \
--js "eyo/js/brick_py/final.js" \
--js "eyo/js/brick_py/stmt.js" \
--js "eyo/js/other/tooltip.js" \
--js "eyo/js/application/desk/board/brick_util/navigate.js" \
--js "eyo/js/application/desk/workspace/flyout/library.js" \
--js "eyo/js/application/driver/dom/dom_application.js" \
--js "eyo/js/application/driver/dom/dom_audio.js" \
--js "eyo/js/application/driver/dom/dom_board.js" \
--js "eyo/js/application/driver/dom/dom_brick.js" \
--js "eyo/js/application/driver/dom/dom_desk.js" \
--js "eyo/js/application/driver/dom/dom_flyout.js" \
--js "eyo/js/application/driver/dom/dom_search.js" \
--js "eyo/js/application/driver/fcfl/fcfl_brick.js" \
--js "eyo/js/application/driver/fcls/fcls_dndMngr.js" \
--js "eyo/js/application/driver/svg/svg.js" \
--js "eyo/js/brick_py/comment.js" \
--js "eyo/js/brick_py/docstring.js" \
--js "eyo/js/brick_py/expr.js" \
--js "eyo/js/brick_py/group.js" \
--js "eyo/js/application/driver/dom/dom_flyout_toolbar.js" \
--js "eyo/js/application/driver/svg/svg_application.js" \
--js "eyo/js/application/driver/svg/svg_board.js" \
--js "eyo/js/application/driver/svg/svg_brick.js" \
--js "eyo/js/application/driver/svg/svg_desk.js" \
--js "eyo/js/application/driver/svg/svg_dnd.js" \
--js "eyo/js/application/driver/svg/svg_dndMngr.js" \
--js "eyo/js/application/driver/svg/svg_drag.js" \
--js "eyo/js/application/driver/svg/svg_dragger_board.js" \
--js "eyo/js/application/driver/svg/svg_dragger_brick.js" \
--js "eyo/js/application/driver/svg/svg_effect.js" \
--js "eyo/js/application/driver/svg/svg_field.js" \
--js "eyo/js/application/driver/svg/svg_flyout.js" \
--js "eyo/js/application/driver/svg/svg_focus.js" \
--js "eyo/js/application/driver/svg/svg_magnet.js" \
--js "eyo/js/application/driver/svg/svg_scrollbar.js" \
--js "eyo/js/application/driver/svg/svg_scroller.js" \
--js "eyo/js/application/driver/svg/svg_search.js" \
--js "eyo/js/application/driver/svg/svg_slot.js" \
--js "eyo/js/application/driver/svg/svg_trashcan.js" \
--js "eyo/js/application/driver/svg/svg_zoomer.js" \
--js "eyo/js/brick_py/control.js" \
--js "eyo/js/brick_py/list.js" \
--js "eyo/js/brick_py/literal.js" \
--js "eyo/js/brick_py/operator.js" \
--js "eyo/js/brick_py/range.js" \
--js "eyo/js/brick_py/starred.js" \
--js "eyo/js/brick_py/try.js" \
--js "eyo/js/model/brick_string.js" \
--js "eyo/js/brick_py/argument.js" \
--js "eyo/js/brick_py/assignment.js" \
--js "eyo/js/brick_py/comp.js" \
--js "eyo/js/brick_py/global.js" \
--js "eyo/js/brick_py/import.js" \
--js "eyo/js/brick_py/lambda.js" \
--js "eyo/js/brick_py/primary.js" \
--js "eyo/js/brick_py/yield.js" \
--js "eyo/js/application/desk/board/brick_util/xml.js" \
--js "eyo/js/brick_py/proc.js" \
--js "eyo/js/model/brick_cmath.js" \
--js "eyo/js/model/brick_decimal.js" \
--js "eyo/js/model/brick_fractions.js" \
--js "eyo/js/model/brick_functions.js" \
--js "eyo/js/model/brick_math.js" \
--js "eyo/js/model/brick_random.js" \
--js "eyo/js/model/brick_statistics.js" \
--js "eyo/js/model/brick_stdtypes.js" \
--js "eyo/js/model/brick_turtle.js" \
--js "eyo/js/other/demo.js" \
