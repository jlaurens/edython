import html.parser

class Parser(html.parser.HTMLParser):
    def __init__(self, *, convert_charrefs=True):
        """Initialize and reset this instance."""
        super(Parser, self).__init__(convert_charrefs = convert_charrefs)
        self.pre_pos_data = []
        self.did_start_pre = False
        self.did_start_h2 = False

    def handle_starttag(self, tag, attrs):
        if tag == 'pre':
            self.handle_endtag('h2')
            self.start_pos = self.getpos()
            self.pre_data = ''
            self.did_start_pre = True
        elif tag == 'h2':
            self.handle_endtag('pre')
            self.start_pos = self.getpos()
            self.pre_data = ''
            self.did_start_h2 = True

    def handle_endtag(self, tag):
        if tag == 'pre':
            if self.did_start_pre:
                self.pre_pos_data.append((self.pre_data, self.start_pos, self.getpos()))
            self.did_start_pre = False
            self.start_pos = None
        elif tag == 'h2':
            if self.did_start_h2:
                self.pre_pos_data.append(('category: '+self.pre_data, self.start_pos, self.getpos()))
            self.did_start_h2 = False
            self.start_pos = None

    def handle_data(self, data):
        """ Records data while in pre element or h2 """
        if self.did_start_pre or self.did_start_h2:
            self.pre_data += data

    def get_pre_pos_data(self):
        return self.pre_pos_data
