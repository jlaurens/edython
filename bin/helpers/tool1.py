"""Generates a dependency javacript file from a directory.
"""
import pathlib, os
import re
import json
import pprint

re_provide = re.compile(r"^\s*goog\.(?:(?P<provide>provide)|(?P<require>require)|forwardDeclare)\('(?P<what>[^']+)'\)[;\s]*$")
#re_provide = re.compile(r"^\s*goog.(?P<provide>provide)\('(?P<what>[^']+)'\)[;\s]*$")

pathRoot = pathlib.Path(__file__).resolve().parent.parent.parent
pathBuild = pathRoot / 'build' / 'helpers'
pathBuild.mkdir(parents=True, exist_ok=True)

def buildDeps(library, library_name):
    pathInput = pathRoot / 'src/lib/' / library
    print('scanning', pathInput)
    files = [x for x in pathInput.glob('**/*')
             if x.is_file() and x.suffix == '.js'
             if '/dev/' not in x.as_posix()]
    pprint.pprint(files)

    out_lines = []
    out_lines2 = []

    for file in files:
        with file.open() as f:
            relative = file.relative_to(pathRoot)
            provide = '['
            require = '['
            provide_sep = ''
            require_sep = ''
            for l in f.readlines():
                m = re_provide.match(l)
                if m:
                    print(m.group('provide'))
                    if m.group('provide'):
                        provide += provide_sep + "'" + m.group('what') + "'"
                        provide_sep = ', '
                        out_lines2.append(m.group('what'))
                    elif m.group('require'):
                        require += require_sep + "'" + m.group('what') + "'"
                        require_sep = ', '
                        print(require)
                    else:
                        out_lines2.append(m.group('what'))
            if len(provide) + len(require)>2:
                provide += ']'
                require += ']'
                out_lines.append("goog.addDependency('" + relative.as_posix() + "', " + provide + ', ' + require + ', {});\n')
    p_out = pathBuild / (library_name+'_deps.js')
    print(p_out)
    p_out.write_text(''.join(out_lines))
    p_out = pathBuild / (library_name+'_required.txt')
    print(p_out)
    p_out.write_text('\n'.join(out_lines2))

buildDeps('eyo', 'eyo')
buildDeps('blockly/core', 'blockly')

exit(0)
