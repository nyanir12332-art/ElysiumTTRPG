(function () {
  const input = document.querySelector('#tts-importer-input');
  const searchButton = document.querySelector('#tts-importer-button');
  const results = document.querySelector('#tts-importer-results');
  const status = document.querySelector('#tts-importer-status');
  const editor = document.querySelector('#tts-editor');

  if (!input || !searchButton || !results || !status || !editor) return;
  const clearResults = () => {
    const scrollbar = results.querySelector(':scope > .crt-scrollbar--embedded');
    results.replaceChildren();
    if (scrollbar) results.appendChild(scrollbar);
    results.scrollTop = 0;
  };

  const cardType = document.querySelector('#card-type');
  const cardTitle = document.querySelector('#card-title');
  const cardSubtitle = document.querySelector('#card-subtitle');
  const cardDescription = document.querySelector('#card-description');
  const itemCost = document.querySelector('#item-cost');
  const itemWeight = document.querySelector('#item-weight');
  const itemDamage = document.querySelector('#item-damage');
  const itemArmorClass = document.querySelector('#item-armor-class');
  const itemCarryingCapacity = document.querySelector('#item-carrying-capacity');
  const itemProperties = document.querySelector('#item-properties');
  const spellCastingTime = document.querySelector('#spell-casting-time');
  const spellRange = document.querySelector('#spell-range');
  const spellDuration = document.querySelector('#spell-duration');
  const spellComponentV = document.querySelector('#spell-component-v');
  const spellComponentS = document.querySelector('#spell-component-s');
  const spellComponentM = document.querySelector('#spell-component-m');
  const spellMaterial = document.querySelector('#spell-material');
  const spellTags = document.querySelector('#spell-tags');
  const disciplinePsiCost = document.querySelector('#discipline-psi-cost');
  const disciplineDuration = document.querySelector('#discipline-duration');
  const disciplineTags = document.querySelector('#discipline-tags');
  const perkRequirement = document.querySelector('#perk-requirement');
  const perkRequiredBy = document.querySelector('#perk-required-by');
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

  const ordinal = (level) => {
    const endings = ['th', 'st', 'nd', 'rd'];
    const remainder = level % 100;
    return `${level}${endings[(remainder - 20) % 10] || endings[remainder] || endings[0]}`;
  };
  const spellSubtitle = (spell) => `${spell.level === 0 ? 'Cantrip' : `${ordinal(spell.level)}-level`} ${spell.school}`;
  const adaptSpellPointText = (value) => String(value || '')
    .replace(/(?:When|If) you cast this spell using a spell slot of (\d+(?:st|nd|rd|th)) level or higher,/gi, 'When you cast this spell at $1 level or higher,')
    .replace(/for each slot level above (\d+(?:st|nd|rd|th))/gi, 'for each level above $1');
  const formatSpellInline = (value) => escapeText(adaptSpellPointText(value))
    .replace(/\*\*\*(.+?)\*\*\*/g, '<b><i>$1</i></b>')
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.+?)\*/g, '<i>$1</i>');
  const markdownTable = (lines) => {
    const rows = lines
      .filter((line) => !/^\|?\s*:?-{3,}/.test(line.trim()))
      .map((line, rowIndex) => {
        const cells = line.trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim());
        const tag = rowIndex === 0 ? 'th' : 'td';
        return `<tr>${cells.map((cell) => `<${tag}>${formatSpellInline(cell)}</${tag}>`).join('')}</tr>`;
      });
    return `<table>${rows.join('')}</table>`;
  };
  const structuredTable = (table) => {
    if (!table || !Array.isArray(table.headers) || !Array.isArray(table.rows)) return '';
    const title = table.title ? `<h2>${formatSpellInline(table.title)}</h2>` : '';
    const header = `<tr>${table.headers.map((cell) => `<th>${formatSpellInline(cell)}</th>`).join('')}</tr>`;
    const rows = table.rows.map((row) => `<tr>${row.map((cell) => `<td>${formatSpellInline(cell)}</td>`).join('')}</tr>`).join('');
    return `${title}<table>${header}${rows}</table>`;
  };
  const structuredStatblock = (block) => {
    if (!block || !block.name) return '';
    const details = Array.isArray(block.details) ? block.details : [];
    const traits = Array.isArray(block.traits) ? block.traits : [];
    const actions = Array.isArray(block.actions) ? block.actions : [];
    const rows = details.map(({ label, value }) => `<tr><td><b>${formatSpellInline(label)}</b></td><td>${formatSpellInline(value)}</td></tr>`).join('');
    const traitMarkup = traits.map(({ name, text }) => `<p><b><i>${formatSpellInline(name)}</i></b> ${formatSpellInline(text)}</p>`).join('');
    const actionMarkup = actions.length
      ? `<h3>Actions</h3>${actions.map(({ name, text }) => `<p><b><i>${formatSpellInline(name)}</i></b> ${formatSpellInline(text)}</p>`).join('')}`
      : '';
    return `<div class="spell-statblock"><h2>${formatSpellInline(block.name)}</h2>${block.subtitle ? `<p><i>${formatSpellInline(block.subtitle)}</i></p>` : ''}<table class="spell-statblock__table">${rows}</table>${traitMarkup}${actionMarkup}</div>`;
  };
  const formatSpellDescription = (spell) => {
    const descriptionBlocks = spell.description || [];
    const blocks = [...descriptionBlocks, ...(spell.higherLevel || []).filter(Boolean)];
    const markup = [];
    for (let index = 0; index < blocks.length; index += 1) {
      const block = adaptSpellPointText(blocks[index]).trim();
      if (!block) continue;
      if (/^#####\s+/.test(block)) {
        markup.push(`<h2>${formatSpellInline(block.replace(/^#####\s+/, ''))}</h2>`);
        continue;
      }
      if (/^\|/.test(block)) {
        markup.push(markdownTable(block.split(/\r?\n/)));
        continue;
      }
      if (/^-\s+/.test(block)) {
        const items = block.split(/\r?\n/).filter((line) => /^-\s+/.test(line));
        markup.push(`<ul>${items.map((item) => `<li>${formatSpellInline(item.replace(/^-\s+/, ''))}</li>`).join('')}</ul>`);
        continue;
      }
      const higherLevel = index >= descriptionBlocks.length;
      markup.push(`<p>${higherLevel ? '<b>At Higher Levels.</b> ' : ''}${formatSpellInline(block)}</p>`);
    }
    markup.push(...(spell.tables || []).map(structuredTable));
    markup.push(...(spell.statblocks || []).map(structuredStatblock));
    return markup.join('');
  };
  const extractSpellMaterial = (components) => {
    const match = String(components || '').match(/\bM\s*\(([^)]+)\)/i);
    return match ? match[1].trim() : '';
  };
  const extractSpell = (spell) => {
    const components = String(spell.components || '');
    return {
      type: 'spell',
      title: spell.name,
      subtitle: spellSubtitle(spell),
      description: formatSpellDescription(spell),
      castingTime: spell.castingTime || '',
      range: spell.range || '',
      duration: spell.duration || '',
      componentV: /(?:^|,)\s*V\b/i.test(components),
      componentS: /(?:^|,)\s*S\b/i.test(components),
      componentM: /(?:^|,)\s*M\b/i.test(components),
      material: extractSpellMaterial(components),
      tags: [spell.ritual ? 'Ritual' : '', spell.concentration ? 'Concentration' : ''].filter(Boolean).join(', '),
    };
  };
  window.TTSSpellCatalog = {
    get(id) {
      const spell = (window.SPELLS || []).find((entry) => entry.id === id);
      return spell ? extractSpell(spell) : null;
    },
  };
  const spellEntries = () => (window.SPELLS || []).map((spell) => ({
    title: `Spell: ${spell.name} - Fable`,
    text: [spell.name, spell.school, ...(spell.classes || []), ...(spell.description || []), ...(spell.higherLevel || [])].filter(Boolean).join(' '),
    path: 'systems/spellcasting.html',
    spell,
  }));
  const disciplineMetadata = (title) => {
    const rawTitle = String(title || '').trim();
    if (rawTitle === 'Bestial Transformation.') {
      return { name: 'Bestial Transformation', psiCost: 'Varies', duration: '1 hour', tags: '' };
    }
    const match = rawTitle.match(/^(.*?)\s*\(([^)]+)\)\.?$/);
    if (!match) return { name: rawTitle.replace(/\.$/, ''), psiCost: '', duration: '', tags: '' };
    const parts = match[2].split(';').map((part) => part.trim()).filter(Boolean);
    const psiCost = parts.shift() || '';
    const concentrationIndex = parts.findIndex((part) => /^conc\.?$/i.test(part));
    const concentration = concentrationIndex !== -1;
    if (concentration) parts.splice(concentrationIndex, 1);
    const duration = parts.join('; ')
      .replace(/\b1 min\./i, '1 minute')
      .replace(/\b(\d+) min\./i, '$1 minutes')
      .replace(/\b1 hr\./i, '1 hour')
      .replace(/\b(\d+) hr\./i, '$1 hours');
    return { name: match[1].trim(), psiCost, duration, tags: concentration ? 'Concentration' : '' };
  };
  const disciplineEntries = () => (window.PSIONIC_DISCIPLINES || []).flatMap((discipline) => [
    {
      title: `Discipline: ${discipline.title} - Fable`,
      text: [discipline.title, discipline.group, discipline.introduction, ...(discipline.abilities || []).flatMap((ability) => [ability.title, ability.content])]
        .filter(Boolean)
        .join(' '),
      path: 'classes/mystic/mystic-psionic-disciplines.html',
      discipline,
    },
    ...(discipline.abilities || []).map((ability) => ({
      title: `Psionic Discipline: ${disciplineMetadata(ability.title).name} - ${discipline.title} - Fable`,
      text: [discipline.title, discipline.group, ability.title, ability.content].filter(Boolean).join(' '),
      path: 'classes/mystic/mystic-psionic-disciplines.html',
      disciplineAbility: { discipline, ability },
    })),
  ]);
  const backgroundEntries = async () => {
    const backgroundIndex = new URL('backgrounds/index.html', siteRoot);
    const pageDocument = await getPage(backgroundIndex.href);
    return Array.from(pageDocument.querySelectorAll('.background-list a[href]'))
      .map((link) => {
        const title = normalize(link.textContent);
        const href = new URL(link.getAttribute('href'), backgroundIndex.href).href;
        const fileName = new URL(href).pathname.split('/').pop();
        return {
          title: `Background: ${title} - Fable`,
          text: title,
          href,
          path: `backgrounds/${fileName}`,
        };
      })
      .filter((entry) => entry.path !== 'backgrounds/index.html');
  };
  const uniqueEntries = (entries) => [...new Map(entries.map((entry) => [
    `${String(entry.path || '').toLowerCase()}|${String(entry.title || '').toLowerCase()}`,
    entry,
  ])).values()];
  const perkEntries = () => {
    const perks = Array.isArray(window.PERKS) ? window.PERKS : [];
    const requiredBy = new Map(perks.map((perk) => [perk.id, []]));
    perks.forEach((perk) => {
      const requirements = String(perk.requirements || '')
        .split(/[,/]/)
        .map((requirement) => requirement.replace(/^\s*\d+\s+/, '').replace(/\s+(?:perks|feats)\s*$/i, '').trim().toLowerCase());
      perks.forEach((candidate) => {
        if (candidate.id !== perk.id && requirements.includes(candidate.name.toLowerCase())) requiredBy.get(candidate.id).push(perk.name);
      });
    });
    return perks.map((perk) => ({
      title: `Perk: ${perk.name} - Fable`,
      text: [perk.name, perk.description, perk.requirements, ...(requiredBy.get(perk.id) || [])].filter(Boolean).join(' '),
      path: 'perks/index.html',
      perk: {
        ...perk,
        requiredBy: (requiredBy.get(perk.id) || []).join(', '),
      },
    }));
  };

  const extractPerk = (perk) => ({
    type: 'perk',
    title: perk.name,
    subtitle: 'Perk',
    description: escapeText(perk.description),
    requirement: perk.requirements || '',
    requiredBy: perk.requiredBy || '',
  });

  const itemAliases = new Map([
    ['ram, portable', 'portable ram'],
    ['tent, two-person', 'two-person tent'],
    ['case, crossbow bolt', 'crossbow bolt case'],
    ['case, map/scroll', 'map/scroll case'],
    ['pot, iron', 'iron pot'],
  ]);
  const catalogItems = () => Object.entries(window.ELYSIUM_ITEM_CATALOG?.additions || {})
    .flatMap(([category, items]) => items.map(([name, cost, weight, description]) => ({
      category,
      name: normalize(name),
      cost: cleanField(cost),
      weight: cleanField(weight),
      description,
    })));
  const specialWeaponDescriptions = {
    lance: "You have disadvantage when you use a lance to attack a target within 5 feet of you. A lance requires two hands to wield when you aren't mounted.",
    net: 'A Large or smaller creature hit by a net is restrained until freed. A net has no effect on formless creatures or creatures that are Huge or larger. A creature can use its action to make a DC 10 Strength check to free itself or another creature within its reach. Dealing 5 slashing damage to the net (AC 10) also frees the creature without harming it, destroying the net. When you attack with a net, you can make only one attack regardless of how many attacks you can normally make.',
  };

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
        const entries = pages
          .filter((page) => !/^classes[\\/]classes\.html$/i.test(String(page.path || '')))
          // Spell records are supplied below from SPELLS, where they can populate card fields.
          .filter((page) => !/^systems[\\/]spellcasting\.html\?spell=/i.test(String(page.path || '')))
          .map((page) => ({
            title: page.title,
            text: page.text || '',
            href: toHref(page.path),
            path: String(page.path).replace(/\\/g, '/'),
          }));
        const systemPages = entries.filter((entry) => /^systems\/(?!index\.html$|tts-converter\.html$).+\.html$/i.test(entry.path));
        const systemTopics = await Promise.all(systemPages.map(async (entry) => {
          try {
            const pageDocument = await getPage(entry.href);
            return Array.from(pageDocument.querySelectorAll('main h2, main h3, main h4'))
              .map((heading) => normalize(heading.textContent))
              .filter(Boolean)
              .map((sectionTitle) => ({
                title: `${sectionTitle} - Fable`,
                text: `${sectionTitle} ${entry.title}`,
                href: entry.href,
                path: entry.path,
                sectionTitle,
                sourceTitle: cleanTitle(entry.title),
              }));
          } catch (error) {
            return [];
          }
        }));
        systemTopics.flat().forEach((topic) => entries.push(topic));

        const itemPage = new URL('items/index.html', siteRoot);
        try {
          const itemDocument = await getPage(itemPage.href);
        const itemNames = [
            ...Array.from(itemDocument.querySelectorAll('.item-card h3')).map((heading) => heading.textContent),
            ...Array.from(itemDocument.querySelectorAll('table tbody tr'))
              .filter((row) => !row.classList.contains('apparel-subcategory'))
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
        catalogItems().forEach((item) => entries.push({
          title: `Item: ${item.name} - Fable`,
          text: `${item.name} ${item.description}`,
          href: `${itemPage.href}?item=${encodeURIComponent(item.name)}`,
          path: 'items/index.html',
          itemName: item.name,
        }));
      } catch (error) {
          // The rest of the catalog remains usable if the item catalog cannot load.
        }
        try {
          entries.push(...await backgroundEntries());
        } catch (error) {
          // Background imports remain optional when the background catalog cannot load.
        }
        entries.push(...spellEntries(), ...perkEntries(), ...disciplineEntries());
        return uniqueEntries(entries);
      })
      // Spell and perk imports stay available even if the optional site search index cannot load.
      .catch(async () => {
        try {
          return uniqueEntries([...await backgroundEntries(), ...spellEntries(), ...perkEntries(), ...disciplineEntries()]);
        } catch (error) {
          return uniqueEntries([...spellEntries(), ...perkEntries(), ...disciplineEntries()]);
        }
      });
    return indexPromise;
  };

  const pageKind = (entry) => {
    if (entry.spell) return 'spell';
    if (entry.discipline || entry.disciplineAbility) return 'discipline';
    if (entry.perk) return 'perk';
    if (/^races\//i.test(entry.path)) return 'race';
    if (/^backgrounds\//i.test(entry.path)) return 'background';
    if (/^items\//i.test(entry.path)) return 'item';
    if (/^systems\//i.test(entry.path)) return 'system';
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
    const headingText = normalize(heading.textContent);
    const groupedSpellSection = /^(?:preparing and casting spells|spell points)$/i.test(headingText);
    const sectionEnd = /^(?:spellcasting ability|ritual casting|spellcasting focus|spells known of 1st level and higher)$/i;
    let markup = '';
    let sibling = heading.nextElementSibling;
    while (sibling) {
      const siblingLevel = /^H[1-6]$/.test(sibling.tagName) ? Number(sibling.tagName.substring(1)) : null;
      if (siblingLevel !== null && siblingLevel <= level) {
        const keepGroupedMinorHeading = groupedSpellSection
          && siblingLevel === level
          && !sectionEnd.test(normalize(sibling.textContent));
        if (!keepGroupedMinorHeading) break;
      }
      markup += serialize(sibling);
      sibling = sibling.nextElementSibling;
    }
    return markup;
  };

  const extractItem = async (entry) => {
    const document = await getPage(entry.href.split('?')[0]);
    const name = entry.itemName || new URL(entry.href).searchParams.get('item') || cleanTitle(entry.title);
    const normalizedName = normalize(name).toLowerCase();
    const wanted = itemAliases.get(normalizedName) || normalizedName;
    const itemName = (heading) => {
      const copy = heading?.cloneNode(true);
      copy?.querySelectorAll('.vehicle-fuel-tooltip').forEach((marker) => marker.remove());
      return normalize(copy?.textContent);
    };
    const article = Array.from(document.querySelectorAll('.item-card')).find((item) => itemName(item.querySelector('h3')).toLowerCase() === wanted);
    if (article) {
      const values = Array.from(article.querySelectorAll('.item-card__heading > span')).map((span) => cleanField(span.textContent));
      const details = article.querySelector('.tool-details') || article.querySelector('p');
      const category = normalize(article.closest('.item-group')?.querySelector(':scope > .item-group-title')?.textContent);
      const articleName = itemName(article.querySelector('h3'));
      const listedCost = window.ELYSIUM_ITEM_CATALOG?.prices?.[category]?.[articleName] || values[0] || '';
      const isContainer = Boolean(article.closest('.containers-group'));
      const isMount = Boolean(article.closest('.mounts-group--mounts'));
      const isLandVehicle = Boolean(article.closest('.mounts-group--vehicles'));
      const isWaterborneVehicle = Boolean(article.closest('.mounts-group--waterborne'));
      const isVehicle = isLandVehicle || isWaterborneVehicle;
      const isAttachment = Boolean(article.closest('.attachments-section'));
      const fuelPerHour = article.querySelector('.vehicle-fuel-tooltip')?.dataset.fuelPerHour || '';
      const detailText = details ? normalize(details.textContent) : '';
      const capacitySentence = isContainer
        ? (detailText.match(/^.*?(?:\.(?=\s+[A-Z]|$)|$)/)?.[0] || '')
        : '';
      const containerCapacity = capacitySentence.replace(/\.$/, '').trim();
      const containerDescription = isContainer && capacitySentence
        ? escapeText(detailText.slice(capacitySentence.length).trim())
        : (details ? serializeWithoutControls(details) : '');
      const attachmentDescription = isAttachment
        ? `${containerDescription}<p><strong>Attachable To.</strong> ${escapeText(values[2] || '-')}</p>`
        : containerDescription;
      return {
        type: 'item',
        title: articleName || name,
        subtitle: isAttachment ? 'Attachment' : isVehicle ? 'Vehicle' : 'Item',
        description: attachmentDescription,
        cost: listedCost,
        weight: isMount || isVehicle ? '' : values[1] || '',
        damage: '',
        carryingCapacity: isMount || isLandVehicle ? values[2] || '' : containerCapacity,
        properties: isAttachment ? `Attachable To: ${values[2] || '-'}` : isVehicle ? `Speed: ${values[1] || '-'}${fuelPerHour ? `; Fuel: ${fuelPerHour} per hour` : ''}` : values[3] || '',
      };
    }

    const catalogItem = catalogItems().find((item) => normalize(item.name).toLowerCase() === wanted);
    if (catalogItem) {
      const capacitySentence = catalogItem.category === 'Containers'
        ? (catalogItem.description.match(/^.*?(?:\.(?=\s+[A-Z]|$)|$)/)?.[0] || '')
        : '';
      return {
        type: 'item',
        title: catalogItem.name,
        subtitle: catalogItem.category === 'Equipment Pack' ? 'Equipment Pack' : 'Item',
        description: escapeText(catalogItem.category === 'Containers' && capacitySentence
          ? catalogItem.description.slice(capacitySentence.length).trim()
          : catalogItem.description),
        cost: catalogItem.cost,
        weight: catalogItem.weight,
        carryingCapacity: capacitySentence.replace(/\.$/, '').trim(),
        damage: '',
        properties: '',
      };
    }

    const row = Array.from(document.querySelectorAll('table tbody tr')).find((item) => normalize(item.querySelector('td')?.textContent).toLowerCase() === wanted);
    if (row) {
      const cells = Array.from(row.querySelectorAll('td'));
      const table = row.closest('table');
      const headers = Array.from(table?.querySelectorAll('thead th') || []).map((header) => normalize(header.textContent).toLowerCase());
      const columnIndex = (...names) => headers.findIndex((header) => names.some((name) => header === name || header.includes(name)));
      const columnValue = (...names) => {
        const index = columnIndex(...names);
        return index >= 0 ? cleanField(cells[index]?.textContent) : '';
      };
      const isFirearm = table?.classList.contains('firearms-table');
      const isWeapon = table?.classList.contains('weapons-table') && !table.classList.contains('weapons-table--ammunition');
      const isArmor = table?.classList.contains('apparel-table') && !isFirearm && !table?.classList.contains('weapons-table');
      const itemTitle = normalize(cells[0]?.textContent);
      const description = headers.map((header, index) => {
        if (/^(?:name|shield type|cost|weight|damage|armor class(?: \(ac\))?|properties|carrying capacity|examples)$/.test(header)) return '';
        const value = cleanField(cells[index]?.textContent);
        return value ? `${header}: ${value}` : '';
      }).filter(Boolean).join(' - ');
      const specialDescription = specialWeaponDescriptions[itemTitle.toLowerCase()];
      return {
        type: 'item',
        title: itemTitle || name,
        subtitle: isFirearm || isWeapon ? 'Weapon' : isArmor ? 'Armor' : 'Item',
        description: escapeText([description, specialDescription].filter(Boolean).join(' ')),
        cost: columnValue('cost'),
        weight: columnValue('weight'),
        damage: columnValue('damage'),
        armorClass: columnValue('armor class'),
        carryingCapacity: columnValue('carrying capacity'),
        properties: columnValue('properties'),
      };
    }
    throw new Error('Item not found');
  };

  // Used by the batch importer so starting equipment uses the exact same
  // catalog cards as a manual item import.
  window.TTSItemCatalog = {
    resolve(name) {
      const itemPage = new URL('items/index.html', siteRoot).href;
      return extractItem({ href: `${itemPage}?item=${encodeURIComponent(name)}`, itemName: name });
    },
  };

  const extractEntry = async (entry, query) => {
    if (entry.spell) return extractSpell(entry.spell);
    if (entry.perk) return extractPerk(entry.perk);
    if (pageKind(entry) === 'item') return extractItem(entry);
    const document = await getPage(entry.href);
    const main = document.querySelector('main');
    if (!main) throw new Error('Entry has no importable content');

    const matchingHeading = findMatchingHeading(main, entry.sectionTitle || query);
    if (matchingHeading) {
      return {
        type: 'feature',
        title: normalize(matchingHeading.textContent),
        subtitle: pageKind(entry) === 'system' ? 'System' : 'Feature',
        description: sectionAfterHeading(matchingHeading),
      };
    }

    const kind = pageKind(entry);
    const content = main.querySelector('.class-copy') || main.querySelector('.subclass-content') || main.querySelector('article') || main;
    return {
      type: kind === 'race' ? 'race' : kind === 'class' ? 'class' : 'feature',
      title: kind === 'system' ? cleanTitle(entry.title) : titleFromPrompt(document, entry.title),
      subtitle: kind === 'race' ? 'Race' : kind === 'background' ? 'Background' : kind === 'class' ? classSubtitleFromPrompt(document, entry.title) : kind === 'system' ? 'System' : 'Feature',
      description: serialize(content),
    };
  };

  const extractOverview = (entry, document) => {
    const main = document.querySelector('main');
    const kind = pageKind(entry);
    const content = main.querySelector('.class-copy') || main.querySelector('.subclass-content') || main.querySelector('article') || main;
    return {
      type: kind === 'race' ? 'race' : kind === 'class' ? 'class' : 'feature',
      title: kind === 'system' ? cleanTitle(entry.title) : titleFromPrompt(document, entry.title),
      subtitle: kind === 'race' ? 'Race' : kind === 'background' ? 'Background' : kind === 'class' ? classSubtitleFromPrompt(document, entry.title) : kind === 'system' ? 'System' : 'Feature',
      description: serialize(content),
    };
  };

  const isClassEntry = (entry) => (/^classes[\\/][^\\/]+\.html$/i.test(entry.path)
    || /^classes[\\/][^\\/]+[\\/][^\\/]+\.html$/i.test(entry.path))
    && !/classes[\\/]classes\.html$/i.test(entry.path);
  const classSectionCategory = (entry) => {
    const path = String(entry.path).replace(/\\/g, '/');
    if (/(?:^|\/)artificer-infusions\.html$/i.test(path)) return 'Infusion';
    if (/(?:^|\/)warlock-eldritch-invocations\.html$/i.test(path)) return 'Invocation';
    if (/(?:^|\/)mystic-psionic-disciplines\.html$/i.test(path)
      || /(?:^|\/)monk-disciplines\.html$/i.test(path)
      || /(?:^|\/)mystic-(?:avatar|awakened|immortal|nomad|wu-jen)-[^/]+\.html$/i.test(path)) return 'Discipline';
    if (/(?:^|\/)blood-hunter-blood-curses\.html$/i.test(path)) return 'Blood Curse';
    if (/(?:^|\/)blood-hunter-mutagens\.html$/i.test(path)) return 'Mutagen';
    if (/(?:^|\/)fighter-battle-maneuvers\.html$/i.test(path)) return 'Maneuver';
    return '';
  };
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
    clearResults();
    const sectionCategory = classSectionCategory(entry);
    const isSubclass = /^classes[\\/][^\\/]+[\\/][^\\/]+\.html$/i.test(entry.path);
    const intro = document.createElement('p');
    intro.className = 'tts-importer__empty';
    intro.textContent = `Choose what to import from ${titleFromPrompt(pageDocument, entry.title)}:`;
    results.appendChild(intro);

    if (!sectionCategory) {
      addChoice(isSubclass ? 'Subclass description' : 'Class description', 'Overview', () => {
        const subclassIntro = pageDocument.querySelector('main .subclass-content > .subclass-intro')
          || pageDocument.querySelector('main .subclass-content > p');
        fillBuilder(isSubclass
          ? {
            type: 'feature',
            title: titleFromPrompt(pageDocument, entry.title),
            subtitle: 'Subclass',
            description: subclassIntro ? serialize(subclassIntro) : '',
          }
          : extractOverview(entry, pageDocument));
        status.textContent = `${titleFromPrompt(pageDocument, entry.title)} loaded into Card Builder.`;
      });
    }

    const headings = Array.from(pageDocument.querySelectorAll('main .class-copy h2, main .class-copy h3, main .class-copy h4, main .feature-section h2, main .feature-section h3, main .feature-section h4'))
      .filter((heading) => !/^(class features|hit points|proficiencies|equipment|spell point cost)$/i.test(normalize(heading.textContent)));
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

    const isLeafSectionHeading = (heading) => {
      const level = Number(heading.tagName.substring(1));
      let sibling = heading.nextElementSibling;
      while (sibling) {
        const siblingLevel = /^H[1-6]$/.test(sibling.tagName) ? Number(sibling.tagName.substring(1)) : null;
        if (siblingLevel !== null) return siblingLevel <= level;
        sibling = sibling.nextElementSibling;
      }
      return true;
    };

    const sectionHeadings = Array.from(pageDocument.querySelectorAll('main .subclass-content h2, main .subclass-content h3, main .subclass-content h4'))
      .filter(isLeafSectionHeading);
    sectionHeadings.forEach((heading) => {
      addChoice(normalize(heading.textContent), sectionCategory ? `${sectionCategory} section` : 'Single section', () => {
        fillBuilder({
          type: 'feature',
          title: normalize(heading.textContent),
          subtitle: sectionCategory || 'Feature',
          description: sectionAfterHeading(heading),
        });
        status.textContent = `${normalize(heading.textContent)} loaded into Card Builder.`;
      });
    });

    const linkedSections = [...new Map(Array.from(pageDocument.querySelectorAll('main .subclass-content a[href]'))
      .map((link) => {
        const href = new URL(link.getAttribute('href'), entry.href).href;
        return [href, { href, title: normalize(link.textContent) }];
      })
      .filter(({ href, title }) => title && /\/classes\/[^/]+\/[^/]+\.html$/i.test(new URL(href).pathname))).values()];
    linkedSections.forEach(({ href, title }) => {
      addChoice(title, sectionCategory ? `${sectionCategory} section` : 'Linked section', async () => {
        status.textContent = 'Loading section choices...';
        try {
          const targetDocument = await getPage(href);
          const targetPath = new URL(href).pathname.replace(/^\/+/, '');
          showClassChoices({ ...entry, href, path: targetPath, title }, targetDocument);
        } catch (error) {
          status.textContent = 'This section could not be loaded.';
        }
      });
    });
    status.textContent = sectionHeadings.length || linkedSections.length
      ? sectionCategory
        ? `Choose a ${sectionCategory.toLowerCase()} to import.`
        : 'Choose the class description, a class feature, or a single section.'
      : 'Choose the class description or a specific feature.';
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
    return serialize(list.cloneNode(true));
  };

  const showRaceChoices = (entry, pageDocument) => {
    clearResults();
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

    addChoice('Race statistics', 'Ability Score, Languages, and additional traits', () => {
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

  const contentBeforeHeading = (container, headingText) => {
    const target = String(headingText).toLowerCase();
    const children = Array.from(container.children);
    const stopIndex = children.findIndex((child) => normalize(child.textContent).toLowerCase() === target);
    return children
      .slice(0, stopIndex < 0 ? children.length : stopIndex)
      .map(serialize)
      .join('');
  };

  const contentUntilNextOption = (heading, optionHeadings) => {
    const markup = [];
    let sibling = heading.nextElementSibling;
    while (sibling) {
      if (optionHeadings.includes(sibling)) break;
      markup.push(serialize(sibling));
      sibling = sibling.nextElementSibling;
    }
    return markup.join('');
  };

  const showBackgroundChoices = (entry, pageDocument) => {
    const copy = pageDocument.querySelector('main .class-copy');
    const backgroundTitle = titleFromPrompt(pageDocument, entry.title);
    if (!copy) return false;

    const splitBackgrounds = new Map([
      ['nest dweller', ['Nest Access', 'District of Origin Options']],
      ['backstreets rat', ['Rat Network', 'District of Origin Options']],
      ['associate fixer', ['Association Sponsorship', 'Association Options']],
    ]);
    const split = splitBackgrounds.get(backgroundTitle.toLowerCase());
    if (split) {
      clearResults();
      const [coreHeading, optionsHeading] = split;
      const options = Array.from(copy.querySelectorAll(':scope > h2'))
        .find((heading) => normalize(heading.textContent).toLowerCase() === optionsHeading.toLowerCase());
      addChoice(backgroundTitle, `Background through ${coreHeading}`, () => {
        fillBuilder({
          type: 'feature',
          title: backgroundTitle,
          subtitle: 'Background',
          description: contentBeforeHeading(copy, optionsHeading),
        });
        status.textContent = `${backgroundTitle} loaded into Card Builder.`;
      });
      if (options) {
        const allHeadings = Array.from(copy.querySelectorAll(':scope > h3'));
        const optionHeadings = backgroundTitle.toLowerCase() === 'associate fixer'
          ? allHeadings.filter((heading, index) => index % 2 === 0)
          : allHeadings;
        optionHeadings.forEach((option) => {
          const optionTitle = normalize(option.textContent);
          addChoice(optionTitle, `${backgroundTitle} option`, () => {
            fillBuilder({
              type: 'feature',
              title: optionTitle,
              subtitle: `${backgroundTitle} Background`,
              description: contentUntilNextOption(option, optionHeadings),
            });
            status.textContent = `${optionTitle} loaded into Card Builder.`;
          });
        });
      }
      status.textContent = `Choose the ${backgroundTitle} background or one of its options.`;
      return true;
    }

    if (backgroundTitle.toLowerCase() === 'finger affiliate') {
      clearResults();
      const optionHeadings = Array.from(copy.querySelectorAll(':scope > .finger-option'));
      optionHeadings.forEach((option) => {
        const optionTitle = normalize(option.textContent);
        addChoice(optionTitle, 'Finger Affiliate option', () => {
          fillBuilder({
            type: 'feature',
            title: optionTitle,
            subtitle: 'Finger Affiliate Background',
            description: contentUntilNextOption(option, optionHeadings),
          });
          status.textContent = `${optionTitle} loaded into Card Builder.`;
        });
      });
      status.textContent = 'Choose a Finger Affiliate option to import.';
      return true;
    }
    return false;
  };

  const disciplineCard = (discipline) => ({
    type: 'discipline',
    title: discipline.title,
    subtitle: `${discipline.group} Discipline`,
    description: discipline.introduction,
    psiCost: '',
    duration: '',
    tags: '',
  });

  const disciplineAbilityCard = (discipline, ability) => {
    const metadata = disciplineMetadata(ability.title);
    return {
      type: 'discipline',
      title: metadata.name,
      subtitle: `${discipline.group} Discipline — ${discipline.title}`,
      description: ability.content,
      psiCost: metadata.psiCost,
      duration: metadata.duration,
      tags: metadata.tags,
    };
  };

  const showDisciplineChoices = (discipline) => {
    clearResults();
    const intro = document.createElement('p');
    intro.className = 'tts-importer__empty';
    intro.textContent = `Choose what to import from ${discipline.title}:`;
    results.appendChild(intro);

    addChoice('Discipline description', 'Description and Psychic Focus', () => {
      fillBuilder(disciplineCard(discipline));
      status.textContent = `${discipline.title} description loaded into Card Builder.`;
    });
    (discipline.abilities || []).forEach((ability) => {
      const metadata = disciplineMetadata(ability.title);
      addChoice(metadata.name, 'Psionic Discipline', () => {
        fillBuilder(disciplineAbilityCard(discipline, ability));
        status.textContent = `${metadata.name} loaded into Card Builder.`;
      });
    });
    status.textContent = `Choose the ${discipline.title} description or an ability.`;
  };

  const setField = (field, value) => {
    if (!field) return;
    field.value = value || '';
    field.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const setChecked = (field, checked) => {
    if (!field) return;
    field.checked = Boolean(checked);
    field.dispatchEvent(new Event('change', { bubbles: true }));
  };

  const fillBuilder = (entry) => {
    setField(cardType, entry.type);
    setField(cardTitle, entry.title);
    setField(cardSubtitle, entry.subtitle);
    setField(cardDescription, entry.description);
    setField(itemCost, entry.type === 'item' ? entry.cost : '');
    setField(itemWeight, entry.type === 'item' ? entry.weight : '');
    setField(itemDamage, entry.type === 'item' ? entry.damage : '');
    setField(itemArmorClass, entry.type === 'item' ? entry.armorClass : '');
    setField(itemCarryingCapacity, entry.type === 'item' ? entry.carryingCapacity : '');
    setField(itemProperties, entry.type === 'item' ? entry.properties : '');
    setField(perkRequirement, entry.type === 'perk' ? entry.requirement : '');
    setField(perkRequiredBy, entry.type === 'perk' ? entry.requiredBy : '');
    setField(spellCastingTime, entry.type === 'spell' ? entry.castingTime : '');
    setField(spellRange, entry.type === 'spell' ? entry.range : '');
    setField(spellDuration, entry.type === 'spell' ? entry.duration : '');
    setChecked(spellComponentV, entry.type === 'spell' && entry.componentV);
    setChecked(spellComponentS, entry.type === 'spell' && entry.componentS);
    setChecked(spellComponentM, entry.type === 'spell' && entry.componentM);
    setField(spellMaterial, entry.type === 'spell' ? entry.material : '');
    setField(spellTags, entry.type === 'spell' ? entry.tags : '');
    setField(disciplinePsiCost, entry.type === 'discipline' ? entry.psiCost : '');
    setField(disciplineDuration, entry.type === 'discipline' ? entry.duration : '');
    setField(disciplineTags, entry.type === 'discipline' ? entry.tags : '');
    editor.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const renderResults = (matches, query) => {
    clearResults();
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
      detail.textContent = entry.sourceTitle ? `system - ${entry.sourceTitle}` : pageKind(entry);
      button.appendChild(detail);
      button.addEventListener('click', async () => {
        status.textContent = 'Importing entry...';
        try {
          if (entry.disciplineAbility) {
            fillBuilder(disciplineAbilityCard(entry.disciplineAbility.discipline, entry.disciplineAbility.ability));
            status.textContent = `${disciplineMetadata(entry.disciplineAbility.ability.title).name} loaded into Card Builder.`;
            return;
          }
          if (entry.discipline) {
            showDisciplineChoices(entry.discipline);
            return;
          }
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
          if (pageKind(entry) === 'background') {
            const page = await getPage(entry.href);
            if (showBackgroundChoices(entry, page)) return;
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
      clearResults();
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
      clearResults();
      const unavailable = document.createElement('p');
      unavailable.className = 'tts-importer__empty';
      unavailable.textContent = 'The site catalog could not be loaded.';
      results.appendChild(unavailable);
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
