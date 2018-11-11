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
        
    class Filter:

        @staticmethod
        def do_module(txt):
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
            return txt in ['bgcolor', 'tracer', 'mode', 'colormode']

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
            return default

    class Argument:

        def __init__(self, owner, name):
            self.owner = owner
            self.name = name
            self.default = None
            self.optional = None

    class Item:
        """An Item represents either a function, a class, a method, a class method or an attribute.
        Each corresponds to a type."""
        index = None
        category = None
        category_index = None
        type = None
        type_index = None
        name_ = None
        arguments = None
        keyword_arguments = None
        class_name = None
        holder_name = None
        returner = None
        description = None
        filter = None
        mandatory_ = None
        star = False
        href = None
        synonyms = None

        def __init__(self, owner, dl, filter=Filter):
            """Parses the dl dom element into an item
            One dd sub element but possibly many dt's"""
            self.owner = owner
            self.filter = filter
            self.keyword_arguments = {}
            self.synonyms = []
            #
            # one dd for the description
            dd = dl.find("{http://www.w3.org/1999/xhtml}dd")
            if dd is not None:
                self.description = "".join(dd.itertext()).strip()
                if self.filter.do_module(self.description):
                    self.returner = True
            dt = dl.find("{http://www.w3.org/1999/xhtml}dt[@id]")
            if dt is not None:
                components = dt.attrib['id'].split('.')
                self.name = components[-1]
                self.class_name = '.'.join(components[0:-1:1])
                self.type = self.filter.do_type_module(dl.get('class'), self.name)
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
                        and self.filter.do_name_module(new_name)):
                self.returner = True

        def get_argument(self, name):
            return self.keyword_arguments[name]

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
            element = dt.find("{http://www.w3.org/1999/xhtml}code[@class='descclass_name']")
            if element is None:
                # thing may have changed in the documentation
                element = dt.find("{http://www.w3.org/1999/xhtml}code[@class='descclassname']")
            if element is not None:
                descclass_name = element.text.strip("." + string.whitespace)
                if self.class_name is None:
                    if len(descclass_name):
                        self.class_name = descclass_name
                elif len(descclass_name) and self.class_name != descclass_name:
                    self.holder_name = self.class_name
                    self.class_name = descclass_name
            # permalink
            element = dt.find("{http://www.w3.org/1999/xhtml}a[@class='headerlink']")
            if element is not None:
                self.href = element.attrib['href']
            call = "".join(dt.itertext()).strip()
            m = re.match(r"""^(?:\S+\s+)?
            (?:
                (?P<class>\S+)\.)?
                (?P<name>[^\s\.]+)
                (?P<arguments>\(
                    (?P<mandatory>[^[]*)
                    (?:\[(?P<optional>.*)\])?
                    (?P<rest>[^][]*)?
                \))
            """, call, re.X)
            if m is None:
                element = dt.find("{http://www.w3.org/1999/xhtml}code[@class='descname']")
                if element is None:
                    if verbose:
                        print('Ignored:', call, ET.tostring(dt, encoding='utf8'), sep = '\n')
                    return
                self.name = element.text
                return
            class_name = m.group('class')
            name = m.group('name')
            if self.name is None:
                self.name = name
            elif self.name != name:
                self.synonyms.append(name)
            if self.class_name is None:
                self.class_name = class_name
            # print(self.name, '--->', m)
            args0 = m.group('arguments')
            args1 = m.group('mandatory')
            args2 = m.group('optional')
            args3 = m.group('rest')
            # print(self.name, '===>', call, '/1:', args1, '/2:', args2, '/3:', args3, '/', args0, sep='')
            if args0 is None:
                # there are no arguments
                return
            # take care of the mandatory argument
            arguments = []
            for arg in re.split(r'\s*,\s*', args1):
                m = re.match('(?P<name>[^=\s]+)(?:\s*=\s*(?P<default>[^=\s]+))?', arg)
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

        @property
        def ary(self):
            if self.arguments is None:
                return None
            if self.star:
                return math.inf
            return self.filter.ary(self.name, len(self.arguments))

        @property
        def mandatory(self):
            if self.arguments is None:
                return None
            if self.mandatory_ is None:
                self.mandatory_ = 0
                for argument in self.arguments:
                    if argument.default is None and argument.optional is not True:
                        self.mandatory_ += 1
            return self.mandatory_

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
goog.require('eYo.Model.Item')
goog.require('eYo.Protocol.Item')

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
 * model
 */
Item.prototype.model = eYo.Model.{{key}}

Item.prototype.model.url = '{{url}}'

Object.defineProperties(
  Item.prototype,
  {
    url: {
      get() {
        return this.href
          ? this.model.url + this.href
          : this.model.url
      }
    }
  }
)
"""
        suffix_ = """
// Add the `Item` methods.
eYo.Do.addProtocol(eYo.Model.{{key}}, 'Item', eYo.Model.{{key}})

// register the types
eYo.Model.Item.registerTypes(eYo.Model.{{key}}.data.types)

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
                for dl in root.iter("{http://www.w3.org/1999/xhtml}dl"):
                    ancestor = parent_map[dl]
                    while ancestor is not None:
                        category = ancestor.get('id')
                        if category is None:
                            ancestor = parent_map[ancestor]
                        else:
                            break
                    if category is None:
                        continue
                    item = Item(self, dl)
                    if item is None or item.name is None:
                        continue
                    item.category = category
                    if not category in self.categories:
                        self.categories[category] = len(self.categories)
                    item.category_index = self.categories[category]
                    if not item.type in self.types:
                        self.types[item.type] = len(self.types)
                    item.index = len(self.items)
                    self.items.append(item)
                    item.type_index = self.types[item.type]
                    self.items_by_name[item.name] = item.index
                    for synonym in item.synonyms:
                        self.items_by_name[synonym] = item.index
                        
            print('Imported {} symbols'.format(len(self.items)))

        @property
        def indent(self):
            return self.depth * self.indent_

        def raw_print(self, *args, **kv_args):
            kv_args['sep'] = ''
            kv_args['end'] = ''
            kv_args['file'] = self.f
            print(*args, **kv_args)

        def do_print(self, *args, nl=False, s7r=None, **kv_args):
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

            arguments = item.arguments
            if arguments is not None and len(arguments) > 0:
                do_print_attribute(item, 'ary')
                if item.ary != item.mandatory:
                    do_print_attribute(item, 'mandatory')
                self.down_print("arguments: [", s7r=',')
                end = ''
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
            self.up_print("})")

        def do_export(self):
            print('Exporting', self.path_out)
            with io.StringIO() as self.f:
            # with path_out.open('w', encoding='utf-8') as f:

                self.raw_print(self.prefix_)
                self.down_print('eYo.Model.{{key}}.data = {')
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
                self.up_print('}', nl=True)
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
