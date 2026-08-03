import re
from pathlib import Path
root = Path('d:/Files/Git/SOTS/ElysiumTTRPG/classes')
classes=[]
for p in sorted(root.glob('*.html')):
    if p.name == 'classes.html':
        continue
    txt = p.read_text(encoding='utf-8')
    if '<li><a href="' in txt:
        classes.append(p)
links=[]
for p in classes:
    txt=p.read_text(encoding='utf-8')
    items=re.findall(r'<li>\s*<a[^>]*href="([^"]+)"[^>]*>(.*?)</a>\s*</li>', txt, re.S)
    links.append([(href.strip(), text.strip()) for href,text in items])
nav_map={}
for seq in links:
    for i,(href,title) in enumerate(seq):
        prev = seq[i-1] if i>0 else None
        nxt = seq[i+1] if i < len(seq)-1 else None
        nav_map[href] = (prev, nxt)

for href,(prev,nxt) in nav_map.items():
    page = root / href
    if not page.exists():
        print('missing', href)
        continue
    txt = page.read_text(encoding='utf-8')
    # remove any existing page-nav block
    txt = re.sub(r'\s*<div class="page-nav">.*?</div>\s*', '\n', txt, flags=re.S)
    if prev or nxt:
        nav = ['        <div class="page-nav">']
        if prev:
            href_prev, title_prev = prev
            nav.append('          <div class="page-nav__item page-nav__prev"><a class="page-nav__link" href="%s"><< %s</a></div>' % (href_prev, title_prev))
        if nxt:
            href_next, title_next = nxt
            nav.append('          <div class="page-nav__item page-nav__next"><a class="page-nav__link" href="%s">%s >></a></div>' % (href_next, title_next))
        nav.append('        </div>')
        nav_html = '\n'.join(nav) + '\n'
        txt = txt.replace('<div class="screen">', '<div class="screen">\n' + nav_html, 1)
    page.write_text(txt, encoding='utf-8')
    print('updated', href)
