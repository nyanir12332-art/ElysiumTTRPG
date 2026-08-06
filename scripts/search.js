(function(){
  // Create search UI and inject into .topbar
  function createSearchUI(){
    const topbar = document.querySelector('.topbar');
    if(!topbar) return;

    const container = document.createElement('div');
    container.className = 'site-search';
    container.innerHTML = `
      <input type="search" placeholder="Search site..." aria-label="Search site" />
      <button type="button" aria-label="Search">Search</button>
    `;

    topbar.appendChild(container);

    const input = container.querySelector('input[type="search"]');
    const button = container.querySelector('button');

    const resultsEl = document.createElement('div');
    resultsEl.className = 'site-search__results';
    resultsEl.style.display = 'none';
    document.body.appendChild(resultsEl);

    button.addEventListener('click', () => doSearch(input.value.trim(), resultsEl));
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

    // Overlap detection with main element: hide if it would overlap
    function checkOverlap(){
      try{
        const main = document.querySelector('main');
        if(!main) return;
        const rectSearch = container.getBoundingClientRect();
        const rectMain = main.getBoundingClientRect();
        const overlap = !(rectSearch.right < rectMain.left || rectSearch.left > rectMain.right || rectSearch.bottom < rectMain.top || rectSearch.top > rectMain.bottom);
        if(overlap){
          container.classList.add('site-search--hidden');
          resultsEl.style.display = 'none';
        } else {
          container.classList.remove('site-search--hidden');
        }
      } catch(e){
        // ignore
      }
    }

    window.addEventListener('resize', checkOverlap);
    window.addEventListener('scroll', checkOverlap, {passive:true});
    // initial
    setTimeout(checkOverlap, 120);

    // Pre-cache index listing by fetching a prebuilt search-index.json (fast) or fall back to parsing ../index.html
    let indexLinks = null;
    function convertPathToHref(targetPath){
      // Normalize backslashes to forward slashes
      const target = targetPath.replace(/\\\\/g,'/').replace(/^\//,'');
      const cur = (window.location.pathname || '').replace(/\\\\/g,'/');
      // Determine current directory
      const curDir = cur.endsWith('/') ? cur : cur.substring(0, cur.lastIndexOf('/')+1);
      const toSegments = target.split('/').filter(Boolean);
      const fromSegments = curDir.split('/').filter(Boolean);
      let i=0; while(i<fromSegments.length && i<toSegments.length && fromSegments[i]===toSegments[i]) i++;
      const up = fromSegments.length - i;
      const rel = (up? '../'.repeat(up):'') + toSegments.slice(i).join('/');
      return rel || './';
    }

    function ensureIndex(){
      if(indexLinks) return Promise.resolve(indexLinks);
      const candidates = ['/search-index.json','../search-index.json','../../search-index.json','./search-index.json','search-index.json'];
      function tryFetch(i){
        if(i>=candidates.length) return fallbackIndex();
        return fetch(candidates[i], {cache:'no-store'}).then(r=>{
          if(!r.ok) throw new Error('no');
          return r.json();
        }).then(json => {
          indexLinks = json.map(it=>({title: it.title, href: convertPathToHref(it.path)}));
          return indexLinks;
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
        // Search titles first
        const titleMatches = list.filter(p => p.title.toLowerCase().includes(query.toLowerCase()));
        const otherPages = list.filter(p => !titleMatches.includes(p));

        const promises = [];
        const results = [];

        titleMatches.forEach(p=>{
          promises.push(fetchAndSearchPage(p.href, query).then(r=>{
            if(r) results.push({title: p.title, href: p.href, snippet: r.snippet});
            else results.push({title: p.title, href: p.href, snippet: ''});
          }));
        });

        // Search other pages' bodies in case title doesn't match
        otherPages.forEach(p=>{
          promises.push(fetchAndSearchPage(p.href, query).then(r=>{ if(r) results.push({title: p.title, href: p.href, snippet: r.snippet}); }));
        });

        Promise.all(promises).then(()=>{
          showResults(resultsEl, results, query);
        });
      });
    }

    function showResults(resultsEl, results, query){
      resultsEl.innerHTML = '';
      if(!results || results.length===0){
        resultsEl.innerHTML = '<div class="site-search__result">No results</div>';
        resultsEl.style.display = 'block';
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
        resultsEl.appendChild(div);
      });
      resultsEl.style.display = 'block';
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
