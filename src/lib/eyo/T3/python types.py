import pathlib
import datetime

import t3lib as T3

if __name__ != "main":
#    path0 = pathlib.Path(__file__).parent / 'lexical.html'
#    print(path0)
#    path00 = pathlib.Path(__file__).parent / 'lexical_xtd.html'
#    print(path00)
    path1 = pathlib.Path(__file__).parent / 'expressions.html'
    print(path1)
    path2 = pathlib.Path(__file__).parent / 'expressions_xtd.html'
    print(path2)
    path3 = pathlib.Path(__file__).parent / 'simple_stmts.html'
    print(path3)
    path4 = pathlib.Path(__file__).parent / 'simple_stmts_xtd.html'
    print(path4)
    path5 = pathlib.Path(__file__).parent / 'compound_stmts.html'
    print(path5)
    path6 = pathlib.Path(__file__).parent / 'compound_stmts_xtd.html'
    print(path6)
    path7 = pathlib.Path(__file__).parent / 'eyo.html'
    print(path7)
    # do not change the order of the path arguments
    types = T3.Types(path1, path2, path3, path4, path5, path6, path7)
    t = types.get_type("call")
    print(t.name, t.alias.name if t.alias else None)
    print(types.get_T3_data(debug = True))
    print(types.get_T3_all())
    out = pathlib.Path(__file__).parent / 'T3.js'
    out.write_text('// This file was generated by "python types.py" on {}\n\n'.format(datetime.datetime.utcnow())+types.get_T3_data(debug = True))
    out = pathlib.Path(__file__).parent / 'T3_all.js'
    out.write_text('// This file was generated by "python types.py" on {}\n\n'.format(datetime.datetime.utcnow())+types.get_T3_all())
