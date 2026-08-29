(() => {
  const classSelect = document.querySelector('#batch-class');
  const levelSelect = document.querySelector('#batch-class-level');
  const subclassLabel = document.querySelector('#batch-subclass-label');
  const subclassSelect = document.querySelector('#batch-subclass');
  const backgroundSelect = document.querySelector('#batch-background');
  const raceSelect = document.querySelector('#batch-race');
  const equipmentOptions = document.querySelector('#batch-equipment-options');
  const backgroundOptions = document.querySelector('#batch-background-options');
  const raceOptions = document.querySelector('#batch-race-options');
  const downloadButton = document.querySelector('#batch-download');
  const status = document.querySelector('#batch-status');
  const spellSearch = document.querySelector('#spell-batch-search');
  const spellResults = document.querySelector('#spell-batch-results');
  const spellDownload = document.querySelector('#spell-batch-download');
  const spellStatus = document.querySelector('#spell-batch-status');
  const catalogMode = document.querySelector('#catalog-batch-mode');
  const catalogSearchLabel = document.querySelector('#catalog-batch-search-label');
  if (!classSelect || !levelSelect || !backgroundSelect || !raceSelect || !downloadButton || !status) return;

  const pageCache = new Map();
  const classCatalog = new Map();
  const selectedSpells = new Set();
  const selectedPerks = new Set();
  const selectedConditions = new Set();
  const text = (value) => String(value || '').replace(/\s+/g, ' ').trim();
  const safeName = (value) => text(value).replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'card';
  const page = async (url) => {
    if (!pageCache.has(url)) {
      pageCache.set(url, fetch(url).then((response) => {
        if (!response.ok) throw new Error(`Could not load ${url}.`);
        return response.text();
      }).then((html) => new DOMParser().parseFromString(html, 'text/html')));
    }
    return pageCache.get(url);
  };
  const entriesFromIndex = async (indexPath, selector) => {
    const indexUrl = new URL(indexPath, document.baseURI);
    const documentFragment = await page(indexUrl.href);
    return Array.from(documentFragment.querySelectorAll(selector)).map((link) => ({
      name: text(link.textContent),
      url: new URL(link.getAttribute('href'), indexUrl.href).href,
    })).filter((entry) => entry.name && entry.url.endsWith('.html'));
  };
  const classEntries = async () => {
    const indexUrl = new URL('../classes/classes.html', document.baseURI);
    const documentFragment = await page(indexUrl.href);
    return Array.from(documentFragment.querySelectorAll('.class-entry')).map((entry) => {
      const link = entry.querySelector(':scope > h3 > a[href]');
      if (!link) return null;
      return {
        name: text(link.textContent),
        url: new URL(link.getAttribute('href'), indexUrl.href).href,
        subclasses: Array.from(entry.querySelectorAll('li.subclass-item > a[href]')).map((subclass) => ({
          name: text(subclass.textContent).replace(/^Subclass:\s*/i, ''),
          url: new URL(subclass.getAttribute('href'), indexUrl.href).href,
        })),
      };
    }).filter(Boolean);
  };
  const addOptions = (select, entries) => entries.sort((a, b) => a.name.localeCompare(b.name)).forEach((entry) => {
    const option = document.createElement('option');
    option.value = entry.url;
    option.textContent = entry.name;
    select.appendChild(option);
  });
  const markup = (nodes) => Array.from(nodes).map((node) => {
    const clone = node.cloneNode(true);
    clone.querySelectorAll('script, style, button, .page-nav').forEach((element) => element.remove());
    clone.querySelectorAll('a').forEach((link) => link.replaceWith(document.createTextNode(link.textContent)));
    return clone.outerHTML;
  }).join('');
  const following = (heading, boundary = 'h2, h3') => {
    const nodes = [];
    for (let node = heading.nextElementSibling; node; node = node.nextElementSibling) {
      if (node.matches(boundary)) break;
      nodes.push(node);
    }
    return markup(nodes);
  };
  const card = (type, title, subtitle, description) => ({ type, title, subtitle, description: description || '<p>No description available.</p>' });
  const showChecks = (host, note, choices, name) => {
    host.replaceChildren();
    if (!choices.length) { host.hidden = true; return; }
    host.hidden = false;
    const intro = document.createElement('p');
    intro.textContent = note;
    host.appendChild(intro);
    choices.forEach((choice) => {
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = name;
      input.value = choice;
      label.append(input, document.createTextNode(choice));
      host.appendChild(label);
    });
  };
  const updateReady = () => {
    const classReady = Boolean(classSelect.value && levelSelect.value);
    const ready = classReady || Boolean(backgroundSelect.value) || Boolean(raceSelect.value);
    downloadButton.disabled = !ready;
    if (!ready) status.textContent = classSelect.value ? 'Choose a class level, or select a background or race.' : 'Choose at least one class, background, or race to enable the export.';
    else status.textContent = 'Ready to build a ZIP containing normal and square JPG cards.';
  };
  const populateSubclasses = () => {
    subclassSelect.replaceChildren(new Option('Do not include a subclass', ''));
    const selected = classCatalog.get(classSelect.value);
    const subclasses = selected?.subclasses || [];
    subclasses.forEach((subclass) => subclassSelect.add(new Option(subclass.name, subclass.url)));
    subclassLabel.hidden = !subclasses.length;
  };
  const classEquipmentChoices = (documentFragment) => {
    const heading = Array.from(documentFragment.querySelectorAll('h3')).find((item) => /^equipment$/i.test(text(item.textContent)));
    if (!heading) return [];
    const list = heading.nextElementSibling?.matches('p') ? heading.nextElementSibling.nextElementSibling : heading.nextElementSibling;
    if (!list?.matches('ul, ol')) return [];
    return Array.from(list.children).filter((item) => item.matches('li')).map((item) => text(item.textContent));
  };
  const choicesFromEquipment = (line) => {
    const choices = [...line.matchAll(/\([a-z]\)\s*([\s\S]*?)(?=\s+or\s+\([a-z]\)|$)/gi)].map((match) => text(match[1]));
    return choices.length ? choices : [line.replace(/^\([a-z]\)\s*/i, '')];
  };
  const equipmentAliases = new Map([
    ['professional clothing', { item: 'Fine Clothes', title: 'Professional Clothing (Fine Clothes)' }],
    ['fine or professional clothing', { item: 'Fine Clothes', title: 'Professional Clothing (Fine Clothes)' }],
    ['common or professional clothing', { item: 'Common Clothes', title: 'Common or Professional Clothing (Common Clothes)' }],
    ['leather', { item: 'Leather Armor', title: 'Leather Armor' }],
    ['chain mail', { item: 'Chain Mail Armor', title: 'Chain Mail Armor' }],
    ['shield', { item: 'Infantry shield', title: 'Shield (Infantry Shield)' }],
    ['identity documents', { item: 'Wallet', title: 'Identity Documents (Wallet)' }],
    ['district transit pass', { item: 'District Transit Pass', title: 'District Transit Pass' }],
    ['identity badge holder', { item: 'Identity Badge Holder', title: 'Identity Badge Holder' }],
    ['sealed courier pouch', { item: 'Pouch', title: 'Sealed Courier Pouch (Pouch)' }],
    ['set of fine clothes', { item: 'Fine Clothes', title: 'Fine Clothes' }],
    ['bag of 1,000 ball bearings', { item: 'Ball Bearings (bag of 1,000)', title: 'Ball Bearings (bag of 1,000)' }],
    ['case for maps and scrolls', { item: 'Map/Scroll Case', title: 'Map/Scroll Case' }],
    ['cases for maps and scrolls', { item: 'Map/Scroll Case', title: 'Map/Scroll Case' }],
    ['power cells', { item: 'Power Cell', title: 'Power Cell' }],
    ['air filter cartridges', { item: 'Air Filter Cartridge', title: 'Air Filter Cartridge' }],
    ['days of rations', { item: 'Rations (1 day)', title: 'Rations (1 day)' }],
    ['days rations', { item: 'Rations (1 day)', title: 'Rations (1 day)' }],
    ['hooded lantern', { item: 'Lantern - Hooded', title: 'Lantern - Hooded' }],
    ['flasks of oil', { item: 'Oil (flask)', title: 'Oil (flask)' }],
    ['feet of string', { item: 'Rope', title: 'String (Rope)' }],
    ['book of lore', { item: 'Book', title: 'Book of Lore (Book)' }],
    ['little bag of sand', { item: 'Pouch', title: 'Little Bag of Sand (Pouch)' }],
    ['small knife', { item: 'Dagger', title: 'Small Knife (Dagger)' }],
    ['battered backpack', { item: 'Backpack', title: 'Battered Backpack (Backpack)' }],
    ['city card with no balance', { item: 'City Card', title: 'City Card with No Balance (City Card)' }],
    ['service token or old unit patch', { item: 'Identity Badge Holder', title: 'Service Token or Old Unit Patch (Identity Badge Holder)' }],
    ['notebook of names', { item: 'Notebook', title: 'Notebook of Names (Notebook)' }],
    ['tool you are proficient with', { item: "Tinker's Tools", title: "Chosen Proficient Tool (Tinker's Tools)" }],
    ['formal black, red, and gold clothing', { item: 'Fine Clothes', title: 'Formal Black, Red, and Gold Clothing (Fine Clothes)' }],
    ['famiglia badge or token', { item: 'Identity Badge Holder', title: 'Famiglia Badge or Token (Identity Badge Holder)' }],
    ['notebook listing local titles and forms of address', { item: 'Notebook', title: 'Notebook of Titles and Forms of Address (Notebook)' }],
    ['black formal outfit', { item: 'Fine Clothes', title: 'Black Formal Outfit (Fine Clothes)' }],
    ['sealed envelope bearing an index mark', { item: 'Map/Scroll Case', title: 'Sealed Index Envelope (Map/Scroll Case)' }],
    ['durable bright or light-colored jacket', { item: "Traveler's Clothes", title: "Durable Bright Jacket (Traveler's Clothes)" }],
    ['notebook recording favors and grudges', { item: 'Notebook', title: 'Notebook of Favors and Grudges (Notebook)' }],
    ['chain or keepsake symbolizing solidarity', { item: 'Chain (10 ft)', title: 'Chain or Keepsake of Solidarity (Chain)' }],
    ["artist's tool set and materials", { item: "Painter's Supplies", title: "Artist's Tool Set and Materials (Painter's Supplies)" }],
    ['clean white clothing', { item: 'Fine Clothes', title: 'Clean White Clothing (Fine Clothes)' }],
    ['sketchbook', { item: 'Book', title: 'Sketchbook (Book)' }],
    ['clothing suitable for two social roles', { item: 'Costume', title: 'Clothing for Two Social Roles (Costume)' }],
    ['notebook with deliberately incomplete contact information', { item: 'Notebook', title: 'Notebook of Incomplete Contacts (Notebook)' }],
    ['seal stamp', { item: 'Signet Ring', title: 'Seal Stamp (Signet Ring)' }],
    ['bundle of blank forms', { item: 'Paper (1 sheet)', title: 'Bundle of Blank Forms (Paper)' }],
    ['light shield', { item: 'Light Shield', title: 'Light Shield' }],
    ['calipers', { item: "Cartographer's Tools", title: "Calipers (Cartographer's Tools)" }],
    ['work gloves', { item: "Traveler's Clothes", title: "Work Gloves (Traveler's Clothes)" }],
    ['plain formal clothing', { item: 'Fine Clothes', title: 'Plain Formal Clothing (Fine Clothes)' }],
    ['fine clothing', { item: 'Fine Clothes', title: 'Fine Clothes' }],
    ['written copy of duel etiquette', { item: 'Book', title: 'Written Copy of Duel Etiquette (Book)' }],
    ['rations', { item: 'Rations (1 day)', title: 'Rations (1 day)' }],
    ['work clothes', { item: 'Common Clothes', title: 'Work Clothes (Common Clothes)' }],
    ['field notebook', { item: 'Notebook', title: 'Field Notebook (Notebook)' }],
    ['field glasses', { item: 'Glasses', title: 'Field Glasses (Glasses)' }],
    ['sample containers', { item: 'Vial', title: 'Sample Containers (Vial)' }],
    ['spellbook or study book', { item: 'Spellbook', title: 'Spellbook or Study Book (Spellbook)' }],
    ['quiet set of common clothes', { item: 'Common Clothes', title: 'Quiet Common Clothes (Common Clothes)' }],
    ['formal clothing', { item: 'Fine Clothes', title: 'Formal Clothing (Fine Clothes)' }],
    ['contract folio', { item: 'Map/Scroll Case', title: 'Contract Folio (Map/Scroll Case)' }],
    ['holy symbol', { item: 'Emblem', title: 'Holy Symbol (Emblem)' }],
    ['common clothing', { item: 'Common Clothes', title: 'Common Clothes' }],
    ['packet of archival paper', { item: 'Paper (1 sheet)', title: 'Packet of Archival Paper (Paper)' }],
    ['pencils', { item: 'Pencils (5)', title: 'Pencils (5)' }],
  ]);
  const ammunition = /\b(?:ammunition|ammo|arrows?|bolts?|bullets?|needles?)\b/i;
  const itemCache = new Map();
  const normalizeEquipmentName = (value) => text(value)
    .replace(/^\s*\d+\s+/, '')
    .replace(/^\s*(?:a|an|the|one|and)\s+/i, '')
    .replace(/[.;]+$/, '')
    .trim();
  const equipmentNames = (value) => {
    const source = text(value);
    const segments = source.includes(';') ? source.split(/\s*;\s*/) : source.split(/\s*,\s*/);
    return segments.flatMap((segment) => {
      const whole = normalizeEquipmentName(segment);
      if (!whole || /^\$[\d,]+$/.test(whole) || ammunition.test(whole)) return [];
      if (equipmentAliases.has(whole.toLowerCase())) return [whole];
      return whole.split(/\s+and\s+/i).map(normalizeEquipmentName);
    }).filter((part) => part && !/^\$[\d,]+$/.test(part) && !ammunition.test(part));
  };
  const itemCard = async (name) => {
    const key = name.toLowerCase();
    if (itemCache.has(key)) return itemCache.get(key);
    const promise = (async () => {
      const alias = equipmentAliases.get(key);
      const requested = alias?.item || name;
      try {
        const resolved = await window.TTSItemCatalog.resolve(requested);
        if (alias) resolved.title = alias.title;
        return resolved;
      } catch (_error) {
        if (!alias && /s$/i.test(requested)) {
          try { return await window.TTSItemCatalog.resolve(requested.replace(/s$/i, '')); } catch (_singularError) { /* use the fallback below */ }
        }
        // A named prop without a catalog entry still needs a usable item card.
        const fallback = await window.TTSItemCatalog.resolve('Notebook');
        fallback.title = `${name} (Notebook)`;
        return fallback;
      }
    })();
    itemCache.set(key, promise);
    return promise;
  };
  const packComponents = async (name) => {
    if (!/\bpack$/i.test(text(name))) return [];
    const normalized = text(name).toLowerCase();
    const catalogPack = (window.ELYSIUM_ITEM_CATALOG?.additions?.['Equipment Pack'] || [])
      .find(([packName]) => text(packName).toLowerCase() === normalized);
    let description = catalogPack?.[3] || '';
    if (!description) {
      const itemPage = await page(new URL('../items/index.html', document.baseURI).href);
      const pack = Array.from(itemPage.querySelectorAll('.equipment-pack-group .item-card')).find((entry) => text(entry.querySelector('h3')?.textContent).toLowerCase() === normalized);
      description = text(pack?.querySelector('p')?.textContent).split(/\.\s+/)[0] || '';
    }
    return equipmentNames(description);
  };
  const equipmentCards = async (value) => {
    const cards = [];
    for (const name of equipmentNames(value)) {
      const contents = await packComponents(name);
      if (contents.length) cards.push(...await equipmentCards(contents.join(', ')));
      else cards.push(await itemCard(name));
    }
    return cards;
  };
  const listedEquipment = (nodes) => Array.from(nodes).flatMap((node) => Array.from(node.querySelectorAll?.('li') || []))
    .filter((item) => /^(?:additional\s+)?equipment\.?$/i.test(text(item.querySelector('strong')?.textContent)))
    .map((item) => text(item.textContent).replace(/^(?:additional\s+)?equipment\.\s*/i, ''));
  const displayEquipmentChoices = async () => {
    equipmentOptions.replaceChildren();
    if (!classSelect.value) { equipmentOptions.hidden = true; return; }
    const documentFragment = await page(classSelect.value);
    const choices = classEquipmentChoices(documentFragment);
    if (!choices.length) { equipmentOptions.hidden = true; return; }
    equipmentOptions.hidden = false;
    const intro = document.createElement('p');
    intro.textContent = 'Choose the starting equipment option from each class choice.';
    equipmentOptions.appendChild(intro);
    choices.forEach((line, choiceIndex) => {
      const group = document.createElement('div');
      const groupTitle = document.createElement('p');
      groupTitle.textContent = `Equipment choice ${choiceIndex + 1}`;
      group.appendChild(groupTitle);
      choicesFromEquipment(line).forEach((choice, optionIndex) => {
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = `batch-equipment-${choiceIndex}`;
        input.value = choice;
        input.checked = optionIndex === 0;
        label.append(input, document.createTextNode(choice));
        group.appendChild(label);
      });
      equipmentOptions.appendChild(group);
    });
  };
  const displayBackgroundOptions = async () => {
    backgroundOptions.replaceChildren();
    if (!backgroundSelect.value) { backgroundOptions.hidden = true; return; }
    const documentFragment = await page(backgroundSelect.value);
    const copy = documentFragment.querySelector('main .class-copy');
    if (!copy) { backgroundOptions.hidden = true; return; }
    const optionsHeading = Array.from(copy.querySelectorAll(':scope > h2')).find((heading) => /(?:district of origin|association options|affiliate options)/i.test(text(heading.textContent)));
    if (!optionsHeading) { backgroundOptions.hidden = true; return; }
    showChecks(backgroundOptions, 'Choose one background option to include.', backgroundOptionCards(copy, optionsHeading).map((option) => option.name), 'batch-background-option');
  };
  const displayRaceOptions = async () => {
    raceOptions.replaceChildren();
    if (!raceSelect.value) { raceOptions.hidden = true; return; }
    const documentFragment = await page(raceSelect.value);
    const copy = documentFragment.querySelector('main .class-copy');
    const options = Array.from(copy?.querySelectorAll(':scope > h2') || []).map((heading) => text(heading.textContent)).filter(Boolean);
    showChecks(raceOptions, 'Choose a subrace or race option to include.', options, 'batch-race-option');
  };
  const backgroundOptionCards = (copy, optionsHeading) => {
    const headings = Array.from(copy.querySelectorAll(':scope > h3'))
      .filter((heading) => heading.compareDocumentPosition(optionsHeading) & Node.DOCUMENT_POSITION_PRECEDING);
    if (copy.classList.contains('finger-affiliate-copy')) {
      return headings.filter((heading) => heading.classList.contains('finger-option')).map((heading) => ({
        name: text(heading.textContent), heading,
        feature: headings[headings.indexOf(heading) + 1]?.classList.contains('finger-feature') ? headings[headings.indexOf(heading) + 1] : null,
      }));
    }
    if (copy.classList.contains('association-options-copy')) {
      return headings.filter((_heading, index) => index % 2 === 0).map((heading, index) => ({ name: text(heading.textContent), heading, feature: headings[index * 2 + 1] || null }));
    }
    return headings.map((heading) => ({ name: text(heading.textContent), heading, feature: null }));
  };
  const classCards = async () => {
    if (!classSelect.value || !levelSelect.value) return [];
    const documentFragment = await page(classSelect.value);
    const className = text(classSelect.selectedOptions[0].textContent);
    const selectedLevel = Number(levelSelect.value);
    const overview = documentFragment.querySelector('main .class-copy');
    const cards = [card('class', className, 'Class', markup(overview?.children || []))];
    const rows = Array.from(documentFragment.querySelectorAll('table tbody tr')).filter((row) => /^\d+(?:st|nd|rd|th)$/i.test(text(row.cells?.[0]?.textContent)) && row.cells.length >= 3);
    const allowed = new Set(rows.filter((row) => Number.parseInt(row.cells[0].textContent, 10) <= selectedLevel)
      .flatMap((row) => text(row.cells[2].textContent).split(',').map((name) => name.replace(/\s*\([^)]*\)/g, '').replace(/\s+feature$/i, '').trim().toLowerCase()))
      .filter((name) => name && !/^(martial archetype|arcane tradition|sacred oath|otherworldly patron|druid circle|bard college|ranger archetype|roguish archetype|sorcerous origin|monastic tradition|primal path|divine domain)$/.test(name)));
    const headings = Array.from(documentFragment.querySelectorAll('.feature-section > h2, .feature-section > h3:not(.minor-heading)'))
      .filter((heading) => !/^class features$/i.test(text(heading.textContent)));
    headings.forEach((heading) => {
      const featureName = text(heading.textContent);
      if (!allowed.has(featureName.toLowerCase())) return;
      cards.push(card('feature', featureName, `${className} Class Feature`, following(heading)));
    });
    for (const input of equipmentOptions.querySelectorAll('input:checked')) cards.push(...await equipmentCards(input.value));
    if (subclassSelect.value) {
      const subclassDocument = await page(subclassSelect.value);
      const subclassName = text(subclassSelect.selectedOptions[0].textContent);
      const subclassContent = subclassDocument.querySelector('main .subclass-content, main .class-copy');
      const subclassChildren = Array.from(subclassContent?.children || []);
      const firstFeature = subclassChildren.findIndex((node) => node.matches('h2'));
      const introduction = firstFeature === -1 ? subclassChildren : subclassChildren.slice(0, firstFeature);
      cards.push(card('class', subclassName, `${className} Subclass`, markup(introduction)));
      Array.from(subclassContent?.querySelectorAll(':scope > h2') || []).forEach((heading) => {
        const description = following(heading, 'h2');
        const levelMatch = text(description).match(/\b(\d+)(?:st|nd|rd|th)\s+level\b/i);
        const minimumLevel = levelMatch ? Number(levelMatch[1]) : 1;
        if (minimumLevel <= selectedLevel) cards.push(card('feature', text(heading.textContent), `${subclassName} Subclass Feature`, description));
      });
    }
    return cards;
  };
  const backgroundCards = async () => {
    if (!backgroundSelect.value) return [];
    const documentFragment = await page(backgroundSelect.value);
    const backgroundName = text(backgroundSelect.selectedOptions[0].textContent);
    const copy = documentFragment.querySelector('main .class-copy');
    const backgroundChildren = Array.from(copy?.children || []);
    const firstSection = backgroundChildren.findIndex((node) => node.matches('h2'));
    const description = firstSection === -1 ? backgroundChildren : backgroundChildren.slice(0, firstSection);
    const cards = [card('feature', backgroundName, 'Background', markup(description.filter((node) => node.matches('p'))))];
    for (const equipment of listedEquipment(description)) cards.push(...await equipmentCards(equipment));
    Array.from(copy?.querySelectorAll(':scope > h2') || []).filter((heading) => !/(?:options|using these backgrounds)$/i.test(text(heading.textContent))).forEach((heading) => {
      cards.push(card('feature', text(heading.textContent), `${backgroundName} Background Feature`, following(heading)));
    });
    const selected = backgroundOptions.querySelector('input:checked')?.value;
    if (selected) {
      const optionsHeading = Array.from(copy.querySelectorAll(':scope > h2')).find((heading) => /(?:district of origin|association options|affiliate options)/i.test(text(heading.textContent)));
      const option = optionsHeading && backgroundOptionCards(copy, optionsHeading).find((item) => item.name === selected);
      if (option) {
        cards.push(card('feature', option.name, `${backgroundName} Option`, following(option.heading, 'h3')));
        for (const equipment of listedEquipment([option.heading.nextElementSibling, option.heading.nextElementSibling?.nextElementSibling].filter(Boolean))) cards.push(...await equipmentCards(equipment));
        if (option.feature) cards.push(card('feature', text(option.feature.textContent), `${option.name} Feature`, following(option.feature, 'h3')));
      }
    }
    return cards;
  };
  const raceCards = async () => {
    if (!raceSelect.value) return [];
    const documentFragment = await page(raceSelect.value);
    const raceName = text(raceSelect.selectedOptions[0].textContent);
    const copy = documentFragment.querySelector('main .class-copy');
    const children = Array.from(copy?.children || []);
    const firstRaceOption = children.findIndex((node) => node.matches('h2'));
    const base = firstRaceOption === -1 ? children : children.slice(0, firstRaceOption);
    const firstTrait = base.findIndex((node) => node.matches('ul, ol'));
    const overview = firstTrait === -1 ? base : base.slice(0, firstTrait);
    const traits = firstTrait === -1 ? [] : base.slice(firstTrait);
    const cards = [];
    if (overview.length) cards.push(card('race', raceName, 'Race Description', markup(overview)));
    if (traits.length) cards.push(card('race', `${raceName} Traits`, 'Race Statistics', markup(traits)));
    const selected = raceOptions.querySelector('input:checked')?.value;
    if (selected) {
      const option = Array.from(copy?.querySelectorAll(':scope > h2') || []).find((heading) => text(heading.textContent) === selected);
      if (option) cards.push(card('race', option.textContent, `${raceName} Subrace`, following(option, 'h2')));
    }
    return cards;
  };

  // Minimal ZIP writer: JPG blobs are already compressed, so ZIP's store mode
  // keeps the download fast and avoids an external dependency.
  const crcTable = (() => { const table = new Uint32Array(256); for (let i = 0; i < 256; i += 1) { let value = i; for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1; table[i] = value >>> 0; } return table; })();
  const crc32 = (bytes) => { let value = 0xffffffff; for (const byte of bytes) value = crcTable[(value ^ byte) & 0xff] ^ (value >>> 8); return (value ^ 0xffffffff) >>> 0; };
  const u16 = (value) => [value & 255, (value >>> 8) & 255];
  const u32 = (value) => [value & 255, (value >>> 8) & 255, (value >>> 16) & 255, (value >>> 24) & 255];
  const zip = (files) => {
    const encoder = new TextEncoder(); let offset = 0; const local = []; const central = [];
    files.forEach(({ path, bytes }) => { const name = encoder.encode(path); const crc = crc32(bytes); const header = new Uint8Array([...u32(0x04034b50), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(crc), ...u32(bytes.length), ...u32(bytes.length), ...u16(name.length), ...u16(0), ...name]); local.push(header, bytes); central.push(new Uint8Array([...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(crc), ...u32(bytes.length), ...u32(bytes.length), ...u16(name.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(offset), ...name])); offset += header.length + bytes.length; });
    const centralSize = central.reduce((total, bytes) => total + bytes.length, 0);
    return new Blob([...local, ...central, new Uint8Array([...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(files.length), ...u16(files.length), ...u32(centralSize), ...u32(offset), ...u16(0)])], { type: 'application/zip' });
  };
  const buildZip = async () => {
    const groups = [
      ['Class', await classCards()],
      ['Background', await backgroundCards()],
      ['Race', await raceCards()],
    ].filter(([, cards]) => cards.length);
    if (!groups.length) throw new Error('Choose at least one complete class, background, or race selection.');
    const files = [];
    for (const [folder, cards] of groups) {
      for (const size of ['portrait', 'square']) {
        const outputFolder = size === 'portrait' ? 'normal' : 'square';
        const back = await window.TTSCardRenderer.backJpeg(size);
        files.push({ path: `${folder}/${outputFolder}/00-elysium-card-back.jpg`, bytes: new Uint8Array(await back.arrayBuffer()) });
        for (let index = 0; index < cards.length; index += 1) {
          const image = await window.TTSCardRenderer.jpeg(cards[index], size);
          files.push({ path: `${folder}/${outputFolder}/${String(index + 1).padStart(2, '0')}-${safeName(cards[index].title)}.jpg`, bytes: new Uint8Array(await image.arrayBuffer()) });
        }
      }
    }
    return zip(files);
  };
  const perkCard = (perk) => ({ type: 'perk', title: perk.name, subtitle: 'Perk', description: perk.description || '', requirement: perk.requirements || '' });
  const conditionEntries = async () => {
    const conditionsUrl = new URL('../systems/rules/conditions.html?v=2', document.baseURI);
    const documentFragment = await page(conditionsUrl.href);
    return Array.from(documentFragment.querySelectorAll('#conditions > h2')).map((heading) => ({
      id: safeName(text(heading.textContent)),
      name: text(heading.textContent),
      description: following(heading, 'h2'),
    }));
  };
  const perksMode = () => catalogMode?.value === 'perks';
  const conditionsMode = () => catalogMode?.value === 'conditions';
  const catalogName = () => conditionsMode() ? 'condition' : (perksMode() ? 'perk' : 'spell');
  const selectedCatalog = () => conditionsMode() ? selectedConditions : (perksMode() ? selectedPerks : selectedSpells);
  const updateSpellReady = () => {
    const selected = selectedCatalog();
    const name = catalogName();
    spellDownload.disabled = selected.size === 0;
    spellDownload.textContent = `Download ${name[0].toUpperCase()}${name.slice(1)} ZIP`;
    spellStatus.textContent = selected.size
      ? `${selected.size} ${name}${selected.size === 1 ? '' : 's'} selected for export.`
      : `Select one or more ${name}s to enable the export.`;
  };
  const renderSpellResults = async () => {
    const query = text(spellSearch.value).toLowerCase();
    const isPerks = perksMode();
    const isConditions = conditionsMode();
    const spells = (isConditions ? await conditionEntries() : (isPerks ? (window.PERKS || []) : (window.SPELLS || []))).filter((spell) => {
      const searchable = isPerks
        ? [spell.name, spell.requirements, spell.description].join(' ').toLowerCase()
        : (isConditions ? [spell.name, spell.description].join(' ').toLowerCase() : [spell.name, spell.school, ...(spell.classes || [])].join(' ').toLowerCase());
      return !query || searchable.includes(query);
    }).sort((first, second) => first.name.localeCompare(second.name));
    spellResults.replaceChildren();
    if (!spells.length) {
      const empty = document.createElement('p');
      empty.textContent = `No ${isConditions ? 'conditions' : (isPerks ? 'perks' : 'spells')} match that search.`;
      spellResults.appendChild(empty);
      return;
    }
    spells.slice(0, 80).forEach((spell) => {
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = selectedCatalog().has(spell.id);
      input.addEventListener('change', () => {
        if (input.checked) selectedCatalog().add(spell.id);
        else selectedCatalog().delete(spell.id);
        updateSpellReady();
      });
      const detail = isPerks
        ? (spell.requirements ? `Requirement: ${spell.requirements}` : 'Perk')
        : (isConditions ? 'Condition' : `${spell.level === 0 ? 'Cantrip' : `${spell.level}${spell.level === 1 ? 'st' : spell.level === 2 ? 'nd' : spell.level === 3 ? 'rd' : 'th'} level`} ${spell.school}`);
      label.append(input, document.createTextNode(`${spell.name} — ${detail}`));
      spellResults.appendChild(label);
    });
  };
  const buildSpellZip = async () => {
    const isPerks = perksMode();
    const isConditions = conditionsMode();
    const cards = isConditions
      ? (await conditionEntries()).filter((condition) => selectedConditions.has(condition.id)).map((condition) => card('condition', condition.name, 'Condition', condition.description))
      : (isPerks
      ? [...selectedPerks].map((id) => (window.PERKS || []).find((perk) => perk.id === id)).filter(Boolean).map(perkCard)
      : [...selectedSpells].map((id) => window.TTSSpellCatalog.get(id)).filter(Boolean));
    if (!cards.length) throw new Error(`Select one or more ${isConditions ? 'conditions' : (isPerks ? 'perks' : 'spells')} to export.`);
    const category = isConditions ? 'Conditions' : (isPerks ? 'Perks' : 'Spells');
    const files = [];
    for (const size of ['portrait', 'square']) {
      const folder = size === 'portrait' ? 'normal' : 'square';
      const back = await window.TTSCardRenderer.backJpeg(size);
      files.push({ path: `${category}/${folder}/00-elysium-card-back.jpg`, bytes: new Uint8Array(await back.arrayBuffer()) });
      for (let index = 0; index < cards.length; index += 1) {
        const image = await window.TTSCardRenderer.jpeg(cards[index], size);
        files.push({ path: `${category}/${folder}/${String(index + 1).padStart(3, '0')}-${safeName(cards[index].title)}.jpg`, bytes: new Uint8Array(await image.arrayBuffer()) });
      }
    }
    return zip(files);
  };
  classSelect.addEventListener('change', async () => { levelSelect.replaceChildren(new Option(classSelect.value ? 'Choose a level' : 'Choose a class first', '')); levelSelect.disabled = !classSelect.value; if (classSelect.value) for (let level = 1; level <= 20; level += 1) levelSelect.add(new Option(`Level ${level}`, String(level))); populateSubclasses(); await displayEquipmentChoices(); updateReady(); });
  levelSelect.addEventListener('change', updateReady);
  backgroundSelect.addEventListener('change', async () => { await displayBackgroundOptions(); updateReady(); });
  raceSelect.addEventListener('change', async () => { await displayRaceOptions(); updateReady(); });
  spellSearch.addEventListener('input', renderSpellResults);
  catalogMode?.addEventListener('change', () => {
    const isPerks = perksMode();
    const isConditions = conditionsMode();
    catalogSearchLabel.childNodes[0].nodeValue = isConditions ? 'Find conditions\n              ' : (isPerks ? 'Find perks\n              ' : 'Find spells\n              ');
    spellSearch.placeholder = isConditions ? 'Search by condition name or effect' : (isPerks ? 'Search by perk name, requirement, or effect' : 'Search by spell name, school, or class');
    spellSearch.value = '';
    renderSpellResults();
    updateSpellReady();
  });
  spellDownload.addEventListener('click', async () => {
    spellDownload.disabled = true;
    const isPerks = perksMode();
    const name = catalogName();
    spellStatus.textContent = `Rendering ${isPerks ? 'perk' : 'spell'} cards and building the ZIP…`;
    if (conditionsMode()) spellStatus.textContent = 'Rendering condition cards and building the ZIP...';
    try {
      const archive = await buildSpellZip();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(archive);
      link.download = `elysium-${name}-cards.zip`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      spellStatus.textContent = `${name[0].toUpperCase()}${name.slice(1)} ZIP downloaded.`;
    } catch (error) {
      spellStatus.textContent = error.message || `The ${name} export could not be completed.`;
    } finally { updateSpellReady(); }
  });
  renderSpellResults();
  updateSpellReady();
  downloadButton.addEventListener('click', async () => {
    downloadButton.disabled = true;
    status.textContent = 'Rendering JPG cards and building the ZIP…';
    try {
      const archive = await buildZip();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(archive);
      link.download = 'elysium-batch-cards.zip';
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      status.textContent = 'Batch ZIP downloaded.';
    } catch (error) {
      status.textContent = error.message || 'The batch export could not be completed.';
    } finally { updateReady(); }
  });
  Promise.all([
    classEntries(),
    entriesFromIndex('../backgrounds/index.html', '.background-list a[href]'),
    entriesFromIndex('../races/index.html', '.race-list a[href]'),
  ]).then(([classes, backgrounds, races]) => {
    classes.forEach((entry) => classCatalog.set(entry.url, entry));
    addOptions(classSelect, classes); addOptions(backgroundSelect, backgrounds); addOptions(raceSelect, races);
    status.textContent = 'Choose at least one class, background, or race to enable the export.';
  }).catch(() => { status.textContent = 'The catalog could not be loaded for the batch importer.'; });
})();
