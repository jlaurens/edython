import urllib.request

def source_of_url(url, decoding = "utf8"):
    page = urllib.request.urlopen(url).read()
    page = page.decode(decoding)  # this may not be utf8
    return page

page = source_of_url("https://www.pythonforbeginners.com/code-snippets-source-code/python-code-snippets-2")

from html.parser import HTMLParser
import re

re_link = re.compile(r"^https://www\.pythonforbeginners\.com/(?P<path>\S*)$")

class MyHTMLParser(HTMLParser):

    def handle_starttag(self, tag, attrs):
        try:
            if self.my_urls_ == None: pass
        except:
            self.my_urls_ = []
        if tag == 'a':
            for attr in attrs:
                if attr[0] == 'href':
                    m = re_link.match(attr[1])
                    if m:
                        self.my_urls_.append(m.group(0))

    @property
    def my_urls(self):
        return self.my_urls_

parser = MyHTMLParser()


parser.feed(page)

print(*parser.my_urls, sep='\n')

import pathlib

parent = pathlib.Path(__file__).absolute().parent.parent
out_path = parent / 'snippets' / 'urls.txt'
out_path.write_text('\n'.join(parser.my_urls))

