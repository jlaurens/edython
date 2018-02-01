import html.parser

class Parser(html.parser.HTMLParser):
    def __init__(self, *, convert_charrefs=True):
        """Initialize and reset this instance."""
        super(Parser, self).__init__(convert_charrefs = convert_charrefs)
        self.pre_pos_data = []
        self.did_start_pre = False

    def handle_starttag(self, tag, attrs):
        if tag == 'pre':
            self.start_pos = self.getpos()
            self.pre_data = ''
            self.did_start_pre = True

    def handle_endtag(self, tag):
        if tag == 'pre':
            if self.did_start_pre:
                self.pre_pos_data.append((self.pre_data, self.start_pos, self.getpos()))
            self.did_start_pre = True
            self.start_pos = None

    def handle_data(self, data):
        """ Records data while in pre element """
        if self.did_start_pre:
            self.pre_data += data

    def get_pre_pos_data(self):
        return self.pre_pos_data
