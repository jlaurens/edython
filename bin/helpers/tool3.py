"""Generates a dependency javacript file from a directory.
"""
import pathlib, os
import re
import shutil
import os
import stat

pathRoot = pathlib.Path(__file__).resolve().parent.parent.parent
pathBuild = pathRoot / 'build' / 'helpers'
pathBuild.mkdir(parents=True, exist_ok=True)

# read the build.sh, change it and save the modified file to the build
def updateBuild(path_in, path_out, path_deps):
    re_good = re.compile(r"^--js ")
    with path_in.open('r', encoding='utf-8') as f:
        head = []
        tail = []
        fill = head
        for l in f.readlines():
            if re_good.match(l):
                fill = tail
            else:
                fill.append(l)
        with path_deps.open('r', encoding='utf-8') as f:
            head.append(f.read())
            head.extend(tail)
            path_out.write_text(''.join(head), encoding='utf-8')
            st = os.stat(path_out.as_posix())
            os.chmod(path_out.as_posix(), st.st_mode | stat.S_IEXEC)
            return 0
    return 1

def updateWeb(path_in, path_out, path_deps):
    re_start = re.compile(r"^\s*<\!--\s+DYNAMIC DEPS START\s+-->\s*$")
    re_end = re.compile(r"^\s*<\!--\s+DYNAMIC DEPS END\s+-->\s*$")
    with path_in.open('r', encoding='utf-8') as f:
        head = []
        tail = []
        fill = head
        for l in f.readlines():
            if re_start.match(l):
                fill.append(l)
                fill = None
            elif re_end.match(l):
                fill = tail
                fill.append(l)
            elif fill is not None:
                fill.append(l)
        with path_deps.open('r', encoding='utf-8') as f:
            head.append(f.read())
            head.extend(tail)
            path_out.write_text(''.join(head), encoding='utf-8')
            return 0
    return 1


print('Step 3:')
print('=======')
print('Update source files.')
out = updateBuild(pathRoot / 'bin' / 'build.sh',
                  pathRoot / 'bin' / 'build.sh',
                pathBuild / 'deps-build.txt'
                  )

out = updateWeb(pathRoot / 'src' / 'index.ejs',
                pathRoot / 'src' / 'index.ejs',
                     pathBuild / 'deps-vue.txt')
try:
    out = updateWeb(pathRoot / 'sandbox' / 'html' / 'toolbox.html',
                    pathRoot / 'sandbox' / 'html' / 'toolbox.html',
                    pathBuild / 'deps-web-dev.txt')
except:
    # this is just a convenient method to update developer's test file
    pass
exit(out)
