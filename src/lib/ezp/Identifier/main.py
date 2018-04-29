import pathlib, re

path = pathlib.Path(__file__).parent / 'data.Unicode.txt'

class BadLineError(Exception):
    """Badly formatted line."""
    pass

class UnicodeChar:
    re_line = re.compile(r'^(?P<code>\S+?);(?P<name>.+?);(?P<category>\S\S);.*')
    def __init__(self, l):
        m = self.re_line.match(l)
        if not m:
            raise BadLineError('My error!')
        self.code_str = m.group('code')
        self.code = int(self.code_str,16)
        self.name = m.group('name')
        self.category = m.group('category')
        self.refused = self.category.startswith('L') and not self.name.startswith('LATIN') and not self.name.startswith('MATH')

class DB:
    def __init__(self, path):
        self.chars = []
        with path.open() as f:
            for x in [x.strip() for x in f.readlines()]:
                try:
                    U = UnicodeChar(x)
                    self.chars.append(U)
                except BadLineError:
                    pass

    def __iter__(self):
        for x in self.chars:
            yield x

    def by_category(self, category):
        for x in self.chars:
            if x.category == category:
                yield x

    def by_categories(self, *args):
        for x in self.chars:
            if x.category in args:
                yield x


db = DB(path)
# Lu, Ll, Lt, Lm, Lo, Nl, the underscore

def classForCategories(*args):
    Xs = sorted([x for x in db.by_categories(*args) if not
                 x.refused], key=lambda x: x.code)
    first = previous = None
    ra = []
    for x in Xs:
        if x.code > 0xFFFF:
            break
        elif first is None:
            first = previous = x
        elif previous.code + 1 < x.code:
            if first == previous:
                ra.append(r'\u'+first.code_str)
            else:
                ra.append(r'\u'+first.code_str+'-'+r'\u'+previous.code_str)
            first = previous = x
        else:
            previous = x
    if first is not None:
        if first == previous:
            ra.append(r'\u'+first.code_str)
        else:
            ra.append(r'\u'+first.code_str+'-'+r'\u'+previous.code_str)
    print('['+''.join(ra)+']')

classForCategories('Lu', 'Ll', 'Lt', 'Lm', 'Lo', 'Nl')
classForCategories('Lu', 'Ll', 'Lt', 'Lm', 'Lo', 'Nl', 'Mn', 'Mc', 'Nd', 'Pc')
