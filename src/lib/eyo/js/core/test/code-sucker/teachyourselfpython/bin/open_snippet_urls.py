import webbrowser
import pathlib


root = pathlib.Path(__file__).absolute().parent.parent
in_path = root / 'snippets' / 'urls.txt'
urls = in_path.read_text().split('\n')
print(*urls, sep='\n')

n = 40
def opener(j):
    for i in range(j, j+n):
        try:
            print("opening", urls[i])
            webbrowser.open_new(urls[i])
        except: pass
# open Safari, create a new window
# opener(0)
# when all the pages hae been loaded, launch get_snippet applescript
# comment the `opener` line above
# close the window in safari and open a new one
# uncomment the next line and run that script once again
# opener(n * 1)
# and so on
# opener(n * 2)
# opener(n * 3)
# opener(n * 4)
# opener(n * 5)
# opener(n * 6)
opener(n * 7)


