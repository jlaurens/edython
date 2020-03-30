"""Create a list of deps from a list of requirements
Each line of the file_name named 'required.txt' is what is put in goog.require('blablabla')
"""

import my_util as mu

mu.parse_args()

from pathlib import Path

if __name__ != "main":
  print('Step 2:')
  print('=======')
  print('Resolve deps.')
  verbose = mu.global_args and mu.global_args.verbose
  mu.make_bdd(mu.path_goog_deps, mu.path_eyo_deps, verbose=verbose)

  mu.sort_deps(mu.bdd, verbose or True)
  final = mu.bdd.sorted_deps

  def export(p_out, mapper, filterer=None):
    print('Exporting to', p_out)
    p_out.write_text(''.join(map(mapper, filter(filterer, final) if filterer else final)))
  
  def map_fn(r):
    if not r.startswith('src'):
      r = (mu.component_goog / r).as_posix()
    return f'''src/{Path(r).relative_to('src').as_posix()}\n'''

  export(
    mu.path_deps,
    map_fn
  )

  export(
    mu.path_deps_test,
    lambda r: f'''src/{Path(r).with_suffix('.test.js').relative_to('src').as_posix()}\n''',
    lambda r: r.startswith('src/lib/eyo')
  )
  export(
    mu.path_deps_build,
    lambda r: f'--js "{r}" \\\n'
  )
  def map_fn(r):
    if not r.startswith('src'):
      r = (mu.component_goog / r).as_posix()
      if not r.startswith('src'):
        raise Exception(f'Missing leading src: {r}')
    return f'''      <script src="{Path(r).relative_to('src').as_posix()}"></script>\n'''
  export(
    mu.path_deps_vue,
    map_fn
  )
  def map_fn(r):
    if not r.startswith('src'):
      r = (mu.component_goog / r).as_posix()
    return f'''      <script src="../../src/{Path(r).relative_to('src').as_posix()}"></script>\n'''
  export(
    mu.path_deps_web_dev,
    map_fn
  )
  def map_fn(r):
    if not r.startswith('src'):
      r = (mu.component_goog / r).as_posix()
    return f'''      <script src="PATH_ROOT/src/{Path(r).relative_to('src').as_posix()}"></script>\n'''
  export(
    mu.path_deps_web_test,
    map_fn
  )
  def map_fn(r):
    if not r.startswith('src'):
      r = (mu.component_goog / r).as_posix()
    return f'''import_file("src/{Path(r).relative_to('src').as_posix()}")\n'''
  export(
    mu.path_deps_test_import,
    map_fn
  )
  p_out = mu.path_deps_tree
  print('Exporting to', p_out)
  p_out.write_text(mu.bdd.to_json())

