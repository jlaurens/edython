var assert = chai.assert

var g = eYo.GMR._PyParser_Grammar

var n_test = (n, type, str) => {
  assert(n, 'No node')
  assert(n.n_type === type, `${n.n_type} === ${type}`)
  assert(n.n_str === '', `${n.n_str} === '${str}'`)
}
console.log('RUNNING PARSETOK TESTS')

describe('Test', function() {
  it('test', function() {
    assert(eYo.Parser.PyParser_ParseString)
    var err_ret = {}
    var n = eYo.Parser.PyParser_ParseString('', g, eYo.TKN.single_input, err_ret)
    n_test(n, eYo.TKN.single_input, null)
    n = n.n_child[0]
    n_test(n, eYo.TKN.NEWLINE, '')
//    eYo.Node.PyNode_ListTree(n)
  });
});

var ra_test = (name, str_s) => {
  describe(name, function() {
    str_s.forEach((str) => {
      var f = (() => {
        return function() {
          var err_ret = {}
          var n = eYo.Parser.PyParser_ParseString(str, g, eYo.TKN.single_input, err_ret)
          // eYo.Node.PyNode_ListTree(n)
          n_test(n, eYo.TKN.single_input, null)
          assert(err_ret.error === eYo.E.DONE, `ERROR: ${err_ret.error}`)
          // n_test(n, eYo.TKN.single_input, null)
          // n = n.n_child[0]
          // n_test(n, eYo.TKN.ENDMARKER, '')
        }
      })()
      it(str, f)
    })
  })  
}

/*
Based on data in https://raw.githubusercontent.com/python/cpython/master/Lib/test/test_parser.py
*/
eYo.Const.Py_DEBUG = false
var ra_yield_statement = [
  "def f(): yield 1",
  "def f(): yield",
  "def f(): x += yield",
  "def f(): x = yield 1",
  "def f(): x = y = yield 1",
  "def f(): x = yield",
  "def f(): x = y = yield",
  "def f(): 1 + (yield)*2",
  "def f(): (yield 1)*2",
  "def f(): return; yield 1",
  "def f(): yield 1; return",
  "def f(): yield from 1",
  "def f(): x = yield from 1",
  "def f(): f((yield from 1))",
  "def f(): yield 1; return 1",
  "def f():\n" +
  "    for x in range(30):\n" +
  "        yield x\n",
  "def f():\n" +
  "    if (yield):\n" +
  "        yield x\n"
]
ra_test('yield_statement', ra_yield_statement)
var ra_await_statement = [
  "async def f():\n await smth()",
  "async def f():\n foo = await smth()",
  "async def f():\n foo, bar = await smth()",
  "async def f():\n (await smth())",
  "async def f():\n foo((await smth()))",
  "async def f():\n await foo(); return 42",
]
ra_test('await_statement', ra_await_statement)
var ra_async_with_statement = [
  "async def f():\n async with 1: pass",
  "async def f():\n async with a as b, c as d: pass",
]
ra_test('async_with_statement', ra_async_with_statement)
var ra_async_for_statement = [
  "async def f():\n async for i in (): pass",
  "async def f():\n async for i, b in (): pass",
]
ra_test('async_for_statement', ra_async_for_statement)
var ra_nonlocal_statement = [
  "def f():\n" +
  "    x = 0\n" +
  "    def g():\n" +
  "        nonlocal x\n",
  "def f():\n" +
  "    x = y = 0\n" +
  "    def g():\n" +
  "        nonlocal x, y\n"
]
ra_test('nonlocal_statement', ra_nonlocal_statement)

var ra_expressions = [
  "foo(1)",
  "[1, 2, 3]",
  "[x**3 for x in range(20)]",
  "[x**3 for x in range(20) if x % 3]",
  "[x**3 for x in range(20) if x % 2 if x % 3]",
  "list(x**3 for x in range(20))",
  "list(x**3 for x in range(20) if x % 3)",
  "list(x**3 for x in range(20) if x % 2 if x % 3)",
  "foo(*args)",
  "foo(*args, **kw)",
  "foo(**kw)",
  "foo(key=value)",
  "foo(key=value, *args)",
  "foo(key=value, *args, **kw)",
  "foo(key=value, **kw)",
  "foo(a, b, c, *args)",
  "foo(a, b, c, *args, **kw)",
  "foo(a, b, c, **kw)",
  "foo(a, *args, keyword=23)",
  "foo + bar",
  "foo - bar",
  "foo * bar",
  "foo / bar",
  "foo // bar",
  "(foo := 1)",
  "lambda: 0",
  "lambda x: 0",
  "lambda *y: 0",
  "lambda *y, **z: 0",
  "lambda **z: 0",
  "lambda x, y: 0",
  "lambda foo=bar: 0",
  "lambda foo=bar, spaz=nifty+spit: 0",
  "lambda foo=bar, **z: 0",
  "lambda foo=bar, blaz=blat+2, **z: 0",
  "lambda foo=bar, blaz=blat+2, *y, **z: 0",
  "lambda x, *y, **z: 0",
  "(x for x in range(10))",
  "foo(x for x in range(10))",
  "...",
  "a[...]",
]
ra_test('expressions', ra_expressions)
var ra_simple_expression = [
  "a",
]
ra_test('simple_expression', ra_simple_expression)

var ra_simple_assignments = [
  "a = b",
  "a = b = c = d = e",
]
ra_test('simple_assignments', ra_simple_assignments)
var ra_var_annot = [
  "x: int = 5",
  "y: List[T] = []; z: [list] = fun()",
  "x: tuple = (1, 2)",
  "d[f()]: int = 42",
  "f(d[x]): str = 'abc'",
  "x.y.z.w: complex = 42j",
  "x: int",
  "def f():\n" +
  "    x: str\n" +
  "    y: int = 5\n",
  "class C:\n" +
  "    x: str\n" +
  "    y: int = 5\n",
  "class C:\n" +
  "    def __init__(self, x: int) -> None:\n" +
  "        self.x: int = x\n"
]
ra_test('var_annot', ra_var_annot)
/*
        # double check for nonsense
        with self.assertRaises(SyntaxError):
            exec("2+2: int", {}, {})
        with self.assertRaises(SyntaxError):
            exec("[]: int = 5", {}, {})
        with self.assertRaises(SyntaxError):
            exec("x, *y, z: int = range(5)", {}, {})
        with self.assertRaises(SyntaxError):
            exec("x: int = 1, y = 2", {}, {})
        with self.assertRaises(SyntaxError):
            exec("u = v: int", {}, {})
        with self.assertRaises(SyntaxError):
            exec("False: int", {}, {})
        with self.assertRaises(SyntaxError):
            exec("x.False: int", {}, {})
        with self.assertRaises(SyntaxError):
            exec("x.y,: int", {}, {})
        with self.assertRaises(SyntaxError):
            exec("[0]: int", {}, {})
        with self.assertRaises(SyntaxError):
            exec("f(): int", {}, {})
*/
var ra_simple_augmented_assignments = [
  "a += b",
  "a -= b",
  "a *= b",
  "a /= b",
  "a //= b",
  "a %= b",
  "a &= b",
  "a |= b",
  "a ^= b",
  "a <<= b",
  "a >>= b",
  "a **= b",
]
ra_test('simple_augmented_assignments', ra_simple_augmented_assignments)
var ra_function_defs = [
  "def f(): pass",
  "def f(*args): pass",
  "def f(*args, **kw): pass",
  "def f(**kw): pass",
  "def f(foo=bar): pass",
  "def f(foo=bar, *args): pass",
  "def f(foo=bar, *args, **kw): pass",
  "def f(foo=bar, **kw): pass",
  "def f(a, b): pass",
  "def f(a, b, *args): pass",
  "def f(a, b, *args, **kw): pass",
  "def f(a, b, **kw): pass",
  "def f(a, b, foo=bar): pass",
  "def f(a, b, foo=bar, *args): pass",
  "def f(a, b, foo=bar, *args, **kw): pass",
  "def f(a, b, foo=bar, **kw): pass",
  "@staticmethod\n" +
  "def f(): pass",
  "@staticmethod\n" +
  "@funcattrs(x, y)\n" +
  "def f(): pass",
  "@funcattrs()\n" +
  "def f(): pass",

  //      # keyword-only arguments
  "def f(*, a): pass",
  "def f(*, a = 5): pass",
  "def f(*, a = 5, b): pass",
  "def f(*, a, b = 5): pass",
  "def f(*, a, b = 5, **kwds): pass",
  "def f(*args, a): pass",
  "def f(*args, a = 5): pass",
  "def f(*args, a = 5, b): pass",
  "def f(*args, a, b = 5): pass",
  "def f(*args, a, b = 5, **kwds): pass",

  //      # function annotations
  "def f(a: int): pass",
  "def f(a: int = 5): pass",
  "def f(*args: list): pass",
  "def f(**kwds: dict): pass",
  "def f(*, a: int): pass",
  "def f(*, a: int = 5): pass",
  "def f() -> int: pass",
]
ra_test('function_defs', ra_function_defs)
var ra_class_defs = [
  "class foo():pass",
  "class foo(object):pass",
  "@class_decorator\n" +
  "class foo():pass",
  "@class_decorator(arg)\n" +
  "class foo():pass",
  "@decorator1\n" +
  "@decorator2\n" +
  "class foo():pass",
]
ra_test('class_defs', ra_class_defs)
var ra_import_from_statement = [
  "from sys.path import *",
  "from sys.path import dirname",
  "from sys.path import (dirname)",
  "from sys.path import (dirname,)",
  "from sys.path import dirname as my_dirname",
  "from sys.path import (dirname as my_dirname)",
  "from sys.path import (dirname as my_dirname,)",
  "from sys.path import dirname, basename",
  "from sys.path import (dirname, basename)",
  "from sys.path import (dirname, basename,)",
  "from sys.path import dirname as my_dirname, basename",
  "from sys.path import (dirname as my_dirname, basename)",
  "from sys.path import (dirname as my_dirname, basename,)",
  "from sys.path import dirname, basename as my_basename",
  "from sys.path import (dirname, basename as my_basename)",
  "from sys.path import (dirname, basename as my_basename,)",
  "from .bogus import x",
]
ra_test('import_from_statement', ra_import_from_statement)
var ra_basic_import_statement = [
  "import sys",
  "import sys as system",
  "import sys, math",
  "import sys as system, math",
  "import sys, math as my_math",
]
ra_test('basic_import_statement', ra_basic_import_statement)
var ra_relative_imports = [
  "from . import name",
  "from .. import name",
  "from ... import name",
  "from .... import name",
  "from .pkg import name",
  "from ..pkg import name",
  "from ...pkg import name",
  "from ....pkg import name",
]
ra_test('relative_imports', ra_relative_imports)
var ra_pep263 = [
  "# -*- coding: iso-8859-1 -*-\n" +
  "pass\n",
]
ra_test('pep263', ra_pep263)
var ra_assert = [
  "assert alo < ahi and blo < bhi\n",
]
ra_test('assert', ra_assert)
var ra_with = [
  "with open('x'): pass\n",
  "with open('x') as f: pass\n",
  "with open('x') as f, open('y') as g: pass\n",
]
ra_test('with', ra_with)
var ra_try_stmt = [
  "try: pass\nexcept: pass\n",
  "try: pass\nfinally: pass\n",
  "try: pass\nexcept A: pass\nfinally: pass\n",
  "try: pass\nexcept A: pass\nexcept: pass\n" +
  "finally: pass\n",
  "try: pass\nexcept: pass\nelse: pass\n",
  "try: pass\nexcept: pass\nelse: pass\n" +
  "finally: pass\n",
]
ra_test('try_stmt', ra_try_stmt)
// va ra_position = [
//         // # An absolutely minimal test of position information.  Better
//         // # tests would be a big project.
//         code = "def f(x):\n    return x + 1"
//         st = parser.suite(code)

//         def walk(tree):
//             node_type = tree[0]
//             next = tree[1]
//             if isinstance(next, (tuple, list)):
//                 for elt in tree[1:]:
//                     for x in walk(elt):
//                         yield x
//             else:
//                 yield tree

//         expected = [
//             (1, 'def', 1, 0),
//             (1, 'f', 1, 4),
//             (7, '(', 1, 5),
//             (1, 'x', 1, 6),
//             (8, ')', 1, 7),
//             (11, ':', 1, 8),
//             (4, '', 1, 9),
//             (5, '', 2, -1),
//             (1, 'return', 2, 4),
//             (1, 'x', 2, 11),
//             (14, '+', 2, 13),
//             (2, '1', 2, 15),
//             (4, '', 2, 16),
//             (6, '', 2, -1),
//             (4, '', 2, -1),
//             (0, '', 2, -1),
//         ]

//         self.assertEqual(list(walk(st.totuple(line_info=True, col_info=True))),
//                          expected)
//         self.assertEqual(list(walk(st.totuple())),
//                          [(t, n) for t, n, l, c in expected])
//         self.assertEqual(list(walk(st.totuple(line_info=True))),
//                          [(t, n, l) for t, n, l, c in expected])
//         self.assertEqual(list(walk(st.totuple(col_info=True))),
//                          [(t, n, c) for t, n, l, c in expected])
//         self.assertEqual(list(walk(st.tolist(line_info=True, col_info=True))),
//                          [list(x) for x in expected])
//         self.assertEqual(list(walk(parser.st2tuple(st, line_info=True,
//                                                    col_info=True))),
//                          expected)
//         self.assertEqual(list(walk(parser.st2list(st, line_info=True,
//                                                   col_info=True))),
//                          [list(x) for x in expected])

var ra_extended_unpacking = [
  "*a = y",
  "x, *b, = m",
  "[*a, *b] = y",
  "for [*x, b] in x: pass",
]
ra_test('extended_unpacking', ra_extended_unpacking)
var ra_raise_statement = [
  "raise\n",
  "raise e\n",
  "try:\n" +
  "    suite\n" +
                         "except Exception as e:\n" +
  "    raise ValueError from e\n"
]
ra_test('raise_statement', ra_raise_statement)
var ra_list_displays = [
  '[]',
  '[*{2}, 3, *[4]]',
]
ra_test('list_displays', ra_list_displays)
var ra_set_displays = [
  '{*{2}, 3, *[4]}',
  '{2}',
  '{2,}',
  '{2, 3}',
  '{2, 3,}',
]
ra_test('set_displays', ra_set_displays)
var ra_dict_displays = [
  '{}',
  '{a:b}',
  '{a:b,}',
  '{a:b, c:d}',
  '{a:b, c:d,}',
  '{**{}}',
  '{**{}, 3:4, **{5:6, 7:8}}',
]
ra_test('dict_displays', ra_dict_displays)
var ra_argument_unpacking = [
  "f(*a, **b)",
  'f(a, *b, *c, *d)',
  'f(**a, **b)',
  'f(2, *a, *b, **b, **c, **d)',
  "f(*b, *() or () and (), **{} and {}, **() or {})",
]
ra_test('argument_unpacking', ra_argument_unpacking)
var ra_set_comprehensions = [
  '{x for x in seq}',
  '{f(x) for x in seq}',
  '{f(x) for x in seq if condition(x)}',
]
ra_test('set_comprehensions', ra_set_comprehensions)
var ra_dict_comprehensions = [
  '{x:x for x in seq}',
  '{x**2:x[3] for x in seq if condition(x)}',
  '{x:x for x in seq1 for y in seq2 if condition(x, y)}',
]
ra_test('dict_comprehensions', ra_dict_comprehensions)
var ra_named_expressions = [
  "(a := 1)",
  "(a := a)",
  "if (match := pattern.search(data)) is None: pass",
  "while match := pattern.search(f.read()): pass",
  "[y := f(x), y**2, y**3]",
  "filtered_data = [y for x in data if (y := f(x)) is None]",
  "(y := f(x))",
  "y0 = (y1 := f(x))",
  "foo(x=(y := f(x)))",
  "def foo(answer=(p := 42)): pass",
  "def foo(answer: (p := 42) = 5): pass",
  "lambda: (x := 1)",
  "(x := lambda: 1)",
  "(x := lambda: (y := 1))", // # not in PEP
  "lambda line: (m := re.match(pattern, line)) and m.group(1)",
  "x = (y := 0)",
  "(z:=(y:=(x:=0)))",
  "(info := (name, phone, *rest))",
  "(x:=1,2)",
  "(total := total + tax)",
  "len(lines := f.readlines())",
  "foo(x := 3, cat='vector')",
  "foo(cat=(category := 'vector'))",
  "if any(len(longline := l) >= 100 for l in lines): print(longline)",
  "if env_base := os.environ.get('PYTHONUSERBASE', None): return env_base",
  "if self._is_special and (ans := self._check_nans(context=context)): return ans",
  "foo(b := 2, a=1)",
  "foo(b := 2, a=1)",
  "foo((b := 2), a=1)",
  "foo(c=(b := 2), a=1)",
]
ra_test('named_expressions', ra_named_expressions)
// #
// #  Second, we take *invalid* trees and make sure we get ParserError
// #  rejections for them.
// #

// class IllegalSyntaxTestCase(unittest.TestCase):

//     def check_bad_tree(self, tree, label):
//         try:
//             parser.sequence2st(tree)
//         except parser.ParserError:
//             pass
//         else:
//             self.fail("did not detect invalid tree for %r" % label)

// va ra_junk = [
//         # not even remotely valid:
//         self.check_bad_tree((1, 2, 3), "<junk>")

// va ra_illegal_terminal = [
//         tree = \
//             (257,
//              (269,
//               (270,
//                (271,
//                 (277,
//                  (1,))),
//                (4, ''))),
//              (4, ''),
//              (0, ''))
//         self.check_bad_tree(tree, "too small items in terminal node")
//         tree = \
//             (257,
//              (269,
//               (270,
//                (271,
//                 (277,
//                  (1, b'pass'))),
//                (4, ''))),
//              (4, ''),
//              (0, ''))
//         self.check_bad_tree(tree, "non-string second item in terminal node")
//         tree = \
//             (257,
//              (269,
//               (270,
//                (271,
//                 (277,
//                  (1, 'pass', '0', 0))),
//                (4, ''))),
//              (4, ''),
//              (0, ''))
//         self.check_bad_tree(tree, "non-integer third item in terminal node")
//         tree = \
//             (257,
//              (269,
//               (270,
//                (271,
//                 (277,
//                  (1, 'pass', 0, 0))),
//                (4, ''))),
//              (4, ''),
//              (0, ''))
//         self.check_bad_tree(tree, "too many items in terminal node")

// va ra_illegal_yield_1 = [
//         # Illegal yield statement: def f(): return 1; yield 1
//         tree = \
//         (257,
//          (264,
//           (285,
//            (259,
//             (1, 'def'),
//             (1, 'f'),
//             (260, (7, '('), (8, ')')),
//             (11, ':'),
//             (291,
//              (4, ''),
//              (5, ''),
//              (264,
//               (265,
//                (266,
//                 (272,
//                  (275,
//                   (1, 'return'),
//                   (313,
//                    (292,
//                     (293,
//                      (294,
//                       (295,
//                        (297,
//                         (298,
//                          (299,
//                           (300,
//                            (301,
//                             (302, (303, (304, (305, (2, '1')))))))))))))))))),
//                (264,
//                 (265,
//                  (266,
//                   (272,
//                    (276,
//                     (1, 'yield'),
//                     (313,
//                      (292,
//                       (293,
//                        (294,
//                         (295,
//                          (297,
//                           (298,
//                            (299,
//                             (300,
//                              (301,
//                               (302,
//                                (303, (304, (305, (2, '1')))))))))))))))))),
//                  (4, ''))),
//                (6, ''))))),
//            (4, ''),
//            (0, ''))))
//         self.check_bad_tree(tree, "def f():\n  return 1\n  yield 1")

// va ra_illegal_yield_2 = [
//         # Illegal return in generator: def f(): return 1; yield 1
//         tree = \
//         (257,
//          (264,
//           (265,
//            (266,
//             (278,
//              (1, 'from'),
//              (281, (1, '__future__')),
//              (1, 'import'),
//              (279, (1, 'generators')))),
//            (4, ''))),
//          (264,
//           (285,
//            (259,
//             (1, 'def'),
//             (1, 'f'),
//             (260, (7, '('), (8, ')')),
//             (11, ':'),
//             (291,
//              (4, ''),
//              (5, ''),
//              (264,
//               (265,
//                (266,
//                 (272,
//                  (275,
//                   (1, 'return'),
//                   (313,
//                    (292,
//                     (293,
//                      (294,
//                       (295,
//                        (297,
//                         (298,
//                          (299,
//                           (300,
//                            (301,
//                             (302, (303, (304, (305, (2, '1')))))))))))))))))),
//                (264,
//                 (265,
//                  (266,
//                   (272,
//                    (276,
//                     (1, 'yield'),
//                     (313,
//                      (292,
//                       (293,
//                        (294,
//                         (295,
//                          (297,
//                           (298,
//                            (299,
//                             (300,
//                              (301,
//                               (302,
//                                (303, (304, (305, (2, '1')))))))))))))))))),
//                  (4, ''))),
//                (6, ''))))),
//            (4, ''),
//            (0, ''))))
//         self.check_bad_tree(tree, "def f():\n  return 1\n  yield 1")

// va ra_a_comma_comma_c = [
//         # Illegal input: a,,c
//         tree = \
//         (258,
//          (311,
//           (290,
//            (291,
//             (292,
//              (293,
//               (295,
//                (296,
//                 (297,
//                  (298, (299, (300, (301, (302, (303, (1, 'a')))))))))))))),
//           (12, ','),
//           (12, ','),
//           (290,
//            (291,
//             (292,
//              (293,
//               (295,
//                (296,
//                 (297,
//                  (298, (299, (300, (301, (302, (303, (1, 'c'))))))))))))))),
//          (4, ''),
//          (0, ''))
//         self.check_bad_tree(tree, "a,,c")

// va ra_illegal_operator = [
//         # Illegal input: a $= b
//         tree = \
//         (257,
//          (264,
//           (265,
//            (266,
//             (267,
//              (312,
//               (291,
//                (292,
//                 (293,
//                  (294,
//                   (296,
//                    (297,
//                     (298,
//                      (299,
//                       (300, (301, (302, (303, (304, (1, 'a'))))))))))))))),
//              (268, (37, '$=')),
//              (312,
//               (291,
//                (292,
//                 (293,
//                  (294,
//                   (296,
//                    (297,
//                     (298,
//                      (299,
//                       (300, (301, (302, (303, (304, (1, 'b'))))))))))))))))),
//            (4, ''))),
//          (0, ''))
//         self.check_bad_tree(tree, "a $= b")

// va ra_malformed_global = [
//         #doesn't have global keyword in ast
//         tree = (257,
//                 (264,
//                  (265,
//                   (266,
//                    (282, (1, 'foo'))), (4, ''))),
//                 (4, ''),
//                 (0, ''))
//         self.check_bad_tree(tree, "malformed global ast")

// va ra_missing_import_source = [
//         # from import fred
//         tree = \
//             (257,
//              (268,
//               (269,
//                (270,
//                 (282,
//                  (284, (1, 'from'), (1, 'import'),
//                   (287, (285, (1, 'fred')))))),
//                (4, ''))),
//              (4, ''), (0, ''))
//         self.check_bad_tree(tree, "from import fred")

// va ra_illegal_encoding = [
//         # Illegal encoding declaration
//         tree = \
//             (341,
//              (257, (0, '')))
//         self.check_bad_tree(tree, "missed encoding")
//         tree = \
//             (341,
//              (257, (0, '')),
//               b'iso-8859-1')
//         self.check_bad_tree(tree, "non-string encoding")
//         tree = \
//             (341,
//              (257, (0, '')),
//               '\udcff')
//         with self.assertRaises(UnicodeEncodeError):
//             parser.sequence2st(tree)


// class CompileTestCase(unittest.TestCase):

//     # These tests are very minimal. :-(

// va ra_compile_expr = [
//         st = parser.expr('2 + 3')
//         code = parser.compilest(st)
//         self.assertEqual(eval(code), 5)

// va ra_compile_suite = [
//         st = parser.suite('x = 2; y = x + 3')
//         code = parser.compilest(st)
//         globs = {}
//         exec(code, globs)
//         self.assertEqual(globs['y'], 5)

// va ra_compile_error = [
//         st = parser.suite('1 = 3 + 4')
//         self.assertRaises(SyntaxError, parser.compilest, st)

// va ra_compile_badunicode = [
//         st = parser.suite('a = "\\U12345678"')
//         self.assertRaises(SyntaxError, parser.compilest, st)
//         st = parser.suite('a = "\\u1"')
//         self.assertRaises(SyntaxError, parser.compilest, st)

// va ra_issue_9011 = [
//         # Issue 9011: compilation of an unary minus expression changed
//         # the meaning of the ST, so that a second compilation produced
//         # incorrect results.
//         st = parser.expr('-3')
//         code1 = parser.compilest(st)
//         self.assertEqual(eval(code1), -3)
//         code2 = parser.compilest(st)
//         self.assertEqual(eval(code2), -3)

// va ra_compile_filename = [
//         st = parser.expr('a + 5')
//         code = parser.compilest(st)
//         self.assertEqual(code.co_filename, '<syntax-tree>')
//         code = st.compile()
//         self.assertEqual(code.co_filename, '<syntax-tree>')
//         for filename in 'file.py', b'file.py':
//             code = parser.compilest(st, filename)
//             self.assertEqual(code.co_filename, 'file.py')
//             code = st.compile(filename)
//             self.assertEqual(code.co_filename, 'file.py')
//         for filename in bytearray(b'file.py'), memoryview(b'file.py'):
//             with self.assertWarns(DeprecationWarning):
//                 code = parser.compilest(st, filename)
//             self.assertEqual(code.co_filename, 'file.py')
//             with self.assertWarns(DeprecationWarning):
//                 code = st.compile(filename)
//             self.assertEqual(code.co_filename, 'file.py')
//         self.assertRaises(TypeError, parser.compilest, st, list(b'file.py'))
//         self.assertRaises(TypeError, st.compile, list(b'file.py'))


// class ParserStackLimitTestCase(unittest.TestCase):
//     """try to push the parser to/over its limits.
//     see http://bugs.python.org/issue1881 for a discussion
//     """
//     def _nested_expression(self, level):
//         return "["*level+"]"*level

// va ra_deeply_nested_list = [
//         # This has fluctuated between 99 levels in 2.x, down to 93 levels in
//         # 3.7.X and back up to 99 in 3.8.X. Related to MAXSTACK size in Parser.h
//         e = self._nested_expression(99)
//         st = parser.expr(e)
//         st.compile()

// va ra_trigger_memory_error = [
//         e = self._nested_expression(100)
//         rc, out, err = assert_python_failure('-c', e)
//         # parsing the expression will result in an error message
//         # followed by a MemoryError (see #11963)
//         self.assertIn(b's_push: parser stack overflow', err)
//         self.assertIn(b'MemoryError', err)

// class STObjectTestCase(unittest.TestCase):
//     """Test operations on ST objects themselves"""

// va ra_comparisons = [
//         # ST objects should support order and equality comparisons
//         st1 = parser.expr('2 + 3')
//         st2 = parser.suite('x = 2; y = x + 3')
//         st3 = parser.expr('list(x**3 for x in range(20))')
//         st1_copy = parser.expr('2 + 3')
//         st2_copy = parser.suite('x = 2; y = x + 3')
//         st3_copy = parser.expr('list(x**3 for x in range(20))')

//         # exercise fast path for object identity
//         self.assertEqual(st1 == st1, True)
//         self.assertEqual(st2 == st2, True)
//         self.assertEqual(st3 == st3, True)
//         # slow path equality
//         self.assertEqual(st1, st1_copy)
//         self.assertEqual(st2, st2_copy)
//         self.assertEqual(st3, st3_copy)
//         self.assertEqual(st1 == st2, False)
//         self.assertEqual(st1 == st3, False)
//         self.assertEqual(st2 == st3, False)
//         self.assertEqual(st1 != st1, False)
//         self.assertEqual(st2 != st2, False)
//         self.assertEqual(st3 != st3, False)
//         self.assertEqual(st1 != st1_copy, False)
//         self.assertEqual(st2 != st2_copy, False)
//         self.assertEqual(st3 != st3_copy, False)
//         self.assertEqual(st2 != st1, True)
//         self.assertEqual(st1 != st3, True)
//         self.assertEqual(st3 != st2, True)
//         # we don't particularly care what the ordering is;  just that
//         # it's usable and self-consistent
//         self.assertEqual(st1 < st2, not (st2 <= st1))
//         self.assertEqual(st1 < st3, not (st3 <= st1))
//         self.assertEqual(st2 < st3, not (st3 <= st2))
//         self.assertEqual(st1 < st2, st2 > st1)
//         self.assertEqual(st1 < st3, st3 > st1)
//         self.assertEqual(st2 < st3, st3 > st2)
//         self.assertEqual(st1 <= st2, st2 >= st1)
//         self.assertEqual(st3 <= st1, st1 >= st3)
//         self.assertEqual(st2 <= st3, st3 >= st2)
//         # transitivity
//         bottom = min(st1, st2, st3)
//         top = max(st1, st2, st3)
//         mid = sorted([st1, st2, st3])[1]
//         self.assertTrue(bottom < mid)
//         self.assertTrue(bottom < top)
//         self.assertTrue(mid < top)
//         self.assertTrue(bottom <= mid)
//         self.assertTrue(bottom <= top)
//         self.assertTrue(mid <= top)
//         self.assertTrue(bottom <= bottom)
//         self.assertTrue(mid <= mid)
//         self.assertTrue(top <= top)
//         # interaction with other types
//         self.assertEqual(st1 == 1588.602459, False)
//         self.assertEqual('spanish armada' != st2, True)
//         self.assertRaises(TypeError, operator.ge, st3, None)
//         self.assertRaises(TypeError, operator.le, False, st1)
//         self.assertRaises(TypeError, operator.lt, st1, 1815)
//         self.assertRaises(TypeError, operator.gt, b'waterloo', st2)

// va ra_copy_pickle = [
//         sts = [
//             parser.expr('2 + 3'),
//             parser.suite('x = 2; y = x + 3'),
//             parser.expr('list(x**3 for x in range(20))')
//         ]
//         for st in sts:
//             st_copy = copy.copy(st)
//             self.assertEqual(st_copy.totuple(), st.totuple())
//             st_copy = copy.deepcopy(st)
//             self.assertEqual(st_copy.totuple(), st.totuple())
//             for proto in range(pickle.HIGHEST_PROTOCOL+1):
//                 st_copy = pickle.loads(pickle.dumps(st, proto))
//                 self.assertEqual(st_copy.totuple(), st.totuple())

//     check_sizeof = support.check_sizeof

//     @support.cpython_only
// va ra_sizeof = [
//         def XXXROUNDUP(n):
//             if n <= 1:
//                 return n
//             if n <= 128:
//                 return (n + 3) & ~3
//             return 1 << (n - 1).bit_length()

//         basesize = support.calcobjsize('Pii')
//         nodesize = struct.calcsize('hP3iP0h2i')
//         def sizeofchildren(node):
//             if node is None:
//                 return 0
//             res = 0
//             hasstr = len(node) > 1 and isinstance(node[-1], str)
//             if hasstr:
//                 res += len(node[-1]) + 1
//             children = node[1:-1] if hasstr else node[1:]
//             if children:
//                 res += XXXROUNDUP(len(children)) * nodesize
//                 for child in children:
//                     res += sizeofchildren(child)
//             return res

//         def check_st_sizeof(st):
//             self.check_sizeof(st, basesize + nodesize +
//                                   sizeofchildren(st.totuple()))

//         check_st_sizeof(parser.expr('2 + 3'))
//         check_st_sizeof(parser.expr('2 + 3 + 4'))
//         check_st_sizeof(parser.suite('x = 2 + 3'))
//         check_st_sizeof(parser.suite(''))
//         check_st_sizeof(parser.suite('# -*- coding: utf-8 -*-'))
//         check_st_sizeof(parser.expr('[' + '2,' * 1000 + ']'))


//     # XXX tests for pickling and unpickling of ST objects should go here

// class OtherParserCase(unittest.TestCase):

// va ra_two_args_to_expr = [
//         # See bug #12264
//         with self.assertRaises(TypeError):
//             parser.expr("a", "b")

// if __name__ == "__main__":
//     unittest.main()
// */


console.log('DONE')
