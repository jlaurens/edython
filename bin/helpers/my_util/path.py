from pathlib import Path

path_root = Path(__file__).resolve().parent.parent.parent.parent
path_bin = path_root / 'bin'
path_src = path_root / 'src'
path_lib = path_src / 'lib'

component_js = Path('eyo') / 'js'
path_js = path_lib / component_js

path_helpers = path_root / 'build' / 'helpers'
path_helpers.mkdir(parents=True, exist_ok=True)

component_goog = Path('closure-library') / 'closure' / 'goog'
path_goog = path_lib / component_goog
path_goog_deps = path_goog / 'deps.js'

path_eyo_deps_json = path_helpers / 'eyo_deps.json'
path_required = path_helpers / 'eyo_required.txt'

path_deps = path_helpers / 'deps.txt'
path_deps_test = path_helpers / 'deps-test.txt'
path_deps_tree = path_helpers / 'deps-test-tree.json'
path_deps_vue = path_helpers / 'deps-vue.txt'
path_deps_web_test = path_helpers / 'deps-web-test.txt'
