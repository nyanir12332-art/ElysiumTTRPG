(() => {
  const $ = (selector) => document.querySelector(selector);
  const XP_TO_LEVEL = 10000;
  const abilities = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'];
  const skills = ['Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception', 'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion', 'Sleight of Hand', 'Stealth', 'Survival'];
  const standardArray = [15, 14, 13, 12, 10, 8];
  const blankAbilityArray = () => Object.fromEntries(abilities.map(ability => [ability, '']));
  const state = { name: '', avatar: '', avatarScale: 1, avatarX: 0, avatarY: 0, class: '', race: '', subrace: '', background: '', backgroundOption: '', size: 'Medium', levelOnePerk: '', level: 1, classLevels: {}, hpFirstLevel: 0, hpHigherLevel: 0, xp: 0, perksPerLevel: false, perks: [], featureChoices: [], levelOneFeatures: [], levelOneFeatureChoices: {}, skillProficiencies: [], equipmentChoices: {}, equipmentItems: {}, inventory: [], sheetReady: false, abilityArray: blankAbilityArray(), racialIncreaseMode: 'three-plus-one', racialIncreases: ['', '', ''], scores: Object.fromEntries(abilities.map(a => [a, 0])), notes: '', details: '' };
  let avatarImage = null;
  let classSkillChoice = null;
  let levelOneChoiceDefinitions = [];
  const sources = { class: '../classes/classes.html', race: '../races/index.html', background: '../backgrounds/index.html', perk: '../scripts/perks.js' };
  // Keep the primary class list in the builder as well as in classes.html.  This
  // is intentionally a small, stable index: the detailed rules are still read
  // from the individual class pages after a player makes a selection.
  const classOptions = [
    ['Artificer', 'artificer.html'], ['Barbarian', 'barbarian.html'], ['Bard', 'bard.html'],
    ['Blood Hunter', 'blood-hunter.html'], ['Cleric', 'cleric.html'], ['Druid', 'druid.html'],
    ['Fighter', 'fighter.html'], ['Monk', 'monk.html'], ['Mystic', 'mystic.html'],
    ['Paladin', 'paladin.html'], ['Ranger', 'ranger.html'], ['Rogue', 'rogue.html'],
    ['Sorcerer', 'sorcerer.html'], ['Warlock', 'warlock.html'], ['Wizard', 'wizard.html'],
  ].map(([label, value]) => ({ label, value }));
  const selects = { class: $('#class-select'), race: $('#race-select'), background: $('#background-select') };
  const details = { class: $('#class-details'), race: $('#race-details'), background: $('#background-details') };
  const equipmentCategories = [
    { pattern: /\b(?:any\s+two|two)\s+simple\s+melee\s+weapons?\b/i, categories: ['Simple Melee Weapons'], count: 2, label: 'simple melee weapon' },
    { pattern: /\b(?:any\s+two|two)\s+simple\s+weapons?\b/i, categories: ['Simple Melee Weapons', 'Simple Ranged Weapons'], count: 2, label: 'simple weapon' },
    { pattern: /\b(?:any\s+two|two)\s+martial\s+weapons?\b/i, categories: ['Martial Melee Weapons', 'Martial Ranged Weapons'], count: 2, label: 'martial weapon' },
    { pattern: /\b(?:a|an|any)\s+simple\s+melee\s+weapon\b/i, categories: ['Simple Melee Weapons'], count: 1, label: 'simple melee weapon' },
    { pattern: /\b(?:a|an|any)\s+martial\s+melee\s+weapon\b/i, categories: ['Martial Melee Weapons'], count: 1, label: 'martial melee weapon' },
    { pattern: /\b(?:a|an|any)\s+simple\s+weapon\b/i, categories: ['Simple Melee Weapons', 'Simple Ranged Weapons'], count: 1, label: 'simple weapon' },
    { pattern: /\b(?:a|an|any)\s+martial\s+weapon\b/i, categories: ['Martial Melee Weapons', 'Martial Ranged Weapons'], count: 1, label: 'martial weapon' },
    { pattern: /\b(?:a|an|any)\s+basic\s+firearm\b/i, categories: ['Basic Firearms'], count: 1, label: 'basic firearm' },
    { pattern: /\b(?:a|an|any)\s+advanced\s+firearm\b/i, categories: ['Advanced Firearms'], count: 1, label: 'advanced firearm' },
  ];
  let equipmentCatalog;
  const loadEquipmentCatalog = async () => {
    if (!equipmentCatalog) equipmentCatalog = (async () => { const doc = new DOMParser().parseFromString(await fetch('../items/index.html').then(r => r.text()), 'text/html'); const groups = new Map(); doc.querySelectorAll('.weapons-section, .firearms-section').forEach(section => { const group = clean(section.querySelector(':scope > .item-group-title')?.textContent); if (group) groups.set(group, [...section.querySelectorAll('tbody tr')].map(row => clean(row.cells?.[0]?.textContent)).filter(Boolean)); }); return groups; })();
    return equipmentCatalog;
  };
  const renderEquipmentItemPickers = async (root, key, choice) => {
    const target = root.querySelector(`[data-equipment-item-picker="${key}"]`); if (!target) return;
    const definition = equipmentCategories.find(entry => entry.pattern.test(choice)); if (!definition) { target.replaceChildren(); return; }
    const catalog = await loadEquipmentCatalog(); const items = definition.categories.flatMap(category => catalog.get(category) || []); target.innerHTML = Array.from({ length: definition.count }, (_, index) => { const itemKey = `${key}-${index}`; return `<label><span>${definition.label} ${definition.count > 1 ? index + 1 : ''}</span><select data-equipment-item="${itemKey}"><option value="">Choose ${definition.label}</option>${items.map(item => `<option${state.equipmentItems[itemKey] === item ? ' selected' : ''}>${item}</option>`).join('')}</select></label>`; }).join('');
    target.querySelectorAll('[data-equipment-item]').forEach(select => select.addEventListener('change', () => state.equipmentItems[select.dataset.equipmentItem] = select.value));
  };

  const clean = (text = '') => String(text).replace(/\s+/g, ' ').trim();
  const escapeRegExp = (text) => String(text).split('').map(character => '\\.^$*+?()[]{}|'.includes(character) ? `\\${character}` : character).join('');
  const title = (value) => value.replace(/\.html$/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const racialBonus = index => state.racialIncreaseMode === 'two-plus-one' && index === 0 ? 2 : 1;
  const racialIncreaseCount = () => state.racialIncreaseMode === 'two-plus-one' ? 2 : 3;
  const refreshScores = () => abilities.forEach(ability => {
    const base = Number(state.abilityArray[ability]) || 0;
    const increase = state.racialIncreases.slice(0, racialIncreaseCount()).reduce((total, choice, index) => total + (choice === ability ? racialBonus(index) : 0), 0);
    state.scores[ability] = base ? base + increase : 0;
  });
  const renderRaceAbilityIncreases = () => {
    const section = $('#race-ability-increase-choice'), box = $('#racial-ability-increases');
    if (!section || !box) return;
    section.hidden = !state.race;
    if (!state.race) { box.replaceChildren(); return; }
    const count = racialIncreaseCount(), chosen = state.racialIncreases.slice(0, count).filter(Boolean);
    box.innerHTML = `<div class="racial-choice-options" role="group" aria-label="Ability score increase choices"><button type="button" data-racial-choice="two-plus-one" aria-pressed="${state.racialIncreaseMode === 'two-plus-one'}" title="Increase one ability by 2 and a different ability by 1"><strong>+2 to one ability, +1 to another</strong></button><button type="button" data-racial-choice="three-plus-one" aria-pressed="${state.racialIncreaseMode === 'three-plus-one'}" title="Increase three different abilities by 1"><strong>+1 to three abilities</strong></button></div><div class="racial-increase-slots">${state.racialIncreases.slice(0, count).map((choice, index) => `<label>Ability score +${racialBonus(index)}<select data-racial-increase="${index}"><option value="">Choose ability</option>${abilities.map(ability => `<option value="${ability}"${choice === ability ? ' selected' : ''}${choice !== ability && chosen.includes(ability) ? ' hidden' : ''}>${ability}</option>`).join('')}</select></label>`).join('')}</div>`;
    box.querySelectorAll('[data-racial-choice]').forEach(button => button.addEventListener('click', () => { state.racialIncreaseMode = button.dataset.racialChoice; state.racialIncreases = ['', '', '']; refreshScores(); render(); }));
    box.querySelectorAll('[data-racial-increase]').forEach(select => select.addEventListener('change', () => { state.racialIncreases[Number(select.dataset.racialIncrease)] = select.value; refreshScores(); render(); }));
  };
  const parseSkillChoice = (line) => {
    const match = line.match(/^Skills:\s*Choose\s+(?:(one|two|three|four)|any\s+(one|two|three|four))(?:\s+skills?)?(?:\s+from\s+(.+))?$/i);
    if (!match) return null;
    const count = { one: 1, two: 2, three: 3, four: 4 }[(match[1] || match[2]).toLowerCase()];
    const options = match[3] ? match[3].replace(/,?\s+and\s+/i, ', ').split(',').map(clean).filter(Boolean) : skills;
    return { count, options };
  };
  const renderClassSkillChoices = () => {
    const box = $('#class-skill-proficiencies');
    if (!box || !classSkillChoice) return;
    const { count, options } = classSkillChoice;
    const selected = state.skillProficiencies.filter(skill => options.includes(skill)).slice(0, count);
    state.skillProficiencies = selected;
    box.innerHTML = Array.from({ length: count }, (_, index) => { const choice = selected[index] || ''; return `<label>Skill ${index + 1}<select data-class-skill="${index}"><option value="">Choose skill</option>${options.map(skill => `<option value="${skill}"${choice === skill ? ' selected' : ''}${choice !== skill && selected.includes(skill) ? ' hidden' : ''}>${skill}</option>`).join('')}</select></label>`; }).join('');
    box.querySelectorAll('[data-class-skill]').forEach(select => select.addEventListener('change', () => { state.skillProficiencies[Number(select.dataset.classSkill)] = select.value; renderClassSkillChoices(); renderLevelOneFeatureChoices(); }));
  };
  const renderLevelOneFeatureChoices = () => {
    const box = $('#level-one-feature-choices');
    if (!box) return;
    box.innerHTML = levelOneChoiceDefinitions.map(definition => {
      const options = definition.options(), selected = (state.levelOneFeatureChoices[definition.key] || []).filter(choice => options.includes(choice)).slice(0, definition.count);
      state.levelOneFeatureChoices[definition.key] = selected;
      return `<section><h4>${definition.label}</h4><div>${Array.from({ length: definition.count }, (_, index) => { const choice = selected[index] || ''; return `<label>${definition.count > 1 ? `${definition.label} ${index + 1}` : definition.label}<select data-level-one-choice="${definition.key}" data-choice-index="${index}"><option value="">Choose option</option>${options.map(option => `<option value="${option}"${choice === option ? ' selected' : ''}${choice !== option && selected.includes(option) ? ' hidden' : ''}>${option}</option>`).join('')}</select></label>`; }).join('')}</div></section>`;
    }).join('');
    box.querySelectorAll('[data-level-one-choice]').forEach(select => select.addEventListener('change', () => { const choices = state.levelOneFeatureChoices[select.dataset.levelOneChoice] || []; choices[Number(select.dataset.choiceIndex)] = select.value; state.levelOneFeatureChoices[select.dataset.levelOneChoice] = choices; renderLevelOneFeatureChoices(); }));
  };
  const drawAvatar = () => {
    const canvas = $('#avatar-canvas'), ctx = canvas.getContext('2d');
    ctx.fillStyle = '#020503'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (avatarImage) { const size = Math.min(avatarImage.width, avatarImage.height) / state.avatarScale; const spareX = Math.max(0, avatarImage.width - size), spareY = Math.max(0, avatarImage.height - size); const x = spareX / 2 + state.avatarX * spareX / 2; const y = spareY / 2 + state.avatarY * spareY / 2; ctx.drawImage(avatarImage, x, y, size, size, 0, 0, canvas.width, canvas.height); }
    else { ctx.strokeStyle = '#145f35'; ctx.lineWidth = 4; ctx.strokeRect(20, 20, 200, 200); ctx.beginPath(); ctx.arc(120, 92, 34, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(120, 184, 55, Math.PI, 0); ctx.stroke(); }
    const sheetAvatar = $('#sheet-avatar'); if (sheetAvatar) sheetAvatar.getContext('2d').drawImage(canvas, 0, 0, sheetAvatar.width, sheetAvatar.height);
  };
  const populate = async (kind) => {
    try {
      if (kind === 'class') {
        return [...selects.class.options].filter(option => option.value).map(option => ({ label: option.textContent.trim(), value: option.value }));
      }
      if (kind === 'perk') {
        const source = await fetch(sources.perk).then(r => r.text());
        return [...source.matchAll(/"id"\s*:\s*"([^"]+)"\s*,\s*"name"\s*:\s*"([^"]+)"/g)].map(match => ({ value: match[1], label: match[2] }));
      }
      const doc = new DOMParser().parseFromString(await fetch(sources[kind]).then(r => r.text()), 'text/html');
      const links = [...doc.querySelectorAll(kind === 'class' ? '.class-entry > h3 a' : 'main a.class-title-link')];
      const list = links.map(a => ({ label: clean(a.textContent).replace(/^Subclass:\s*/, ''), value: a.getAttribute('href') })).filter((item, index, array) => item.value && array.findIndex(x => x.value === item.value) === index);
      list.forEach(item => selects[kind].append(new Option(item.label, item.value)));
      return list;
    } catch (error) {
      console.error(`Could not load ${kind} options`, error);
      return [];
    }
  };
  const extract = async (kind, href) => {
    if (!href) { details[kind].textContent = ''; return; }
    const base = new URL(sources[kind], location.href); const page = new URL(href, base);
    try {
      const doc = new DOMParser().parseFromString(await fetch(page).then(r => r.text()), 'text/html');
      const headings = [...doc.querySelectorAll('h2, h3, h4')];
      const sectionNodes = heading => { const nodes = []; for (let node = heading?.nextElementSibling; node && !/^H[2-4]$/.test(node.tagName); node = node.nextElementSibling) nodes.push(node); return nodes; };
      const featureSectionNodes = heading => { const nodes = []; for (let node = heading?.nextElementSibling; node; node = node.nextElementSibling) { if (/^H[2-4]$/.test(node.tagName) && !node.classList.contains('minor-heading')) break; nodes.push(node); } return nodes; };
      const featureName = value => clean(value).replace(/\s*\([^)]*\)\s*$/, '');
      const levelOneFeatures = (() => {
        if (kind !== 'class') return [];
        const table = [...doc.querySelectorAll('table')].find(candidate => [...candidate.querySelectorAll('thead th')].some(header => /^features?$/i.test(clean(header.textContent))));
        const headers = table ? [...table.querySelectorAll('thead th')] : [], featureIndex = headers.findIndex(header => /^features?$/i.test(clean(header.textContent)));
        const row = featureIndex < 0 ? null : [...table.querySelectorAll('tbody tr')].find(candidate => /^1st$/i.test(clean(candidate.cells[0]?.textContent || '')));
        const names = row ? clean(row.cells[featureIndex]?.textContent || '').split(',').map(featureName).filter(name => name && name !== '-') : [];
        return names.map(name => {
          const heading = headings.find(candidate => featureName(candidate.textContent).toLowerCase() === name.toLowerCase());
          const description = featureSectionNodes(heading).filter(node => node.matches('p, ul, ol')).map(node => clean(node.textContent)).filter(Boolean).join(' ');
          return { name, description };
        });
      })();
      let bloodCurses = [];
      if (kind === 'class' && levelOneFeatures.some(feature => feature.name === 'Blood Maledict')) {
        try {
          const curseDoc = new DOMParser().parseFromString(await fetch(new URL('blood-hunter/blood-hunter-blood-curses.html', page)).then(response => response.text()), 'text/html');
          bloodCurses = [...curseDoc.querySelectorAll('h2')].filter(heading => !/Prerequisite:/i.test(clean(heading.nextElementSibling?.textContent || ''))).map(heading => clean(heading.textContent)).filter(Boolean);
        } catch { bloodCurses = []; }
      }
      const levelOneChoiceDefinitionsForClass = (() => {
        if (kind !== 'class') return [];
        const linkedChoices = { 'Divine Domain': 'Domain', 'Sorcerous Origin': 'Origin', 'Otherworldly Patron': 'Patron', 'Mystic Order': 'Order' };
        return levelOneFeatures.flatMap(feature => {
          if (feature.name === 'Expertise') return [{ key: 'expertise', label: 'Expertise', count: 2, options: () => [...state.skillProficiencies.filter(Boolean), "Thieves' tools"] }];
          if (feature.name === 'Deft Explorer') return [{ key: 'canny', label: 'Canny', count: 1, options: () => state.skillProficiencies.filter(Boolean) }];
          if (feature.name === 'Blood Maledict') return bloodCurses.length ? [{ key: 'blood-maledict', label: 'Blood Curse', count: 1, options: () => bloodCurses }] : [];
          const featureHeading = headings.find(candidate => featureName(candidate.textContent).toLowerCase() === feature.name.toLowerCase());
          if (feature.name === 'Fighting Style') {
            const options = [...(sectionNodes(featureHeading).find(node => node.matches('ul'))?.querySelectorAll(':scope > li') || [])].map(item => clean(item.querySelector('strong')?.textContent).replace(/[.:]$/, '')).filter(Boolean);
            return options.length ? [{ key: 'fighting-style', label: 'Fighting Style', count: 1, options: () => options }] : [];
          }
          const linkedHeadingName = linkedChoices[feature.name];
          if (!linkedHeadingName) return [];
          const choiceHeading = headings.find(candidate => featureName(candidate.textContent).toLowerCase() === linkedHeadingName.toLowerCase());
          const options = [...(sectionNodes(choiceHeading).find(node => node.matches('ul'))?.querySelectorAll('a.class-title-link') || [])].map(link => clean(link.textContent)).filter(Boolean);
          return options.length ? [{ key: feature.name.toLowerCase().replace(/\s+/g, '-'), label: feature.name, count: 1, options: () => options }] : [];
        });
      })();
      const trait = label => { const item = [...doc.querySelectorAll('li')].find(li => { const traitLabel = clean(li.querySelector('strong')?.textContent); return traitLabel && traitLabel.replace(/[.:]$/, '').toLowerCase() === label.toLowerCase(); }); return item ? clean(item.textContent).replace(new RegExp(`^${label}[.:]?\\s*`, 'i'), '') : ''; };
      const proficiencyHeading = headings.find(heading => /^proficiencies$/i.test(clean(heading.textContent)) || /^skill proficiencies$/i.test(clean(heading.textContent)));
      const equipmentHeading = headings.find(heading => /^equipment$/i.test(clean(heading.textContent)));
      const proficiencies = sectionNodes(proficiencyHeading).filter(node => node.matches('p')).map(node => clean(node.textContent));
      if (kind === 'class') { const hpLines = [...doc.querySelectorAll('p')].map(node => clean(node.textContent)); state.hpFirstLevel = Number(hpLines.find(line => /^Hit Points at 1st Level:/i.test(line))?.match(/:\s*(\d+)/)?.[1] || 0); state.hpHigherLevel = Number(hpLines.find(line => /^Hit Points at Higher Levels:/i.test(line))?.match(/:\s*(\d+)/)?.[1] || 0); }
      const equipmentNodes = sectionNodes(equipmentHeading);
      const equipmentList = equipmentNodes.find(node => node.matches('ul'));
      const blocks = kind === 'class'
        ? [['Proficiencies', proficiencies.length ? proficiencies.join(' | ') : 'See the selected class page.'], ['Equipment', equipmentList ? 'Choose each listed starting-equipment option below.' : 'See the selected class page.']]
        : kind === 'race'
          ? [['Ability Score Increase', trait('Ability Score Increase') || 'See the selected race page.'], ['Core Traits', [trait('Size'), trait('Speed')].filter(Boolean).join(' | ') || 'See the selected race page.']]
          : [['Proficiencies', [trait('Skill Proficiencies'), trait('Tool Proficiencies')].filter(Boolean).join(' | ') || 'See the selected background page.'], ['Equipment', trait('Equipment') || 'See the selected background page.']];
      details[kind].innerHTML = blocks.map(([label, value]) => {
        const content = kind === 'class' && label === 'Proficiencies'
          ? `<div class="proficiency-list">${proficiencies.filter(line => !/^Skills:/i.test(line)).map(line => `<p>${line}</p>`).join('')}</div>`
          : `<p>${value}</p>`;
        return `<section class="choice-block"><h3>${label}</h3>${content}</section>`;
      }).join('');
      if (kind === 'class') {
        classSkillChoice = parseSkillChoice(proficiencies.find(line => /^Skills:/i.test(line)) || '');
        state.levelOneFeatures = levelOneFeatures;
        levelOneChoiceDefinitions = levelOneChoiceDefinitionsForClass;
        state.levelOneFeatureChoices = Object.fromEntries(Object.entries(state.levelOneFeatureChoices).filter(([key]) => levelOneChoiceDefinitions.some(definition => definition.key === key)));
        if (classSkillChoice) details.class.insertAdjacentHTML('beforeend', '<section class="class-skill-proficiencies"><h3>Choose skill proficiencies</h3><div id="class-skill-proficiencies"></div></section>');
        if (levelOneFeatures.length) details.class.insertAdjacentHTML('beforeend', `<section class="level-one-features"><h3>Level 1 features</h3><div>${levelOneFeatures.map(feature => `<details><summary>${feature.name}<span>+</span></summary><p>${feature.description || 'See the selected class page for this feature.'}</p></details>`).join('')}</div></section>`);
        if (levelOneChoiceDefinitions.length) details.class.insertAdjacentHTML('beforeend', '<section class="level-one-feature-choices"><h3>Level 1 feature choices</h3><div id="level-one-feature-choices"></div></section>');
      }
      if (kind === 'background') {
        let optionSection = ''; const backgroundOptions = [];
        headings.forEach(heading => { if (heading.tagName === 'H2') optionSection = clean(heading.textContent); if (heading.tagName !== 'H3') return; const nodes = sectionNodes(heading), optionTraits = nodes.flatMap(node => node.matches('ul') ? [...node.querySelectorAll(':scope > li')] : []); if (optionTraits.length || /district of origin/i.test(optionSection)) backgroundOptions.push({ name: clean(heading.textContent), intro: clean(nodes.find(node => node.tagName === 'P')?.textContent), traits: optionTraits.map(item => clean(item.textContent)) }); });
        if (backgroundOptions.length) {
          const optionHeadings = headings.filter(heading => heading.tagName === 'H2').map(heading => clean(heading.textContent)).join(' '); const optionLabel = /association/i.test(optionHeadings) ? 'Association' : /district|nest/i.test(optionHeadings) ? 'Nest / district' : doc.querySelector('.finger-option') ? 'Finger affiliation' : 'Background option';
          details.background.insertAdjacentHTML('beforeend', `<label class="subrace-choice background-option-choice"><span>${optionLabel}</span><select id="background-option-select"><option value="">Choose ${optionLabel.toLowerCase()}</option>${backgroundOptions.map(option => `<option${state.backgroundOption === option.name ? ' selected' : ''}>${option.name}</option>`).join('')}</select></label><section class="background-option-traits" hidden></section>`);
          const optionSelect = $('#background-option-select'), optionPanel = details.background.querySelector('.background-option-traits');
          const showOption = () => { const option = backgroundOptions.find(entry => entry.name === optionSelect.value); optionPanel.hidden = !option; optionPanel.innerHTML = option ? `<h3>${option.name}</h3>${option.intro ? `<p class="subrace-intro">${option.intro}</p>` : ''}<div class="subrace-trait-list">${option.traits.map(full => { const [label, ...rest] = full.split(/\.\s+/); return `<details class="subrace-trait"><summary>${label}<span>+</span></summary><p>${rest.join('. ')}</p></details>`; }).join('')}</div>` : ''; };
          optionSelect.addEventListener('change', () => { state.backgroundOption = optionSelect.value; showOption(); }); showOption();
        }
      }
      if (kind === 'race') {
        const subraces = headings.filter(heading => heading.tagName === 'H2').map(heading => clean(heading.textContent)).filter(Boolean);
        if (subraces.length) {
          details.race.insertAdjacentHTML('beforeend', `<label class="subrace-choice"><span>Subrace</span><select id="subrace-select"><option value="">Choose subrace</option>${subraces.map(name => `<option${state.subrace === name ? ' selected' : ''}>${name}</option>`).join('')}</select></label><section class="subrace-traits" hidden></section>`);
          const select = $('#subrace-select'), traitPanel = details.race.querySelector('.subrace-traits');
          const showSubrace = () => { const heading = headings.find(candidate => clean(candidate.textContent) === select.value); const nodes = sectionNodes(heading); const intro = clean(nodes.find(node => node.tagName === 'P')?.textContent); const traitItems = nodes.flatMap(node => node.matches('ul') ? [...node.querySelectorAll(':scope > li')] : []).map(item => { const full = clean(item.textContent); const label = clean(item.querySelector('strong')?.textContent).replace(/[.:]$/, '') || full.split(/[.:]/)[0]; const description = clean(full.replace(new RegExp(`^${escapeRegExp(label)}[.:]?\\s*`, 'i'), '')); return { label, description }; }).filter(trait => trait.label); traitPanel.hidden = !select.value; traitPanel.innerHTML = select.value ? `<h3>${select.value}</h3>${intro ? `<p class="subrace-intro">${intro}</p>` : ''}<div class="subrace-trait-list">${traitItems.map(trait => `<details class="subrace-trait"><summary>${trait.label}<span>+</span></summary><p>${trait.description}</p></details>`).join('') || '<p>No additional mechanical traits are listed.</p>'}</div>` : ''; };
          select.addEventListener('change', () => { state.subrace = select.value; showSubrace(); }); showSubrace();
        }
      }
      const entries = equipmentList ? [...equipmentList.children].filter(item => item.tagName === 'LI').map(item => clean(item.textContent)) : [];
      if (entries.length) {
        let choiceNumber = 0;
        const fields = entries.map((entry, index) => { const markers = [...entry.matchAll(/\([a-z]\)\s*/gi)]; const options = markers.length ? markers.map((marker, markerIndex) => clean(entry.slice(marker.index + marker[0].length, markers[markerIndex + 1]?.index ?? entry.length)).replace(/(?:,?\s*or)?\s*,?$/i, '')) : [entry]; const key = `${kind}-${index}`; const categoryGrant = equipmentCategories.some(definition => definition.pattern.test(entry)); if (options.length < 2 && !categoryGrant) return `<p class="equipment-grant">${entry}</p>`; choiceNumber += 1; if (options.length < 2) return `<div class="equipment-direct-choice"><span>Equipment choice ${choiceNumber}</span><div class="equipment-item-picker" data-equipment-item-picker="${key}" data-direct-equipment-choice="${entry}"></div></div>`; return `<label><span>Equipment choice ${choiceNumber}</span><select data-equipment-choice="${key}"><option value="">Choose an option</option>${options.map(option => `<option${state.equipmentChoices[key] === option ? ' selected' : ''}>${option}</option>`).join('')}</select><div class="equipment-item-picker" data-equipment-item-picker="${key}"></div></label>`; }).join('');
        details[kind].insertAdjacentHTML('beforeend', `<div class="equipment-choices">${fields}</div>`);
        details[kind].querySelectorAll('[data-equipment-choice]').forEach(select => { select.addEventListener('change', () => { state.equipmentChoices[select.dataset.equipmentChoice] = select.value; renderEquipmentItemPickers(details[kind], select.dataset.equipmentChoice, select.value); }); if (select.value) renderEquipmentItemPickers(details[kind], select.dataset.equipmentChoice, select.value); });
        details[kind].querySelectorAll('[data-direct-equipment-choice]').forEach(picker => renderEquipmentItemPickers(details[kind], picker.dataset.equipmentItemPicker, picker.dataset.directEquipmentChoice));
      }
      if (kind === 'class') state.classLevels[selects.class.value] ||= 1;
      if (kind === 'class') renderClassSkillChoices();
      if (kind === 'class') renderLevelOneFeatureChoices();
    } catch (error) { console.error(`Could not load ${kind} details`, error); details[kind].textContent = 'Details could not be loaded. You can still save this selection.'; }
    try { render(); } catch (error) { console.error('Could not refresh character builder', error); }
  };
  const levelFeatures = async (classHref, level) => {
    if (!classHref) return 'Choose a class first.';
    try { const doc = new DOMParser().parseFromString(await fetch(new URL(classHref, new URL(sources.class, location.href))).then(r => r.text()), 'text/html'); const table = [...doc.querySelectorAll('table')].find(candidate => [...candidate.querySelectorAll('thead th')].some(header => /^features?$/i.test(clean(header.textContent))); const headers = table ? [...table.querySelectorAll('thead th')] : [], featureIndex = headers.findIndex(header => /^features?$/i.test(clean(header.textContent))); const row = featureIndex < 0 ? null : [...table.querySelectorAll('tbody tr')].find(candidate => new RegExp(`^${level}(st|nd|rd|th)?$`, 'i').test(clean(candidate.cells[0]?.textContent || ''))); return row ? clean(row.cells[featureIndex]?.textContent || '') || 'No listed feature at this level.' : 'No listed feature at this level.'; } catch { return 'Features could not be loaded.'; }
  };
  const renderPanel = (tab = document.querySelector('.sheet-tabs button[aria-selected="true"]')?.dataset.sheetTab || 'skills') => {
    const panel = $('#sheet-panel');
    if (tab === 'skills') {
      const bonus = Math.ceil(state.level / 4) + 1;
      const mod = ability => Math.floor((state.scores[ability] - 10) / 2);
      const signed = value => `${value >= 0 ? '+' : ''}${value}`;
      const skills = [['Acrobatics','Dexterity'],['Athletics','Strength'],['History','Intelligence'],['Insight','Wisdom'],['Investigation','Intelligence'],['Perception','Wisdom'],['Stealth','Dexterity'],['Survival','Wisdom']];
      const equipment = details.class.querySelector('.equipment-choices')?.cloneNode(true);
      const backgroundEquipment = details.background.querySelector('.equipment-choices')?.cloneNode(true);
      panel.innerHTML = `<div class="sheet-panel-grid sheet-actions"><article><h3>Skills</h3><div class="skill-rows">${skills.map(([skill, ability]) => `<span>${skill}<strong>${signed(mod(ability))}</strong></span>`).join('')}</div></article><article><h3>Actions</h3><div class="action-rows"><span>Attack <strong>1 action</strong></span><span>Dash <strong>1 action</strong></span><span>Disengage <strong>1 action</strong></span><span>Class Features <strong>${state.class ? 'Available' : '—'}</strong></span></div></article></div><section class="sheet-equipment"><h3>Equipment Choices</h3><div data-class-equipment></div><div data-background-equipment></div></section>`;
      const classTarget = panel.querySelector('[data-class-equipment]'), backgroundTarget = panel.querySelector('[data-background-equipment]');
      const expertise = [...(state.levelOneFeatureChoices.expertise || []), ...(state.levelOneFeatureChoices.canny || [])];
      panel.querySelector('.skill-rows').innerHTML = skills.map(([skill, ability]) => { const proficient = state.skillProficiencies.includes(skill), expert = expertise.includes(skill); return `<span>${skill}${expert ? ' (Expertise)' : proficient ? ' (Proficient)' : ''}<strong>${signed(mod(ability) + (proficient ? bonus : 0) + (expert ? bonus : 0))}</strong></span>`; }).join('');
      if (equipment) classTarget.append(equipment); else classTarget.innerHTML = '<p>There are no class equipment choices to make.</p>';
      if (backgroundEquipment) backgroundTarget.append(backgroundEquipment);
      panel.querySelectorAll('[data-equipment-choice]').forEach(select => select.addEventListener('change', () => { state.equipmentChoices[select.dataset.equipmentChoice] = select.value; }));
    }
    if (tab === 'inventory') { if (window.FableInventory) window.FableInventory.render(panel, state); else panel.textContent = 'Loading inventory…'; }
    if (tab === 'features') { const perks = [state.levelOnePerk, ...state.perks].filter(Boolean); const featureChoices = Object.entries(state.levelOneFeatureChoices).map(([key, choices]) => { const label = levelOneChoiceDefinitions.find(definition => definition.key === key)?.label || key.replace(/-/g, ' '); return choices.filter(Boolean).length ? `<p><strong>${label}:</strong> ${choices.filter(Boolean).join(', ')}</p>` : ''; }).join(''); const classFeatures = state.levelOneFeatures.length ? `<div class="sheet-class-features">${state.levelOneFeatures.map(feature => `<details><summary>${feature.name}<span>+</span></summary><p>${feature.description || 'See the class page for this feature.'}</p></details>`).join('')}</div>` : '<p>No class selected.</p>'; panel.innerHTML = `<div class="sheet-panel-grid"><article><h3>Level 1 Class Features</h3>${classFeatures}${featureChoices}</article><article><h3>Perks</h3><p>${perks.length ? perks.join(', ') : 'No perks chosen.'}</p><p>${state.class ? `Class level: ${state.classLevels[state.class] || 1}` : 'Choose a class.'}</p></article></div>`; }
    if (tab === 'details') panel.innerHTML = `<div class="sheet-panel-grid"><article><h3>Details</h3><textarea id="details-text" aria-label="Character details"></textarea></article></div>`;
    if (tab === 'notes') panel.innerHTML = `<div class="sheet-panel-grid"><article><h3>Notes</h3><textarea id="notes-text" aria-label="Character notes"></textarea></article></div>`;
    const d = $('#details-text'), n = $('#notes-text'); if (d) { d.value = state.details; d.oninput = () => state.details = d.value; } if (n) { n.value = state.notes; n.oninput = () => state.notes = n.value; }
  };
  const render = () => {
    refreshScores();
    $('#character-name').value = state.name; $('#level-value').textContent = state.level; $('#proficiency-value').textContent = `+${Math.ceil(state.level / 4) + 1}`;
    const con = state.scores.Constitution ? Math.floor((state.scores.Constitution - 10) / 2) : 0; const hp = state.hpFirstLevel ? Math.max(1, state.hpFirstLevel + con + Math.max(0, state.level - 1) * (state.hpHigherLevel + con)) : 0; $('#hp-value').textContent = hp;
    const assignedScores = Object.values(state.abilityArray).filter(Boolean);
    const box = $('#ability-scores'); box.innerHTML = abilities.map(ability => { const selected = String(state.abilityArray[ability] || ''), total = state.scores[ability], increase = total - (Number(selected) || 0); return `<label><span>${ability.slice(0,3).toUpperCase()}${selected ? ` · ${total}` : ''}</span><select data-ability-score="${ability}"><option value="">Select score</option>${standardArray.map(score => { const isSelected = selected === String(score); const text = isSelected && increase ? `${score} + ${increase} = ${total}` : score; return `<option value="${score}"${isSelected ? ' selected' : ''}${!isSelected && assignedScores.includes(String(score)) ? ' hidden' : ''}>${text}</option>`; }).join('')}</select></label>`; }).join('');
    box.querySelectorAll('[data-ability-score]').forEach(select => select.addEventListener('change', () => { state.abilityArray[select.dataset.abilityScore] = select.value; refreshScores(); render(); }));
    renderRaceAbilityIncreases();
    renderLevelOneFeatureChoices();
    $('#xp-input').value = state.xp; $('#xp-meter-fill').style.width = `${Math.min(100, state.xp / XP_TO_LEVEL * 100)}%`; $('#xp-text').textContent = `${state.xp.toLocaleString()} / 10,000 XP`; $('#open-level-up').disabled = state.xp < XP_TO_LEVEL || !state.class;
    $('#perks-per-level').checked = state.perksPerLevel; $('#level-one-perk-choice').hidden = !state.perksPerLevel; $('#level-one-perk').value = state.levelOnePerk; $('#sheet-character-size').value = state.size || 'Medium'; drawAvatar(); renderPanel();
    $('#print-character').hidden = !(state.class && state.race && state.background) || state.sheetReady;
    document.querySelector('.character-builder').classList.toggle('sheet-ready', state.sheetReady);
    $('#save-character').hidden = !state.sheetReady;
    $('#sheet-name').textContent = state.name || 'Unknown Wanderer'; $('#sheet-level').textContent = state.level; $('#sheet-origin').textContent = [selects.race.selectedOptions[0]?.textContent, state.subrace, selects.background.selectedOptions[0]?.textContent, selects.class.selectedOptions[0]?.textContent].filter(Boolean).join(' · ') || 'Choose a class, race, and background.'; $('#sheet-hp').textContent = $('#hp-value').textContent; $('#sheet-hp-max').textContent = $('#hp-value').textContent; $('#sheet-abilities').innerHTML = abilities.map(ability => `<span>${ability.slice(0,3).toUpperCase()}<strong>${state.scores[ability]}</strong></span>`).join(''); ['Strength','Dexterity','Constitution'].forEach(ability => { $(`#sheet-${ability.toLowerCase()}`).textContent = `${Math.floor((state.scores[ability] - 10) / 2) >= 0 ? '+' : ''}${Math.floor((state.scores[ability] - 10) / 2)}`; }); $('#sheet-perception').textContent = `+${Math.ceil(state.level / 4) + 1}`; $('#sheet-dc').textContent = 8 + Math.ceil(state.level / 4) + 1;
  };
  const save = () => { state.name = $('#character-name').value.trim(); state.avatar = avatarImage ? $('#avatar-canvas').toDataURL('image/png') : ''; const filename = (state.name || 'character').replace(/[\\/:*?"<>|]+/g, '-'); const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `${filename}.json`; link.click(); URL.revokeObjectURL(link.href); };
  const loadState = (data) => { Object.assign(state, data); state.abilityArray = { ...blankAbilityArray(), ...(data.abilityArray || {}) }; state.racialIncreaseMode = data.racialIncreaseMode === 'two-plus-one' ? 'two-plus-one' : 'three-plus-one'; state.racialIncreases = Array.isArray(data.racialIncreases) ? [...data.racialIncreases.slice(0, 3), '', '', ''].slice(0, 3) : ['', '', '']; state.skillProficiencies = Array.isArray(data.skillProficiencies) ? data.skillProficiencies.filter(Boolean) : []; state.levelOneFeatures = Array.isArray(data.levelOneFeatures) ? data.levelOneFeatures : []; state.levelOneFeatureChoices = data.levelOneFeatureChoices && typeof data.levelOneFeatureChoices === 'object' ? data.levelOneFeatureChoices : {}; state.scores = { ...Object.fromEntries(abilities.map(a => [a, 0])), ...(data.scores || {}) }; state.classLevels ||= {}; state.inventory ||= []; if (state.avatar) { avatarImage = new Image(); avatarImage.onload = render; avatarImage.src = state.avatar; } selects.class.value = state.class || ''; selects.race.value = state.race || ''; selects.background.value = state.background || ''; ['class','race','background'].forEach(k => extract(k, selects[k].value)); render(); };
  const bindOriginSelectors = () => Object.entries(selects).forEach(([kind, select]) => select.addEventListener('change', () => { state[kind] = select.value; if (kind === 'class') { state.skillProficiencies = []; state.levelOneFeatures = []; state.levelOneFeatureChoices = {}; classSkillChoice = null; levelOneChoiceDefinitions = []; } if (kind === 'race') { state.subrace = ''; state.racialIncreaseMode = 'three-plus-one'; state.racialIncreases = ['', '', '']; } if (kind === 'background') state.backgroundOption = ''; extract(kind, select.value); }));
  const init = async () => {
    // A slow index request must never leave an otherwise usable builder inert.
    bindOriginSelectors();
    render();
    await Promise.all(['class','race','background'].map(populate)); const imported = sessionStorage.getItem('fable-character-import'); if (imported) { sessionStorage.removeItem('fable-character-import'); try { loadState(JSON.parse(imported)); } catch { render(); } } else render();
    $('#character-name').addEventListener('input', e => state.name = e.target.value); $('#sheet-character-size').addEventListener('change', e => { state.size = e.target.value; renderPanel('inventory'); }); $('#xp-input').addEventListener('input', e => { state.xp = Math.max(0, Math.min(XP_TO_LEVEL, Number(e.target.value || 0))); render(); }); $('#perks-per-level').addEventListener('change', e => { state.perksPerLevel = e.target.checked; $('#level-one-perk-choice').hidden = !state.perksPerLevel; if (!state.perksPerLevel) state.levelOnePerk = ''; render(); });
    $('#avatar-change').addEventListener('click', () => $('#avatar-file').click()); $('#avatar-file').addEventListener('change', e => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { state.avatarX = 0; state.avatarY = 0; avatarImage = new Image(); avatarImage.onload = render; avatarImage.src = reader.result; }; reader.readAsDataURL(file); }); $('#avatar-scale').addEventListener('input', e => { state.avatarScale = Number(e.target.value); drawAvatar(); });
    const avatarCanvas = $('#avatar-canvas'); let avatarDrag = null; avatarCanvas.addEventListener('pointerdown', event => { if (!avatarImage) return; avatarDrag = { x: event.clientX, y: event.clientY, avatarX: state.avatarX, avatarY: state.avatarY }; avatarCanvas.setPointerCapture(event.pointerId); }); avatarCanvas.addEventListener('pointermove', event => { if (!avatarDrag) return; state.avatarX = Math.max(-1, Math.min(1, avatarDrag.avatarX - (event.clientX - avatarDrag.x) / 56)); state.avatarY = Math.max(-1, Math.min(1, avatarDrag.avatarY - (event.clientY - avatarDrag.y) / 56)); drawAvatar(); }); avatarCanvas.addEventListener('pointerup', () => avatarDrag = null);
    $('#save-character').addEventListener('click', save); $('#print-character').addEventListener('click', () => { state.sheetReady = true; render(); document.querySelector('.sheet-dashboard').scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    document.querySelectorAll('[data-sheet-tab]').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('[data-sheet-tab]').forEach(b => b.setAttribute('aria-selected', 'false')); button.setAttribute('aria-selected', 'true'); renderPanel(button.dataset.sheetTab); }));
    const dialog = $('#level-dialog'); $('#open-level-up').addEventListener('click', async () => { const levelSelect = $('#level-class-select'); levelSelect.innerHTML = state.class ? `<option value="${state.class}">${selects.class.selectedOptions[0]?.textContent || title(state.class)}</option>` : ''; $('#level-perk-choice').hidden = !state.perksPerLevel; const featureText = await levelFeatures(state.class, state.level + 1); $('#level-features').textContent = featureText; const requiresChoice = /archetype|subclass|tradition|domain|patron|college|circle|oath|origin|conclave/i.test(featureText); const featureLabel = $('#level-feature-choice'), featureSelect = $('#feature-choice-select'); featureLabel.hidden = !requiresChoice; featureSelect.innerHTML = '<option value="">Select feature option</option>'; if (requiresChoice) { const classDoc = new DOMParser().parseFromString(await fetch(sources.class).then(r => r.text()), 'text/html'); const selectedTitle = selects.class.selectedOptions[0]?.textContent; const entry = [...classDoc.querySelectorAll('.class-entry')].find(item => clean(item.querySelector('h3')?.textContent) === selectedTitle); [...(entry?.querySelectorAll('.subclass-item a') || [])].forEach(link => featureSelect.append(new Option(clean(link.textContent).replace(/^Subclass:\s*/, ''), link.getAttribute('href')))); } dialog.showModal(); });
    $('#apply-level').addEventListener('click', async () => { const href = $('#level-class-select').value; const feature = $('#feature-choice-select'); if (!$('#level-feature-choice').hidden && !feature.value) { feature.focus(); return; } state.level += 1; state.classLevels[href] = (state.classLevels[href] || 0) + 1; state.xp = 0; if (!$('#level-feature-choice').hidden) state.featureChoices.push(feature.selectedOptions[0].textContent); if (state.perksPerLevel && $('#level-perk-select').value) { const perk = $('#level-perk-select').selectedOptions[0].textContent; state.perks.push(perk); if (perk === 'Giant Blood') state.size = 'Large'; if (perk === 'Broonie Blood') state.size = 'Tiny'; } dialog.close(); render(); });
    const perks = await populate('perk'); const perkSelect = $('#level-perk-select'), levelOneSelect = $('#level-one-perk'); perks.forEach(p => { perkSelect.append(new Option(p.label, p.value)); levelOneSelect.append(new Option(p.label, p.label)); }); levelOneSelect.value = state.levelOnePerk; levelOneSelect.addEventListener('change', () => { state.levelOnePerk = levelOneSelect.value; if (state.levelOnePerk === 'Giant Blood') state.size = 'Large'; if (state.levelOnePerk === 'Broonie Blood') state.size = 'Tiny'; render(); });
  };
  window.FableCharacterBuilder = { state, render, renderPanel };
  init();
})();
