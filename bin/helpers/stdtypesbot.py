"""Parse the sdttypes documentation for function entries"""
import xml.etree.ElementTree as ET
import urllib.request
import pathlib
import re
import datetime
import io


class Filter:

    @staticmethod
    def do(txt):
        return re.match(r'^[^\.]*return', txt, re.S | re.I) is not None

    @staticmethod
    def do_name(txt):
        return txt.startswith('get') or txt in ['tuple', 'list', 'range', 'format', 'format_map', 'index', 'rindex',
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
    def ary(name, default):
        return default

class Argument:

    def __init__(self, owner, name):
        self.owner = owner
        self.name = name
        self.default = None
        self.optional = None

class Item:
    index = None
    category = None
    category_index = None
    type = None
    type_index = None
    name_ = None
    arguments = None
    keyword_arguments = None
    class_name = None
    returner = None
    description = None
    filter = None
    mandatory_ = None

    def __init__(self, owner, dl, filter=Filter):
        """Parses the dl dom element into an item
        One dd sub element but possibly many dt's"""
        self.owner = owner
        self.filter = filter
        self.keyword_arguments = {}
        #
        self.type = dl.get('class')
        # one dd for the description
        dd = dl.find("{http://www.w3.org/1999/xhtml}dd")
        if dd is not None:
            self.description = "".join(dd.itertext()).strip()
            if self.filter.do(self.description):
                self.returner = True
        dt = dl.find("{http://www.w3.org/1999/xhtml}dt[@id]")
        if dt is None:
            return
        self.name = dt.attrib['id'].split('.')[-1]
        for dt in dl.findall("{http://www.w3.org/1999/xhtml}dt"):
            self.parse_dt(dt)

    @property
    def name(self):
        return self.name_

    @name.setter
    def name(self, new_name):
        self.name_ = new_name
        if self.returner is None \
            and (self.type in ['class', 'attribute'] or self.type in [None, 'method', 'classmethod', 'staticmethod'] \
                and self.filter.do_name(new_name)):
            self.returner = True

    def get_argument(self, name):
        return self.keyword_arguments[name]

    def parse_dt(self, dt):
        element = dt.find("{http://www.w3.org/1999/xhtml}code[@class='descclass_name']")
        if element is not None:
            descclass_name = element.text.strip()
            if self.class_name is None:
                if len(descclass_name):
                    self.class_name = descclass_name
            elif len(descclass_name) and self.class_name != descclass_name:
                print('! discordant descclass_name', self.class_name, descclass_name)
        call = "".join(dt.itertext()).strip()
        m = re.match(r'^(?:\S+\s+)?'
                     r'(?:(?P<class>\S+)\.)?'
                     r'(?P<name>[^\s\.]+)'
                     r'(?P<arguments>\((?P<mandatory>[^[]*)(?:\[(?P<optional>.*)\])?(?P<rest>[^][]*)?\))', call)
        if m is None:
            # print('FAILED:', call, re.match(r'^(?:\S+\s+)?(\S+)\(([^\[]*)(\[.*)?\)', call))
            return
        class_name = m.group('class')
        name = m.group('name')
        if self.name is None:
            self.name = name
        if self.class_name is None:
            self.class_name = class_name
        # print('--->', m)
        args0 = m.group('arguments')
        args1 = m.group('mandatory')
        args2 = m.group('optional')
        args3 = m.group('rest')
        # print('===>', call, '/1:', args1, '/2a:', args2a, '/2b:', args2b, '/3:', args3, '/', sep='')
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
        # now the optional arguments
        if args2 is None:
            return
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

    def __init__(self, path_root, key):
        self.key = key
        self.path_root = path_root
        self.path_in = path_root / 'build/helpers/{}.html'.format(key)
        self.path_out = path_root / 'src/lib/eyo/core/{}_model.js'.format(key)
        self.items_by_name = {}
        self.items = []
        self.categories = {}
        self.types = {}
        self.depth = 0

    def do_import(self):
        if not self.path_in.exists():
            urllib.request.urlretrieve (
                "https://docs.python.org/3.6/library/{}.html".format(self.key),
                self.path_in
            ) # this line needs certification
        with self.path_in.open('r') as f:
            content = f.read()
            f.close()
            f = None
            content = content.replace('&copy;', '©')
            root = ET.fromstring(content)
            parent_map = {c: p for p in root.iter() for c in p}
            for dl in root.iter("{http://www.w3.org/1999/xhtml}dl"):
                ancestor = parent_map[dl]
                category = ancestor.get('id')
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

    @property
    def indent(self):
        return self.depth * self.indent_

    def raw_print(self, *args, **kv_args):
        kv_args['sep'] = ''
        kv_args['end'] = ''
        kv_args['file'] = self.f
        print(*args, **kv_args)

    def print(self, *args, nl=False, s7r=None, **kv_args):
        self.raw_print(s7r if s7r is not None else "", "\n" if nl else "" , self.indent, *args, **kv_args)

    def up_print(self, *args, **kv_args):
        self.depth -= 1
        kv_args['nl'] = True
        self.print(*args, **kv_args)

    def down_print(self, *args, **kv_args):
        kv_args['nl'] = True
        self.print(*args, **kv_args)
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
            if key.endswith('_index'):
                key = key.replace('_index', '')
            self.print(template.format(key, attr), s7r=s7r, nl=True)

        self.down_print("{", s7r=separator)
        do_print_attribute(item, 'name', s7r='')
        do_print_attribute(item, 'class_name', key='class')
        do_print_attribute(item, 'category_index')
        do_print_attribute(item, 'type_index')
        if item.returner is None:
            self.print("stmt: true", s7r=separator, nl=True)

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
                    self.print('optional: true', nl=True, s7r=",")
                self.up_print("}")
                end = ','
            self.up_print("]")
        self.up_print("}")

    def do_export(self):

        with io.StringIO() as self.f:
        # with path_out.open('w') as f:

            self.raw_print("""/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */

/**
 * @fileoverview {{key}} model. Automatically generated by `bin/helpers/{{key}}bot.py`
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Model.{{key}}')

goog.require('eYo.Model')
""")
            self.down_print('eYo.Model.{{key}}.data = {')
            self.down_print('categories: [')
            separator = ''
            for category in list(x[0] for x in sorted(list((k,v) for k,v in self.categories.items()), key= lambda x: x[1])):
                self.print("'{}'".format(category), s7r=separator, nl=True)
                separator = ','
            del separator
            self.up_print('],')
            self.down_print('types: [')
            separator = ''
            for tipe in list(x[0] for x in sorted(list((k,v) for k,v in self.types.items()), key=lambda x: x[1])):
                self.print("'{}'".format(tipe), s7r=separator, nl=True)
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
                self.print("'{}': {}".format(name, index), s7r=separator, nl=True)
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
                    self.print("{}: [{}]".format(index, ", ".join(ra)), s7r=separator, nl=True)
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
                    self.print("{}: [{}]".format(index, ", ".join(ra)), s7r=separator, nl=True)
                    separator = ","
            self.up_print('}', nl=True)
            self.up_print('}', nl=True)
            self.print("""
/**
 * Get the item with the given key
 * @param {!String|Number} key  The key or index of the item
 * @return {?Object} return the model object for that item, if any.
 */
eYo.Model.{{key}}.getItem = function (key) {
  if (!goog.isNumber(key)) {
    key = eYo.Model.{{key}}.data.by_name[key]
  }
  if (goog.isNumber(key)) {
    return eYo.Model.{{key}}.data.items[key]
  }
}

/**
 * Get the indices of the items for the given category
 * @param {!String} key  The name of the category
 * @return {!Array} the list of item indices with the given category (possibly void).
 */
eYo.Model.{{key}}.getItemsInCategory = function (category, type) {
  var ra = eYo.Model.{{key}}.data.by_category[category] || []
  if (goog.isString(type)) {
    type = eYo.Model.{{key}}.data.type.indexOf(type)
  }
  if (goog.isNumber(type) && type >= 0) {
    var ra2 = []
    for (var i = 0; i < ra.length ; i++ ) {
      var item = eYo.Model.{{key}}.getItem(i)
      if (item && item.type === type) {
        ra2.append(i)
      }
    }
    return ra2
  } else {
    return ra
  }
}
""", nl=True)
            self.print(
                '// This file was generated by `./bin/helpers/{{key}}bot.py`' + ' on {}\n\n'.format(datetime.datetime.utcnow()),
                nl=True)
            contents = self.f.getvalue()
            self.f.close()
            self.f = None
            with self.path_out.open('w') as f:
                print(contents.replace('{{key}}', self.key), file=f)

model = Model(pathlib.Path(__file__).parent.parent.parent, 'stdtypes')
model.do_import()
model.do_export()