import webbrowser
import pathlib


parent = pathlib.Path(__file__).absolute().parent.parent
in_path = parent / 'snippets' / 'urls.txt'
urls = in_path.read_text().split('\n')
print(*urls, sep='\n')

try:
    for i in range(0,len(urls),5):
        for j in range(5):
            webbrowser.open_new(urls[i+j])
        break
except: pass

