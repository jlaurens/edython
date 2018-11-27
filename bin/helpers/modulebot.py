"""Parse the {{module}} documentation for function entries.

For the stdtypes module, the html parsed is,
for the `str` method `endswith`:

<dl class="method">
<dt id="str.endswith">
<code class="descclassname">str.</code><code class="descname">endswith</code><span class="sig-paren">(</span><em>suffix</em><span class="optional">[</span>, <em>start</em><span class="optional">[</span>, <em>end</em><span class="optional">]</span><span class="optional">]</span><span class="sig-paren">)</span><a class="headerlink" href="#str.endswith" title="Permalink to this definition">¶</a></dt>
<dd><p>Return blablabla.</p>
</dd></dl>

We find all the dl elements, then parse them into Item instances.
The dl class attribute is the type of the Item.
One `dl` with one or more `dt`'s and one `dd`.

For the `math` module, the `atan2` entry is

<dl class="function">
<dt id="math.atan2">
<code class="descclassname">math.</code><code class="descname">atan2</code><span class="sig-paren">(</span><em>y</em>, <em>x</em><span class="sig-paren">)</span><a class="headerlink" href="#math.atan2" title="Permalink to this definition">¶</a></dt>
<dd><p>Return blablabla.</p>
</dd></dl>

For the `decimal` module, the class entry is

<dl class="class">
<dt id="decimal.Decimal">...</dt>
<dd><p>Construct a new <a class="reference internal" href="#decimal.Decimal" title="decimal.Decimal"><code class="xref py py-class docutils literal notranslate"><span class="pre">Decimal</span></code></a> object based from <em>value</em>.</p>
blablabla</p>
</dd></dl>

This `dl` element contains other `dl` element for methods.

Another example of class

<dl class="class">
<dt id="string.Template">
<em class="property">class </em><code class="descclassname">string.</code><code class="descname">Template</code><span class="sig-paren">(</span><em>template</em><span class="sig-paren">)</span><a class="headerlink" href="#string.Template" title="Permalink to this definition">¶</a></dt>
<dd><p>The constructor takes a single argument which is the template string.</p>
<dl class="method">
<dt id="string.Template.substitute">
<code class="descname">substitute</code><span class="sig-paren">(</span><em>mapping</em>, <em>**kwds</em><span class="sig-paren">)...
...
</dd></dl>

</dd></dl>


For the datastructures, the entry is

<dl class="method">
<dt>
<code class="descclassname">list.</code><code class="descname">append</code><span class="sig-paren">(</span><em>x</em><span class="sig-paren">)</span></dt>
<dd><p>Add an item to the end of the list.  Equivalent to <code class="docutils literal notranslate"><span class="pre">a[len(a):]</span> <span class="pre">=</span> <span class="pre">[x]</span></code>.</p>
</dd></dl>

"""
import xml.etree.ElementTree as ET
import copy
import urllib.request
import pathlib
import re
import datetime
import argparse
import io
import math
import string

parent_map = None

def do_one_module(module, **kwargs):

    suffix = kwargs['suffix']
    verbose = kwargs['verbose']
    version = kwargs['version'] if 'version' in kwargs else '3.6'

    dls = None # The list of dl elements parsed
        
    class Filter:

        @staticmethod
        def do_module(txt):
            '''
            Returns `True` to indicate that there is a return value.
            '''
            if txt.startswith('Return')\
                    or txt.startswith('Retrieve')\
                    or txt.startswith('The concatenation of the ')\
                    or txt.startswith('The lowercase letters ')\
                    or txt.startswith('The uppercase letters ')\
                    or txt.startswith('The string ')\
                    or txt.startswith('String of ASCII characters which are considered ')\
                    or txt.startswith('A string containing all ASCII characters ')\
                    or re.match(r'^[^\.]*returns?', txt, re.S | re.I) is not None\
                    or re.match(r'^.*\.\s*Returns?', txt, re.S) is not None:
                return True
            try:
                f = getattr(Filter, 'do_' + module)
                if f is not None:
                    return f(txt)
            except:
                pass
            return False

        @staticmethod
        def do_string(txt):
            if txt.startswith('The concatenation of the ')\
                    or txt.startswith('The lowercase letters ')\
                    or txt.startswith('The uppercase letters ')\
                    or txt.startswith('The string ')\
                    or txt.startswith('String of ASCII characters which are considered ')\
                    or txt.startswith('A string containing all ASCII characters ')\
                    or re.match(r'^\s*The constructor', txt, re.S) is not None:
                return True

        @staticmethod
        def do_name_functions(txt):
            return txt in ['bin', 'compile', 'delattr', 'eval', 'format', 'hasattr', 'hex', 'input', 'oct', 'print']

        @staticmethod
        def do_name_turtle(txt):
            return txt in ['bgcolor', 'tracer', 'mode', 'colormode', 'Turtle', 'TurtleScreen', 'RawTurtle', 'ScrolledCanvas', 'Shape', 'Vec2D']

        @staticmethod
        def do_name_module(txt):
            if txt.startswith('get'):
                return True
            try:
                f = getattr(Filter, 'do_name_' + module)
                if not f is None:
                    return f(txt)
            except:
                pass
            return False


        @staticmethod
        def do_name_stdtypes(txt):
            return txt in ['tuple', 'list', 'range', 'format', 'format_map', 'index', 'rindex',
            'rsplit', 'split', 'mro'] or txt.startswith('__')

        @staticmethod
        def do_name_fractions(txt):
            return txt in ['Fraction', 'from_float', 'from_decimal', 'format', 'format_map', 'index', 'rindex',
            'rsplit', 'split', 'mro'] or txt.startswith('__')

        @staticmethod
        def do_random(txt):
            m = re.match(r'^(?:\w\S+\w\s+){1,2}\s*distribution.', txt)
            return m is not None

        @staticmethod
        def do_name_random(txt):
            m = re.match(r'^(?:\S+)variate$', txt)
            return m is not None

        @staticmethod
        def do_type_module(tipe, name):
            try:
                f = getattr(Filter, 'do_type_' + module)
                if not f is None:
                    return f(tipe, name)
            except:
                pass
            return tipe


        @staticmethod
        def ary(name, default):
            try:
                f = getattr(Filter, 'ary_' + module)
                if not f is None:
                    return f(name, default)
            except:
                pass
            return default

        @staticmethod
        def ary_turtle(name, default):
            if name == 'Turtle':
                return 1
            return default

        @staticmethod
        def mandatory(name, default):
            try:
                f = getattr(Filter, 'mandatory_' + module)
                if not f is None:
                    return f(name, default)
            except:
                pass
            return default

        @staticmethod
        def mandatory_turtle(name, default):
            if name == 'Turtle':
                return 1
            return default

    class Signature:

        arguments = None
        star = False
        name = None
        mandatory_ = None
    
        def __init__(self, owner, call = None):
            if verbose:
                print('Signature:', owner.name, call)
            self.owner = owner
            if call is not None:
                self.parse(call)
        
        def __eq__(self, other):
            """Overrides the default implementation"""
            if isinstance(other, Signature):
                return self.arguments == other.arguments
            return NotImplemented

        def __str__(self):
            return str(self.arguments)

        @property
        def ary(self):
            if self.arguments is None:
                return None
            if len(self.arguments):
                arg = self.arguments[0]
                if arg.name == '*args':
                    signatures = self.owner.signatures
                    if len(signatures):
                        return max(map(lambda x: x.ary, signatures))
            if self.star:
                return math.inf
            return Filter.ary(self.owner.name, len(self.arguments))

        @property
        def mandatory(self):
            if self.arguments is None:
                return None
            if len(self.arguments):
                arg = self.arguments[0]
                if arg.name == '*args':
                    signatures = self.owner.signatures
                    if len(signatures):
                        return min(map(lambda x: x.mandatory, signatures))
            if self.mandatory_ is None:
                self.mandatory_ = 0
                for argument in self.arguments:
                    if argument.default is None and argument.optional is not True:
                        self.mandatory_ += 1
            return Filter.mandatory(self.owner.name, self.mandatory_)

        def parse(self, call):
            '''
            call is the `(…)` in `foo(…)`.
            '''
            m = re.match(r"""^
            (?:
                \(
                    (?P<mandatory>[^[]*)
                    (?:\[(?P<optional>.*)\])?
                    (?P<rest>[^][]*)
                \)
            )
            """, call, re.X)
            # print(self.name, '--->', m)
            if m is None:
                # there are no arguments
                return
            args1 = m.group('mandatory')
            args2 = m.group('optional')
            args3 = m.group('rest')
            # print(self.name, '===>', call, '/1:', args1, '/2:', args2, '/3:', args3, sep='')
            # take care of the mandatory argument
            arguments = []
            for arg in re.findall(r'''
            \s*(?:\([^)]+\)|,|[^,\s]+)\s*
            ''', args1, re.X):
                m = re.match('(?P<name>(?:\([^)]+\)|[^=,\s]+))(?:\s*=\s*(?P<default>[^=,\s]+))?', arg)
                if m is None:
                    continue
                name = m.group('name')
                default = m.group('default')
                argument = Argument(self, name)
                arguments.append(argument)
                if default is not None:
                    # record the default, just in case
                    # convert to number if possible
                    try:
                        n = int(default)
                        default = n
                    except:
                        try:
                            x = float(default)
                            default = x
                        except:
                            pass
                    argument.default = default
                if name.startswith('*'):
                    self.star = True
                    argument.optional = True
            # now the optional arguments
            if args2 is not None:
                args2 = args2.replace('[', '').replace(']', '')
                for arg in re.split(r'\s*,\s*', args2):
                    m = re.match('(?P<name>[^=\s]+)(?:\s*=\s*(?P<default>[^=\s]+))?', arg)
                    if m is None:
                        continue
                    name = m.group('name')
                    default = m.group('default')
                    argument = Argument(self, name)
                    arguments.append(argument)
                    if default is None:
                        argument.optional = True
                    else:
                        # record the default, just in case
                        # convert to number if possible
                        try:
                            n = int(default)
                            default = n
                        except:
                            pass
                        argument.default = default
            if self.arguments is None:
                self.arguments = arguments
            elif len(self.arguments) < len(arguments):
                self.arguments = arguments


    class Argument:

        def __init__(self, owner, name):
            self.owner = owner
            self.name = name
            self.default = None
            self.optional = None

        def __eq__(self, other):
            """Overrides the default implementation"""
            if isinstance(other, Argument):
                return (self.name, self.default, self.optional) == (other.name, other.default, other.optional)
            return NotImplemented

        def __hash__(self):
            return self.name

        def __repr__(self):
            return '<argument: ' + self.name + '>'

    class Item:
        """An Item represents either a function, a class, a method, a class method or an attribute.
        Each corresponds to a type."""
        index = None
        category = None
        category_index = None
        type = None
        type_index = None
        name_ = None
        class_name = None
        holder_name = None
        returner = None
        description = None
        href = None
        synonyms = None
        signature = None
        signatures = None

        def __init__(self, owner, dl):
            """Parses the dl dom element into an item
            One dd sub element but possibly many dt's"""
            self.owner = owner
            self.synonyms = []
            self.signatures = []
            #
            # one dd for the description
            dd = dl.find("{http://www.w3.org/1999/xhtml}dd")
            if dd is not None:
                self.description = "".join(dd.itertext()).strip()
                if Filter.do_module(self.description):
                    self.returner = True
            dt = dl.find("{http://www.w3.org/1999/xhtml}dt[@id]")
            if dt is not None:
                components = dt.attrib['id'].split('.')
                self.name = components[-1]
                self.class_name = '.'.join(components[0:-1:1])
                self.type = Filter.do_type_module(dl.get('class'), self.name)
                if self.type in ['attribute', 'exception']:
                    self.returner = True
            for dt in dl.findall("{http://www.w3.org/1999/xhtml}dt"):
                if dl == parent_map[dt]:
                    self.parse_dt(dt)

        @property
        def name(self):
            return self.name_

        @name.setter
        def name(self, new_name):
            self.name_ = new_name
            if self.returner is None \
                and (self.type in ['class', 'attribute', 'data']
                    or self.type in [None, 'method', 'classmethod', 'staticmethod', 'function'] \
                        and Filter.do_name_module(new_name)):
                self.returner = True

        def parse_dt(self, dt):
            """
Example of `dt` for `as_integer_ratio` method of `decimal` instances:
<dt id="decimal.Decimal.as_integer_ratio">
<code class="descname">as_integer_ratio</code>
<span class="sig-paren">(</span>
<span class="sig-paren">)</span>
<a class="headerlink" href="#decimal.Decimal.as_integer_ratio" title="Permalink to this definition">¶</a>
</dt>

Example of `dt` for `copy_sign` method of `decimal` instances:
<dt id="decimal.Decimal.copy_sign">
<code class="descname">copy_sign</code>
<span class="sig-paren">(</span>
<em>other</em>,
<em>context=None</em>
<span class="sig-paren">)</span>
<a class="headerlink" href="#decimal.Decimal.copy_sign" title="Permalink to this definition">¶</a>
</dt>

Example of `dt` for `find` method of `str` instances:
<dt id="str.find">
<code class="descclassname">str.</code>
<code class="descname">find</code>
<span class="sig-paren">(</span>
<em>sub</em>
<span class="optional">[</span>,
<em>start</em><
span class="optional">[</span>,
<em>end</em>
<span class="optional">]</span>
<span class="optional">]</span>
<span class="sig-paren">)</span>
<a class="headerlink" href="#str.find" title="Permalink to this definition">¶</a></dt>

Example of `dt` for `format` method of `str` instances:
<dt id="str.format">
<code class="descclassname">str.</code>
<code class="descname">format</code>
<span class="sig-paren">(</span>
<em>*args</em>,
<em>**kwargs</em>
<span class="sig-paren">)</span>
<a class="headerlink" href="#str.format" title="Permalink to this definition">¶</a></dt>

Example of the first `dt` for the `range` class:
<dt id="range">
<em class="property">class </em><code class="descname">range</code>
<span class="sig-paren">(</span>
<em>stop</em>
<span class="sig-paren">)</span>
<a class="headerlink" href="#range" title="Permalink to this definition">¶</a></dt>
<dt>

and its first attribute

<dt id="range.start">
<code class="descname">start</code><a class="headerlink" href="#range.start" title="Permalink to this definition">¶</a></dt>
<dd><p>The value of …</p>
</dd>

Example of `dt` for the `append`list method.
<dt>
<code class="descclassname">list.</code><code class="descname">append</code><span class="sig-paren">(</span><em>x</em><span class="sig-paren">)</span></dt>
<dd><p>Add an item to the end of the list.  Equivalent to <code class="docutils literal notranslate"><span class="pre">a[len(a):]</span> <span class="pre">=</span> <span class="pre">[x]</span></code>.</p>
</dd>

Example of `dt` for the turtle module, class.

<dl class="class">
<dt id="turtle.Turtle">
<em class="property">class </em>
<code class="descclassname">turtle.</code><code class="descname">Turtle</code><a class="headerlink" href="#turtle.Turtle" title="Permalink to this definition">¶</a></dt>
<dd><p>Subclass of RawTurtle, has the same interface but draws on a default
<a class="reference internal" href="#turtle.Screen" title="turtle.Screen"><code class="xref py py-class docutils literal notranslate"><span class="pre">Screen</span></code></a> object created automatically when needed for the first time.</p>
</dd></dl>

Example of `dt` for the turtle module, method synonyms.

<dl class="function">
<dt id="turtle.back">
<code class="descclassname">turtle.</code><code class="descname">back</code><span class="sig-paren">(</span><em>distance</em><span class="sig-paren">)</span><a class="headerlink" href="#turtle.back" title="Permalink to this definition">¶</a></dt>
<dt id="turtle.bk">
<code class="descclassname">turtle.</code><code class="descname">bk</code><span class="sig-paren">(</span><em>distance</em><span class="sig-paren">)</span><a class="headerlink" href="#turtle.bk" title="Permalink to this definition">¶</a></dt>
<dt id="turtle.backward">
<code class="descclassname">turtle.</code><code class="descname">backward</code><span class="sig-paren">(</span><em>distance</em><span class="sig-paren">)</span><a class="headerlink" href="#turtle.backward" title="Permalink to this definition">¶</a></dt>
<dd>…</dd></dl>


"""
            # permalink
            element = dt.find("{http://www.w3.org/1999/xhtml}a[@class='headerlink']")
            if element is not None:
                self.href = element.attrib['href']
            ddt = copy.deepcopy(dt)
            codes = ddt.findall("{http://www.w3.org/1999/xhtml}code")
            if not len(codes):
                if verbose:
                    print('Ignored:', ET.tostring(dt, encoding='utf8'), sep = '\n')
                return
            by_index = []
            by_class = {}
            for code in codes:
                ddt.remove(code)
                component = "".join(code.itertext()).strip("." + string.whitespace)
                by_index.append(component)
                key = code.attrib['class']
                if key is not None:
                    by_class[key] = component
            name = None
            try:
                name = by_class['descclass_name']
            except KeyError:
                # thing may have changed in the documentation
                try:
                    name = by_class['descclassname']
                except KeyError:
                    name = '.'.join(list(by_index)[:-1])
            if name is not None:
                descclass_name = name
                if self.class_name is None:
                    if len(descclass_name):
                        self.class_name = descclass_name
                elif len(descclass_name) and self.class_name != descclass_name:
                    self.holder_name = self.class_name
                    self.class_name = descclass_name
            try:
                name = by_class['descname']
            except KeyError:
                name = by_index[-1]
            if self.name is None:
                self.name = name
            elif self.name != name:
                self.synonyms.append(name)
            prop = ddt.find(".//{http://www.w3.org/1999/xhtml}em[@class='property']")
            if prop is not None:
                ddt.remove(prop)
                prop = "".join(prop.itertext()).strip()
                if self.type is None:
                    self.type = prop
                elif prop != self.type and (prop, self.type) != ('static', 'staticmethod'):
                    print('! ATTENTION, possible inconsistency', prop, self.type, self.type is None)
            call = "".join(ddt.itertext()).strip()

            signature = Signature(self, call)
            if signature.arguments is not None:
                if self.signature is None:
                    self.signature = signature
                elif self.signature != signature and signature not in self.signatures:
                    self.signatures.append(signature)
                    try:
                        arg0 = signature.arguments[0]
                        arg1 = self.signature.arguments[0]
                    except:
                        pass
            elif verbose:
                print('Ignored call:', call)

        def parse_inner(self, dt):
            codes = dt.findall('.//{http://www.w3.org/1999/xhtml}code')
            for code in codes:
                call = "".join(code.itertext()).strip("." + string.whitespace)
                m = re.match(r"""^
                    {}\s*
                    (?P<arguments>\(\s*.*?\s*\))\s*
                    $""".format(self.name), call, re.X)
                if m is not None:
                    signature = Signature(self, m.group('arguments'))
                    if signature.arguments is not None and signature != self.signature and not signature in self.signatures:
                        self.signatures.append(signature)
                    else:
                        print('NO INNER', call)
                else:
                    print('NO INNER', call)
           
    class Model:

        indent_ = '  '
        prefix_ = """/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */

/**
 * @fileoverview {{module}} model. Automatically generated by `python3 bin/helpers/modulebot.py {{--no-suffix}}{{module}}`
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Model.{{key}}')
goog.provide('eYo.Model.{{key}}.Item')

goog.require('eYo.Model')
goog.require('eYo.Model.Module')
goog.require('eYo.Model.Item')

eYo.Model.{{key}} = new eYo.Model.Module('{{key}}', '{{url}}')

/**
 * @constructor
 * @param {*} model 
 */
eYo.Model.{{key}}.Item = function (model) {
  eYo.Model.{{key}}.Item.superClass_.constructor.call(this, model)
}

var Item = eYo.Model.{{key}}.Item

goog.inherits(Item, eYo.Model.Item)

/**
 * module
 */
Item.prototype.module = eYo.Model.{{key}}

Object.defineProperties(
  Item.prototype,
  {
    url: {
      get() {
        return this.href
          ? this.module.url + this.href
          : this.module.url
      }
    }
  }
)
"""
        suffix_ = """

"""
        def __init__(self, path_root, key):
            self.key = key
            self.path_root = path_root
            self.path_in = path_root / 'build/helpers/{}.html'.format(key)
            self.path_out = path_root / 'src/lib/eyo/model/{}_model.js'.format(key)
            self.items_by_name = {}
            self.items = []
            self.categories = {}
            self.types = {}
            self.depth = 0
            self.url = "https://docs.python.org/" + version + "/library/{}.html".format(self.key)

        def process_dl(self, dl):
            if dl.attrib['class'] == 'docutils':
                # only embedded 'docutils' are used
                return
            global dls
            if dl in dls:
                dls.remove(dl)
            ancestor = parent_map[dl]
            while ancestor is not None:
                category = ancestor.get('id')
                if category is None:
                    ancestor = parent_map[ancestor]
                else:
                    break
            if category is None:
                return None
            item = Item(self, dl)
            if item is None or item.name is None:
                return None
            item.category = category
            if not category in self.categories:
                self.categories[category] = len(self.categories)
            item.category_index = self.categories[category]
            if item.type is not None:
                if not item.type in self.types:
                    self.types[item.type] = len(self.types)
                item.type_index = self.types[item.type]
            item.index = len(self.items)
            self.items.append(item)
            
            # now the inner dl's
            for dl in dl.findall('.//{http://www.w3.org/1999/xhtml}dl'):
                if dl in dls:
                    dls.remove(dl)
                if dl.attrib['class'] == 'method':
                    dls.append(dl)
                elif dl.attrib['class'] == 'docutils':
                    dts = dl.findall('.//{http://www.w3.org/1999/xhtml}dt')
                    for dt in dts:
                        item.parse_inner(dt)
                                


        def do_import(self):
            print('Importing', self.path_in)
            if not self.path_in.exists():
                print('Downloading', self.url)
                try:
                    urllib.request.urlretrieve (
                        self.url,
                        self.path_in
                    ) # this line needs certification
                except:
                    print('Failed')
                    self.url = "https://docs.python.org/" + version + "/tutorial/{}.html".format(self.key)
                    print('Downloading', self.url)
                    try:
                        urllib.request.urlretrieve (
                            self.url,
                            self.path_in
                        ) # this line needs certification
                    except:
                        print('Failed')
                        self.url = "https://docs.python.org/" + version + "/reference/{}.html".format(self.key)
                        print('Downloading', self.url)
                        urllib.request.urlretrieve (
                            self.url,
                            self.path_in
                        ) # this line needs certification
            with self.path_in.open('r', encoding='utf-8') as f:
                contents = f.read()
                f.close()
                f = None
                contents = contents.replace('&copy;', '©')
                root = ET.fromstring(contents)
                global parent_map
                parent_map = {c: p for p in root.iter() for c in p}
                # find all the dl candidats
                global dls
                what = "{http://www.w3.org/1999/xhtml}dl"
                dls = list(root.iter(what))
                while len(dls):
                    dl = dls[0]
                    del dls[0]
                    self.process_dl(dl)

            print('Imported {} symbols'.format(len(self.items)))

        def do_prepare(self):
            self.items.sort(key = lambda item: item.name)
            for i in range(len(self.items)):
                item = self.items[i]
                item.index = i
                self.items_by_name[item.name] = i
                for synonym in item.synonyms:
                    self.items_by_name[synonym] = i

        @property
        def indent(self):
            return self.depth * self.indent_

        def raw_print(self, *args, **kv_args):
            kv_args['sep'] = ''
            kv_args['end'] = ''
            kv_args['file'] = self.f
            print(*args, **kv_args)

        def do_print(self, *args, nl=False, s7r=None, **kv_args):
            """
            Use `s7r` keyword argument to print something before
            """
            self.raw_print(s7r if s7r is not None else "", "\n" if nl else "" , self.indent, *args, **kv_args)

        def up_print(self, *args, **kv_args):
            self.depth -= 1
            kv_args['nl'] = True
            self.do_print(*args, **kv_args)

        def down_print(self, *args, **kv_args):
            kv_args['nl'] = True
            self.do_print(*args, **kv_args)
            self.depth += 1

        def print_item(self, separator, item):

            def do_print_attribute(the_item, name, s7r=',', key=None):
                attr = getattr(the_item, name, None)
                if attr is None:
                    return
                if isinstance(attr, int) or isinstance(attr, float):
                    template = "{}: {}"
                else:
                    template = "{}: '{}'"
                    if isinstance(attr, str):
                        attr = attr.replace("'", r"\'")
                if key is None:
                    key = name
                if key is 'type_index':
                    key = 'type_'
                elif key.endswith('_index'):
                    key = key.replace('_index', '')
                if attr is math.inf:
                    attr = 'Infinity'
                self.do_print(template.format(key, attr), s7r=s7r, nl=True)

            self.down_print("new Item({", s7r=separator)
            do_print_attribute(item, 'name', s7r='')
            synonyms = item.synonyms
            if synonyms is not None and len(synonyms) > 0:
                self.down_print("synonyms: [", s7r=',')
                end = ''
                for synonym in synonyms:
                    self.do_print("'", synonym, "'", nl=True, s7r=end)
                    end = ','
                self.up_print("]")
            do_print_attribute(item, 'class_name', key='class')
            do_print_attribute(item, 'holder_name', key='holder')
            do_print_attribute(item, 'category_index')
            do_print_attribute(item, 'type_index')
            do_print_attribute(item, 'href')
            if item.returner is None:
                self.do_print("stmt: true", s7r=',', nl=True)

            def print_argument(arguments, sep="", end=""):
                self.down_print("arguments: [", s7r=sep)
                end = ""
                for argument in arguments:
                    self.down_print("{", s7r=end)
                    do_print_attribute(argument, 'name', s7r="")
                    if argument.default is not None:
                        do_print_attribute(argument, 'default', s7r=",")
                    if argument.optional:
                        self.do_print('optional: true', nl=True, s7r=",")
                    self.up_print("}")
                    end = ','
                self.up_print("]")

            def print_signature(signature, s7r = ","):
                if signature.star and verbose:
                    print('STAR', signature.name, signature.owner.name)
                do_print_attribute(signature, 'ary', s7r=s7r)
                if signature.ary > 0:
                    if signature.ary != signature.mandatory:
                        do_print_attribute(signature, 'mandatory')
                    print_argument(signature.arguments, sep=",")

            if len(item.signatures):
                self.down_print("signatures: [", s7r=',')
                end = ''
                for signature in item.signatures:
                    self.down_print("{", s7r=end)
                    print_signature(signature, s7r='')
                    self.up_print("}")
                    end = ','
                self.up_print("]")
            if item.signature is not None:
                print_signature(item.signature)

            self.up_print("})")                

        def do_export(self):
            print('Exporting', self.path_out)
            with io.StringIO() as self.f:
            # with path_out.open('w', encoding='utf-8') as f:
                self.raw_print(self.prefix_)
                self.down_print('eYo.Model.{{key}}.setData({')
                self.down_print('categories: [')
                separator = ''
                for category in list(x[0] for x in sorted(list((k,v) for k,v in self.categories.items()), key= lambda x: x[1])):
                    self.do_print("'{}'".format(category), s7r=separator, nl=True)
                    separator = ','
                del separator
                self.up_print('],')
                self.down_print('types: [')
                separator = ''
                for tipe in list(x[0] for x in sorted(list((k,v) for k,v in self.types.items()), key=lambda x: x[1])):
                    self.do_print("'{}'".format(tipe), s7r=separator, nl=True)
                    separator = ','
                self.up_print('],')
                self.down_print('items: [')
                separator = ''
                for item in self.items:
                    self.print_item(separator, item)
                    separator = ','
                self.up_print('],')
                self.down_print('by_name: {')
                separator = ''
                for (name, index) in self.items_by_name.items():
                    self.do_print("'{}': {}".format(name, index), s7r=separator, nl=True)
                    separator = ','
                self.up_print('},')
                self.down_print('by_category: {')
                separator = ''
                for category, index in self.categories.items():
                    ra = []
                    for item in self.items:
                        if item.category_index == index:
                            ra.append(str(item.index))
                    if len(ra) > 0:
                        self.do_print("{}: [{}]".format(index, ", ".join(ra)), s7r=separator, nl=True)
                        separator = ","
                self.up_print('},', nl=True)
                self.down_print('by_type: {')
                separator = ''
                for what, index in self.types.items():
                    ra = []
                    for item in self.items:
                        if item.type_index == index:
                            ra.append(str(item.index))
                    if len(ra) > 0:
                        self.do_print("{}: [{}]".format(index, ", ".join(ra)), s7r=separator, nl=True)
                        separator = ","
                self.up_print('}', nl=True)
                self.up_print('})', nl=True) # end of data
                self.do_print(self.suffix_, nl=True)
                self.do_print(
                    '// This file was generated by `python3 ./bin/helpers/modulebot.py {{--no-suffix}}{{module}}`' + ' on {}\n\n'.format(
                        datetime.datetime.utcnow()),
                    nl=True)
                contents = self.f.getvalue()
                self.f.close()
                self.f = None
                with self.path_out.open('w', encoding='utf-8') as f:
                    contents = contents.replace('{{module}}', module)
                    contents = contents.replace('{{key}}', self.key + suffix)
                    contents = contents.replace('{{url}}', str(self.url).replace('\'', '\\\''))
                    contents = contents.replace('{{--no-suffix}}', '--no-suffix ' if suffix == '' else '')
                    print(contents, file=f)
                    if verbose:
                        print(contents)

    model = Model(pathlib.Path(__file__).parent.parent.parent, module)
    model.do_import()
    model.do_prepare()
    model.do_export()

parser = argparse.ArgumentParser(description='Extract module model from online document.')
parser.add_argument('module', metavar='module', type=str, nargs='+',
                    help='a module name from which to extract a model.')
parser.add_argument('--no-suffix', dest='suffix', action='store_const',
                    const='', default='__module',
                    help='without the `__module` suffix')

parser.add_argument('--verbose', dest='verbose', action='store_const',
                    const=True, default=False,
                    help='Print the model')

args = parser.parse_args()

for module in args.module:
    do_one_module(module, suffix = args.suffix, verbose = args.verbose)
