import pathlib

root = pathlib.Path(__file__).absolute().parent.parent
snippets = root / 'snippets'
src_lib_eyo_test = root.parent.parent
test_html = src_lib_eyo_test / (root.name + '.test.html')

header = []
footer = []
current = header
for line in test_html.read_text().splitlines():
    if current is not None:
        current.append(line)
    if 'DYNAMIC SOURCE TESTS START' in line:
        current = None
    elif 'DYNAMIC SOURCE TESTS END' in line:
        current = footer
        current.append(line)

header = '\n'.join(header)
footer = '\n'.join(footer)

content = [header]

dir_list = [x for x in snippets.iterdir() if x.is_dir()]

for d in snippets.iterdir():
    if d.is_dir():
        content.append(
f"""describe(`{d.name}`, function () {{
  this.timeout(15000)"""
)
        for dd in d.iterdir():
            if dd.suffix == ".py":
                py = dd.read_text()
                content.append(
f"""
    it(`{dd.name}`, function () {{
        eYo.Test.source(`{py}`)
    }})
""")
                break
        content.append(
    f"""}})"""
)
        break

content.append(footer)

test_html.write_text('\n'.join(content))