(function(){
  // Create one shared search control for every page with a site header.
  function createSearchUI(){
    const mount = document.querySelector('header');
    if(!mount) return;

    const container = document.createElement('div');
    container.className = 'site-search';
    container.innerHTML = `
      <input type="search" placeholder="Search site..." aria-label="Search site" autocomplete="off" autocorrect="off" spellcheck="false" />
      <button type="button" aria-label="Search">Search</button>
    `;

    document.body.appendChild(container);

    const input = container.querySelector('input[type="search"]');
    const button = container.querySelector('button');

    const resultsEl = document.createElement('div');
    resultsEl.className = 'site-search__results';
    resultsEl.style.display = 'none';
    const resultsContent = document.createElement('div');
    resultsContent.className = 'site-search__results-content';
    const scrollbar = document.createElement('div');
    scrollbar.className = 'site-search__scrollbar';
    scrollbar.innerHTML = '<div class="site-search__scrollbar-button up">^</div><div class="site-search__scrollbar-thumb"></div><div class="site-search__scrollbar-button down">v</div>';
    resultsEl.append(resultsContent, scrollbar);
    document.body.appendChild(resultsEl);

    const thumb = scrollbar.querySelector('.site-search__scrollbar-thumb');
    const up = scrollbar.querySelector('.up');
    const down = scrollbar.querySelector('.down');

    const updateResultsScrollbar = () => {
      const maxScroll = resultsContent.scrollHeight - resultsContent.clientHeight;
      if (maxScroll <= 0) {
        scrollbar.style.display = 'none';
        return;
      }
      scrollbar.style.display = 'block';
      const trackHeight = scrollbar.clientHeight - 32;
      const thumbHeight = Math.max(42, trackHeight * (resultsContent.clientHeight / resultsContent.scrollHeight));
      const maxThumbTop = trackHeight - thumbHeight;
      thumb.style.height = `${thumbHeight}px`;
      thumb.style.transform = `translateY(${(resultsContent.scrollTop / maxScroll) * maxThumbTop}px)`;
    };

    const scrollResultsBy = (amount) => resultsContent.scrollBy({ top: amount, behavior: 'smooth' });
    up.addEventListener('click', () => scrollResultsBy(-resultsContent.clientHeight * 0.85));
    down.addEventListener('click', () => scrollResultsBy(resultsContent.clientHeight * 0.85));
    resultsContent.addEventListener('scroll', updateResultsScrollbar, { passive: true });
    window.addEventListener('resize', updateResultsScrollbar);
    thumb.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      thumb.classList.add('dragging');
      const startY = event.clientY;
      const startScroll = resultsContent.scrollTop;
      const onMove = (moveEvent) => {
        const maxScroll = resultsContent.scrollHeight - resultsContent.clientHeight;
        const trackHeight = scrollbar.clientHeight - 32;
        const thumbHeight = thumb.offsetHeight;
        const maxThumbTop = trackHeight - thumbHeight;
        resultsContent.scrollTop = startScroll + (moveEvent.clientY - startY) * (maxScroll / maxThumbTop);
      };
      const onUp = () => {
        thumb.classList.remove('dragging');
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    });

    button.addEventListener('click', () => doSearch(input.value.trim(), resultsEl));
    input.addEventListener('input', () => hideResults(resultsEl));
    input.addEventListener('keydown', (e) => {
      if(e.key === 'Enter') {
        e.preventDefault();
        doSearch(input.value.trim(), resultsEl);
      }
      if(e.key === 'Escape') {
        input.value = '';
        hideResults(resultsEl);
      }
    });

    // Hide results when clicking outside
    document.addEventListener('click', (e) => {
      if(!container.contains(e.target) && !resultsEl.contains(e.target)) {
        hideResults(resultsEl);
      }
    });

    // Pre-cache index listing by fetching a prebuilt search-index.json (fast) or fall back to parsing ../index.html
    let indexLinks = null;
    function convertPathToHref(targetPath, baseHref = document.baseURI){
      const target = targetPath.replace(/\\/g, '/').replace(/^\//, '');
      return new URL(target, new URL(baseHref, document.baseURI)).href;
    }

    function ensureIndex(){
      if(indexLinks) return Promise.resolve(indexLinks);
      const candidates = ['/search-index.json','../search-index.json','../../search-index.json','./search-index.json','search-index.json'];
      function tryFetch(i){
        if(i>=candidates.length) return fallbackIndex();
        const indexUrl = new URL(candidates[i], document.baseURI).href;
        return fetch(indexUrl, {cache:'no-store'}).then(r=>{
          if(!r.ok) throw new Error('no');
          return r.json();
        }).then(json => {
          indexLinks = json.map(it=>({title: it.title, href: convertPathToHref(it.path, indexUrl)}));
          const itemPage = indexLinks.find(page => /\/items\/index\.html$/i.test(new URL(page.href).pathname)) || {
            title: 'Items - Fable',
            href: new URL('items/index.html', indexUrl).href
          };

          if(!indexLinks.some(page => page.href === itemPage.href)) indexLinks.push(itemPage);

          return fetch(itemPage.href, {cache:'no-store'}).then(r=>r.text()).then(html=>{
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const itemNames = [
              ...Array.from(doc.querySelectorAll('.item-card h3')).map(name => name.textContent.trim()),
              ...Array.from(doc.querySelectorAll('table tbody tr'))
                .filter(row => !row.classList.contains('apparel-subcategory'))
                .map(row => row.querySelector('td')?.textContent.trim())
                .filter(name => name)
            ];
            const uniqueItemNames = [...new Map(itemNames.map(itemName => [itemName.toLowerCase(), itemName])).values()];
            const itemEntries = uniqueItemNames.map(itemName => ({
              title: `Item: ${itemName} - Fable`,
              href: `${itemPage.href}?item=${encodeURIComponent(itemName)}`
            }));
            indexLinks = indexLinks.concat(itemEntries);
            return indexLinks;
          }).catch(()=>indexLinks);
        }).catch(()=> tryFetch(i+1));
      }

      function fallbackIndex(){
        return fetch('../index.html', {cache:'no-store'}).then(r=>r.text()).then(html=>{
          const p = new DOMParser().parseFromString(html, 'text/html');
          const anchors = Array.from(p.querySelectorAll('.class-title-link'));
          indexLinks = anchors.map(a=>({title: a.textContent.trim(), href: a.getAttribute('href')}));
          return indexLinks;
        }).catch(()=>{
          const anchors = Array.from(document.querySelectorAll('.class-title-link'));
          indexLinks = anchors.map(a=>({title: a.textContent.trim(), href: a.getAttribute('href')}));
          return indexLinks;
        });
      }

      return tryFetch(0);
    }

    const pageCache = new Map();

    function fetchAndSearchPage(href, q){
      if(pageCache.has(href)){
        const text = pageCache.get(href);
        return Promise.resolve(searchInText(href, q, text));
      }
      return fetch(href, {cache:'no-store'}).then(r=>r.text()).then(html=>{
        const doc = new DOMParser().parseFromString(html, 'text/html');
        doc.querySelectorAll('header, .page-nav, .site-search, script, style, nav').forEach((element) => element.remove());
        const text = doc.body ? doc.body.innerText : html;
        pageCache.set(href, text);
        return searchInText(href, q, text);
      }).catch(()=>null);
    }

    function searchInText(href, q, text){
      const idx = text.toLowerCase().indexOf(q.toLowerCase());
      if(idx === -1) return null;
      const start = Math.max(0, idx-60);
      const end = Math.min(text.length, idx+160);
      const snippet = (start>0? '...':'') + text.substring(start,end).replace(/\s+/g,' ').trim() + (end<text.length? '...':'');
      return {href, snippet};
    }

    function doSearch(query, resultsEl){
      query = (query||'').trim();
      if(!query){
        hideResults(resultsEl);
        return;
      }
      ensureIndex().then(list=>{
        if(!list || list.length===0){
          hideResults(resultsEl);
          return;
        }
        const titleKey = (title) => title.toLowerCase()
            .replace(/^item:\s*/, '')
            .replace(/\s*-\s*fable\s*$/, '')
            .trim();
        const rankTitle = (title) => {
          const normalizedTitle = titleKey(title);
          const normalizedQuery = query.toLowerCase();
          if(normalizedTitle === normalizedQuery) return 0;
          if(normalizedTitle.startsWith(normalizedQuery)) return 1;
          if(normalizedTitle.includes(normalizedQuery)) return 2;
          return 3;
        };

        // Search page and item names first, then search page content.
        const titleMatches = list.filter(p => titleKey(p.title).includes(query.toLowerCase()));
        const otherPages = list.filter(p => !titleMatches.includes(p));

        const promises = [];
        const results = [];

        titleMatches.forEach(p=>{
          promises.push(fetchAndSearchPage(p.href, query).then(r=>{
            if(r) results.push({title: p.title, href: p.href, snippet: r.snippet, score: rankTitle(p.title)});
            else results.push({title: p.title, href: p.href, snippet: '', score: rankTitle(p.title)});
          }));
        });

        // Search other pages' bodies in case title doesn't match
        otherPages.forEach(p=>{
          promises.push(fetchAndSearchPage(p.href, query).then(r=>{ if(r) results.push({title: p.title, href: p.href, snippet: r.snippet, score: 3}); }));
        });

        Promise.all(promises).then(()=>{
          results.sort((a, b) => a.score - b.score || a.title.localeCompare(b.title));
          showResults(resultsEl, results, query);
        });
      });
    }

    function showResults(resultsEl, results, query){
      resultsContent.innerHTML = '';
      if(!results || results.length===0){
        resultsContent.innerHTML = '<div class="site-search__result">No results</div>';
        resultsEl.style.display = 'block';
        updateResultsScrollbar();
        return;
      }
      results.slice(0,12).forEach(r=>{
        const div = document.createElement('div');
        div.className = 'site-search__result';
        const a = document.createElement('a');
        a.href = r.href;
        a.textContent = r.title || r.href;
        div.appendChild(a);
        if(r.snippet){
          const sn = document.createElement('span');
          sn.className = 'site-search__snippet';
          // highlight first occurrence
          const lower = r.snippet.toLowerCase();
          const qLower = query.toLowerCase();
          const idx = lower.indexOf(qLower);
          if(idx>=0){
            const before = r.snippet.substring(0, idx);
            const match = r.snippet.substring(idx, idx+query.length);
            const after = r.snippet.substring(idx+query.length);
            sn.innerHTML = escapeHtml(before) + '<strong style="color:var(--green);">' + escapeHtml(match) + '</strong>' + escapeHtml(after);
          } else {
            sn.textContent = r.snippet;
          }
          div.appendChild(sn);
        }
        resultsContent.appendChild(div);
      });
      resultsEl.style.display = 'block';
      updateResultsScrollbar();
    }

    function hideResults(resultsEl){
      resultsEl.style.display = 'none';
    }

    function escapeHtml(s){
      return String(s).replace(/[&<>\"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; });
    }
  }

  // Inject CSS by importing it (styles/site.css already imports search.css if configured). If not present, do nothing.
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', createSearchUI);
  } else {
    createSearchUI();
  }
})();
