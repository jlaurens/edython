"""Parse the {{module}} documentation for function entries"""
import xml.etree.ElementTree as ET
import urllib.request
import pathlib
import re
import datetime
import argparse
import io

parser = argparse.ArgumentParser(description='Extract module model from online document.')
parser.add_argument('module', metavar='module', type=str, nargs='+',
                    help='a module name from which to extract a model.')

args = parser.parse_args()

module = args.module[0]

class Filter:

    @staticmethod
    def do_module(txt):
        return txt.startswith('Return')

    @staticmethod
    def do_name_module(txt):
        return txt.startswith('get')

    @staticmethod
    def do_random(txt):
        m = re.match(r'^(?:\w\S+\w\s+){1,2}\s*distribution.', txt)
        return m is not None

    @staticmethod
    def do_name_random(txt):
        m = re.match(r'^(?:\S+)variate$', txt)
        return m is not None

path_root = pathlib.Path(__file__).parent.parent.parent
path_in = path_root / 'build/helpers/{}.html'.format(module)
path_out = path_root / 'src/lib/eyo/core/{}_model.js'.format(module)

by_name = {}
items = []
categories = {}
types = {}

def export_model():

    depth = 0
    indent = '  '

    def do_head_print(*args):
        nonlocal depth, indent
        print(depth * indent, *args, sep='', end='', file=f)

    def do_print(*args):
        nonlocal depth, indent
        print("\n", depth * indent, *args, sep='', end='', file=f)


    def do_print_sep(*args, s7r=','):
        nonlocal depth, indent
        print(s7r, "\n", depth * indent, *args, sep='', end='', file=f)

    def do_print_item(separator, item):

        def do_print_item_attribute(key):
            do_print_sep("{}: '{}'".format(key, item[key]))

        def do_print_item_attribute_n(key):
            do_print_sep("{}: {}".format(key, item[key]))

        def do_print_argument_attribute(key, s7r=','):
            attr = argument[key]
            if attr is None:
                return
            if isinstance(attr, int) or isinstance(attr, float):
                template = "{}: {}"
            else:
                template = "{}: '{}'"
                if isinstance(attr, str):
                    attr = attr.replace("'", r"\'")
            if key.endswith('_index'):
                key = key.replace('_index', '')
            do_print_sep(template.format(key, attr), s7r=s7r)

        do_print_sep("{", s7r=separator)
        nonlocal depth
        depth += 1
        do_print("names: ['{}']".format("', '".join(item['names'])))
        do_print_item_attribute_n('category')
        if 'description' in item:
            do_print_item_attribute('description')
        do_print_item_attribute_n('type')

        if not 'returner' in item:
            do_print_sep("stmt: true")

        arguments = item['arguments']
        if arguments is not None:
            if len(arguments):
                do_print_item_attribute_n('ary')
                if item['mandatory'] != item['ary']:
                    do_print_item_attribute_n('mandatory')
                do_print_sep("arguments: [")
                end = ''
                depth += 1
                for argument in arguments:
                    do_print_sep("{", s7r=end)
                    depth += 1
                    do_print_argument_attribute('name', s7r="")
                    if 'default' in argument:
                        do_print_argument_attribute('default')
                    if 'description' in argument:
                        do_print_argument_attribute('description')
                    depth -= 1
                    do_print("}")
                    end = ','
                depth -= 1
                do_print("]")
        depth -= 1
        do_print("}")

    with io.StringIO() as f:
    # with path_out.open('w') as f:

        do_head_print("""/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */

/**
 * @fileoverview {{module}} model. Automatically generated by `bin/helpers/{{module}}bot.py {{module}}`
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Model.{{module}}__module')

goog.require('eYo.Model')
""")
        do_print('eYo.Model.{{module}}__module.data = {')
        depth += 1
        do_print("prefix: '{{module}}.',")
        do_print('categories: [')
        depth += 1
        separator = ''
        for category in list(x[0] for x in sorted(list((k,v) for k,v in categories.items()), key= lambda x: x[1])):
            do_print_sep("'{}'".format(category), s7r=separator)
            separator = ','
        del separator
        depth -= 1
        do_print('],')
        do_print('types: [')
        depth += 1
        separator = ''
        for tpe in list(x[0] for x in sorted(list((k,v) for k,v in types.items()), key= lambda x: x[1])):
            do_print_sep("'{}'".format(tpe), s7r=separator)
            separator = ','
        depth -= 1
        do_print('],')
        do_print('items: [')
        depth += 1
        separator = ''
        for item in items:
            do_print_item(separator, item)
            separator = ','
        depth -= 1
        do_print('],')
        do_print('by_name: {')
        depth += 1
        separator = ''
        for (name, index) in by_name.items():
            do_print_sep("'{}': {}".format(name, index), s7r = separator)
            separator = ','
        depth -= 1
        do_print('},')
        do_print('by_category: {')
        depth += 1
        separator = ''
        for category, index in categories.items():
            ra = []
            for item in items:
                if item['category'] == index:
                    ra.append(str(item['index']))
            if len(ra) > 0:
                do_print_sep("{}: [{}]".format(index, ", ".join(ra)), s7r=separator)
                separator = ","
        depth -= 1
        do_print('},')
        do_print('by_type: {')
        depth += 1
        separator = ''
        for what, index in types.items():
            ra = []
            for item in items:
                if item['type'] == index:
                    ra.append(str(item['index']))
            if len(ra) > 0:
                do_print_sep("{}: [{}]".format(index, ", ".join(ra)), s7r=separator)
                separator = ","
        depth -= 1
        do_print('}')
        depth -= 1
        do_print('}')
        do_print("""
/**
 * Get the item with the given key
 * @param {!String|Number} key  The key or index of the item
 * @return {?Object} return the model object for that item, if any.
 */
eYo.Model.{{module}}__module.getItem = function (key) {
  if (!goog.isNumber(key)) {
    key = eYo.Model.{{module}}__module.data.by_name[key]
  }
  if (goog.isNumber(key)) {
    return eYo.Model.{{module}}__module.data.items[key]
  }
}

/**
 * Get the indices of the items for the given category
 * @param {!String} key  The name of the category
 * @return {!Array} the list of item indices with the given category (possibly void).
 */
eYo.Model.{{module}}__module.getItemsInCategory = function (category, type) {
  var ra = eYo.Model.{{module}}__module.data.by_category[category] || []
  if (goog.isString(type)) {
    type = eYo.Model.{{module}}__module.data.type.indexOf(type)
  }
  if (goog.isNumber(type) && type >= 0) {
    var ra2 = []
    for (var i = 0; i < ra.length ; i++ ) {
      var item = eYo.Model.{{module}}__module.getItem(i)
      if (item && item.type === type) {
        ra2.append(i)
      }
    }
    return ra2
  } else {
    return ra
  }
}
""")
        do_print(
            '// This file was generated by `./bin/helpers/{{module}}bot.py` on {}\n\n'.format(datetime.datetime.utcnow()))
        contents = f.getvalue()
        f.close()
        contents = contents.replace("{{module}}", module)
        with path_out.open('w') as f:
            print(contents, file = f)

def import_model():
    if not path_in.exists():
        urllib.request.urlretrieve ("https://docs.python.org/3.6/library/" + module + ".html", path_in) # this line needs certification
    with path_in.open('r') as f:
        content = f.read()
        content = content.replace('&copy;', '©')
        root = ET.fromstring(content)
        parent_map = {c: p for p in root.iter() for c in p}
        # start with all the functions
        for dl in root.iter("{http://www.w3.org/1999/xhtml}dl"):
            tpe = dl.get('class')
            if not tpe:
                continue
            returner = False
            descriptions_by_name = {}
            dd = dl.find("{http://www.w3.org/1999/xhtml}dd")
            if dd:
                txt = "".join(dd.itertext())
                if not returner:
                    if tpe == 'function':
                        if Filter.do_module(txt):
                            returner = True
                        else:
                            try:
                                f = getattr(Filter, 'do_' + module)
                                if f is not None:
                                    returner = f(txt)
                            except:
                                pass
                    elif tpe == 'data':
                        returner = True
                descriptions = []
                td = dd.find(".//{http://www.w3.org/1999/xhtml}td")
                if td:
                    ul = td.find(".//{http://www.w3.org/1999/xhtml}ul")
                    if ul:
                        for li in ul.findall(".//{http://www.w3.org/1999/xhtml}li"):
                            descriptions.append("".join(li.itertext()))
                    else:
                        descriptions.append("".join(td.itertext()))
                for description in descriptions:
                    m = re.match(r'^(.*?)\s*[-–]\s*(.*?)$', description, re.DOTALL)
                    if m:
                        descriptions_by_name[m.group(1)] = m.group(2)
            ancestor = parent_map[dl]
            category = ancestor.get('id')
            names = []
            arguments = None
            for dt in dl.findall("{http://www.w3.org/1999/xhtml}dt"):
                element = dt.find("{http://www.w3.org/1999/xhtml}code[@class='descclassname']")
                if element is None or element.text != module + '.':
                    continue
                element = dt.find("{http://www.w3.org/1999/xhtml}code[@class='descname']")
                if element is None:
                    continue
                name = element.text
                if name is None:
                    continue
                names.append(name)
                if not returner and tpe == 'function':
                    try:
                        f = getattr(Filter, 'do_name_' + module)
                        if not f is None:
                            returner = f(name)
                    except:
                        pass
                element = dt.find("{http://www.w3.org/1999/xhtml}span[@class='sig-paren']")
                if element is None:
                    # this is a constant or a caller
                    continue
                if not arguments:
                    arguments = []
                    ary = 0
                    mandatory = 0
                    for ems in dt.findall("{http://www.w3.org/1999/xhtml}em"):
                        for em in re.split(r'\s*,\s*', ems.text):
                            ary += 1
                            m = re.match('(?P<name>[^=\s]+)\s*=\s*(?P<default>[^=\s]+)', em)
                            argument = {}
                            if m:
                                argument['name'] = m.group('name').strip()
                                default = m.group('default').strip()
                                try:
                                    n = int(default)
                                    default = n
                                except:
                                    try:
                                        x = float(default)
                                        default = x
                                    except:
                                        pass
                                argument['default'] = default
                            else:
                                mandatory += 1
                                argument['name'] = em.strip()
                            key = argument['name']
                            if key in descriptions_by_name:
                                argument['description'] = descriptions_by_name[key].\
                                    replace('\n', ' ').replace("'", "\\'").strip()
                            arguments.append(argument)

            if len(names):
                if not category in categories:
                    categories[category] = len(categories)
                if not tpe in types:
                    types[tpe] = len(types)
                names = sorted(names, key=lambda x: (x.find('_') < 0, -len(x)))
                item = {
                    'index': len(items),
                    'names': names,
                    'category': categories[category],
                    'type': types[tpe],
                    'arguments': arguments,
                    'ary': ary,
                    'mandatory': mandatory
                }
                if returner:
                    item['returner'] = returner
                for name in names:
                    by_name[name] = item['index']
                items.append(item)

import_model()
export_model()
