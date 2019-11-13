from urllib.request import urlopen
from urllib.parse import urlparse
from pathlib import Path
import re

bdd_path = Path.home() / 'Downloads/bdd'
bdd_path.mkdir(exist_ok=True)

def last_component(url):
  return Path(urlparse(url).path).name

def bdd_path_from_url(url):
  name = last_component(url)
  return bdd_path / name

def download_to_bdd(url):
  dest = bdd_path_from_url(url)
  if dest.exists():
    print(f'Already downloaded: {url}')
    return
  try:
    print(f'D/L: {url} -> {dest}')
    with urlopen(url) as f:
      content = f.read()
      dest.write_bytes(content)
      print('Done')
  except:
    print('Aborted')

def read_text_from_bdd(url):
  download_to_bdd(url)
  path = bdd_path_from_url(url)
  return path.read_text()

def read_images_from_train(url, n):
  print(f"D/L {n} images from {url}")
  txt = read_text_from_bdd(url)
  for url in re.findall('https://.*?jpg', txt):
    download_to_bdd(url)
    if n>0:
      n -= 1
    else:
      break

train0 = 'https://storage.googleapis.com/cvdf-datasets/oid/open-images-dataset-train0.tsv'
"""
Voir
https://github.com/cvdfoundation/open-images-dataset#download-full-dataset-with-google-storage-transfer
Pour les autres fichiers 'train'
"""

read_images_from_train(train0, 10)


