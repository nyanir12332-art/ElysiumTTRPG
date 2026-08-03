import re
from pathlib import Path
root = Path('d:/Files/Git/SOTS/ElysiumTTRPG/classes')
class_pages=[]
for p in sorted(root.glob('*.html')):
    if p.name == 'classes.html':
        continue
    txt = p.read_text(encoding='utf-8')
    if '<li><a href="' in txt:
        class_pages.append(p)
seq=[]
for p in class_pages:
    txt=p.read_text(encoding='utf-8')
    items=re.findall(r'<li>\s*<a[^>]*href="([^"]+)"[^>]*>(.*?)</a>\s*</li>', txt, re.S)
    if items:
        for href,title in items:
            seq.append((href.strip(), title.strip(), p.name))
print('total sequence entries', len(seq))
for entry in seq[:10]:
    print(entry)
for entry in seq[-10:]:
    print(entry)
