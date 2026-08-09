(function () {
  const input = document.querySelector('#tts-importer-input');
  const searchButton = document.querySelector('#tts-importer-button');
  const results = document.querySelector('#tts-importer-results');
  const status = document.querySelector('#tts-importer-status');
  const editor = document.querySelector('#tts-editor');

  if (!input || !searchButton || !results || !status || !editor) return;

  const cardType = document.querySelector('#card-type');
  const cardTitle = document.querySelector('#card-title');
  const cardSubtitle = document.querySelector('#card-subtitle');
  const cardDescription = document.querySelector('#card-description');
  const itemCost = document.querySelector('#item-cost');
  const itemWeight = document.querySelector('#item-weight');
  const itemProperties = document.querySelector('#item-properties');
  const siteRoot = new URL('../', document.baseURI);
  const indexUrl = new URL('../search-index.json', document.baseURI);
  let indexPromise;

  const normalize = (value) => String(value || '').replace(/\s+/g, ' ').trim();
  const cleanTitle = (value) => normalize(value)
    .replace(/\s*-\s*Fable\s*$/i, '')
    .replace(/^(?:Class|Race|Background|Item):\s*/i, '');
  const cleanField = (value) => {
    const cleaned = normalize(value);
    return /^(?:-|—)$/.test(cleaned) ? '' : cleaned;
  };
  const escapeText = (value) => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const serializeWithoutControls = (node) => {
    const clone = node.cloneNode(true);
    clone.querySelectorAll('button, .item-card__expand, .explosive-expand').forEach((control) => control.remove());
    return Array.from(clone.childNodes).map(serialize).join('');
  };

  const toHref = (path) => new URL(String(path).replace(/\\/g, '/'), siteRoot).href;

  const serialize = (node) => {
    if (node.nodeType === Node.TEXT_NODE) return escapeText(node.nodeValue || '');
    if (node.nodeType !== Node.ELEMENT_NODE) return '';
    const tag = node.tagName.toLowerCase();
    if (['script', 'style', 'nav', 'header', 'footer'].includes(tag)) return '';
    const children = Array.from(node.childNodes).map(serialize).join('');
    if (tag === 'br') return '<br>';
    if (tag === 'strong' || tag === 'b') return `<b>${children}</b>`;
    if (tag === 'em' || tag === 'i') return `<i>${children}</i>`;
    if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4') return `<h2>${children}</h2>`;
    if (tag === 'p') return `<p>${children}</p>`;
    if (tag === 'ul') return `<ul>${children}</ul>`;
    if (tag === 'ol') return `<ol>${children}</ol>`;
    if (tag === 'li') return `<li>${children}</li>`;
    if (tag === 'table') return `<table>${children}</table>`;
    if (tag === 'tr') return `<tr>${children}</tr>`;
    if (tag === 'th') return `<th>${children}</th>`;
    if (tag === 'td') return `<td>${children}</td>`;
    return children;
  };

  const getPage = (href) => fetch(href, { cache: 'no-store' })
    .then((response) => {
      if (!response.ok) throw new Error('Unable to load page');
      return response.text();
    })
    .then((html) => new DOMParser().parseFromString(html, 'text/html'));

  const loadIndex = () => {
    if (indexPromise) return indexPromise;
    indexPromise = fetch(indexUrl, { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load search index');
        return response.json();
      })
      .then(async (pages) => {
        const entries = pages.map((page) => ({
          title: page.title,
          text: page.text || '',
          href: toHref(page.path),
          path: String(page.path).replace(/\\/g, '/'),
        }));
        const itemPage = new URL('items/index.html', siteRoot);
        try {
          const itemDocument = await getPage(itemPage.href);
          const itemNames = [
            ...Array.from(itemDocument.querySelectorAll('.item-card h3')).map((heading) => heading.textContent),
            ...Array.from(itemDocument.querySelectorAll('table tbody tr'))
              .map((row) => row.querySelector('td')?.textContent)
              .filter(Boolean),
          ];
          const uniqueNames = [...new Map(itemNames.map((name) => [normalize(name).toLowerCase(), normalize(name)])).values()];
          uniqueNames.forEach((name) => entries.push({
            title: `Item: ${name} - Fable`,
            text: name,
            href: `${itemPage.href}?item=${encodeURIComponent(name)}`,
            path: 'items/index.html',
            itemName: name,
          }));
        } catch (error) {
          // The rest of the catalog remains usable if the item catalog cannot load.
        }
        return entries;
      });
    return indexPromise;
  };

  const pageKind = (entry) => {
    if (/^races\//i.test(entry.path)) return 'race';
    if (/^backgrounds\//i.test(entry.path)) return 'background';
    if (/^items\//i.test(entry.path)) return 'item';
    return 'class';
  };

  const titleFromPrompt = (document, fallback) => {
    const prompt = document.querySelector('main h1.prompt');
    const text = normalize(prompt?.textContent || '');
    return text.includes(':') ? text.split(':').slice(1).join(':').trim() : cleanTitle(fallback);
  };

  const classSubtitleFromPrompt = (document, fallback) => {
    const source = titleFromPrompt(document, fallback).split(':')[0].trim();
    return `${source} Class`;
  };

  const raceSubtitleFromPrompt = (document, fallback) => {
    const source = titleFromPrompt(document, fallback).split(':')[0].trim();
    return `${source} Race`;
  };

  const findMatchingHeading = (main, query) => {
    if (!query) return null;
    const headings = Array.from(main.querySelectorAll('h2, h3, h4'));
    const lowered = query.toLowerCase();
    return headings.find((heading) => normalize(heading.textContent).toLowerCase() === lowered)
      || headings.find((heading) => normalize(heading.textContent).toLowerCase().includes(lowered));
  };

  const sectionAfterHeading = (heading) => {
    const level = Number(heading.tagName.substring(1));
    let markup = '';
    let sibling = heading.nextElementSibling;
    while (sibling) {
      const siblingLevel = /^H[1-6]$/.test(sibling.tagName) ? Number(sibling.tagName.substring(1)) : null;
      if (siblingLevel !== null && siblingLevel <= level) break;
      markup += serialize(sibling);
      sibling = sibling.nextElementSibling;
    }
    return markup;
  };

  const extractItem = async (entry) => {
    const document = await getPage(entry.href.split('?')[0]);
    const name = entry.itemName || new URL(entry.href).searchParams.get('item') || cleanTitle(entry.title);
    const wanted = normalize(name).toLowerCase();
    const article = Array.from(document.querySelectorAll('.item-card')).find((item) => normalize(item.querySelector('h3')?.textContent).toLowerCase() === wanted);
    if (article) {
      const values = Array.from(article.querySelectorAll('.item-card__heading > span')).map((span) => cleanField(span.textContent));
      const details = article.querySelector('.tool-details') || article.querySelector('p');
      return {
        type: 'item',
        title: normalize(article.querySelector('h3')?.textContent) || name,
        subtitle: 'Item',
        description: details ? serializeWithoutControls(details) : '',
        cost: values[0] || '',
        weight: values[1] || '',
        properties: values[3] || '',
      };
    }

    const row = Array.from(document.querySelectorAll('table tbody tr')).find((item) => normalize(item.querySelector('td')?.textContent).toLowerCase() === wanted);
    if (row) {
      const cells = Array.from(row.querySelectorAll('td'));
      cells.slice(3).forEach((cell) => cell.querySelectorAll('button, .item-card__expand, .explosive-expand').forEach((control) => control.remove()));
      return {
        type: 'item',
        title: normalize(cells[0]?.textContent) || name,
        subtitle: 'Item',
        description: escapeText(cells.slice(3).map((cell) => normalize(cell.textContent)).filter(Boolean).join(' — ')),
        cost: cleanField(cells[1]?.textContent),
        weight: cleanField(cells[2]?.textContent),
        properties: '',
      };
    }
    throw new Error('Item not found');
  };

  const extractEntry = async (entry, query) => {
    if (pageKind(entry) === 'item') return extractItem(entry);
    const document = await getPage(entry.href);
    const main = document.querySelector('main');
    if (!main) throw new Error('Entry has no importable content');

    const matchingHeading = findMatchingHeading(main, query);
    if (matchingHeading) {
      return {
        type: 'feature',
        title: normalize(matchingHeading.textContent),
        subtitle: 'Feature',
        description: sectionAfterHeading(matchingHeading),
      };
    }

    const kind = pageKind(entry);
    const content = main.querySelector('.class-copy') || main.querySelector('article') || main;
    return {
      type: kind === 'race' ? 'race' : kind === 'class' ? 'class' : 'feature',
      title: titleFromPrompt(document, entry.title),
      subtitle: kind === 'race' ? 'Race' : kind === 'background' ? 'Background' : kind === 'class' ? classSubtitleFromPrompt(document, entry.title) : 'Feature',
      description: serialize(content),
    };
  };

  const extractOverview = (entry, document) => {
    const main = document.querySelector('main');
    const kind = pageKind(entry);
    const content = main.querySelector('.class-copy') || main.querySelector('article') || main;
    return {
      type: kind === 'race' ? 'race' : kind === 'class' ? 'class' : 'feature',
      title: titleFromPrompt(document, entry.title),
      subtitle: kind === 'race' ? 'Race' : kind === 'background' ? 'Background' : kind === 'class' ? classSubtitleFromPrompt(document, entry.title) : 'Feature',
      description: serialize(content),
    };
  };

  const isClassEntry = (entry) => /^classes\//i.test(entry.path) && !/classes\.html$/i.test(entry.path);
  const isRaceEntry = (entry) => /^races\//i.test(entry.path) && !/races[\\/]index\.html$/i.test(entry.path);

  const addChoice = (label, detail, action) => {
    const button = document.createElement('button');
    button.className = 'tts-importer__result';
    button.type = 'button';
    button.textContent = label;
    const small = document.createElement('small');
    small.textContent = detail;
    button.appendChild(small);
    button.addEventListener('click', action);
    results.appendChild(button);
  };

  const showClassChoices = (entry, pageDocument) => {
    results.innerHTML = '';
    const intro = document.createElement('p');
    intro.className = 'tts-importer__empty';
    intro.textContent = `Choose what to import from ${titleFromPrompt(pageDocument, entry.title)}:`;
    results.appendChild(intro);

    addChoice('Class description', 'Overview', () => {
      fillBuilder(extractOverview(entry, pageDocument));
      status.textContent = `${titleFromPrompt(pageDocument, entry.title)} loaded into Card Builder.`;
    });

    const headings = Array.from(pageDocument.querySelectorAll('main .feature-section h2, main .feature-section h3, main .feature-section h4'))
      .filter((heading) => !/^(class features|hit points|proficiencies|equipment)$/i.test(normalize(heading.textContent)));
    headings.forEach((heading) => {
      addChoice(normalize(heading.textContent), 'Class feature', () => {
        fillBuilder({
          type: 'class',
          title: normalize(heading.textContent),
          subtitle: classSubtitleFromPrompt(pageDocument, entry.title),
          description: sectionAfterHeading(heading),
        });
        status.textContent = `${normalize(heading.textContent)} loaded into Card Builder.`;
      });
    });
    status.textContent = 'Choose the class description or a specific feature.';
  };

  const getRaceCopy = (pageDocument) => pageDocument.querySelector('main .class-copy');

  const getRaceDescription = (entry, pageDocument) => {
    const copy = getRaceCopy(pageDocument);
    if (!copy) return '';
    const pieces = [];
    Array.from(copy.children).some((child) => {
      if (child.matches('h2, ul')) return pieces.length > 0;
      if (child.tagName === 'P') pieces.push(serialize(child));
      return false;
    });
    if (pieces.length) return pieces.join('');
    const firstParagraph = copy.querySelector('p');
    return firstParagraph ? serialize(firstParagraph) : '';
  };

  const getRaceStats = (pageDocument) => {
    const copy = getRaceCopy(pageDocument);
    const list = copy?.querySelector(':scope > ul');
    if (!list) return '';
    const clone = list.cloneNode(true);
    Array.from(clone.children).forEach((item) => {
      const label = normalize(item.querySelector('strong')?.textContent).replace(/\.$/, '').toLowerCase();
      if (label === 'languages') {
        let sibling = item.nextElementSibling;
        while (sibling) {
          const next = sibling.nextElementSibling;
          sibling.remove();
          sibling = next;
        }
      }
    });
    return serialize(clone);
  };

  const showRaceChoices = (entry, pageDocument) => {
    results.innerHTML = '';
    const raceTitle = titleFromPrompt(pageDocument, entry.title);
    const raceSubtitle = raceSubtitleFromPrompt(pageDocument, entry.title);
    const intro = document.createElement('p');
    intro.className = 'tts-importer__empty';
    intro.textContent = `Choose what to import from ${raceTitle}:`;
    results.appendChild(intro);

    addChoice('Race description', 'Overview', () => {
      fillBuilder({
        type: 'race',
        title: raceTitle,
        subtitle: raceSubtitle,
        description: getRaceDescription(entry, pageDocument),
      });
      status.textContent = `${raceTitle} description loaded into Card Builder.`;
    });

    addChoice('Race statistics', 'Ability Score through Languages', () => {
      fillBuilder({
        type: 'race',
        title: `${raceTitle} Statistics`,
        subtitle: raceSubtitle,
        description: getRaceStats(pageDocument),
      });
      status.textContent = `${raceTitle} statistics loaded into Card Builder.`;
    });

    Array.from(getRaceCopy(pageDocument)?.querySelectorAll(':scope > h2') || []).forEach((heading) => {
      addChoice(normalize(heading.textContent), 'Subrace', () => {
        fillBuilder({
          type: 'race',
          title: normalize(heading.textContent),
          subtitle: raceSubtitle,
          description: sectionAfterHeading(heading),
        });
        status.textContent = `${normalize(heading.textContent)} loaded into Card Builder.`;
      });
    });
    status.textContent = 'Choose the race description, statistics, or a subrace.';
  };

  const setField = (field, value) => {
    if (!field) return;
    field.value = value || '';
    field.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const fillBuilder = (entry) => {
    setField(cardType, entry.type);
    setField(cardTitle, entry.title);
    setField(cardSubtitle, entry.subtitle);
    setField(cardDescription, entry.description);
    setField(itemCost, entry.type === 'item' ? entry.cost : '');
    setField(itemWeight, entry.type === 'item' ? entry.weight : '');
    setField(itemProperties, entry.type === 'item' ? entry.properties : '');
    editor.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const renderResults = (matches, query) => {
    results.innerHTML = '';
    if (!matches.length) {
      const empty = document.createElement('p');
      empty.className = 'tts-importer__empty';
      empty.textContent = `No catalog entries found for “${query}”.`;
      results.appendChild(empty);
      return;
    }
    matches.slice(0, 12).forEach((entry) => {
      const button = document.createElement('button');
      button.className = 'tts-importer__result';
      button.type = 'button';
      button.innerHTML = `${cleanTitle(entry.title)}<small>${pageKind(entry)}${entry.text && entry.title.toLowerCase().includes(query.toLowerCase()) ? '' : ' — matching content'}</small>`;
      button.textContent = cleanTitle(entry.title);
      const detail = document.createElement('small');
      detail.textContent = pageKind(entry);
      button.appendChild(detail);
      button.addEventListener('click', async () => {
        status.textContent = 'Importing entry...';
        try {
          if (isClassEntry(entry)) {
            const page = await getPage(entry.href);
            showClassChoices(entry, page);
            return;
          }
          if (isRaceEntry(entry)) {
            const page = await getPage(entry.href);
            showRaceChoices(entry, page);
            return;
          }
          const imported = await extractEntry(entry, query);
          fillBuilder(imported);
          status.textContent = `${imported.title} loaded into Card Builder.`;
        } catch (error) {
          status.textContent = 'This entry could not be imported.';
        }
      });
      results.appendChild(button);
    });
  };

  const runSearch = () => {
    const query = normalize(input.value).toLowerCase();
    if (!query) {
      results.innerHTML = '';
      status.textContent = 'Search the site catalog to import an entry.';
      return;
    }
    status.textContent = 'Searching the site catalog...';
    loadIndex().then((entries) => {
      const matches = entries
        .filter((entry) => `${entry.title} ${entry.text}`.toLowerCase().includes(query))
        .sort((a, b) => {
          const score = (entry) => {
            const title = cleanTitle(entry.title).toLowerCase();
            return title === query ? 0 : title.startsWith(query) ? 1 : title.includes(query) ? 2 : 3;
          };
          return score(a) - score(b) || cleanTitle(a.title).localeCompare(cleanTitle(b.title));
        });
      renderResults(matches, query);
      status.textContent = matches.length ? 'Select an entry to import it.' : 'No matching catalog entries found.';
    }).catch(() => {
      results.innerHTML = '<p class="tts-importer__empty">The site catalog could not be loaded.</p>';
      status.textContent = 'Importer unavailable.';
    });
  };

  searchButton.addEventListener('click', runSearch);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      runSearch();
    }
  });
})();
