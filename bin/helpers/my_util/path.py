import pathlib

path_root = pathlib.Path(__file__).resolve().parent.parent.parent.parent
path_bin = path_root / 'bin'
path_src = path_root / 'src'
path_test = path_root / 'test'
path_eyo = path_src / 'lib' / 'eyo'
path_js = path_eyo / 'js'

path_helpers = path_root / 'build' / 'helpers'
path_helpers.mkdir(parents=True, exist_ok=True)

component_goog = pathlib.Path('src') / 'lib' / 'closure-library' / 'closure' / 'goog'
path_goog = path_root / component_goog
path_goog_deps = path_goog / 'deps.js'

path_eyo_deps = path_helpers / 'eyo_deps.js'
path_required = path_helpers / 'eyo_required.txt'

path_deps_build = path_helpers / 'deps-build.txt'
path_deps = path_helpers / 'deps.txt'
path_deps_test = path_helpers / 'deps-test.txt'
path_deps_tree = path_helpers / 'deps-test-tree.json'
path_deps_vue = path_helpers / 'deps-vue.txt'
path_deps_web_dev = path_helpers / 'deps-web-dev.txt'
path_deps_web_test = path_helpers / 'deps-web-test.txt'
path_deps_test_import = path_helpers / 'deps-test-import.txt'
