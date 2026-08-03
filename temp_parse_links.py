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
print('class_pages count', len(class_pages))
links={}
for p in class_pages:
    txt=p.read_text(encoding='utf-8')
    items=re.findall(r'<li>\s*<a[^>]*href="([^"]+)"[^>]*>(.*?)</a>\s*</li>', txt, re.S)
    if items:
        links[p.name]=[(href, text.strip()) for href,text in items]
        print(p.name, len(items))
    else:
        print('no items', p.name)
for name, items in links.items():
    print('\n', name, [t for _,t in items])
