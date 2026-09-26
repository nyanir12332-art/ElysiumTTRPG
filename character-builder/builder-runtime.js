(() => {
  const $ = (selector) => document.querySelector(selector);
  const abilities = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'];
  const skills = ['Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception', 'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion', 'Sleight of Hand', 'Stealth', 'Survival'];
  const skillPreviews = {
    Acrobatics: 'Dexterity: balance, tumble, escape restraints, or land safely on difficult ground.',
    'Animal Handling': 'Wisdom: calm, control, or understand the behavior of animals and mounts.',
    Arcana: 'Intelligence: recall magical lore and identify or disable magical effects and traps.',
    Athletics: 'Strength: climb, jump, swim, grapple, or force your body through an obstacle.',
    Deception: 'Charisma: convincingly lie, disguise intentions, or mislead another creature.',
    History: 'Intelligence: recall events, cultures, people, conflicts, and details from the past.',
    Insight: 'Wisdom: read motives, emotions, sincerity, and changes in another creature’s behavior.',
    Intimidation: 'Charisma: influence someone through threats, forceful presence, or displays of power.',
    Investigation: 'Intelligence: search for clues, connect evidence, and deduce how something works.',
    Medicine: 'Wisdom: diagnose an illness or injury, stabilize the dying, or recognize a cause of death.',
    Nature: 'Intelligence: recall lore about terrain, plants, animals, weather, and natural hazards.',
    Perception: 'Wisdom: notice hidden creatures, traps, sounds, movement, and other nearby details.',
    Performance: 'Charisma: entertain or impress an audience through acting, music, dance, or speech.',
    Persuasion: 'Charisma: influence others through tact, good faith, negotiation, or social grace.',
    Religion: 'Intelligence: recall lore about gods, rites, holy symbols, cults, and religious traditions.',
    'Sleight of Hand': 'Dexterity: pick pockets, conceal an object, or perform precise manual trickery.',
    Stealth: 'Dexterity: hide, move quietly, or avoid being seen and heard.',
    Survival: 'Wisdom: track creatures, navigate, forage, predict hazards, and live off the land.'
  };
  const standardArray = [15, 14, 13, 12, 10, 8];
  const XP_TO_LEVEL = 10000;
  const state = { level: 1, xp: 0, classLevels: {}, abilityArray: {}, racial: [], racialMode: 'three', abilityScoreExchanges: [], abilityScoreIncreases: [], perkAbilityChoices: {}, intelligenceProficiencies: [], intelligenceProficiencyTypes: [], skills: [], expertise: [], classFeatureChoices: {}, classSpells: {}, spellcasting: {}, spellcastingLevel: 0, subclass: '', subclassFeatureChoices: {}, equipmentChoices: {}, equipmentItems: {}, classTools: [], classFixedTools: [], raceOption: '', raceLanguages: [], raceFixedLanguages: [], raceTools: [], raceFixedTools: [], backgroundOption: '', backgroundLicenseGrade: '', backgroundSkills: [], backgroundLanguages: [], backgroundFixedLanguages: [], backgroundTools: [], backgroundFixedTools: [], backgroundEquipment: [], cash: 0, perksPerLevel: false, levelOnePerk: '', humanPerk: '', perkSkill: '', humanSkill: '', inventory: [], details: {}, notes: '', conditions: [], exhaustionLevel: 0, customFeatures: [], entryEdits: {}, levelUpFeatures: [], addedPerks: [], customPerks: [], currentHp: null, temporaryHp: 0, levelHpBonus: 0, hitDieSides: 0, hitDiceRemaining: null, hitDicePools: {} };
  const hitDiceSizes = [6, 8, 10, 12];
  let avatar = null;
  const avatarPan = { x: 0, y: 0 };
  let perks = [];
  let classFeatureChoiceDefinitions = [];
  let classSpellChoiceDefinitions = [];
  let classSpellProgression = [];
  let classSkillDefinition = null;
  let spellCatalog;
  let sheetEntryEditorPresets = new Map();
  let restoringImport = false;
  let raceLanguageDefinition = null;
  let backgroundLanguageDefinition = null;
  const toolDefinitions = { class: null, race: null, background: null };
  const toolDefinitionRequests = { class: 0, race: 0, background: 0 };
  let toolChoiceCatalog;

  const spellcastingProfiles = {
    artificer: { ability: 'Intelligence', mode: 'prepared', preparation: 'half', starts: 1 },
    bard: { ability: 'Charisma', mode: 'known', starts: 1 },
    cleric: { ability: 'Wisdom', mode: 'prepared', preparation: 'full', starts: 1 },
    druid: { ability: 'Wisdom', mode: 'prepared', preparation: 'full', starts: 1 },
    paladin: { ability: 'Charisma', mode: 'prepared', preparation: 'half', starts: 2 },
    ranger: { ability: 'Wisdom', mode: 'known', starts: 2 },
    sorcerer: { ability: 'Charisma', mode: 'known', starts: 1 },
    warlock: { ability: 'Charisma', mode: 'known', starts: 1 },
    wizard: { ability: 'Intelligence', mode: 'spellbook', preparation: 'full', starts: 1 }
  };

  const languages = [
    ['Common', 'Standard'], ['Dwarvish', 'Standard'], ['Elvish', 'Standard'], ['Giant', 'Standard'],
    ['Gnomish', 'Standard'], ['Goblin', 'Standard'], ['Halfling', 'Standard'], ['Orc', 'Standard'],
    ['Abyssal', 'Exotic'], ['Celestial', 'Exotic'], ['Draconic', 'Exotic'], ['Deep Speech', 'Exotic'],
    ['Infernal', 'Exotic'], ['Grung', 'Exotic'], ['Minotaur', 'Exotic'], ['Primordial', 'Exotic'],
    ['Sylvan', 'Exotic'], ['Undercommon', 'Exotic']
  ].map(([name, category]) => ({ name, category }));

  const clean = (value) => String(value || '').replace(/\s+/g, ' ').trim();
  const classHitDieSides = (className) => {
    const value = clean(className).toLowerCase();
    if (/barbarian/.test(value)) return 12;
    if (/blood.?hunter|fighter|paladin|ranger/.test(value)) return 10;
    if (/artificer|bard|cleric|druid|monk|mystic|rogue|warlock/.test(value)) return 8;
    if (/sorcerer|wizard/.test(value)) return 6;
    return 0;
  };
  const normalizeHitDicePools = () => {
    state.hitDicePools = state.hitDicePools && typeof state.hitDicePools === 'object' && !Array.isArray(state.hitDicePools) ? state.hitDicePools : {};
    hitDiceSizes.forEach((sides) => {
      const saved = state.hitDicePools[`d${sides}`] || {};
      const maximum = Math.max(0, Math.floor(Number(saved.maximum) || 0));
      const remaining = Math.max(0, Math.min(maximum, Math.floor(Number(saved.remaining) || 0)));
      state.hitDicePools[`d${sides}`] = { maximum, remaining };
    });
    if (!hitDiceSizes.some((sides) => state.hitDicePools[`d${sides}`].maximum) && state.classLevels && typeof state.classLevels === 'object') {
      Object.entries(state.classLevels).forEach(([className, levels]) => {
        const sides = classHitDieSides(className), count = Math.max(0, Math.floor(Number(levels) || 0));
        if (!sides || !count) return;
        state.hitDicePools[`d${sides}`].maximum += count;
        state.hitDicePools[`d${sides}`].remaining += count;
      });
    }
    if (!hitDiceSizes.some((sides) => state.hitDicePools[`d${sides}`].maximum) && hitDiceSizes.includes(Number(state.hitDieSides))) {
      const maximum = Math.max(1, Number($('#sheet-level')?.textContent) || 1);
      state.hitDicePools[`d${state.hitDieSides}`] = { maximum, remaining: Math.max(0, Math.min(maximum, Math.floor(Number(state.hitDiceRemaining ?? maximum)))) };
    }
    return state.hitDicePools;
  };
  const title = (value) => clean(value).replace(/\.html$/, '').replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  const escapePattern = (value) => String(value).split('').map((character) => '\\.^$*+?()[]{}|'.includes(character) ? `\\${character}` : character).join('');
  const escapeAttribute = (value) => clean(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const previewSnippet = (value, limit = 190) => {
    const text = clean(value);
    return text.length > limit ? `${text.slice(0, limit).replace(/\s+\S*$/, '')}…` : text;
  };
  const equipmentCategories = [
    { pattern: /\b(?:any\s+two|two)\s+simple\s+melee\s+weapons?\b/i, categories: ['Simple Melee Weapons'], count: 2, label: 'simple melee weapon' },
    { pattern: /\b(?:any\s+two|two)\s+simple\s+weapons?\b/i, categories: ['Simple Melee Weapons', 'Simple Ranged Weapons'], count: 2, label: 'simple weapon' },
    { pattern: /\b(?:any\s+two|two)\s+martial\s+weapons?\b/i, categories: ['Martial Melee Weapons', 'Martial Ranged Weapons'], count: 2, label: 'martial weapon' },
    { pattern: /\b(?:a|an|any)\s+simple\s+melee\s+weapon\b/i, categories: ['Simple Melee Weapons'], count: 1, label: 'simple melee weapon' },
    { pattern: /\b(?:a|an|any)\s+martial\s+melee\s+weapon\b/i, categories: ['Martial Melee Weapons'], count: 1, label: 'martial melee weapon' },
    { pattern: /\b(?:a|an|any)\s+simple\s+weapon\b/i, categories: ['Simple Melee Weapons', 'Simple Ranged Weapons'], count: 1, label: 'simple weapon' },
    { pattern: /\b(?:a|an|any)\s+martial\s+weapon\b/i, categories: ['Martial Melee Weapons', 'Martial Ranged Weapons'], count: 1, label: 'martial weapon' },
    { pattern: /\b(?:a|an|any)\s+basic\s+firearm\b/i, categories: ['Basic Firearms'], count: 1, label: 'basic firearm' },
    { pattern: /\b(?:a|an|any)\s+advanced\s+firearm\b/i, categories: ['Advanced Firearms'], count: 1, label: 'advanced firearm' }
  ];
  let equipmentCatalog;
  const expandShieldProficiency = (line) => {
    if (!/^Armor:/i.test(line)) return line;
    const value = line.replace(/^Armor:\s*/i, '');
    const allShields = 'light shields, medium shields, heavy shields';
    if (/(?:^|,\s*)shields(?:\s|,|\(|$)/i.test(value)) return `Armor: ${value.replace(/(?:^|,\s*)shields(?=\s|,|\(|$)/i, (match) => `${match.startsWith(',') ? ', ' : ''}${allShields}`)}`;
    if (/\b(?:light|medium|heavy) shields\b/i.test(value)) return `Armor: ${value}`;
    if (/\b(?:all|heavy) armor\b/i.test(value)) return `Armor: ${value}, ${allShields}`;
    if (/\bmedium armor\b/i.test(value)) return `Armor: ${value}, light shields, medium shields`;
    if (/\blight armor\b/i.test(value)) return `Armor: ${value}, light shields`;
    return `Armor: ${value}`;
  };
  const fetchDocument = async (url) => new DOMParser().parseFromString(await fetch(url).then((response) => {
    if (!response.ok) throw new Error(`${response.status} loading ${url}`);
    return response.text();
  }), 'text/html');
  const labelPerkTypes = (entries) => {
    const byName = new Map(entries.map((perk) => [perk.label.toLowerCase(), perk]));
    const dependencyInfo = new Map(entries.map((perk) => {
      const named = [];
      const groups = [];
      perk.requirements.split(/[,/]/).forEach((rawRequirement) => {
        const requirement = rawRequirement.trim();
        if (!requirement || /^No\b/i.test(requirement)) return;
        const groupMatch = requirement.match(/^\d+\s+(.+?)\s+(?:perks|feats)$/i);
        if (groupMatch) {
          groups.push(groupMatch[1].trim().toLowerCase());
          return;
        }

        const normalized = requirement.replace(/^\d+\s+/, '').replace(/\s+(?:perks|feats)$/i, '').toLowerCase();
        const target = byName.get(normalized) || byName.get(`${normalized}er`);
        if (target && target.value !== perk.value && !named.includes(target)) named.push(target);
      });
      return [perk.value, { named, groups }];
    }));
    const curseIds = new Set(
      entries
        .filter((perk) => /\bCurse$/i.test(perk.label) || /\bcurse perks\b/i.test(perk.requirements))
        .map((perk) => perk.value)
    );
    let addedCurse = true;
    while (addedCurse) {
      addedCurse = false;
      entries.forEach((perk) => {
        if (!curseIds.has(perk.value) && dependencyInfo.get(perk.value).named.some((parent) => curseIds.has(parent.value))) {
          curseIds.add(perk.value);
          addedCurse = true;
        }
      });
    }
    const rootCache = new Map();
    const lineRoots = (perk, visiting = new Set()) => {
      if (rootCache.has(perk.value)) return rootCache.get(perk.value);
      if (visiting.has(perk.value)) return new Set([perk.value]);
      const info = dependencyInfo.get(perk.value);
      const roots = new Set();
      const nextVisiting = new Set(visiting).add(perk.value);
      info.named
        .filter((parent) => !curseIds.has(parent.value))
        .forEach((parent) => {
          lineRoots(parent, nextVisiting).forEach((root) => roots.add(root));
        });

      info.groups.forEach((group) => roots.add(`group:${group}`));
      if (roots.size === 0) roots.add(perk.value);
      rootCache.set(perk.value, roots);
      return roots;
    };
    entries.forEach((perk) => {
      const info = dependencyInfo.get(perk.value);
      if (curseIds.has(perk.value)) {
        perk.typeLabel = 'Curse';
      } else if (info.named.length === 0 && info.groups.length === 0) {
        perk.typeLabel = 'Primary';
      } else if (info.named.length === 0 && info.groups.length === 1) {
        perk.typeLabel = 'Branch';
      } else {
        perk.typeLabel = lineRoots(perk).size > 1 ? 'Fusion' : 'Branch';
      }
    });
    return entries;
  };
  const loadPerks = async () => {
    if (perks.length) return perks;
    try {
      const source = await fetch('../scripts/perks.js').then((response) => response.text());
      const perkPattern = /"id"\s*:\s*"([^"]+)"\s*,\s*"name"\s*:\s*"([^"]+)"\s*,\s*"description"\s*:\s*"((?:\\.|[^"\\])*)"\s*,\s*"requirements"\s*:\s*"([^"]*)"/g;
      const parsedPerks = [...source.matchAll(perkPattern)].map((match) => {
        const [, value, label, description, requirements] = match;
        let decodedDescription = description;

        try {
          decodedDescription = JSON.parse(`"${description}"`);
        } catch {
          // Use the captured text as-is.
        }

        const increaseText = decodedDescription.match(/Increase (?:your |one )?(.+?)(?: score)? by 1\b/i)?.[1] || '';
        let abilityIncreaseOptions = abilities.filter((ability) => new RegExp(`\\b${ability}\\b`, 'i').test(increaseText));
        if (/ability score of your choice|ability score you chose/i.test(increaseText)) abilityIncreaseOptions = [...abilities];
        return {
          value,
          label,
          description: decodedDescription,
          requirements,
          abilityIncreaseOptions
        };
      });

      perks = labelPerkTypes(parsedPerks);
    } catch (error) {
      console.error('Unable to load perk options', error);
    }
    return perks;
  };
  const loadSpellCatalog = async () => {
    if (!spellCatalog) spellCatalog = (async () => {
      const source = await fetch('../scripts/spells.js').then((response) => response.text());
      const opening = source.indexOf('[');
      const closingMatch = source.slice(opening).match(/\r?\n\];/);
      const closing = closingMatch ? opening + closingMatch.index + closingMatch[0].lastIndexOf(']') : -1;
      if (opening < 0 || closing < opening) return [];
      return JSON.parse(source.slice(opening, closing + 1)).map((spell) => ({
        ...spell,
        preview: previewSnippet([spell.school, spell.castingTime && `Casting time: ${spell.castingTime}`, spell.range && `Range: ${spell.range}`, ...(spell.description || [])].filter(Boolean).join(' Â· '))
      }));
    })().catch((error) => { console.error('Unable to load spell choices', error); return []; });
    const catalog = await spellCatalog;
    spellCatalog = catalog;
    return catalog;
  };
  const populatePerkSelect = (select, selected) => {
    if (!select) return;
    const requirementsFor = (perk) => perks.filter((candidate) => candidate.label !== perk.label && new RegExp(escapePattern(candidate.label), 'i').test(perk.requirements || '')).map((candidate) => candidate.label);
    const selectedValues = [state.levelOnePerk, state.humanPerk].filter(Boolean);
    const remainingValues = [...selectedValues];
    const currentIndex = remainingValues.indexOf(selected);
    if (currentIndex >= 0) remainingValues.splice(currentIndex, 1);
    const isValidReplacement = (perk) => {
      if (remainingValues.includes(perk.value)) return false;
      const replacementValues = [...remainingValues, perk.value];
      const replacementNames = new Set(replacementValues.map((value) => perks.find((candidate) => candidate.value === value)?.label).filter(Boolean));
      return replacementValues.every((value) => {
        const selectedPerk = perks.find((candidate) => candidate.value === value);
        return selectedPerk && requirementsFor(selectedPerk).every((requirement) => replacementNames.has(requirement));
      });
    };
    select.innerHTML = `<option value="">Choose a perk</option>${perks.map((perk) => `<option value="${perk.value}" data-preview="${escapeAttribute(previewSnippet(perk.description))}"${selected === perk.value ? ' selected' : ''}${!isValidReplacement(perk) && selected !== perk.value ? ' disabled' : ''}>${perk.label} — ${perk.typeLabel}</option>`).join('')}`;
  };
  const renderPerkChoices = () => {
    const levelOneChoice = $('#level-one-perk-choice');
    const levelOneSelect = $('#level-one-perk');
    const levelOneLabel = levelOneChoice?.querySelector('span');
    if (levelOneLabel) levelOneLabel.textContent = 'Level 1 Perk';
    if (levelOneChoice) levelOneChoice.hidden = !state.perksPerLevel;
    populatePerkSelect(levelOneSelect, state.levelOnePerk);
    renderPerkAbilityChoice('level-one-perk', state.levelOnePerk);
    const humanChoice = $('#human-perk-choice');
    const humanSelect = $('#human-perk');
    const isHuman = /(?:^|\/)human\.html$/i.test($('#race-select')?.value || '');
    if (humanChoice) humanChoice.hidden = !isHuman;
    if (!isHuman) state.humanPerk = '';
    populatePerkSelect(humanSelect, state.humanPerk);
    renderPerkAbilityChoice('human-perk', state.humanPerk);
    const perkSkillChoice = $('#perk-skill-choice');
    const perkSkillSelect = $('#perk-skill');
    const hasSkilledPerk = state.levelOnePerk === 'skilled' || state.humanPerk === 'skilled';
    if (perkSkillChoice) perkSkillChoice.hidden = !hasSkilledPerk;
    if (!hasSkilledPerk) state.perkSkill = '';
    if (perkSkillSelect) perkSkillSelect.innerHTML = `<option value="">Choose a skill</option>${skills.map((skill) => `<option value="${skill}" data-preview="${escapeAttribute(skillPreviews[skill])}"${state.perkSkill === skill ? ' selected' : ''}${state.backgroundSkills.includes(skill) || state.skills.includes(skill) || state.humanSkill === skill ? ' hidden' : ''}>${skill}</option>`).join('')}`;
    const humanSkillChoice = $('#human-skill-choice');
    const humanSkillSelect = $('#human-skill');
    if (humanSkillChoice) humanSkillChoice.hidden = !isHuman;
    if (!isHuman) state.humanSkill = '';
    if (humanSkillSelect) humanSkillSelect.innerHTML = `<option value="">Choose a skill</option>${skills.map((skill) => `<option value="${skill}" data-preview="${escapeAttribute(skillPreviews[skill])}"${state.humanSkill === skill ? ' selected' : ''}${state.backgroundSkills.includes(skill) || state.skills.includes(skill) || state.perkSkill === skill ? ' hidden' : ''}>${skill}</option>`).join('')}`;
    renderIntelligenceProficiencyChoices();
    updateOriginChoiceSection();
  };
  const perkIncreaseOptions = (perkValue) => perks.find((perk) => perk.value === perkValue)?.abilityIncreaseOptions || [];
  const renderPerkAbilityChoice = (prefix, perkValue) => {
    const wrapper = $(`#${prefix}-ability-choice`);
    const select = $(`#${prefix}-ability`);
    if (!wrapper || !select) return;
    const options = perkIncreaseOptions(perkValue);
    wrapper.hidden = options.length < 2;
    if (options.length === 1) state.perkAbilityChoices[perkValue] = options[0];
    if (!options.includes(state.perkAbilityChoices[perkValue])) state.perkAbilityChoices[perkValue] = '';
    select.innerHTML = `<option value="">Choose an ability</option>${options.map((ability) => `<option value="${ability}"${state.perkAbilityChoices[perkValue] === ability ? ' selected' : ''}>${ability}</option>`).join('')}`;
  };
  const updateOriginChoiceSection = () => {
    const raceChoices = $('#race-choice-controls');
    const backgroundChoices = $('#background-choice-controls');
    const classChoices = $('#class-choice-controls');
    const hasRaceChoice = [...(raceChoices?.children || [])].some((control) => !control.hidden);
    const hasBackgroundChoice = Boolean(backgroundChoices?.children.length);
    const hasClassChoice = Boolean(classChoices?.children.length);
    const hasPerkChoice = !$('#level-one-perk-choice')?.hidden;
    const hasPerkSkillChoice = !$('#perk-skill-choice')?.hidden;
    const hasIntelligenceChoices = !$('#intelligence-proficiency-choices')?.hidden;
    const section = $('#origin-choice-section');
    if (section) section.hidden = !hasRaceChoice && !hasBackgroundChoice && !hasClassChoice && !hasPerkChoice && !hasPerkSkillChoice && !hasIntelligenceChoices;
  };
  const loadEquipmentCatalog = async () => {
    if (!equipmentCatalog) equipmentCatalog = (async () => {
      const doc = await fetchDocument('../items/index.html');
      const groups = new Map();
      doc.querySelectorAll('.weapons-section, .firearms-section, .apparel-section').forEach((section) => {
        const group = clean(section.querySelector(':scope > .item-group-title')?.textContent);
        const headings = [...section.querySelectorAll('thead th')].map((heading) => clean(heading.textContent).toLowerCase());
        const damageIndex = headings.indexOf('damage');
        const propertiesIndex = headings.indexOf('properties');
        const armorClassIndex = headings.indexOf('armor class (ac)');
        const armorType = /^(?:Light|Medium|Heavy) Armor$/i.test(group) ? group : '';
        if (group) groups.set(group, [...section.querySelectorAll('tbody tr')].map((row) => {
          const name = clean(row.cells?.[0]?.textContent);
          const damage = damageIndex >= 0 ? clean(row.cells?.[damageIndex]?.textContent) : '';
          const properties = propertiesIndex >= 0 ? clean(row.cells?.[propertiesIndex]?.textContent) : '';
          const armorClass = armorClassIndex >= 0 ? clean(row.cells?.[armorClassIndex]?.textContent) : '';
          const details = armorType
            ? [`Type: ${armorType}`, armorClass && `Armor Class: ${armorClass}`].filter(Boolean).join(' · ')
            : [damage && `Damage: ${damage}`, properties && properties !== '-' && `Properties: ${properties}`].filter(Boolean).join(' · ');
          return name ? { name, preview: details } : null;
        }).filter(Boolean));
      });
      groups.set('Equipment Pack', [...doc.querySelectorAll('.equipment-pack-group .item-card')].map((card) => {
        const name = clean(card.querySelector('.item-card__heading h3')?.textContent);
        const contents = clean(card.querySelector(':scope > p')?.textContent);
        return name ? { name, preview: contents ? `Contents: ${contents}` : '' } : null;
      }).filter(Boolean));
      return groups;
    })();
    return equipmentCatalog;
  };
  const intelligenceProficiencyCount = () => Math.max(0, modifier(permanentScore('Intelligence')));
  const intelligenceProficiencyOptions = async () => {
    const [equipment, tools] = await Promise.all([loadEquipmentCatalog(), loadToolChoiceCatalog()]);
    const weapons = ['Simple Melee Weapons', 'Simple Ranged Weapons', 'Martial Melee Weapons', 'Martial Ranged Weapons', 'Basic Firearms']
      .flatMap((category) => (equipment.get(category) || []).map((item) => ({ value: `Weapon: ${item.name}`, label: item.name, group: 'Weapons', category, preview: item.preview })));
    const artisanTools = (tools["Artisan's Tools"] || []).map((tool) => ({ value: `Artisan Tool: ${tool.name}`, label: tool.name, group: "Artisan's Tools", preview: tool.preview }));
    return [
      ...skills.map((skill) => ({ value: `Skill: ${skill}`, label: skill, group: 'Skills', preview: skillPreviews[skill] })),
      ...languages.map((language) => ({ value: `Language: ${language.name}`, label: language.name, group: 'Languages', preview: `${language.category} language` })),
      ...artisanTools,
      ...weapons
    ];
  };
  const renderIntelligenceProficiencyChoices = async (host = $('#intelligence-proficiency-choices')) => {
    if (!host) return;
    host.classList.add('intelligence-proficiency-choices');
    const count = intelligenceProficiencyCount();
    state.intelligenceProficiencies = Array.isArray(state.intelligenceProficiencies) ? state.intelligenceProficiencies.slice(0, count).map((entry) => clean(entry)) : [];
    state.intelligenceProficiencyTypes = Array.isArray(state.intelligenceProficiencyTypes) ? state.intelligenceProficiencyTypes.slice(0, count) : [];
    host.hidden = count < 1;
    if (!count) { host.replaceChildren(); updateOriginChoiceSection(); return; }
    const options = await intelligenceProficiencyOptions();
    if (!host.isConnected) return;
    if (count !== intelligenceProficiencyCount()) { renderIntelligenceProficiencyChoices(host); return; }
    const unavailable = new Set([
      ...state.skills.map((value) => `Skill: ${value}`), ...state.backgroundSkills.map((value) => `Skill: ${value}`),
      state.perkSkill && `Skill: ${state.perkSkill}`, state.humanSkill && `Skill: ${state.humanSkill}`,
      ...featureEffects().filter((effect) => effect.type === 'skillProficiency' || effect.type === 'skillExpertise').map((effect) => `Skill: ${effect.target}`),
      ...state.raceLanguages.map((value) => `Language: ${value}`), ...state.raceFixedLanguages.map((value) => `Language: ${value}`),
      ...state.backgroundLanguages.map((value) => `Language: ${value}`), ...state.backgroundFixedLanguages.map((value) => `Language: ${value}`),
      ...state.classTools.map((value) => `Artisan Tool: ${value}`), ...state.classFixedTools.map((value) => `Artisan Tool: ${value}`),
      ...state.raceTools.map((value) => `Artisan Tool: ${value}`), ...state.raceFixedTools.map((value) => `Artisan Tool: ${value}`),
      ...state.backgroundTools.map((value) => `Artisan Tool: ${value}`), ...state.backgroundFixedTools.map((value) => `Artisan Tool: ${value}`)
    ].filter(Boolean));
    const classWeaponText = clean([...document.querySelectorAll('#class-details .proficiency-row')].find((row) => /^Weapons$/i.test(clean(row.querySelector('strong')?.textContent)))?.querySelector('span')?.textContent);
    options.filter((option) => option.group === 'Weapons').forEach((option) => {
      const specificCategoryGranted = new RegExp(`\\b${escapePattern(option.category.replace(/s$/i, ''))}s?\\b`, 'i').test(classWeaponText);
      const categoryGranted = specificCategoryGranted || (/\bsimple weapons?\b/i.test(classWeaponText) && /^Simple /.test(option.category))
        || (/\bmartial weapons?\b/i.test(classWeaponText) && /^Martial /.test(option.category))
        || (/\bbasic firearms?\b/i.test(classWeaponText) && option.category === 'Basic Firearms');
      if (categoryGranted || new RegExp(`\\b${escapePattern(option.label)}\\b`, 'i').test(classWeaponText)) unavailable.add(option.value);
    });
    featureEffects().filter((effect) => effect.type === 'proficiency').forEach((effect) => {
      const granted = clean(effect.target);
      options.forEach((option) => {
        if (new RegExp(`\\b${escapePattern(option.label)}\\b`, 'i').test(granted)) unavailable.add(option.value);
      });
    });
    state.intelligenceProficiencies = state.intelligenceProficiencies.map((entry) => unavailable.has(entry) ? '' : entry);
    const groups = [...new Set(options.map((option) => option.group))];
    const groupLabels = { Weapons: 'Weapon', Skills: 'Skill', Languages: 'Language', "Artisan's Tools": 'Artisan Tool' };
    const fields = Array.from({ length: count }, (_, index) => {
      const selected = state.intelligenceProficiencies[index] || '';
      const selectedGroup = options.find((option) => option.value === selected)?.group || state.intelligenceProficiencyTypes[index] || '';
      const proficiencyOptions = options.filter((option) => option.group === selectedGroup).map((option) => `<option value="${escapeAttribute(option.value)}" data-preview="${escapeAttribute(option.preview)}"${selected === option.value ? ' selected' : ''}${selected !== option.value && (unavailable.has(option.value) || state.intelligenceProficiencies.includes(option.value)) ? ' hidden' : ''}>${escapeAttribute(option.label)}</option>`).join('');
      return `<section class="intelligence-proficiency-choice"><label><span>Proficiency Type</span><select data-intelligence-proficiency-type="${index}"><option value="">Choose type</option>${groups.map((group) => `<option value="${escapeAttribute(group)}"${selectedGroup === group ? ' selected' : ''}>${escapeAttribute(groupLabels[group] || group)}</option>`).join('')}</select></label><label><span>Proficiency</span><select data-intelligence-proficiency="${index}"${selectedGroup ? '' : ' disabled'}><option value="">Choose proficiency</option>${proficiencyOptions}</select></label></section>`;
    }).join('');
    host.innerHTML = `<h3>INT Proficiencies</h3><div>${fields}</div>`;
    host.querySelectorAll('[data-intelligence-proficiency-type]').forEach((select) => select.addEventListener('change', () => {
      state.intelligenceProficiencies[Number(select.dataset.intelligenceProficiencyType)] = '';
      state.intelligenceProficiencyTypes[Number(select.dataset.intelligenceProficiencyType)] = select.value;
      const choice = select.closest('.intelligence-proficiency-choice');
      const proficiency = choice.querySelector('[data-intelligence-proficiency]');
      proficiency.disabled = !select.value;
      proficiency.innerHTML = `<option value="">Choose proficiency</option>${options.filter((option) => option.group === select.value).map((option) => `<option value="${escapeAttribute(option.value)}" data-preview="${escapeAttribute(option.preview)}"${unavailable.has(option.value) || state.intelligenceProficiencies.includes(option.value) ? ' hidden' : ''}>${escapeAttribute(option.label)}</option>`).join('')}`;
    }));
    host.querySelectorAll('[data-intelligence-proficiency]').forEach((select) => select.addEventListener('change', () => {
      state.intelligenceProficiencies[Number(select.dataset.intelligenceProficiency)] = select.value;
      renderIntelligenceProficiencyChoices(host);
      if (host.id !== 'intelligence-proficiency-choices') renderSheetPanel('details');
    }));
    updateOriginChoiceSection();
  };
  const renderEquipmentItemPickers = async (root, key, choice) => {
    const target = root.querySelector(`[data-equipment-item-picker="${key}"]`);
    if (!target) return;
    const definition = equipmentCategories.find((entry) => entry.pattern.test(choice));
    if (!definition) { target.replaceChildren(); return; }
    const catalog = await loadEquipmentCatalog();
    const items = definition.categories.flatMap((category) => catalog.get(category) || []);
    target.innerHTML = Array.from({ length: definition.count }, (_, index) => {
      const itemKey = `${key}-${index}`;
      return `<label><span>${definition.label}${definition.count > 1 ? ` ${index + 1}` : ''}</span><select data-equipment-item="${itemKey}"><option value="">Choose ${definition.label}</option>${items.map((item) => `<option value="${escapeAttribute(item.name)}" data-preview="${escapeAttribute(item.preview)}"${state.equipmentItems[itemKey] === item.name ? ' selected' : ''}>${item.name}</option>`).join('')}</select></label>`;
    }).join('');
    target.querySelectorAll('[data-equipment-item]').forEach((select) => select.addEventListener('change', () => { state.equipmentItems[select.dataset.equipmentItem] = select.value; }));
    refreshDetailScrollbar(root.closest('[data-crt-scrollbar]'));
  };
  const renderStartingEquipment = async (root, entries) => {
    const catalog = await loadEquipmentCatalog();
    const catalogItems = [...catalog.values()].flat().sort((left, right) => right.name.length - left.name.length);
    const previewForChoice = (choice) => catalogItems.find((item) => {
      const names = [item.name, item.name.replace(/ Armor$/i, '')].filter(Boolean);
      return names.some((name) => new RegExp(`\\b${escapePattern(name)}\\b`, 'i').test(choice));
    })?.preview || '';
    let choiceNumber = 0;
    const fields = entries.map((entry, index) => {
      const markers = [...entry.matchAll(/\([a-z]\)\s*/gi)];
      const options = markers.length ? markers.map((marker, markerIndex) => clean(entry.slice(marker.index + marker[0].length, markers[markerIndex + 1]?.index ?? entry.length)).replace(/(?:,?\s*or)?\s*,?$/i, '')) : [entry];
      const key = `class-${index}`;
      const categoryGrant = equipmentCategories.some((definition) => definition.pattern.test(entry));
      if (options.length < 2 && !categoryGrant) return `<p class="equipment-grant">${entry}</p>`;
      choiceNumber += 1;
      if (options.length < 2) return `<section class="equipment-direct-choice"><p>${entry}</p><div class="equipment-item-picker" data-equipment-item-picker="${key}" data-direct-equipment-choice="${entry}"></div></section>`;
      return `<section class="equipment-choice"><p>${entry}</p><select data-equipment-choice="${key}"><option value="">Choose an option</option>${options.map((option) => `<option value="${escapeAttribute(option)}" data-preview="${escapeAttribute(previewForChoice(option))}"${state.equipmentChoices[key] === option ? ' selected' : ''}>${option}</option>`).join('')}</select><p class="equipment-choice__details" data-equipment-choice-details="${key}" hidden></p><div class="equipment-item-picker" data-equipment-item-picker="${key}"></div></section>`;
    }).join('');
    root.insertAdjacentHTML('beforeend', `<section class="equipment-choices">${fields}</section>`);
    root.querySelectorAll('[data-equipment-choice]').forEach((select) => {
      const showSelectedDetails = () => {
        const details = root.querySelector(`[data-equipment-choice-details="${select.dataset.equipmentChoice}"]`);
        if (!details) return;
        const preview = /\bpack\b/i.test(select.value) ? clean(select.selectedOptions[0]?.dataset.preview) : '';
        details.textContent = preview;
        details.hidden = !preview;
      };
      select.addEventListener('change', () => {
        state.equipmentChoices[select.dataset.equipmentChoice] = select.value;
        renderEquipmentItemPickers(root, select.dataset.equipmentChoice, select.value);
        showSelectedDetails();
      });
      showSelectedDetails();
      if (select.value) renderEquipmentItemPickers(root, select.dataset.equipmentChoice, select.value);
    });
    root.querySelectorAll('[data-direct-equipment-choice]').forEach((picker) => renderEquipmentItemPickers(root, picker.dataset.equipmentItemPicker, picker.dataset.directEquipmentChoice));
  };
  const detailContent = (detail) => detail && (detail.querySelector('[data-crt-scroll-target]') || detail);
  const setDetailMarkup = (detail, markup) => { detailContent(detail).innerHTML = markup; };
  const appendDetailMarkup = (detail, markup) => detailContent(detail).insertAdjacentHTML('beforeend', markup);
  const clearDetail = (detail) => detailContent(detail).replaceChildren();
  const refreshDetailScrollbar = (detail) => {
    if (!detail) return;
    const enable = () => {
      if (!window.CRTScrollbar) return;
      if (typeof window.CRTScrollbar.refresh === 'function') window.CRTScrollbar.refresh(detail);
      else window.CRTScrollbar.enhance(detail);
    };
    enable();
    requestAnimationFrame(enable);
    requestAnimationFrame(() => requestAnimationFrame(enable));
  };

  const drawAvatar = () => {
    const canvas = $('#avatar-canvas');
    if (!canvas) return;
    const context = canvas.getContext('2d');
    context.fillStyle = '#020503';
    context.fillRect(0, 0, canvas.width, canvas.height);
    if (avatar) {
      const scale = Number($('#avatar-scale').value || 1);
      const crop = Math.min(avatar.width, avatar.height) / scale;
      const maxOffsetX = Math.max(0, (avatar.width - crop) / 2);
      const maxOffsetY = Math.max(0, (avatar.height - crop) / 2);
      const sourceX = maxOffsetX * (1 + avatarPan.x);
      const sourceY = maxOffsetY * (1 + avatarPan.y);
      context.drawImage(avatar, sourceX, sourceY, crop, crop, 0, 0, canvas.width, canvas.height);
      return;
    }
    context.strokeStyle = '#145f35';
    context.lineWidth = 4;
    context.strokeRect(20, 20, 200, 200);
    context.beginPath(); context.arc(120, 92, 34, 0, Math.PI * 2); context.stroke();
    context.beginPath(); context.arc(120, 184, 55, Math.PI, 0); context.stroke();
  };

  const selectedPerkValues = () => unique([state.levelOnePerk, state.humanPerk, ...(state.addedPerks || [])]);
  const perkAbilityIncrease = (ability) => selectedPerkValues().reduce((total, value) => {
    const options = perkIncreaseOptions(value);
    const chosen = options.length === 1 ? options[0] : state.perkAbilityChoices[value];
    return total + (chosen === ability ? 1 : 0);
  }, 0) + (state.customPerks || []).filter((perk) => (state.addedPerks || []).includes(perk.value)).flatMap((perk) => perk.effects || []).filter((effect) => effect.type === 'ability' && clean(effect.target).toLowerCase() === ability.toLowerCase()).reduce((total, effect) => total + (Number(effect.value) || 0), 0);
  const assignedAndRacialScore = (ability) => Number(state.abilityArray[ability] || 0) + state.racial.reduce((total, choice, index) => total + (choice === ability ? (state.racialMode === 'two' && index === 0 ? 2 : 1) : 0), 0);
  const validAbilityScoreExchanges = () => (state.abilityScoreExchanges || []).filter((exchange) => abilities.includes(exchange?.decrease) && abilities.includes(exchange?.increase) && exchange.decrease !== exchange.increase);
  const exchangeDelta = (ability) => validAbilityScoreExchanges().reduce((total, exchange) => total + (exchange.increase === ability ? 1 : 0) - (exchange.decrease === ability ? 2 : 0), 0);
  const baseScore = (ability) => assignedAndRacialScore(ability) + exchangeDelta(ability);
  const permanentScore = (ability) => Math.min(20, baseScore(ability) + (state.abilityScoreIncreases || []).filter((choice) => choice === ability).length + perkAbilityIncrease(ability));
  const score = (ability) => permanentScore(ability);
  const reconcileAbilityScoreExchanges = () => {
    state.abilityScoreExchanges = Array.isArray(state.abilityScoreExchanges) ? state.abilityScoreExchanges.slice(0, 2).map((exchange) => ({ decrease: clean(exchange?.decrease), increase: clean(exchange?.increase) })) : [];
    const scores = Object.fromEntries(abilities.map((ability) => [ability, assignedAndRacialScore(ability)]));
    state.abilityScoreExchanges.forEach((exchange) => {
      if (exchange.decrease === exchange.increase) exchange.increase = '';
      if (exchange.decrease && scores[exchange.decrease] < 6) exchange.decrease = '';
      if (exchange.increase && scores[exchange.increase] >= 20) exchange.increase = '';
      if (exchange.decrease && exchange.increase) {
        scores[exchange.decrease] -= 2;
        scores[exchange.increase] += 1;
      }
    });
  };
  const renderAbilityScoreExchanges = () => {
    const box = $('#ability-score-exchanges');
    const addButton = $('#add-ability-score-exchange');
    if (!box || !addButton) return;
    reconcileAbilityScoreExchanges();
    const rows = state.abilityScoreExchanges.map((exchange, index) => {
      const otherExchanges = state.abilityScoreExchanges.filter((_, otherIndex) => otherIndex !== index).filter((entry) => entry.decrease && entry.increase && entry.decrease !== entry.increase);
      const scoreWithoutRow = (ability) => assignedAndRacialScore(ability) + otherExchanges.reduce((total, entry) => total + (entry.increase === ability ? 1 : 0) - (entry.decrease === ability ? 2 : 0), 0);
      const decreaseOptions = abilities.map((ability) => `<option value="${ability}"${exchange.decrease === ability ? ' selected' : ''}${ability === exchange.increase || (exchange.decrease !== ability && scoreWithoutRow(ability) < 6) ? ' disabled' : ''}>${ability}</option>`).join('');
      const increaseOptions = abilities.map((ability) => `<option value="${ability}"${exchange.increase === ability ? ' selected' : ''}${ability === exchange.decrease || (exchange.increase !== ability && scoreWithoutRow(ability) >= 20) ? ' disabled' : ''}>${ability}</option>`).join('');
      return `<section class="ability-score-exchange"><label><span>Decrease −2</span><select data-exchange-decrease="${index}"><option value="">Choose ability</option>${decreaseOptions}</select></label><label><span>Increase +1</span><select data-exchange-increase="${index}"><option value="">Choose ability</option>${increaseOptions}</select></label><button type="button" data-remove-ability-score-exchange="${index}" aria-label="Remove ability score exchange">Remove</button></section>`;
    }).join('');
    box.innerHTML = rows;
    addButton.hidden = state.abilityScoreExchanges.length >= 2;
    box.querySelectorAll('[data-exchange-decrease], [data-exchange-increase]').forEach((select) => select.addEventListener('change', () => {
      const index = Number(select.dataset.exchangeDecrease ?? select.dataset.exchangeIncrease);
      const key = select.matches('[data-exchange-decrease]') ? 'decrease' : 'increase';
      state.abilityScoreExchanges[index][key] = select.value;
      renderAbilityScoreExchanges(); renderAbilities(); renderClassSpellChoices(); renderIntelligenceProficiencyChoices();
    }));
    box.querySelectorAll('[data-remove-ability-score-exchange]').forEach((button) => button.addEventListener('click', () => {
      state.abilityScoreExchanges.splice(Number(button.dataset.removeAbilityScoreExchange), 1);
      renderAbilityScoreExchanges(); renderAbilities(); renderClassSpellChoices(); renderIntelligenceProficiencyChoices();
    }));
  };
  const renderAbilities = () => {
    const container = $('#ability-scores');
    const assigned = Object.values(state.abilityArray).filter(Boolean);
    container.innerHTML = abilities.map((ability) => {
      const selected = String(state.abilityArray[ability] || '');
      const total = score(ability);
      return `<label><span>${ability.slice(0, 3).toUpperCase()}${selected ? ` · ${total}` : ''}</span><select data-ability="${ability}"><option value="">Select Score</option>${standardArray.map((number) => `<option value="${number}"${selected === String(number) ? ' selected' : ''}${selected !== String(number) && assigned.includes(String(number)) ? ' hidden' : ''}>${selected === String(number) && total !== number ? `${number} + ${total - number} = ${total}` : number}</option>`).join('')}</select></label>`;
    }).join('');
    container.querySelectorAll('[data-ability]').forEach((select) => select.addEventListener('change', () => {
      state.abilityArray[select.dataset.ability] = select.value;
      renderAbilityScoreExchanges();
      renderAbilities();
      renderClassSpellChoices();
      renderIntelligenceProficiencyChoices();
    }));
  };

  const renderRacialIncreases = () => {
    const section = $('#race-ability-increase-choice');
    const box = $('#racial-ability-increases');
    if (!section || !box) return;
    section.hidden = !$('#race-select').value;
    if (section.hidden) { box.replaceChildren(); return; }
    const count = state.racialMode === 'two' ? 2 : 3;
    const chosen = state.racial.slice(0, count).filter(Boolean);
    box.innerHTML = `<div class="racial-choice-options"><button type="button" data-mode="two">+2 to one ability, +1 to another</button><button type="button" data-mode="three">+1 to three abilities</button></div><div class="racial-increase-slots">${Array.from({ length: count }, (_, index) => `<label>Ability score +${state.racialMode === 'two' && index === 0 ? 2 : 1}<select data-racial="${index}"><option value="">Choose ability</option>${abilities.map((ability) => `<option value="${ability}"${state.racial[index] === ability ? ' selected' : ''}${state.racial[index] !== ability && chosen.includes(ability) ? ' hidden' : ''}>${ability}</option>`).join('')}</select></label>`).join('')}</div>`;
    box.querySelectorAll('[data-mode]').forEach((button) => button.addEventListener('click', () => {
      state.racialMode = button.dataset.mode; state.racial = []; renderRacialIncreases(); renderAbilityScoreExchanges(); renderAbilities(); renderClassSpellChoices(); renderIntelligenceProficiencyChoices();
    }));
    box.querySelectorAll('[data-racial]').forEach((select) => select.addEventListener('change', () => {
      state.racial[Number(select.dataset.racial)] = select.value; renderRacialIncreases(); renderAbilityScoreExchanges(); renderAbilities(); renderClassSpellChoices(); renderIntelligenceProficiencyChoices();
    }));
  };

  const appendOptions = async (kind, source) => {
    const select = $(`#${kind}-select`);
    try {
      const doc = await fetchDocument(source);
      const links = [...doc.querySelectorAll('main a.class-title-link')];
      links.map((link) => ({ label: clean(link.textContent).replace(/^Subclass:\s*/, ''), value: link.getAttribute('href') }))
        .filter((item, index, list) => item.value && list.findIndex((candidate) => candidate.value === item.value) === index)
        .forEach((item) => select.append(new Option(item.label, item.value)));
    } catch (error) { console.error(`Unable to load ${kind} options`, error); }
  };

  const sectionNodes = (heading) => {
    const nodes = [];
    for (let node = heading && heading.nextElementSibling; node && !/^H[2-4]$/.test(node.tagName); node = node.nextElementSibling) nodes.push(node);
    return nodes;
  };
  const sectionText = (heading) => sectionNodes(heading).filter((node) => node.matches('p, ul, ol')).map((node) => clean(node.textContent));
  const featureDescription = (doc, featureName) => {
    const target = clean(featureName).replace(/\s*\([^)]*\)\s*$/, '').replace(/\s+feature$/i, '').toLowerCase();
    const heading = [...doc.querySelectorAll('h2, h3, h4')].find((candidate) => clean(candidate.textContent).replace(/\s*\([^)]*\)\s*$/, '').replace(/\s+feature$/i, '').toLowerCase() === target);
    if (!heading) return '';
    const copy = [];
    for (let node = heading.nextElementSibling; node; node = node.nextElementSibling) {
      if (/^H[2-4]$/.test(node.tagName) && !node.classList.contains('minor-heading')) break;
      if (node.matches('p, ul, ol')) copy.push(clean(node.textContent));
    }
    return copy.join(' ');
  };
  const sourceTableCards = (tables) => tables.flatMap((table) => {
    const caption = clean(table.querySelector('caption')?.textContent) || 'Statistics';
    const headers = [...table.querySelectorAll('thead th')].map((cell) => clean(cell.textContent));
    let rows = [...table.querySelectorAll('tbody tr')];
    if (/level/i.test(headers[0] || '') && rows.some((row) => /^1st$/i.test(clean(row.cells?.[0]?.textContent)))) rows = rows.filter((row) => /^1st$/i.test(clean(row.cells?.[0]?.textContent)));
    return rows.map((row) => {
      const values = [...row.cells].map((cell) => clean(cell.textContent));
      const leadIndex = /^(?:d\d+|roll)$/i.test(headers[0] || '') && values.length > 1 ? 1 : 0;
      const label = `${caption}: ${values[leadIndex] || values[0] || 'Entry'}`;
      const text = values.map((value, index) => index === leadIndex || !value ? '' : `${headers[index] || `Column ${index + 1}`}: ${value}`).filter(Boolean).join(' · ');
      return { label, text };
    });
  });
  const backgroundTraits = (list) => [...(list ? list.querySelectorAll(':scope > li') : [])].map((item) => {
    const label = clean(item.querySelector('strong')?.textContent).replace(/[.:]$/, '');
    const text = clean(item.textContent).replace(new RegExp(`^${escapePattern(label)}[.:]?\\s*`, 'i'), '');
    return { label, text };
  }).filter((trait) => trait.label);
  const backgroundCards = (items) => items.map((item) => `<article><strong>${escapeAttribute(item.label)}</strong><p>${escapeAttribute(item.text)}</p></article>`).join('');
  const getLanguageDefinition = (traits) => {
    const languageTraits = traits.filter((trait) => /^(?:Languages?|Extra Language)$/i.test(trait.label));
    if (!languageTraits.length) return null;
    const text = languageTraits.map((trait) => trait.text).join(' ');
    const fixed = languages.map((language) => language.name).filter((language) => new RegExp(`\\b${escapePattern(language)}\\b`, 'i').test(text));
    const choiceCount = languageTraits.reduce((total, trait) => {
      if (!/of your choice|(?:one|two|three|four) (?:other|extra|additional) languages?|additional language/i.test(trait.text)) return total;
      const amount = trait.text.match(/\b(one|two|three|four)\b(?=[^.]{0,35}\blanguages?\b)/i)?.[1]?.toLowerCase();
      return total + ({ one: 1, two: 2, three: 3, four: 4 }[amount] || 1);
    }, 0);
    return { count: choiceCount, fixed };
  };
  const renderLanguageChoices = (source) => {
    const isRace = source === 'race';
    const host = isRace ? $('#race-choice-controls') : $('#background-choice-controls');
    if (!host) return;
    const definition = isRace ? raceLanguageDefinition : backgroundLanguageDefinition;
    const sectionAttribute = `data-${source}-language-choice`;
    host.querySelector(`[${sectionAttribute}]`)?.remove();
    const stateKey = isRace ? 'raceLanguages' : 'backgroundLanguages';
    const fixedKey = isRace ? 'raceFixedLanguages' : 'backgroundFixedLanguages';
    state[fixedKey] = definition?.fixed || [];
    if (!definition) return;
    if (!definition.count) { state[stateKey] = []; return; }
    const otherLanguages = isRace
      ? [...state.backgroundLanguages, ...state.backgroundFixedLanguages]
      : [...state.raceLanguages, ...state.raceFixedLanguages];
    const selected = state[stateKey].filter((language) => languages.some((entry) => entry.name === language) && !definition.fixed.includes(language) && !otherLanguages.includes(language)).slice(0, definition.count);
    state[stateKey] = selected;
    const fields = Array.from({ length: definition.count }, (_, index) => `<label><span>${isRace ? 'Racial' : 'Background'} language ${definition.count > 1 ? index + 1 : ''}</span><select data-language-source="${source}" data-language-index="${index}"><option value="">Choose language</option>${languages.map((language) => `<option value="${language.name}" data-preview="${language.category} language"${selected[index] === language.name ? ' selected' : ''}${selected[index] !== language.name && (selected.includes(language.name) || otherLanguages.includes(language.name) || definition.fixed.includes(language.name)) ? ' hidden' : ''}>${language.name} — ${language.category}</option>`).join('')}</select></label>`).join('');
    host.insertAdjacentHTML('beforeend', `<section ${sectionAttribute} class="class-skill-proficiencies origin-language-choices"><h3>Choose ${isRace ? 'racial' : 'background'} ${definition.count === 1 ? 'language' : 'languages'}</h3><div>${fields}</div></section>`);
    host.querySelectorAll(`[data-language-source="${source}"]`).forEach((select) => select.addEventListener('change', () => {
      state[stateKey][Number(select.dataset.languageIndex)] = select.value;
      renderLanguageChoices('race');
      renderLanguageChoices('background');
      renderIntelligenceProficiencyChoices();
      updateOriginChoiceSection();
    }));
  };
  const setLanguageDefinition = (source, traits) => {
    if (source === 'race') raceLanguageDefinition = getLanguageDefinition(traits);
    else backgroundLanguageDefinition = getLanguageDefinition(traits);
    renderLanguageChoices(source);
    renderLanguageChoices(source === 'race' ? 'background' : 'race');
    renderIntelligenceProficiencyChoices();
  };
  const loadToolChoiceCatalog = async () => {
    if (!toolChoiceCatalog) toolChoiceCatalog = (async () => {
      const doc = await fetchDocument('../items/index.html');
      const groups = {};
      doc.querySelectorAll('.tools-panel .item-group').forEach((group) => {
        const category = clean(group.querySelector(':scope > .item-group-title')?.textContent);
        if (!category) return;
        groups[category] = [...group.querySelectorAll(':scope > .item-card')].map((card) => ({
          name: clean(card.querySelector('.item-card__heading h3')?.textContent),
          category,
          preview: previewSnippet(card.querySelector('.tool-details > p')?.textContent || `${category} proficiency.`)
        })).filter((tool) => tool.name);
      });
      groups.Vehicles = [
        { name: 'Land Vehicles', category: 'Vehicle Proficiency', preview: 'Proficiency with land vehicles.' },
        { name: 'Waterborne Vehicles', category: 'Vehicle Proficiency', preview: 'Proficiency with waterborne vehicles.' }
      ];
      return groups;
    })();
    return toolChoiceCatalog;
  };
  const uniqueTools = (tools) => [...new Map(tools.map((tool) => [tool.name, tool])).values()];
  const getToolDefinition = async (text) => {
    const sourceText = clean(text).replace(/^Tools?:\s*/i, '');
    if (!sourceText) return null;
    const groups = await loadToolChoiceCatalog();
    const artisan = groups["Artisan's Tools"] || [];
    const gaming = groups['Gaming Set'] || [];
    const instruments = groups['Musical Instrument'] || [];
    const miscellaneous = groups.Miscellaneous || [];
    const vehicles = groups.Vehicles || [];
    const all = uniqueTools([...artisan, ...gaming, ...instruments, ...miscellaneous, ...vehicles]);
    const fragments = sourceText.split(/\s*(?:;|\bplus\b|,\s+and\s+|\band\s+(?=one\b))\s*/i).filter(Boolean);
    const slots = [];
    const choiceOptions = (fragment) => {
      const value = fragment.toLowerCase();
      const named = all.filter((tool) => new RegExp(`\\b${escapePattern(tool.name)}\\b`, 'i').test(fragment));
      if (/choice\s*:/i.test(fragment) && named.length) return named;
      if (/thieves' tools\s+or\s+(?:one\s+)?artisan/i.test(value)) return uniqueTools([...named, ...artisan]);
      if (/vehicle\s+or\s+(?:an?\s+)?artisan|artisan(?:'s)? tool\s+or\s+(?:one\s+)?vehicle/i.test(value)) return uniqueTools([...vehicles, ...artisan]);
      if (/vehicle\s+or\s+(?:a\s+)?gaming|gaming set\s+or\s+(?:one\s+)?vehicle/i.test(value)) return uniqueTools([...vehicles, ...gaming]);
      if (/miscellaneous[^.]*gaming[^.]*artisan/i.test(value)) return uniqueTools([...miscellaneous, ...gaming, ...artisan]);
      if (/artisan[^.]*or[^.]*musical|musical[^.]*or[^.]*artisan/i.test(value)) return uniqueTools([...artisan, ...instruments]);
      if (/gaming set\s+or\s+(?:one\s+)?tool|tool set appropriate|tools? used in your work/i.test(value)) return uniqueTools([...named, ...all]);
      if (/one (?:type of )?musical instrument/i.test(value)) return instruments;
      if (/one (?:type of |other )?artisan(?:'s)? tool|artisan's tools? of your choice/i.test(value)) return artisan;
      if (/one (?:of your choice of )?vehicles?|one vehicle/i.test(value)) return vehicles;
      if (/one (?:of your choice of )?gaming set/i.test(value)) return gaming;
      if (/choose one tool|one (?:set of )?tools? of your choice|one of your choice/i.test(value)) return all;
      if (/\bor\b/i.test(value) && named.length) return named;
      return [];
    };
    fragments.forEach((fragment) => {
      const options = choiceOptions(fragment);
      if (options.length) slots.push(options);
    });
    const fixed = uniqueTools(fragments.flatMap((fragment) => {
      if (/choice\s*:|\bor\b/i.test(fragment)) return [];
      return all.filter((tool) => new RegExp(`\\b${escapePattern(tool.name)}\\b`, 'i').test(fragment));
    })).map((tool) => tool.name);
    if (/\bshields\b/i.test(sourceText) && !/\bor\b[^.]*shields|shields[^.]*\bor\b/i.test(sourceText)) fixed.push('Shields');
    if (/^vehicles\b/i.test(sourceText)) fixed.push('Vehicles');
    return { slots, fixed: [...new Set(fixed)] };
  };
  const renderToolChoices = (source) => {
    const host = $(`#${source}-choice-controls`);
    if (!host) return;
    host.querySelector(`[data-${source}-tool-choice]`)?.remove();
    const definition = toolDefinitions[source];
    const choiceKey = `${source}Tools`;
    const fixedKey = `${source}FixedTools`;
    state[fixedKey] = definition?.fixed || [];
    if (!definition) return;
    if (!definition.slots.length) { state[choiceKey] = []; return; }
    const otherSources = ['class', 'race', 'background'].filter((entry) => entry !== source);
    const unavailable = otherSources.flatMap((entry) => [...(state[`${entry}Tools`] || []), ...(state[`${entry}FixedTools`] || [])]);
    const selected = definition.slots.map((options, index) => {
      const tool = (state[choiceKey] || [])[index] || '';
      return options.some((option) => option.name === tool) && !definition.fixed.includes(tool) && !unavailable.includes(tool) ? tool : '';
    });
    state[choiceKey] = selected;
    const fields = definition.slots.map((options, index) => `<label><span>${source[0].toUpperCase() + source.slice(1)} tool proficiency${definition.slots.length > 1 ? ` ${index + 1}` : ''}</span><select data-tool-source="${source}" data-tool-index="${index}"><option value="">Choose tool proficiency</option>${options.map((tool) => `<option value="${escapeAttribute(tool.name)}" data-preview="${escapeAttribute(tool.preview)}"${selected[index] === tool.name ? ' selected' : ''}${selected[index] !== tool.name && (selected.includes(tool.name) || unavailable.includes(tool.name) || definition.fixed.includes(tool.name)) ? ' hidden' : ''}>${escapeAttribute(tool.name)} — ${escapeAttribute(tool.category)}</option>`).join('')}</select></label>`).join('');
    const markup = `<section data-${source}-tool-choice class="class-skill-proficiencies origin-tool-choices"><h3>Choose ${source} tool ${definition.slots.length === 1 ? 'proficiency' : 'proficiencies'}</h3><div>${fields}</div></section>`;
    const skillSection = host.querySelector(source === 'background' ? '#background-skill-proficiencies' : source === 'class' ? '#class-skill-proficiencies' : '[data-race-subcategory-choice]')?.closest('section');
    if (skillSection) skillSection.insertAdjacentHTML('afterend', markup);
    else host.insertAdjacentHTML('beforeend', markup);
    host.querySelectorAll(`[data-tool-source="${source}"]`).forEach((select) => select.addEventListener('change', () => {
      state[choiceKey][Number(select.dataset.toolIndex)] = select.value;
      ['class', 'race', 'background'].forEach(renderToolChoices);
      renderIntelligenceProficiencyChoices();
      updateOriginChoiceSection();
    }));
  };
  const setToolDefinition = async (source, text) => {
    const request = ++toolDefinitionRequests[source];
    const definition = await getToolDefinition(text);
    if (request !== toolDefinitionRequests[source]) return;
    toolDefinitions[source] = definition;
    ['class', 'race', 'background'].forEach(renderToolChoices);
    renderIntelligenceProficiencyChoices();
    updateOriginChoiceSection();
  };
  const getBackgroundSkillDefinition = (traits) => {
    const trait = traits.find((item) => /^Skill Proficiencies$/i.test(item.label));
    if (!trait) return null;
    const options = skills.filter((skill) => new RegExp(`\\b${escapePattern(skill)}\\b`, 'i').test(trait.text));
    const isChoice = /\bchoose\b|of your choice/i.test(trait.text);
    const count = /\bthree\b/i.test(trait.text) ? 3 : /\btwo\b/i.test(trait.text) ? 2 : isChoice ? 1 : options.length;
    return { count, options: options.length ? options : skills, fixed: isChoice ? [] : options };
  };
  const renderBackgroundSkillChoices = (traits) => {
    const box = $('#background-skill-proficiencies');
    if (!box) return;
    const definition = getBackgroundSkillDefinition(traits);
    if (!definition) { state.backgroundSkills = []; box.hidden = true; box.replaceChildren(); return; }
    const selected = definition.fixed.length
      ? definition.fixed
      : state.backgroundSkills.filter((skill) => definition.options.includes(skill)).slice(0, definition.count);
    state.backgroundSkills = selected;
    const reconcile = () => {
      state.skills = state.skills.filter((skill) => !state.backgroundSkills.includes(skill));
      if (state.backgroundSkills.includes(state.humanSkill)) state.humanSkill = '';
      if (state.backgroundSkills.includes(state.perkSkill)) state.perkSkill = '';
      if (classSkillDefinition) renderSkillChoices(classSkillDefinition);
      renderExpertiseChoices();
      renderPerkChoices();
    };
    box.hidden = false;
    box.innerHTML = `<h3>Background skill proficiencies</h3><div>${Array.from({ length: definition.count }, (_, index) => {
      if (definition.fixed[index]) return `<label><span>Background skill ${index + 1}</span><select disabled><option selected>${escapeAttribute(definition.fixed[index])}</option></select></label>`;
      return `<label><span>Background skill ${index + 1}</span><select data-background-skill="${index}"><option value="">Choose skill</option>${definition.options.map((skill) => `<option value="${skill}" data-preview="${escapeAttribute(skillPreviews[skill])}"${selected[index] === skill ? ' selected' : ''}${selected[index] !== skill && selected.includes(skill) ? ' hidden' : ''}>${skill}</option>`).join('')}</select></label>`;
    }).join('')}</div>`;
    box.querySelectorAll('[data-background-skill]').forEach((select) => select.addEventListener('change', () => {
      state.backgroundSkills[Number(select.dataset.backgroundSkill)] = select.value;
      reconcile();
      renderBackgroundSkillChoices(traits);
    }));
    reconcile();
  };
  const renderBackgroundDetails = (doc, details, href) => {
    const copy = doc.querySelector('main .class-copy');
    const backgroundChoiceBox = $('#background-choice-controls');
    if (backgroundChoiceBox) backgroundChoiceBox.replaceChildren();
    if (!copy) { setDetailMarkup(details, '<section class="choice-block"><p>See the selected background page.</p></section>'); updateOriginChoiceSection(); return; }
    const children = [...copy.children];
    const firstHeadingIndex = children.findIndex((node) => /^H[2-4]$/.test(node.tagName));
    const openingNodes = firstHeadingIndex < 0 ? children : children.slice(0, firstHeadingIndex);
    const intro = openingNodes.filter((node) => node.tagName === 'P').map((node) => clean(node.textContent)).filter(Boolean);
    const sharedTraits = backgroundTraits(openingNodes.find((node) => node.tagName === 'UL'));
    const h2s = children.filter((node) => node.tagName === 'H2');
    const optionSection = h2s.find((heading) => /(?:options?|district of origin)/i.test(clean(heading.textContent)));
    const generalFeatureHeadings = optionSection ? h2s.slice(0, h2s.indexOf(optionSection)) : h2s;
    const isLoadoutTrait = (trait) => /equipment|starting cash/i.test(trait.label);
    const generalFeatures = generalFeatureHeadings.map((heading) => ({
      label: clean(heading.textContent),
      text: sectionNodes(heading).filter((node) => node.tagName === 'P').map((node) => clean(node.textContent)).join(' ')
    })).filter((feature) => feature.label && feature.text && !/starting equipment|starting cash/i.test(feature.label));

    let optionHeadings = [];
    if (optionSection) {
      const candidates = [];
      for (let node = optionSection.nextElementSibling; node && node.tagName !== 'H2'; node = node.nextElementSibling) if (node.tagName === 'H3') candidates.push(node);
      const namedByPage = /nest-dweller/i.test(href)
        ? candidates.filter((heading) => /district$/i.test(clean(heading.textContent)))
        : /backstreets-rat/i.test(href)
          ? candidates.filter((heading) => /district$/i.test(clean(heading.textContent)))
          : /associate-fixer/i.test(href)
            ? candidates.filter((heading) => /association$/i.test(clean(heading.textContent)))
            : /finger-affiliate/i.test(href)
              ? candidates.filter((heading) => heading.classList.contains('finger-option'))
              : [];
      optionHeadings = namedByPage.length ? namedByPage : candidates.filter((heading) => {
        for (let node = heading.nextElementSibling; node && node.tagName !== 'H2' && node.tagName !== 'H3'; node = node.nextElementSibling) if (node.tagName === 'UL') return true;
        return false;
      });
    }
    const optionSet = new Set(optionHeadings);
    const backgroundOptions = optionHeadings.map((heading) => {
      const nodes = [];
      for (let node = heading.nextElementSibling; node && node.tagName !== 'H2' && !optionSet.has(node); node = node.nextElementSibling) nodes.push(node);
      const featureHeading = nodes.find((node) => node.tagName === 'H3');
      const featureNodes = featureHeading ? nodes.slice(nodes.indexOf(featureHeading) + 1) : [];
      const feature = featureHeading ? {
        label: clean(featureHeading.textContent),
        text: featureNodes.filter((node) => node.tagName === 'P').map((node) => clean(node.textContent)).join(' ')
      } : null;
      const name = clean(heading.textContent);
      const traits = backgroundTraits(nodes.find((node) => node.tagName === 'UL'));
      if (/nest-dweller/i.test(href)) traits.push({ label: 'Additional Equipment', text: `A Nest ID issued for the ${name} Nest.` });
      return {
        name,
        intro: clean(nodes.find((node) => node.tagName === 'P')?.textContent),
        traits,
        feature
      };
    });
    const hasFixerLicense = sharedTraits.some((trait) => /equipment/i.test(trait.label) && /Fixer license/i.test(trait.text));
    const choiceLabel = /associate-fixer/i.test(href) ? 'Association'
      : /finger-affiliate/i.test(href) ? 'Syndicate'
        : /nest-dweller/i.test(href) ? 'Nest'
          : 'District of origin';
    const renderLoadout = (option) => {
      const traits = [...sharedTraits, ...(option?.traits || [])];
      const rawEquipment = traits.filter((trait) => /equipment/i.test(trait.label)).map((trait) => state.backgroundLicenseGrade ? trait.text.replace(/a Fixer license/i, `a Grade ${state.backgroundLicenseGrade} Fixer license`) : trait.text);
      const cash = rawEquipment.reduce((total, entry) => total + [...entry.matchAll(/\$\s*([\d,]+(?:\.\d+)?)/g)].reduce((sum, match) => sum + Number(match[1].replace(/,/g, '')), 0), 0);
      const equipment = rawEquipment.map((entry) => entry.replace(/[;,]?\s*(?:and\s+)?\$\s*[\d,]+(?:\.\d+)?[.!]?\s*$/i, '').replace(/[;,\s]+$/, ''));
      state.backgroundEquipment = equipment;
      state.cash = cash;
    };
    const markup = `<section class="race-details background-details">
      ${intro.map((paragraph) => `<p class="race-details__intro">${escapeAttribute(paragraph)}</p>`).join('')}
      ${sharedTraits.filter((trait) => !/^Skill Proficiencies$/i.test(trait.label) && !isLoadoutTrait(trait)).length ? `<h3>Background traits</h3><div class="race-trait-list">${backgroundCards(sharedTraits.filter((trait) => !/^Skill Proficiencies$/i.test(trait.label) && !isLoadoutTrait(trait)))}</div>` : ''}
      ${generalFeatures.length ? `<h3>Background ${generalFeatures.length === 1 ? 'feature' : 'features'}</h3><div class="race-trait-list">${backgroundCards(generalFeatures)}</div>` : ''}
    </section>`;
    setDetailMarkup(details, markup);
    if (backgroundChoiceBox) backgroundChoiceBox.innerHTML = `${backgroundOptions.length ? `<section class="class-subclass-choice background-choice"><label><span>Choose ${choiceLabel}</span><select id="background-option-select"><option value="">Choose ${choiceLabel.toLowerCase()}</option>${backgroundOptions.map((option) => `<option value="${escapeAttribute(option.name)}"${state.backgroundOption === option.name ? ' selected' : ''}>${escapeAttribute(option.name)}</option>`).join('')}</select></label><section id="background-option-details" class="class-subclass-details background-option-details" hidden></section></section>` : ''}${hasFixerLicense ? `<section class="class-subclass-choice background-choice"><label><span>Choose Fixer license grade</span><select id="background-license-grade"><option value="">Choose license grade</option><option value="9"${state.backgroundLicenseGrade === '9' ? ' selected' : ''}>Grade 9</option><option value="8"${state.backgroundLicenseGrade === '8' ? ' selected' : ''}>Grade 8</option></select></label></section>` : ''}<section id="background-skill-proficiencies" class="class-skill-proficiencies" hidden></section>`;
    updateOriginChoiceSection();
    const optionSelect = $('#background-option-select');
    const optionDetails = $('#background-option-details');
    const licenseSelect = $('#background-license-grade');
    if (licenseSelect) licenseSelect.addEventListener('change', () => {
      state.backgroundLicenseGrade = licenseSelect.value;
      renderLoadout(backgroundOptions.find((candidate) => candidate.name === optionSelect?.value));
    });
    if (!optionSelect || !optionDetails) { renderBackgroundSkillChoices(sharedTraits); setLanguageDefinition('background', sharedTraits); setToolDefinition('background', sharedTraits.find((trait) => /^Tool Proficiencies?$/i.test(trait.label))?.text || ''); renderLoadout(null); updateOriginChoiceSection(); return; }
    const showOption = () => {
      const option = backgroundOptions.find((candidate) => candidate.name === optionSelect.value);
      optionDetails.hidden = !option;
      optionDetails.innerHTML = option ? `<h3>${escapeAttribute(option.name)}</h3>
        ${option.intro ? `<p class="race-details__intro">${escapeAttribute(option.intro)}</p>` : ''}
        ${option.traits.filter((trait) => !/^Skill Proficiencies$/i.test(trait.label) && !isLoadoutTrait(trait)).length ? `<h3>Background traits</h3><div class="race-trait-list">${backgroundCards(option.traits.filter((trait) => !/^Skill Proficiencies$/i.test(trait.label) && !isLoadoutTrait(trait)))}</div>` : ''}
        ${option.feature?.text ? `<h3>Background feature</h3><div class="race-trait-list">${backgroundCards([option.feature])}</div>` : ''}` : '';
      renderBackgroundSkillChoices([...sharedTraits, ...(option?.traits || [])]);
      setLanguageDefinition('background', [...sharedTraits, ...(option?.traits || [])]);
      setToolDefinition('background', [...sharedTraits, ...(option?.traits || [])].find((trait) => /^Tool Proficiencies?$/i.test(trait.label))?.text || '');
      renderLoadout(option);
      refreshDetailScrollbar(details);
    };
    optionSelect.addEventListener('change', () => { state.backgroundOption = optionSelect.value; showOption(); });
    showOption();
  };
  const renderClassSpellChoices = () => {
    const box = $('#class-spell-choices');
    if (!box) return;
    box.innerHTML = classSpellChoiceDefinitions.map((definition) => {
      const options = typeof definition.options === 'function' ? definition.options() : definition.options;
      const count = Math.max(0, typeof definition.count === 'function' ? definition.count() : definition.count);
      const selected = (state.classSpells[definition.key] || []).filter((choice) => options.some((option) => option.value === choice)).slice(0, count);
      state.classSpells[definition.key] = selected;
      if (!count) return '';
      const fields = Array.from({ length: count }, (_, index) => `<label><span>${escapeAttribute(definition.label)} ${index + 1}</span><select data-class-spell="${definition.key}" data-spell-index="${index}"><option value="">Choose ${escapeAttribute(definition.label.toLowerCase())}</option>${options.map((option) => `<option value="${escapeAttribute(option.value)}" data-preview="${escapeAttribute(option.preview)}"${selected[index] === option.value ? ' selected' : ''}${selected[index] !== option.value && selected.includes(option.value) ? ' hidden' : ''}>${escapeAttribute(option.label)}</option>`).join('')}</select></label>`).join('');
      return `<section><h4>${escapeAttribute(definition.feature)}</h4><div>${fields}</div></section>`;
    }).join('');
    box.querySelectorAll('[data-class-spell]').forEach((select) => select.addEventListener('change', () => {
      const selected = state.classSpells[select.dataset.classSpell] || [];
      selected[Number(select.dataset.spellIndex)] = select.value;
      state.classSpells[select.dataset.classSpell] = selected;
      renderClassSpellChoices();
    }));
  };
  const renderClassFeatureChoices = () => {
    const box = $('#class-feature-choices');
    if (!box) return;
    box.innerHTML = classFeatureChoiceDefinitions.map((definition) => {
      const options = (typeof definition.options === 'function' ? definition.options() : definition.options).map((option) => typeof option === 'string' ? { label: option, value: option, preview: '' } : option);
      const selected = (state.classFeatureChoices[definition.key] || []).filter((choice) => options.some((option) => option.value === choice)).slice(0, definition.count);
      state.classFeatureChoices[definition.key] = selected;
      const fields = Array.from({ length: definition.count }, (_, index) => `<label><span>${definition.label}${definition.count > 1 ? ` ${index + 1}` : ''}</span><select data-class-feature="${definition.key}" data-feature-index="${index}"><option value="">Choose ${definition.label.toLowerCase()}</option>${options.map((option) => `<option value="${escapeAttribute(option.value)}" data-preview="${escapeAttribute(option.preview)}"${selected[index] === option.value ? ' selected' : ''}${selected[index] !== option.value && selected.includes(option.value) ? ' hidden' : ''}>${escapeAttribute(option.label)}</option>`).join('')}</select></label>`).join('');
      return `<section><h4>${escapeAttribute(definition.feature)}</h4><div>${fields}</div></section>`;
    }).join('');
    box.querySelectorAll('[data-class-feature]').forEach((select) => select.addEventListener('change', () => {
      const selected = state.classFeatureChoices[select.dataset.classFeature] || [];
      selected[Number(select.dataset.featureIndex)] = select.value;
      state.classFeatureChoices[select.dataset.classFeature] = selected;
      renderClassFeatureChoices();
    }));
  };
  const renderSkillChoices = (skills) => {
    const box = $('#class-skill-proficiencies');
    if (!box) return;
    const selected = state.skills.filter((skill) => skills.options.includes(skill)).slice(0, skills.count);
    state.skills = selected;
    box.innerHTML = Array.from({ length: skills.count }, (_, index) => `<label>Skill ${index + 1}<select data-class-skill="${index}"><option value="">Choose skill</option>${skills.options.map((skill) => `<option value="${skill}" data-preview="${escapeAttribute(skillPreviews[skill])}"${selected[index] === skill ? ' selected' : ''}${selected[index] !== skill && (selected.includes(skill) || state.backgroundSkills.includes(skill) || state.humanSkill === skill || state.perkSkill === skill) ? ' hidden' : ''}>${skill}</option>`).join('')}</select></label>`).join('');
    box.querySelectorAll('[data-class-skill]').forEach((select) => select.addEventListener('change', () => { state.skills[Number(select.dataset.classSkill)] = select.value; renderSkillChoices(skills); renderExpertiseChoices(); renderClassFeatureChoices(); renderPerkChoices(); }));
  };
  const renderExpertiseChoices = () => {
    const box = $('#class-expertise-choices');
    if (!box) return;
    const options = [...new Set([...state.skills.filter(Boolean), ...state.backgroundSkills.filter(Boolean), "Thieves' tools"])];
    const selected = state.expertise.filter((choice) => options.includes(choice)).slice(0, 2);
    state.expertise = selected;
    box.innerHTML = Array.from({ length: 2 }, (_, index) => `<label>Expertise ${index + 1}<select data-expertise="${index}"><option value="">Choose proficiency</option>${options.map((option) => `<option value="${option}" data-preview="${escapeAttribute(skillPreviews[option])}"${selected[index] === option ? ' selected' : ''}${selected[index] !== option && selected.includes(option) ? ' hidden' : ''}>${option}</option>`).join('')}</select></label>`).join('');
    box.querySelectorAll('[data-expertise]').forEach((select) => select.addEventListener('change', () => { state.expertise[Number(select.dataset.expertise)] = select.value; renderExpertiseChoices(); }));
  };
  const renderSubclassDetails = async (href, target) => {
    if (!href || !target) return;
    try {
      const doc = await fetchDocument(new URL(href, new URL('../classes/classes.html', location.href)));
      const content = doc.querySelector('main .subclass-content');
      const intro = clean(content && content.querySelector('.subclass-intro, p') && content.querySelector('.subclass-intro, p').textContent);
      const firstLevelCards = [];
      const table = content && content.querySelector('table');
      const tableRow = table && [...table.querySelectorAll('tbody tr')].find((row) => /^1st$/i.test(clean(row.cells[0] && row.cells[0].textContent)));
      const tableCaption = clean(table && table.querySelector('caption') && table.querySelector('caption').textContent);
      if (tableRow && tableCaption) firstLevelCards.push({ label: tableCaption, text: [...tableRow.cells].slice(1).map((cell) => clean(cell.textContent)).filter(Boolean).join(' · ') });
      [...(content ? content.querySelectorAll('h2') : [])].forEach((heading) => {
        const copy = [];
        for (let node = heading.nextElementSibling; node && node.tagName !== 'H2'; node = node.nextElementSibling) if (node.matches('p, ul, ol')) copy.push(clean(node.textContent));
        const text = copy.join(' ');
        if (/\b1st level\b/i.test(text)) firstLevelCards.push({ label: clean(heading.textContent), text });
      });
      target.hidden = false;
      target.innerHTML = `<h3>${clean(content && content.getAttribute('aria-label')).replace(/^\w+:\s*/i, '') || 'Subclass'}</h3>${intro ? `<p class="race-details__intro">${intro}</p>` : ''}<div class="race-trait-list">${firstLevelCards.map((card) => `<article><strong>${card.label}</strong><p>${card.text}</p></article>`).join('') || '<p>There are no additional Level 1 features listed for this choice.</p>'}</div>`;
    } catch (error) { console.error('Unable to load subclass details', error); target.hidden = false; target.textContent = 'Subclass details could not be loaded.'; }
    refreshDetailScrollbar(target.closest('[data-crt-scrollbar]'));
  };
  const renderLevelOneSubclass = async (href, target) => {
    if (!target) return;
    if (!href) { target.hidden = true; target.replaceChildren(); return; }
    try {
      const doc = await fetchDocument(new URL(href, new URL('../classes/classes.html', location.href)));
      const content = doc.querySelector('main .subclass-content');
      const intro = clean(content?.querySelector('.subclass-intro, p')?.textContent);
      const headings = [...(content ? content.querySelectorAll(':scope > h2') : [])];
      const features = [];
      let laterFeaturesReached = false;
      headings.forEach((heading) => {
        const nodes = [];
        for (let node = heading.nextElementSibling; node && node.tagName !== 'H2'; node = node.nextElementSibling) nodes.push(node);
        const text = nodes.filter((node) => node.matches('p, ul, ol')).map((node) => clean(node.textContent)).join(' ');
        const unlocks = [...text.matchAll(/(?:at|starting at|beginning at|from)\s+(\d+)(?:st|nd|rd|th)\s+level/gi)].map((match) => Number(match[1]));
        const unlock = unlocks.length ? Math.min(...unlocks) : 0;
        const tables = nodes.flatMap((node) => node.matches('table') ? [node] : [...(node.querySelectorAll?.('table') || [])]);
        const hasFirstLevelRow = tables.some((table) => [...table.querySelectorAll('tbody tr')].some((row) => /^1st$/i.test(clean(row.cells?.[0]?.textContent))));
        if (unlock > 1) laterFeaturesReached = true;
        if (unlock === 1 || hasFirstLevelRow || (!unlock && !laterFeaturesReached)) features.push({ label: clean(heading.textContent), text, tables });
      });
      const leadingTables = [];
      for (let node = content?.firstElementChild; node && node !== headings[0]; node = node.nextElementSibling) if (node.matches('table, .table-wrap')) leadingTables.push(...(node.matches('table') ? [node] : node.querySelectorAll('table')));
      const relevantTables = [...new Set([...leadingTables, ...features.flatMap((feature) => feature.tables)])];
      const statistics = sourceTableCards(relevantTables);
      const choices = [];
      const choiceTablePattern = /(?:ancestry|ordning|affinity|genie kind|genie(?:'|’|�)s vessel|runic patterns)/i;
      relevantTables.forEach((table) => {
        const caption = clean(table.querySelector('caption')?.textContent);
        if (!choiceTablePattern.test(caption)) return;
        const headers = [...table.querySelectorAll('thead th')].map((cell) => clean(cell.textContent));
        const optionIndex = /^(?:d\d+|roll)$/i.test(headers[0] || '') && headers.length > 1 ? 1 : 0;
        const options = [...table.querySelectorAll('tbody tr')].map((row) => {
          const values = [...row.cells].map((cell) => clean(cell.textContent));
          return { value: values[optionIndex], label: values[optionIndex], preview: values.map((value, index) => index === optionIndex || !value ? '' : `${headers[index] || `Column ${index + 1}`}: ${value}`).filter(Boolean).join(' · ') };
        }).filter((option) => option.value);
        if (options.length) choices.push({ key: `table-${caption.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, feature: caption, label: caption, count: 1, options });
      });
      features.forEach((feature) => feature.text.split(/(?<=[.!?])\s+/).forEach((sentence) => {
        if (!/skill/i.test(sentence) || !/(?:following skills|skills? \(your choice\)|one skill of your choice|choice of (?:one|two) of the following skills)/i.test(sentence)) return;
        let options = skills.filter((skill) => new RegExp(`\\b${escapePattern(skill)}\\b`, 'i').test(sentence));
        if (!options.length && /one skill of your choice/i.test(sentence)) options = skills;
        if (options.length < 2) return;
        const count = /(?:two of the following skills|choice of two)/i.test(sentence) ? 2 : 1;
        const key = `skill-${feature.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        if (!choices.some((choice) => choice.key === key)) choices.push({ key, feature: feature.label, label: 'Skill proficiency', count, options: options.map((skill) => ({ value: skill, label: skill, preview: skillPreviews[skill] })) });
      }));
      const disciplineFeature = features.find((feature) => /learn two additional Psionic Disciplines of your choice/i.test(feature.text));
      if (disciplineFeature) {
        const order = clean(content.getAttribute('aria-label')).replace(/^mystic:\s*/i, '').replace(/[^a-z]/gi, '').toLowerCase();
        const source = await fetch('../scripts/psionic-disciplines-data.js').then((response) => response.text());
        const disciplines = [...source.matchAll(/"group":"([^"]+)","title":"([^"]+)"/g)].filter(([, group]) => group.replace(/[^a-z]/gi, '').toLowerCase() === order).map(([, , name]) => name).filter((name, index, list) => list.indexOf(name) === index);
        if (disciplines.length) choices.push({ key: 'bonus-disciplines', feature: disciplineFeature.label, label: 'Psionic discipline', count: 2, options: disciplines.map((name) => ({ value: name, label: name, preview: 'Discipline for the selected Mystic Order.' })) });
      }
      target.hidden = false;
      target.innerHTML = `<h3>${escapeAttribute(clean(content?.getAttribute('aria-label')).replace(/^\w+:\s*/i, '') || 'Subclass')}</h3>${intro ? `<p class="race-details__intro">${escapeAttribute(intro)}</p>` : ''}<h3>Level 1 subclass features</h3><div class="race-trait-list">${backgroundCards(features.map((feature) => ({ label: feature.label, text: feature.text || 'See the selected subclass page for details.' }))) || '<p>No additional Level 1 features are listed.</p>'}</div>${statistics.length ? `<h3>Level 1 statistics</h3><div class="race-trait-list">${backgroundCards(statistics)}</div>` : ''}${choices.length ? '<section class="level-one-feature-choices subclass-feature-choices"><h3>Subclass feature choices</h3><div id="subclass-feature-choice-fields"></div></section>' : ''}`;
      const choiceBox = target.querySelector('#subclass-feature-choice-fields');
      const renderChoices = () => {
        if (!choiceBox) return;
        choiceBox.innerHTML = choices.map((definition) => {
          const selected = (state.subclassFeatureChoices[definition.key] || []).filter((choice) => definition.options.some((option) => option.value === choice)).slice(0, definition.count);
          state.subclassFeatureChoices[definition.key] = selected;
          const fields = Array.from({ length: definition.count }, (_, index) => `<label><span>${escapeAttribute(definition.label)}${definition.count > 1 ? ` ${index + 1}` : ''}</span><select data-subclass-feature="${definition.key}" data-feature-index="${index}"><option value="">Choose ${escapeAttribute(definition.label.toLowerCase())}</option>${definition.options.map((option) => `<option value="${escapeAttribute(option.value)}" data-preview="${escapeAttribute(option.preview)}"${selected[index] === option.value ? ' selected' : ''}${selected[index] !== option.value && selected.includes(option.value) ? ' hidden' : ''}>${escapeAttribute(option.label)}</option>`).join('')}</select></label>`).join('');
          return `<section><h4>${escapeAttribute(definition.feature)}</h4><div>${fields}</div></section>`;
        }).join('');
        choiceBox.querySelectorAll('[data-subclass-feature]').forEach((select) => select.addEventListener('change', () => {
          const selected = state.subclassFeatureChoices[select.dataset.subclassFeature] || [];
          selected[Number(select.dataset.featureIndex)] = select.value;
          state.subclassFeatureChoices[select.dataset.subclassFeature] = selected;
          renderChoices();
        }));
      };
      renderChoices();
    } catch (error) { console.error('Unable to load subclass details', error); target.hidden = false; target.textContent = 'Subclass details could not be loaded.'; }
    refreshDetailScrollbar(target.closest('[data-crt-scrollbar]'));
  };
  const loadClass = async () => {
    const select = $('#class-select');
    const details = $('#class-details');
    const choiceBox = $('#class-choice-controls');
    if (choiceBox) choiceBox.replaceChildren();
    updateOriginChoiceSection();
    if (!select.value) { classSkillDefinition = null; toolDefinitions.class = null; state.classTools = []; state.classFixedTools = []; state.hitDieSides = 0; state.hitDiceRemaining = null; state.hitDicePools = {}; clearDetail(details); $('#hp-value').textContent = '0'; updateOriginChoiceSection(); return; }
    if (!restoringImport) {
      state.level = 1;
      state.classLevels = { [select.value]: 1 };
      state.equipmentChoices = {};
      state.equipmentItems = {};
      state.skills = [];
      state.expertise = [];
      state.classFeatureChoices = {};
      state.classSpells = {};
      state.spellcasting = {};
      state.spellcastingLevel = 0;
      state.levelUpFeatures = [];
      state.levelHpBonus = 0;
      state.classTools = [];
      state.classFixedTools = [];
      state.subclass = '';
      state.subclassFeatureChoices = {};
    }
    classFeatureChoiceDefinitions = [];
    classSpellChoiceDefinitions = [];
    classSpellProgression = [];
    classSkillDefinition = null;
    try {
      const doc = await fetchDocument(`../classes/${select.value}`);
      const headings = [...doc.querySelectorAll('h2, h3, h4')];
      const proficiencyHeading = headings.find((heading) => /^proficiencies$/i.test(clean(heading.textContent)) || /^skill proficiencies$/i.test(clean(heading.textContent)));
      const proficiencyLines = sectionText(proficiencyHeading).map(expandShieldProficiency);
      const equipmentHeading = headings.find((heading) => /^equipment$/i.test(clean(heading.textContent)));
      const equipmentNodes = sectionNodes(equipmentHeading);
      const equipmentIntroNode = equipmentNodes.find((node) => node.tagName === 'P');
      const equipmentIntro = clean(equipmentIntroNode && equipmentIntroNode.textContent);
      const equipmentList = equipmentNodes.find((node) => node.tagName === 'UL');
      const equipmentItems = [...(equipmentList ? equipmentList.querySelectorAll(':scope > li') : [])].map((item) => clean(item.textContent)).filter(Boolean);
      const skillLine = proficiencyLines.find((line) => /^Skills:/i.test(line)) || '';
      const skillMatch = skillLine.match(/^Skills:\s*Choose\s+(?:any\s+)?(one|two|three|four)(?:\s+skills?)?(?:\s+from\s+(.+))?$/i);
      const count = { one: 1, two: 2, three: 3, four: 4 }[(skillMatch && skillMatch[1] || '').toLowerCase()] || 0;
      const options = skillMatch ? (skillMatch[2] ? skillMatch[2].replace(/,?\s+and\s+/i, ', ').split(',').map(clean).filter(Boolean) : skills) : [];
      if (count && options.length) classSkillDefinition = { count, options };
      const table = [...doc.querySelectorAll('table')].find((candidate) => [...candidate.querySelectorAll('thead th')].some((header) => /^features?$/i.test(clean(header.textContent))));
      const headers = table ? [...table.querySelectorAll('thead th')] : [];
      const featureColumn = headers.findIndex((header) => /^features?$/i.test(clean(header.textContent)));
      const firstRow = featureColumn < 0 ? null : [...table.querySelectorAll('tbody tr')].find((row) => /^1st$/i.test(clean(row.cells[0] && row.cells[0].textContent)));
      classSpellProgression = table ? [...table.querySelectorAll('tbody tr')].map((row) => ({
        level: Number.parseInt(clean(row.cells[0]?.textContent), 10) || 0,
        values: Object.fromEntries(headers.map((header, index) => [clean(header.textContent).toLowerCase(), clean(row.cells[index]?.textContent)]))
      })).filter((entry) => entry.level) : [];
      const features = firstRow ? clean(firstRow.cells[featureColumn].textContent).split(',').filter(Boolean) : [];
      const classId = select.value.replace(/\.html$/i, '').toLowerCase();
      const tableCount = (label) => {
        const column = headers.findIndex((header) => new RegExp(`^${escapePattern(label)}$`, 'i').test(clean(header.textContent)));
        const value = column >= 0 && firstRow ? Number(clean(firstRow.cells[column]?.textContent)) : 0;
        return Number.isFinite(value) ? value : 0;
      };
      const availableSpells = (await loadSpellCatalog()).filter((spell) => (spell.classes || []).some((name) => clean(name).toLowerCase() === classId));
      const spellOptions = (level) => availableSpells.filter((spell) => Number(spell.level) === level).map((spell) => ({ value: spell.id, label: spell.name, preview: spell.preview }));
      const cantripCount = tableCount('Cantrips Known');
      const knownSpellCount = tableCount('Spells Known');
      if (cantripCount) classSpellChoiceDefinitions.push({ key: 'cantrips', feature: 'Cantrips known', label: 'Cantrip', count: cantripCount, options: spellOptions(0) });
      if (knownSpellCount) classSpellChoiceDefinitions.push({ key: 'known-spells', feature: '1st-level spells known', label: 'Spell', count: knownSpellCount, options: spellOptions(1) });
      if (classId === 'wizard') classSpellChoiceDefinitions.push({ key: 'spellbook', feature: 'Starting spellbook', label: 'Spellbook spell', count: 6, options: spellOptions(1) });
      const preparedAbility = { artificer: 'Intelligence', cleric: 'Wisdom', druid: 'Wisdom', wizard: 'Intelligence' }[classId];
      if (preparedAbility) {
        const preparedCount = () => Math.max(1, Math.floor((score(preparedAbility) - 10) / 2) + (classId === 'artificer' ? 0 : 1));
        const preparedOptions = classId === 'wizard'
          ? () => spellOptions(1).filter((spell) => (state.classSpells.spellbook || []).includes(spell.value))
          : spellOptions(1);
        classSpellChoiceDefinitions.push({ key: 'prepared-spells', feature: `Prepared 1st-level spells (${preparedAbility} modifier)`, label: 'Prepared spell', count: preparedCount, options: preparedOptions });
      }
      const featureDetails = features.map((feature) => {
        const name = clean(feature).replace(/\s*\([^)]*\)\s*$/, '');
        const heading = headings.find((candidate) => clean(candidate.textContent).replace(/\s*\([^)]*\)\s*$/, '').toLowerCase() === name.toLowerCase());
        const copy = [];
        for (let node = heading && heading.nextElementSibling; node; node = node.nextElementSibling) {
          if (/^H[2-4]$/.test(node.tagName) && !node.classList.contains('minor-heading')) break;
          if (node.matches('p, ul, ol')) copy.push(clean(node.textContent));
        }
        return `<details><summary>${feature}<span>+</span></summary><p>${copy.join(' ') || 'See the selected class page for this feature.'}</p></details>`;
      }).join('');
      const hpText = [...doc.querySelectorAll('p')].map((node) => clean(node.textContent)).find((line) => /^Hit Points at 1st Level:/i.test(line)) || '';
      $('#hp-value').textContent = (hpText.match(/:\s*(\d+)/) || [])[1] || '0';
      const hitDiceText = [...doc.querySelectorAll('p')].map((node) => clean(node.textContent)).find((line) => /^Hit Dice:/i.test(line)) || '';
      state.hitDieSides = Number(hitDiceText.match(/\b1d(\d+)\b/i)?.[1]) || 0;
      if (!restoringImport) {
        state.hitDiceRemaining = 1;
        state.hitDicePools = Object.fromEntries(hitDiceSizes.map((sides) => [`d${sides}`, { maximum: sides === state.hitDieSides ? 1 : 0, remaining: sides === state.hitDieSides ? 1 : 0 }]));
      }
      const proficiencyRows = proficiencyLines.filter((line) => !/^Skills:/i.test(line)).map((line) => {
        const divider = line.indexOf(':');
        const label = divider < 0 ? line : line.slice(0, divider);
        const value = divider < 0 ? '' : line.slice(divider + 1).trim();
        return `<div class="proficiency-row"><strong>${label}</strong>${value ? `<span>${value}</span>` : ''}</div>`;
      }).join('');
      const expertiseHeading = headings.find((heading) => /^Expertise$/i.test(clean(heading.textContent)));
      const hasLevelOneExpertise = /\bat\s+1st\s+level\b/i.test(sectionText(expertiseHeading).join(' '));
      if (hasLevelOneExpertise && !restoringImport) state.expertise = [];
      const fightingStyle = features.find((feature) => /^Fighting Style$/i.test(clean(feature)));
      if (fightingStyle) {
        const heading = headings.find((candidate) => /^Fighting Style$/i.test(clean(candidate.textContent)));
        const styles = backgroundTraits(sectionNodes(heading).find((node) => node.tagName === 'UL')).map((style) => ({ value: style.label, label: style.label, preview: previewSnippet(style.text) }));
        if (styles.length) classFeatureChoiceDefinitions.push({ key: 'fighting-style', feature: 'Fighting Style', label: 'Fighting style', count: 1, options: styles });
      }
      if (features.some((feature) => /^Hunter's Bane$/i.test(clean(feature)))) classFeatureChoiceDefinitions.push({ key: 'hemocraft-ability', feature: "Hunter's Bane", label: 'Hemocraft ability', count: 1, options: ['Intelligence', 'Wisdom'] });
      if (features.some((feature) => /^Blood Maledict$/i.test(clean(feature)))) {
        try {
          const curseDoc = await fetchDocument('../classes/blood-hunter/blood-hunter-blood-curses.html');
          const curses = [...curseDoc.querySelectorAll('main h2')].map((heading) => {
            const copy = sectionText(heading);
            return { value: clean(heading.textContent), label: clean(heading.textContent), preview: previewSnippet(copy.filter((line) => !/^Prerequisite:/i.test(line)).join(' ')), restricted: copy.some((line) => /^Prerequisite:/i.test(line)) };
          }).filter((curse) => curse.value && !curse.restricted);
          if (curses.length) classFeatureChoiceDefinitions.push({ key: 'blood-curse', feature: 'Blood Maledict', label: 'Blood curse', count: 1, options: curses });
        } catch (error) { console.error('Unable to load Blood Curse choices', error); }
      }
      if (features.some((feature) => /^Deft Explorer$/i.test(clean(feature)))) classFeatureChoiceDefinitions.push({ key: 'canny', feature: 'Deft Explorer — Canny', label: 'Expertise skill', count: 1, options: () => state.skills.filter(Boolean).map((skill) => ({ value: skill, label: skill, preview: skillPreviews[skill] })) });
      if (choiceBox) choiceBox.innerHTML = `${equipmentItems.length ? '<section class="starting-equipment"><h3>Starting equipment</h3><div id="starting-equipment-choices"></div></section>' : ''}${count ? '<section class="class-skill-proficiencies"><h3>Choose skill proficiencies</h3><div id="class-skill-proficiencies"></div></section>' : ''}${hasLevelOneExpertise ? '<section class="class-skill-proficiencies"><h3>Choose expertise</h3><div id="class-expertise-choices"></div></section>' : ''}${classFeatureChoiceDefinitions.length ? '<section class="level-one-feature-choices"><h3>Level 1 feature choices</h3><div id="class-feature-choices"></div></section>' : ''}${classSpellChoiceDefinitions.length ? '<section class="level-one-feature-choices class-spell-choices"><h3>Level 1 spell choices</h3><div id="class-spell-choices"></div></section>' : ''}`;
      updateOriginChoiceSection();
      setDetailMarkup(details, `<section class="choice-block"><h3>Proficiencies</h3><div class="proficiency-list">${proficiencyRows || '<p>See the class page.</p>'}</div></section><section class="level-one-features"><h3>Level 1 features</h3><div>${featureDetails || '<p>No Level 1 features listed.</p>'}</div></section>`);
      if (equipmentItems.length) await renderStartingEquipment($('#starting-equipment-choices'), equipmentItems);
      if (classSkillDefinition) renderSkillChoices(classSkillDefinition);
      if (hasLevelOneExpertise) renderExpertiseChoices();
      if (classFeatureChoiceDefinitions.length) renderClassFeatureChoices();
      if (classSpellChoiceDefinitions.length) renderClassSpellChoices();
      await setToolDefinition('class', proficiencyLines.find((line) => /^Tools?:/i.test(line)) || '');
      const subclassFeatureLabels = { 'Divine Domain': 'Choose Divine Domain', 'Mystic Order': 'Choose Mystic Order', 'Sorcerous Origin': 'Choose Sorcerous Origin', 'Otherworldly Patron': 'Choose Otherworldly Patron' };
      const subclassFeature = features.find((feature) => subclassFeatureLabels[clean(feature)]);
      if (subclassFeature) {
        const index = await fetchDocument('../classes/classes.html');
        const entry = [...index.querySelectorAll('.class-entry')].find((item) => item.querySelector('h3 > a') && item.querySelector('h3 > a').getAttribute('href') === select.value);
        const options = [...(entry ? entry.querySelectorAll('.subclass-item a') : [])].map((link) => ({ label: clean(link.textContent).replace(/^Subclass:\s*/, ''), value: link.getAttribute('href') })).filter((option) => option.value);
        if (options.length) {
          choiceBox.insertAdjacentHTML('beforeend', `<section class="class-subclass-choice"><label><span>${subclassFeatureLabels[clean(subclassFeature)]}</span><select id="class-subclass-select"><option value="">Choose an option</option>${options.map((option) => `<option value="${option.value}"${state.subclass === option.value ? ' selected' : ''}>${option.label}</option>`).join('')}</select></label><section id="class-subclass-details" class="class-subclass-details" hidden></section></section>`);
          updateOriginChoiceSection();
          $('#class-subclass-select').addEventListener('change', (event) => { state.subclass = event.target.value; state.subclassFeatureChoices = {}; renderLevelOneSubclass(event.target.value, $('#class-subclass-details')); });
          if (state.subclass) await renderLevelOneSubclass(state.subclass, $('#class-subclass-details'));
        }
      }
      refreshDetailScrollbar(details);
    } catch (error) { console.error('Unable to load class details', error); setDetailMarkup(details, 'Class details could not be loaded.'); }
  };

  const loadSimpleDetails = async (kind, source) => {
    const select = $(`#${kind}-select`); const details = $(`#${kind}-details`);
    if (!select.value) {
      clearDetail(details);
      if (kind === 'race') { raceLanguageDefinition = null; toolDefinitions.race = null; state.raceLanguages = []; state.raceFixedLanguages = []; state.raceTools = []; state.raceFixedTools = []; $('#race-choice-controls')?.querySelectorAll('[data-race-language-choice], [data-race-tool-choice]').forEach((node) => node.remove()); renderRacialIncreases(); }
      if (kind === 'background') { backgroundLanguageDefinition = null; toolDefinitions.background = null; state.backgroundLanguages = []; state.backgroundFixedLanguages = []; state.backgroundTools = []; state.backgroundFixedTools = []; $('#background-choice-controls')?.replaceChildren(); updateOriginChoiceSection(); }
      return;
    }
    try {
      const doc = await fetchDocument(new URL(select.value, new URL(source, location.href)));
      if (kind === 'race') {
        const raceCopies = [...doc.querySelectorAll('main .class-copy')];
        const raceChildren = raceCopies.flatMap((copy) => [...copy.children]);
        const firstSubraceIndex = raceChildren.findIndex((node) => node.tagName === 'H2');
        const sharedNodes = firstSubraceIndex < 0 ? raceChildren : raceChildren.slice(0, firstSubraceIndex);
        const raceIntro = sharedNodes.filter((node) => node.tagName === 'P').map((node) => clean(node.textContent)).filter(Boolean).join(' ');
        const traits = sharedNodes.filter((node) => node.tagName === 'UL').flatMap(backgroundTraits);
        const sharedTables = sourceTableCards(sharedNodes.flatMap((node) => node.matches('table') ? [node] : [...node.querySelectorAll('table')]));
        const core = ['Ability Score Increase', 'Size', 'Speed', 'Fey', 'Languages'];
        const ordered = [...traits.filter((trait) => core.includes(trait.label)), ...traits.filter((trait) => !core.includes(trait.label))];
        const subraceHeadings = raceChildren.filter((node) => node.tagName === 'H2');
        const raceChoices = $('#race-choice-controls');
        raceChoices?.querySelector('[data-race-subcategory-choice]')?.remove();
        const subraceControl = subraceHeadings.length ? `<section data-race-subcategory-choice class="class-subclass-choice"><label><span>Subrace or lineage</span><select id="race-subcategory-select"><option value="">Choose subrace or lineage</option>${subraceHeadings.map((heading) => { const label = clean(heading.textContent); return `<option value="${escapeAttribute(label)}">${escapeAttribute(label)}</option>`; }).join('')}</select></label><section id="race-subcategory-details" class="race-subcategory-details" hidden></section></section>` : '';
        if (subraceControl) raceChoices?.insertAdjacentHTML('beforeend', subraceControl);
        setLanguageDefinition('race', traits);
        setToolDefinition('race', traits.filter((trait) => /^Tool Proficienc|^Tinker$/i.test(trait.label)).map((trait) => trait.text).join(' '));
        updateOriginChoiceSection();
        setDetailMarkup(details, `<section class="race-details">${raceIntro ? `<p class="race-details__intro">${escapeAttribute(raceIntro)}</p>` : ''}<h3>Race traits and statistics</h3><div class="race-trait-list">${backgroundCards([...ordered, ...sharedTables]) || '<p>No shared race traits are listed.</p>'}</div></section>`);
        const subraceSelect = $('#race-subcategory-select');
        const subraceDetails = $('#race-subcategory-details');
        if (subraceSelect && subraceDetails) subraceSelect.addEventListener('change', () => {
          const heading = subraceHeadings.find((candidate) => clean(candidate.textContent) === subraceSelect.value);
          state.raceOption = heading ? clean(heading.textContent) : '';
          const optionNodes = [];
          for (let node = heading?.nextElementSibling; node && node.tagName !== 'H2'; node = node.nextElementSibling) optionNodes.push(node);
          const intro = optionNodes.filter((node) => node.tagName === 'P').map((node) => clean(node.textContent)).filter(Boolean).join(' ');
          const subtraits = optionNodes.filter((node) => node.tagName === 'UL').flatMap(backgroundTraits);
          const tableCards = sourceTableCards(optionNodes.flatMap((node) => node.matches('table') ? [node] : [...node.querySelectorAll('table')]));
          subraceDetails.hidden = !heading;
          subraceDetails.innerHTML = heading ? `<h3>${escapeAttribute(clean(heading.textContent))}</h3>${intro ? `<p>${escapeAttribute(intro)}</p>` : ''}${subtraits.length ? `<h3>Traits and statistics</h3><div class="race-trait-list">${backgroundCards(subtraits)}</div>` : ''}${tableCards.length ? `<h3>Tables and options</h3><div class="race-trait-list">${backgroundCards(tableCards)}</div>` : ''}${!intro && !subtraits.length && !tableCards.length ? '<p>See the selected race page for this option.</p>' : ''}` : '';
          setLanguageDefinition('race', [...traits, ...subtraits]);
          setToolDefinition('race', [...traits, ...subtraits].filter((trait) => /^Tool Proficienc|^Tinker$/i.test(trait.label)).map((trait) => trait.text).join(' '));
          renderLanguageChoices('background');
          updateOriginChoiceSection();
          refreshDetailScrollbar(details);
        });
        if (subraceSelect && state.raceOption) { subraceSelect.value = state.raceOption; subraceSelect.dispatchEvent(new Event('change')); }
      } else renderBackgroundDetails(doc, details, select.value);
    } catch (error) { console.error(`Unable to load ${kind} details`, error); }
    refreshDetailScrollbar(details);
    if (kind === 'race') renderRacialIncreases();
  };

  const selectedLabel = (selector) => clean($(selector)?.selectedOptions?.[0]?.textContent);
  const modifier = (value) => Math.floor((Number(value) - 10) / 2);
  const signed = (value) => `${value >= 0 ? '+' : ''}${value}`;
  const characterLevel = () => Math.max(1, Math.floor(Number(state.level) || 0), Math.floor(Object.values(state.classLevels || {}).reduce((total, value) => total + (Number(value) || 0), 0)));
  const proficiencyBonus = () => Math.ceil(characterLevel() / 4) + 1;
  const renderExperience = () => {
    state.xp = Math.max(0, Math.min(XP_TO_LEVEL, Math.floor(Number(state.xp) || 0)));
    if ($('#xp-input')) $('#xp-input').value = String(state.xp);
    if ($('#xp-text')) $('#xp-text').textContent = `${state.xp.toLocaleString()} / ${XP_TO_LEVEL.toLocaleString()} XP`;
    if ($('#xp-meter-fill')) $('#xp-meter-fill').style.width = `${state.xp / XP_TO_LEVEL * 100}%`;
    const meter = $('.xp-meter');
    if (meter) meter.setAttribute('aria-valuenow', String(state.xp));
    if ($('#open-level-up')) $('#open-level-up').disabled = state.xp < XP_TO_LEVEL;
  };
  const effectiveSpellcasterLevel = (classLevels = state.classLevels) => {
    const levelOf = (name) => Math.max(0, Math.floor(Number(classLevels?.[`${name}.html`]) || 0));
    const full = ['bard', 'cleric', 'druid', 'sorcerer', 'wizard'].reduce((total, name) => total + levelOf(name), 0);
    const half = Math.ceil(levelOf('artificer') / 2) + Math.floor(levelOf('paladin') / 2) + Math.floor(levelOf('ranger') / 2);
    const profaneSoul = /blood-hunter-profane-soul\.html$/i.test(state.subclass || '') ? Math.ceil(levelOf('blood-hunter') / 3) : 0;
    return full + half + profaneSoul;
  };
  const spellPointsByLevel = [0, 4, 6, 14, 17, 27, 32, 38, 44, 57, 64, 73, 73, 83, 83, 94, 94, 107, 114, 123, 133];
  const ordinal = (value) => `${value}${value % 100 >= 11 && value % 100 <= 13 ? 'th' : value % 10 === 1 ? 'st' : value % 10 === 2 ? 'nd' : value % 10 === 3 ? 'rd' : 'th'}`;
  const spellcastingSummary = (classLevels = state.classLevels) => {
    const casterLevel = effectiveSpellcasterLevel(classLevels);
    const warlockLevel = Math.max(0, Math.floor(Number(classLevels?.['warlock.html']) || 0));
    const parts = [];
    if (casterLevel) parts.push(`Level ${casterLevel} · ${spellPointsByLevel[Math.min(20, casterLevel)]} points · max ${ordinal(Math.min(9, Math.ceil(casterLevel / 2)))}`);
    if (warlockLevel) parts.push(`Pact Magic ${warlockLevel}`);
    return parts.join(' / ') || '—';
  };
  const chosenValues = (source) => Object.values(source || {}).flat().map(clean).filter(Boolean);
  const unique = (values) => [...new Set(values.map(clean).filter(Boolean))];
  const sheetSkillAbilities = {
    Acrobatics: 'Dexterity', 'Animal Handling': 'Wisdom', Arcana: 'Intelligence', Athletics: 'Strength', Deception: 'Charisma', History: 'Intelligence', Insight: 'Wisdom', Intimidation: 'Charisma', Investigation: 'Intelligence', Medicine: 'Wisdom', Nature: 'Intelligence', Perception: 'Wisdom', Performance: 'Charisma', Persuasion: 'Charisma', Religion: 'Intelligence', 'Sleight of Hand': 'Dexterity', Stealth: 'Dexterity', Survival: 'Wisdom'
  };
  let activeSheetTab = 'skills';

  const validateSheetIdentity = (reveal = true) => {
    document.querySelectorAll('.builder-missing').forEach((node) => node.classList.remove('builder-missing'));
    const missingByGroup = new Map();
    const addMissing = (key, label, input, host) => {
      if (!input || clean(input.value) || missingByGroup.has(key)) return;
      missingByGroup.set(key, { label, input, host: host || input.closest('section, label') });
    };
    const isActiveSelect = (select) => {
      if (!select || select.disabled) return false;
      for (let node = select; node && node !== document.body; node = node.parentElement) {
        if (node.hidden || node.getAttribute('aria-hidden') === 'true') return false;
      }
      return true;
    };

    addMissing('name', 'name', $('#character-name'), $('.character-summary'));
    addMissing('class', 'class', $('#class-select'), $('#class-select')?.closest('.builder-card'));
    addMissing('race', 'race', $('#race-select'), $('#race-select')?.closest('.builder-card'));
    addMissing('background', 'background', $('#background-select'), $('#background-select')?.closest('.builder-card'));

    [...document.querySelectorAll('#ability-scores select[data-ability]')]
      .filter(isActiveSelect)
      .forEach((select) => addMissing('abilities', 'all ability scores', select, select.closest('.ability-card')));

    document.querySelectorAll('#race-ability-increase-choice select, #ability-score-exchange-choice select, #origin-choice-controls select').forEach((select) => {
      if (!isActiveSelect(select) || clean(select.value)) return;
      const inBackground = Boolean(select.closest('#background-choice-controls'));
      let key = 'required-selections';
      let label = 'required selections';
      let host = select.closest('section, label');

      if (select.matches('[data-racial]')) {
        key = 'racial-increases'; label = 'racial ability increases'; host = $('#race-ability-increase-choice');
      } else if (select.matches('[data-exchange-decrease], [data-exchange-increase]')) {
        key = 'ability-score-exchanges'; label = 'ability score exchanges'; host = $('#ability-score-exchange-choice');
      } else if (select.closest('.starting-equipment')) {
        key = 'starting-equipment'; label = 'starting equipment'; host = select.closest('.starting-equipment');
      } else if (select.matches('[data-language-source="race"]')) {
        key = 'race-languages'; label = 'racial languages'; host = $('#race-choice-controls');
      } else if (select.matches('[data-language-source="background"]')) {
        key = 'background-languages'; label = 'background languages'; host = $('#background-choice-controls');
      } else if (select.matches('[data-tool-source]')) {
        const source = select.dataset.toolSource;
        key = `${source}-tools`; label = `${source} tool proficiencies`; host = $(`#${source}-choice-controls`);
      } else if (select.matches('[data-intelligence-proficiency]')) {
        key = 'intelligence-proficiencies'; label = 'Intelligence proficiencies'; host = $('#intelligence-proficiency-choices');
      } else if (inBackground && select.closest('.class-skill-proficiencies')) {
        key = 'background-proficiencies'; label = 'background proficiencies'; host = $('#background-choice-controls');
      } else if (select.closest('.class-skill-proficiencies')) {
        const expertise = Boolean(select.closest('#class-expertise-choices'));
        key = expertise ? 'expertise' : 'class-proficiencies';
        label = expertise ? 'expertise choices' : 'class proficiencies';
        host = select.closest('.class-skill-proficiencies');
      } else if (select.matches('[data-class-spell]')) {
        key = 'spells'; label = 'level 1 spells'; host = select.closest('.level-one-feature-choices');
      } else if (select.matches('[data-class-feature], [data-subclass-feature]')) {
        key = 'features'; label = 'level 1 feature choices'; host = select.closest('.level-one-feature-choices, .class-subclass-details');
      } else if (select.id === 'class-subclass-select') {
        key = 'subclass'; label = 'level 1 subclass'; host = select.closest('.class-subclass-choice');
      } else if (['level-one-perk', 'perk-skill', 'human-perk', 'human-skill'].includes(select.id)) {
        key = 'perks'; label = 'perk choices'; host = select.closest('.human-perk-choice') || $('#origin-choice-section');
      } else if (inBackground) {
        key = 'background-choices'; label = 'background choices'; host = $('#background-choice-controls');
      } else if (select.closest('#race-choice-controls')) {
        key = 'race-choices'; label = 'race or subrace choices'; host = $('#race-choice-controls');
      }
      addMissing(key, label, select, host);
    });
    if (activeIntelligenceProficiencies().filter(Boolean).length < intelligenceProficiencyCount()) {
      const host = $('#intelligence-proficiency-choices');
      missingByGroup.set('intelligence-proficiencies', { label: 'Intelligence proficiencies', input: host?.querySelector('select'), host });
    }

    const missing = [...missingByGroup.values()];
    const notice = $('#builder-validation-notice');
    if (!missing.length) {
      notice.hidden = true;
      notice.replaceChildren();
      return true;
    }
    missing.forEach((field) => field.host?.classList.add('builder-missing'));
    notice.innerHTML = `<h2>Character sheet incomplete</h2><p>Finish ${missing.length === 1 ? 'this required selection' : 'these required selections'} before building the sheet:</p><div class="builder-validation-notice__links">${missing.map((field, index) => `<button type="button" data-missing-field="${index}">${field.label}</button>`).join('')}</div>`;
    notice.hidden = false;
    notice.querySelectorAll('[data-missing-field]').forEach((button) => button.addEventListener('click', () => {
      const field = missing[Number(button.dataset.missingField)];
      field?.host?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(() => {
        const focusTarget = field?.input?.closest('[data-select-menu]')?.querySelector('.select-menu__trigger') || field?.input;
        focusTarget?.focus();
      }, 350);
    }));
    if (reveal) notice.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return false;
  };

  const sheetSelections = () => unique([
    ...chosenValues(state.classFeatureChoices),
    ...chosenValues(state.subclassFeatureChoices),
    ...chosenValues(state.classSpells)
  ]);

  const pencilIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4M4 16l4 4"/></svg>';
  const editButton = (mode, label, effectType = '', featureId = '', entryKey = '') => `<button class="sheet-edit-button" type="button" data-sheet-edit="${mode}"${effectType ? ` data-effect-type="${effectType}"` : ''}${featureId ? ` data-feature-id="${escapeAttribute(featureId)}"` : ''}${entryKey ? ` data-entry-key="${escapeAttribute(entryKey)}"` : ''} aria-label="${escapeAttribute(label)}" title="${escapeAttribute(label)}">${pencilIcon}</button>`;
  const featureEffects = () => [
    ...(state.customFeatures || []).flatMap((feature) => (feature.effects || []).map((effect) => ({ ...effect, feature: feature.name }))),
    ...(state.customPerks || []).filter((perk) => (state.addedPerks || []).includes(perk.value)).flatMap((perk) => (perk.effects || []).map((effect) => ({ ...effect, feature: perk.label })))
  ];
  const effectTotal = (type, target = '') => featureEffects().filter((effect) => effect.type === type && (!target || clean(effect.target).toLowerCase() === clean(target).toLowerCase())).reduce((total, effect) => total + (Number(effect.value) || 0), 0);
  const movementEffectTotal = (speedType) => featureEffects().filter((effect) => effect.type === 'movement' && (clean(effect.target).toLowerCase() === clean(speedType).toLowerCase() || (!clean(effect.target) && clean(speedType).toLowerCase() === 'walk'))).reduce((total, effect) => total + (Number(effect.value) || 0), 0);
  const hasEffect = (type, target) => featureEffects().some((effect) => effect.type === type && clean(effect.target).toLowerCase() === clean(target).toLowerCase());
  const temporaryAbilityEffectTotal = (ability) => (state.customFeatures || []).flatMap((feature) => feature.effects || []).filter((effect) => effect.type === 'ability' && clean(effect.target).toLowerCase() === ability.toLowerCase()).reduce((total, effect) => total + (Number(effect.value) || 0), 0);
  const calculatedScores = () => Object.fromEntries(abilities.map((ability) => [ability, Math.max(1, permanentScore(ability) + temporaryAbilityEffectTotal(ability))]));
  const classSaveProficiencies = () => {
    const row = [...document.querySelectorAll('#class-details .proficiency-row')].find((node) => /^Saving Throws$/i.test(clean(node.querySelector('strong')?.textContent)));
    const value = clean(row?.querySelector('span')?.textContent);
    return abilities.filter((ability) => new RegExp(`\\b${ability}\\b`, 'i').test(value));
  };
  const activeIntelligenceProficiencies = () => (state.intelligenceProficiencies || []).slice(0, intelligenceProficiencyCount());
  const intelligenceProficienciesOfType = (type) => activeIntelligenceProficiencies().filter((entry) => entry.startsWith(`${type}: `)).map((entry) => entry.slice(type.length + 2));
  const sheetProficiencySkills = () => unique([...state.skills, ...state.backgroundSkills, state.perkSkill, state.humanSkill, ...intelligenceProficienciesOfType('Skill'), ...featureEffects().filter((effect) => effect.type === 'skillProficiency').map((effect) => effect.target)]);
  const sheetExpertiseSkills = () => unique([...state.expertise, ...featureEffects().filter((effect) => effect.type === 'skillExpertise').map((effect) => effect.target)]);
  const includesName = (values, target) => values.some((value) => clean(value).toLowerCase() === clean(target).toLowerCase());
  const manualExhaustionLevel = () => Math.max(0, Math.min(10, Math.floor(Number(state.exhaustionLevel) || 0)));
  const calculatedSkillBonus = (skill, scores = calculatedScores()) => {
    const ability = sheetSkillAbilities[skill];
    const proficient = includesName(sheetProficiencySkills(), skill);
    const expert = includesName(sheetExpertiseSkills(), skill);
    const proficiency = proficiencyBonus();
    return modifier(scores[ability]) + (expert ? proficiency * 2 : proficient ? proficiency : 0) + effectTotal('skillBonus', skill) - manualExhaustionLevel();
  };
  const allSheetConditions = () => unique([...(state.conditions || []).filter((condition) => clean(condition).toLowerCase() !== 'exhaustion'), ...featureEffects().filter((effect) => effect.type === 'condition' && clean(effect.target).toLowerCase() !== 'exhaustion').map((effect) => effect.target), manualExhaustionLevel() ? 'Exhaustion' : '', state.encumbrance === 'heavy' ? 'Heavily Encumbered' : state.encumbrance === 'encumbered' ? 'Encumbered' : '']);
  const conditionRules = {
    Blinded: 'Cannot see; attacks are affected by unseen-attacker rules.', Charmed: 'Cannot attack the charmer; the charmer has advantage on social checks.', Deafened: 'Cannot hear and automatically fails checks that require hearing.', Frightened: 'Disadvantage on checks and attacks while the source is visible; cannot willingly approach it.', Grappled: 'Speed becomes 0.', Incapacitated: 'Cannot take actions or reactions.', Invisible: 'Cannot be seen without special senses; attacks are affected by unseen-attacker rules.', Paralyzed: 'Incapacitated; cannot move or speak; Strength and Dexterity saves fail automatically.', Petrified: 'Transformed and incapacitated; cannot move or speak.', Poisoned: 'Disadvantage on attack rolls and ability checks.', Prone: 'Movement requires crawling; attack rolls are affected by distance.', Restrained: 'Speed becomes 0; Dexterity saves and attacks have disadvantage.', Stunned: 'Incapacitated; cannot move; Strength and Dexterity saves fail automatically.', Unconscious: 'Incapacitated, prone, and unaware; cannot move or speak.', Encumbered: 'Speed -10 ft.', 'Heavily Encumbered': 'Speed -20 ft.; disadvantage on Strength, Dexterity, and Constitution checks, attacks, and saves.'
  };
  const featureEffectLabels = {
    ability: 'Ability score', skillBonus: 'Skill bonus', skillProficiency: 'Skill proficiency', skillExpertise: 'Skill expertise', saveProficiency: 'Saving throw proficiency', proficiency: 'Proficiency', hp: 'Maximum HP', movement: 'Movement speed', initiative: 'Initiative', ac: 'Armor Class', spellAttack: 'Spell attack bonus', spellDc: 'Spell save DC', condition: 'Condition', creatureType: 'Creature type'
  };
  const effectSummary = (effect) => {
    const label = featureEffectLabels[effect.type] || 'Effect';
    if (['condition', 'creatureType', 'skillProficiency', 'skillExpertise', 'saveProficiency', 'proficiency'].includes(effect.type)) return `${label}: ${effect.target}`;
    return `${label}${effect.target ? ` (${effect.target})` : ''}: ${signed(Number(effect.value) || 0)}`;
  };

  const formatCash = (amount) => `$${Number(amount || 0).toLocaleString()}`;

  const wizardSpellCopyingTerms = (spell) => {
    const spellLevel = Math.max(1, Math.floor(Number(spell.level) || 1));
    const wizardLevel = Math.max(0, Math.floor(Number(state.classLevels?.['wizard.html']) || 0));
    const subclass = clean(state.subclass).toLowerCase();
    const school = clean(spell.school).toLowerCase();
    const schoolTradition = subclass.match(/wizard-(abjuration|conjuration|divination|enchantment|evocation|illusion|necromancy|transmutation)\.html$/)?.[1];
    const hasSchoolDiscount = wizardLevel >= 2 && schoolTradition === school;
    const hasWizardlyQuill = wizardLevel >= 2 && /wizard-order-of-scribes\.html$/.test(subclass);

    const cost = spellLevel * (hasSchoolDiscount ? 250 : 500);
    const minutes = spellLevel * (hasWizardlyQuill ? 2 : hasSchoolDiscount ? 60 : 120);
    let discount = '';

    if (hasSchoolDiscount) {
      discount = `${title(schoolTradition)} Savant halves the copying cost and time.`;
    } else if (hasWizardlyQuill) {
      discount = 'Wizardly Quill reduces the copying time to 2 minutes per spell level.';
    }

    return { cost, minutes, discount };
  };

  const formatCopyingTime = (minutes) => {
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'}`;
    const hours = minutes / 60;
    return `${hours} hour${hours === 1 ? '' : 's'}`;
  };

  const refreshSheet = () => {
    if (!$('.character-builder')?.classList.contains('sheet-ready')) return;
    populateCharacterSheet();
  };

  const openSheetEditor = (mode, preset = {}) => {
    const dialog = $('#sheet-editor-dialog');
    const form = $('#sheet-editor-form');
    const body = $('#sheet-editor-body');
    const heading = $('#sheet-editor-title');
    const context = $('#sheet-editor-context');
    const submitButton = form?.querySelector('button[type="submit"]');
    if (!dialog || !form || !body) return;
    form.onsubmit = null;
    form.noValidate = true;
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Apply';
    }
    if (!form.dataset.inlineValidation) {
      form.dataset.inlineValidation = 'true';
      form.addEventListener('submit', (event) => {
        form.querySelectorAll('.sheet-editor-field--invalid').forEach((label) => label.classList.remove('sheet-editor-field--invalid'));
        form.querySelectorAll('.sheet-field-error').forEach((error) => error.remove());
        const invalid = [...form.elements].find((control) => control.willValidate && !control.validity.valid);
        if (!invalid) return;
        event.preventDefault(); event.stopImmediatePropagation();
        const label = invalid.closest('label'), fieldName = clean(label?.childNodes[0]?.textContent) || 'Required field';
        const message = invalid.validity.valueMissing ? `${fieldName} is required.` : invalid.validity.rangeUnderflow || invalid.validity.rangeOverflow ? `${fieldName} must be between ${invalid.min} and ${invalid.max}.` : `Check the value entered for ${fieldName}.`;
        const error = document.createElement('span');
        error.className = 'sheet-field-error'; error.setAttribute('role', 'alert');
        error.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 21 19H3L12 3Z"/><path d="M12 8v5M12 16v1"/></svg><span>${escapeAttribute(message)}</span>`;
        label?.classList.add('sheet-editor-field--invalid'); label?.append(error);
        const clearError = () => { label?.classList.remove('sheet-editor-field--invalid'); error.remove(); };
        invalid.addEventListener('input', clearError, { once: true }); invalid.addEventListener('change', clearError, { once: true });
        window.setTimeout(() => (invalid.closest('[data-select-menu]')?.querySelector('.select-menu__trigger') || invalid).focus(), 0);
      }, true);
    }
    dialog.classList.toggle('sheet-editor--feature', mode === 'feature' || mode === 'sheet-entry');
    dialog.classList.toggle('sheet-editor--listed-perk', mode === 'listed-perk');
    if (context) {
      context.hidden = mode === 'feature' || mode === 'listed-perk' || mode === 'sheet-entry';
      context.textContent = mode === 'identity' ? 'Identity Record' : mode === 'cash' ? 'Funds Record' : mode === 'hp' || mode === 'combat' ? 'Combat Record' : mode === 'conditions' ? 'Condition Record' : mode === 'spellbook-purchase' ? 'Wizard Spellbook' : '';
    }
    if (mode === 'sheet-entry') {
      const source = sheetEntryEditorPresets.get(preset.entryKey);
      if (!source) return;
      const edited = state.entryEdits?.[preset.entryKey] || {};
      heading.textContent = source.kind === 'perk' ? 'Edit Perk' : 'Edit Class Feature';
      body.innerHTML = `<label>Name<input name="entryName" value="${escapeAttribute(edited.name || source.name)}" required></label><label>Description<textarea name="entryDescription" required>${escapeAttribute(edited.description ?? source.description)}</textarea></label>${state.entryEdits?.[preset.entryKey] ? '<button class="sheet-editor-delete" type="button" data-reset-entry>Reset changes</button>' : ''}`;
      body.querySelector('[data-reset-entry]')?.addEventListener('click', () => { delete state.entryEdits[preset.entryKey]; dialog.close(); refreshSheet(); });
      form.onsubmit = (event) => { event.preventDefault(); const data = new FormData(form); state.entryEdits ||= {}; state.entryEdits[preset.entryKey] = { name: clean(data.get('entryName')), description: clean(data.get('entryDescription')) }; dialog.close(); refreshSheet(); };
    } else if (mode === 'identity') {
      heading.textContent = 'Edit Identity';
      body.innerHTML = `<label>Character name<input name="characterName" value="${escapeAttribute($('#character-name')?.value || '')}" required></label>`;
      form.onsubmit = (event) => { event.preventDefault(); $('#character-name').value = clean(new FormData(form).get('characterName')); dialog.close(); refreshSheet(); };
    } else if (mode === 'cash') {
      heading.textContent = 'Edit Cash';
      body.innerHTML = `<label>Cash<input name="cash" type="number" min="0" step="1" value="${Number(state.cash || 0)}" required></label>`;
      form.onsubmit = (event) => { event.preventDefault(); state.cash = Math.max(0, Number(new FormData(form).get('cash')) || 0); dialog.close(); renderSheetPanel('inventory'); };
    } else if (mode === 'hp' || mode === 'combat') {
      heading.textContent = 'Track Combat';
      const pools = normalizeHitDicePools();
      const hitDiceRows = hitDiceSizes.map((sides) => `<div class="combat-hit-die-row"><strong>d${sides}</strong><label>Remaining<input name="hitDiceRemaining${sides}" type="number" min="0" max="99" step="1" value="${pools[`d${sides}`].remaining}"></label><label>Maximum<input name="hitDiceMaximum${sides}" type="number" min="0" max="99" step="1" value="${pools[`d${sides}`].maximum}"></label></div>`).join('');
      body.innerHTML = `<div class="sheet-editor-grid combat-hp-fields"><label>Current HP<input name="currentHp" type="number" min="0" step="1" value="${Number(state.currentHp || 0)}" required></label><label>Temporary HP<input name="temporaryHp" type="number" min="0" step="1" value="${Number(state.temporaryHp || 0)}" required></label></div><fieldset class="combat-hit-dice"><legend>Hit Dice by class die</legend>${hitDiceRows}</fieldset>`;
      form.onsubmit = (event) => { event.preventDefault(); const data = new FormData(form); state.currentHp = Math.max(0, Number(data.get('currentHp')) || 0); state.temporaryHp = Math.max(0, Number(data.get('temporaryHp')) || 0); hitDiceSizes.forEach((sides) => { const maximum = Math.max(0, Math.floor(Number(data.get(`hitDiceMaximum${sides}`)) || 0)); const remaining = Math.max(0, Math.min(maximum, Math.floor(Number(data.get(`hitDiceRemaining${sides}`)) || 0))); state.hitDicePools[`d${sides}`] = { maximum, remaining }; }); dialog.close(); refreshSheet(); };
    } else if (mode === 'conditions') {
      const conditions = ['Blinded', 'Charmed', 'Deafened', 'Frightened', 'Grappled', 'Incapacitated', 'Invisible', 'Paralyzed', 'Petrified', 'Poisoned', 'Prone', 'Restrained', 'Stunned', 'Unconscious'];
      heading.textContent = 'Apply Conditions';
      const savedConditions = (state.conditions || []).filter((condition) => clean(condition).toLowerCase() !== 'exhaustion');
      const savedExhaustion = manualExhaustionLevel() || ((state.conditions || []).some((condition) => clean(condition).toLowerCase() === 'exhaustion') ? 1 : 0);
      body.innerHTML = `<fieldset class="condition-picker"><legend>Active conditions</legend>${conditions.map((condition) => `<label><input type="checkbox" name="condition" value="${condition}"${savedConditions.includes(condition) ? ' checked' : ''}><span>${condition}</span></label>`).join('')}</fieldset><label class="exhaustion-level-control">Exhaustion level (0–10)<input name="exhaustionLevel" type="number" min="0" max="10" step="1" value="${savedExhaustion}"></label><label>Other condition<input name="customCondition" value="${escapeAttribute(savedConditions.filter((condition) => !conditions.includes(condition)).join(', '))}" placeholder="Comma-separated"></label>`;
      form.onsubmit = (event) => { event.preventDefault(); const data = new FormData(form); state.exhaustionLevel = Math.max(0, Math.min(10, Math.floor(Number(data.get('exhaustionLevel')) || 0))); state.conditions = unique([...data.getAll('condition'), ...clean(data.get('customCondition')).split(',').map(clean)]).filter((condition) => condition.toLowerCase() !== 'exhaustion'); dialog.close(); refreshSheet(); };
    } else if (mode === 'spellbook-purchase') {
      const spell = preset.spell;
      const terms = wizardSpellCopyingTerms(spell);
      const availableCash = Math.max(0, Number(state.cash) || 0);
      const canAfford = availableCash >= terms.cost;

      heading.textContent = `Copy ${spell.name}`;
      body.innerHTML = `
        <section class="spellbook-purchase">
          <p>Copy this ${ordinal(spell.level)}-level ${escapeAttribute(spell.school)} spell into your spellbook?</p>
          <dl>
            <div><dt>Copying cost</dt><dd>${formatCash(terms.cost)}</dd></div>
            <div><dt>Copying time</dt><dd>${formatCopyingTime(terms.minutes)}</dd></div>
            <div><dt>Available cash</dt><dd>${formatCash(availableCash)}</dd></div>
          </dl>
          ${terms.discount ? `<p class="spellbook-purchase__discount">${escapeAttribute(terms.discount)}</p>` : ''}
          ${canAfford ? '' : `<p class="spellbook-purchase__warning" role="alert">You need ${formatCash(terms.cost - availableCash)} more to copy this spell.</p>`}
        </section>
      `;

      if (submitButton) {
        submitButton.disabled = !canAfford;
        submitButton.textContent = `Spend ${formatCash(terms.cost)} and Add`;
      }

      form.onsubmit = (event) => {
        event.preventDefault();
        if (!canAfford) return;

        state.cash = availableCash - terms.cost;
        preset.onPurchase?.();
        dialog.close();
      };
    } else if (mode === 'listed-perk') {
      heading.textContent = 'Add Listed Perk';
      let perkMode = 'listed';
      let draftPerkName = '', draftPerkDescription = '';
      let draftPerkEffects = [{ type: 'skillBonus', target: '', value: 1 }];
      const conditionTargets = ['Blinded', 'Charmed', 'Deafened', 'Frightened', 'Grappled', 'Incapacitated', 'Invisible', 'Paralyzed', 'Petrified', 'Poisoned', 'Prone', 'Restrained', 'Stunned', 'Unconscious'];
      const creatureTypeTargets = ['Aberration', 'Beast', 'Celestial', 'Construct', 'Dragon', 'Elemental', 'Fey', 'Fiend', 'Giant', 'Humanoid', 'Monstrosity', 'Ooze', 'Plant', 'Undead'];
      const perkTargetsForEffect = (type) => ({ ability: abilities, skillBonus: skills, skillProficiency: skills, skillExpertise: skills, saveProficiency: abilities, movement: ['Walk', 'Burrow', 'Climb', 'Fly', 'Swim'], condition: conditionTargets, creatureType: creatureTypeTargets }[type] || null);
      const perkTargetPrompts = { ability: 'Choose an ability', skillBonus: 'Choose a skill', skillProficiency: 'Choose a skill', skillExpertise: 'Choose a skill', saveProficiency: 'Choose an ability', proficiency: 'Armor, weapon, tool, or language', movement: 'Choose a speed type', condition: 'Choose a condition', creatureType: 'Choose a creature type' };
      const perkTargetControl = (effect) => {
        const options = perkTargetsForEffect(effect.type), current = clean(effect.target || ''), prompt = perkTargetPrompts[effect.type] || 'Target';
        if (!options) return `<input data-effect-target value="${escapeAttribute(current)}" placeholder="${escapeAttribute(prompt)}">`;
        const choices = unique([...options, ...(current && !options.includes(current) ? [current] : [])]);
        return `<select data-effect-target><option value="">${escapeAttribute(prompt)}</option>${choices.map((choice) => `<option value="${escapeAttribute(choice)}"${choice === current ? ' selected' : ''}>${escapeAttribute(choice)}</option>`).join('')}</select>`;
      };
      const readPerkEffectRows = () => [...(body.querySelectorAll('[data-perk-effect-rows] .feature-effect-row') || [])].map((row) => ({ type: row.querySelector('[data-effect-kind]').value, target: clean(row.querySelector('[data-effect-target]').value), value: Number(row.querySelector('[data-effect-value]').value) || 0 }));
      const renderPerkEffectRows = () => {
        const rows = body.querySelector('[data-perk-effect-rows]');
        if (!rows) return;
        rows.innerHTML = draftPerkEffects.map((effect, index) => `<div class="feature-effect-row"><label>Effect<select data-effect-kind>${Object.entries(featureEffectLabels).map(([value, label]) => `<option value="${value}"${effect.type === value ? ' selected' : ''}>${label}</option>`).join('')}</select></label><label data-effect-target-wrap>${effect.type === 'movement' ? 'Speed type' : 'Target'}${perkTargetControl(effect)}</label><label data-effect-value-wrap>Modifier<input data-effect-value type="number" step="1" value="${Number(effect.value) || 0}"></label><button class="sheet-effect-remove" type="button" data-remove-perk-effect="${index}" aria-label="Remove effect" title="Remove effect"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/></svg></button></div>`).join('');
        rows.querySelectorAll('.feature-effect-row').forEach((row, index) => {
          const type = row.querySelector('[data-effect-kind]').value;
          row.querySelector('[data-effect-target-wrap]').hidden = !['ability', 'skillBonus', 'skillProficiency', 'skillExpertise', 'saveProficiency', 'proficiency', 'movement', 'condition', 'creatureType'].includes(type);
          row.querySelector('[data-effect-value-wrap]').hidden = ['skillProficiency', 'skillExpertise', 'saveProficiency', 'proficiency', 'condition', 'creatureType'].includes(type);
          row.querySelector('[data-effect-kind]').onchange = () => { draftPerkEffects = readPerkEffectRows(); draftPerkEffects[index].target = ''; renderPerkEffectRows(); };
        });
        rows.querySelectorAll('[data-remove-perk-effect]').forEach((button) => { button.onclick = () => { draftPerkEffects = readPerkEffectRows().filter((effect, index) => index !== Number(button.dataset.removePerkEffect)); renderPerkEffectRows(); }; });
      };
      const renderPerkFields = () => {
        const fields = body.querySelector('[data-perk-fields]');
        heading.textContent = perkMode === 'custom' ? 'Add Custom Perk' : 'Add Listed Perk';
        fields.innerHTML = perkMode === 'custom'
          ? `<section class="custom-perk-fields"><label>Perk name<input name="customPerkName" value="${escapeAttribute(draftPerkName)}" required></label><label>Description<textarea name="customPerkDescription" required>${escapeAttribute(draftPerkDescription)}</textarea></label></section><fieldset class="feature-effect-editor perk-effect-editor"><legend>Mechanical changes</legend><div data-perk-effect-rows></div><button class="sheet-add-effect" type="button" data-add-perk-effect><span aria-hidden="true">+</span>Add mechanical effect</button></fieldset>`
          : `<section class="listed-perk-field"><label>Choose a perk<select name="perk" required><option value="">Choose a listed perk</option>${perks.map((perk) => `<option value="${escapeAttribute(perk.value)}" data-preview="${escapeAttribute(previewSnippet(perk.description))}">${escapeAttribute(perk.label)} — ${escapeAttribute(perk.typeLabel)}</option>`).join('')}</select></label></section>`;
        if (perkMode === 'custom') { renderPerkEffectRows(); fields.querySelector('[data-add-perk-effect]').onclick = () => { draftPerkEffects = readPerkEffectRows(); draftPerkEffects.push({ type: 'skillBonus', target: '', value: 1 }); renderPerkEffectRows(); }; }
        else {
          const perkSelect = fields.querySelector('[name="perk"]');
          const abilityWrapper = document.createElement('label');
          abilityWrapper.hidden = true;
          abilityWrapper.innerHTML = 'Ability score increase<select name="perkAbility"><option value="">Choose an ability</option></select>';
          fields.querySelector('.listed-perk-field').append(abilityWrapper);
          const abilitySelect = abilityWrapper.querySelector('select');
          const syncAbilityChoice = () => { const options = perkIncreaseOptions(perkSelect.value); abilityWrapper.hidden = options.length < 2; abilitySelect.required = options.length > 1; abilitySelect.innerHTML = `<option value="">Choose an ability</option>${options.map((ability) => `<option value="${ability}"${permanentScore(ability) >= 20 ? ' disabled' : ''}>${ability}</option>`).join('')}`; };
          perkSelect.addEventListener('change', syncAbilityChoice);
          syncAbilityChoice();
        }
      };
      body.innerHTML = `<div class="perk-entry-mode" role="tablist" aria-label="Perk source"><button type="button" role="tab" data-perk-mode="listed" aria-pressed="true"><strong>Listed Perk</strong></button><button type="button" role="tab" data-perk-mode="custom" aria-pressed="false"><strong>Custom Perk</strong></button></div><div class="perk-entry-fields" data-perk-fields></div>`;
      renderPerkFields();
      body.querySelectorAll('[data-perk-mode]').forEach((button) => { button.onclick = () => { if (perkMode === 'custom') { draftPerkEffects = readPerkEffectRows(); draftPerkName = clean(form.elements.customPerkName?.value); draftPerkDescription = clean(form.elements.customPerkDescription?.value); } perkMode = button.dataset.perkMode; body.querySelectorAll('[data-perk-mode]').forEach((choice) => choice.setAttribute('aria-pressed', String(choice === button))); renderPerkFields(); }; });
      form.onsubmit = (event) => { event.preventDefault(); const data = new FormData(form); if (perkMode === 'custom') { const label = clean(data.get('customPerkName')), description = clean(data.get('customPerkDescription')); if (!label || !description) return; const value = `custom-perk-${Date.now()}`; const effects = readPerkEffectRows().filter((effect) => effect.type && (!['ability', 'skillBonus', 'skillProficiency', 'skillExpertise', 'saveProficiency', 'proficiency', 'movement', 'condition', 'creatureType'].includes(effect.type) || effect.target)); state.customPerks.push({ value, label, description, effects }); state.addedPerks.push(value); } else { const value = clean(data.get('perk')), options = perkIncreaseOptions(value), ability = clean(data.get('perkAbility')); if (value && !state.addedPerks.includes(value)) { state.addedPerks.push(value); if (options.length === 1) state.perkAbilityChoices[value] = options[0]; else if (options.includes(ability)) state.perkAbilityChoices[value] = ability; } } dialog.close(); refreshSheet(); };
    } else {
      const existing = (state.customFeatures || []).find((feature) => feature.id === preset.featureId);
      const firstEffect = existing?.effects?.[0] || { type: preset.effectType || 'skillBonus', target: preset.target || '', value: 1 };
      const conditionTargets = ['Blinded', 'Charmed', 'Deafened', 'Frightened', 'Grappled', 'Incapacitated', 'Invisible', 'Paralyzed', 'Petrified', 'Poisoned', 'Prone', 'Restrained', 'Stunned', 'Unconscious'];
      const creatureTypeTargets = ['Aberration', 'Beast', 'Celestial', 'Construct', 'Dragon', 'Elemental', 'Fey', 'Fiend', 'Giant', 'Humanoid', 'Monstrosity', 'Ooze', 'Plant', 'Undead'];
      const movementTargets = ['Walk', 'Burrow', 'Climb', 'Fly', 'Swim'];
      const targetsForEffect = (type) => ({ ability: abilities, skillBonus: skills, skillProficiency: skills, skillExpertise: skills, saveProficiency: abilities, movement: movementTargets, condition: conditionTargets, creatureType: creatureTypeTargets }[type] || null);
      const targetPrompts = { ability: 'Choose an ability', skillBonus: 'Choose a skill', skillProficiency: 'Choose a skill', skillExpertise: 'Choose a skill', saveProficiency: 'Choose an ability', proficiency: 'Armor, weapon, tool, or language', movement: 'Choose a speed type', condition: 'Choose a condition', creatureType: 'Choose a creature type' };
      const targetControl = (effect) => {
        const options = targetsForEffect(effect.type), current = clean(effect.target || ''), prompt = targetPrompts[effect.type] || 'Target';
        if (!options) return `<input data-effect-target value="${escapeAttribute(current)}" placeholder="${escapeAttribute(prompt)}">`;
        const choices = unique([...options, ...(current && !options.includes(current) ? [current] : [])]);
        return `<select data-effect-target><option value="">${escapeAttribute(prompt)}</option>${choices.map((choice) => `<option value="${escapeAttribute(choice)}"${choice === current ? ' selected' : ''}>${escapeAttribute(choice)}</option>`).join('')}</select>`;
      };
      heading.textContent = existing ? 'Edit Feature' : 'Create Feature';
      body.innerHTML = `<label>Feature name<input name="name" value="${escapeAttribute(existing?.name || '')}" required></label><label>Description<textarea name="description">${escapeAttribute(existing?.description || '')}</textarea></label><fieldset class="feature-effect-editor"><legend>Mechanical changes</legend><div id="feature-effect-rows"></div><button class="sheet-add-effect" type="button" data-add-effect><span aria-hidden="true">+</span>Add sheet effect</button></fieldset>${existing ? '<button class="sheet-editor-delete" type="button" data-delete-feature>Delete feature</button>' : ''}`;
      let draftEffects = (existing?.effects?.length ? existing.effects : [firstEffect]).map((effect) => ({ ...effect }));
      const rows = $('#feature-effect-rows');
      const readRows = () => [...rows.querySelectorAll('.feature-effect-row')].map((row) => ({ type: row.querySelector('[data-effect-kind]').value, target: clean(row.querySelector('[data-effect-target]').value), value: Number(row.querySelector('[data-effect-value]').value) || 0 }));
      const syncEffectRow = (row) => {
        const type = row.querySelector('[data-effect-kind]').value;
        row.querySelector('[data-effect-target-wrap]').hidden = !['ability', 'skillBonus', 'skillProficiency', 'skillExpertise', 'saveProficiency', 'proficiency', 'movement', 'condition', 'creatureType'].includes(type);
        row.querySelector('[data-effect-value-wrap]').hidden = ['skillProficiency', 'skillExpertise', 'saveProficiency', 'proficiency', 'condition', 'creatureType'].includes(type);
      };
      const renderEffectRows = () => {
        rows.innerHTML = draftEffects.map((effect, index) => `<div class="feature-effect-row"><label>Effect<select data-effect-kind>${Object.entries(featureEffectLabels).map(([value, label]) => `<option value="${value}"${effect.type === value ? ' selected' : ''}>${label}</option>`).join('')}</select></label><label data-effect-target-wrap>${effect.type === 'movement' ? 'Speed type' : 'Target'}${targetControl(effect)}</label><label data-effect-value-wrap>Modifier<input data-effect-value type="number" step="1" value="${Number(effect.value) || 0}"></label><button class="sheet-effect-remove" type="button" data-remove-effect="${index}" aria-label="Remove effect" title="Remove effect"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/></svg></button></div>`).join('');
        rows.querySelectorAll('.feature-effect-row').forEach((row, index) => { syncEffectRow(row); row.querySelector('[data-effect-kind]').onchange = () => { draftEffects = readRows(); draftEffects[index].target = ''; renderEffectRows(); }; });
        rows.querySelectorAll('[data-remove-effect]').forEach((button) => { button.onclick = () => { draftEffects = readRows().filter((effect, index) => index !== Number(button.dataset.removeEffect)); if (!draftEffects.length) draftEffects.push({ type: 'skillBonus', target: '', value: 1 }); renderEffectRows(); }; });
      };
      renderEffectRows();
      body.querySelector('[data-add-effect]').onclick = () => { draftEffects = readRows(); draftEffects.push({ type: 'skillBonus', target: '', value: 1 }); renderEffectRows(); };
      body.querySelector('[data-delete-feature]')?.addEventListener('click', () => { state.customFeatures = state.customFeatures.filter((feature) => feature.id !== existing.id); dialog.close(); refreshSheet(); });
      form.onsubmit = (event) => {
        event.preventDefault();
        const data = new FormData(form);
        const effects = readRows().filter((effect) => effect.type && (!['ability', 'skillBonus', 'skillProficiency', 'skillExpertise', 'saveProficiency', 'proficiency', 'movement', 'condition', 'creatureType'].includes(effect.type) || effect.target));
        const feature = { id: existing?.id || (crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`), name: clean(data.get('name')), description: clean(data.get('description')), effects };
        if (existing) Object.assign(existing, feature); else state.customFeatures.push(feature);
        dialog.close(); refreshSheet();
      };
    }
    dialog.showModal();
    window.setTimeout(() => body.querySelector('input:not([type="checkbox"]), select, textarea')?.focus(), 0);
  };

  const selectedClassId = () => clean($('#class-select')?.value).replace(/\.html$/i, '').toLowerCase();
  const selectedClassLevel = () => {
    const classValue = clean($('#class-select')?.value);
    return Math.max(1, Math.floor(Number(state.classLevels?.[classValue]) || Number(state.level) || Number($('#sheet-level')?.textContent) || 1));
  };
  const spellProgressionValue = (level, ...labels) => {
    const row = classSpellProgression.find((entry) => entry.level === level);
    if (!row) return 0;
    for (const label of labels) {
      const raw = row.values[label.toLowerCase()];
      if (raw !== undefined && /\d/.test(raw)) return Number.parseInt(raw, 10) || 0;
    }
    return 0;
  };
  const spellProgressionHas = (label) => classSpellProgression.some((entry) => Object.hasOwn(entry.values, label.toLowerCase()));
  const fallbackMaxSpellLevel = (profile, level) => {
    if (level < profile.starts) return 0;
    if (selectedClassId() === 'artificer') return Math.min(5, Math.max(1, Math.ceil(level / 4)));
    if (profile.mode === 'prepared' && profile.preparation === 'half') return Math.min(5, Math.max(1, Math.ceil((level - 1) / 4)));
    return Math.min(9, Math.max(1, Math.ceil(level / 2)));
  };
  const spellcastingRecord = (classId) => {
    state.spellcasting = state.spellcasting && typeof state.spellcasting === 'object' && !Array.isArray(state.spellcasting) ? state.spellcasting : {};
    const record = state.spellcasting[classId] && typeof state.spellcasting[classId] === 'object' ? state.spellcasting[classId] : {};
    ['cantrips', 'known', 'prepared', 'spellbook'].forEach((key) => { record[key] = Array.isArray(record[key]) ? unique(record[key]) : []; });
    if (!record.seeded) {
      record.cantrips = unique([...record.cantrips, ...(state.classSpells.cantrips || [])]);
      record.known = unique([...record.known, ...(state.classSpells['known-spells'] || [])]);
      record.prepared = unique([...record.prepared, ...(state.classSpells['prepared-spells'] || [])]);
      record.spellbook = unique([...record.spellbook, ...(state.classSpells.spellbook || [])]);
      record.seeded = true;
    }
    state.spellcasting[classId] = record;
    return record;
  };
  const spellLevelLabel = (level) => Number(level) === 0 ? 'Cantrip' : `Level ${level}`;
  const renderSpellcastingPanel = (panel) => {
    const classId = selectedClassId();
    const profile = spellcastingProfiles[classId];
    if (!profile) {
      panel.innerHTML = '<section class="spellcasting-empty"><h3>Spellcasting</h3><strong>Not available for this class</strong></section>';
      return;
    }
    if (!Array.isArray(spellCatalog)) {
      panel.innerHTML = '<section class="spellcasting-empty"><h3>Spellcasting</h3><strong>Loading spell catalog</strong></section>';
      loadSpellCatalog().then(() => { if (activeSheetTab === 'spellcasting') renderSheetPanel('spellcasting'); });
      return;
    }
    const level = selectedClassLevel();
    const record = spellcastingRecord(classId);
    const scores = calculatedScores();
    const proficiency = proficiencyBonus();
    const abilityModifier = modifier(scores[profile.ability]);
    const attackBonus = proficiency + abilityModifier + effectTotal('spellAttack');
    const saveDc = 8 + proficiency + abilityModifier + effectTotal('spellDc');
    const combinedCasterLevel = classId === 'warlock' ? 0 : effectiveSpellcasterLevel();
    const maxSpellLevel = combinedCasterLevel ? Math.min(9, Math.ceil(combinedCasterLevel / 2)) : spellProgressionValue(level, 'Max Spell Level') || fallbackMaxSpellLevel(profile, level);
    const spellPoints = combinedCasterLevel ? spellPointsByLevel[Math.min(20, combinedCasterLevel)] : spellProgressionValue(level, 'Spell Points');
    const hasCantrips = spellProgressionHas('Cantrips Known');
    const cantripLimit = hasCantrips ? spellProgressionValue(level, 'Cantrips Known') : 0;
    const knownLimit = spellProgressionValue(level, 'Spells Known') || record.known.length;
    const preparedLimit = Math.max(1, abilityModifier + (profile.preparation === 'half' ? Math.floor(level / 2) : level));
    const classSpells = spellCatalog.filter((spell) => (spell.classes || []).some((name) => clean(name).toLowerCase() === classId));
    const cantrips = hasCantrips ? classSpells.filter((spell) => Number(spell.level) === 0) : [];
    const leveledSpells = classSpells.filter((spell) => Number(spell.level) > 0 && Number(spell.level) <= maxSpellLevel);
    const byId = new Map(spellCatalog.map((spell) => [spell.id, spell]));
    ['cantrips', 'known', 'prepared', 'spellbook'].forEach((key) => { record[key] = record[key].filter((id) => byId.has(id)); });
    record.prepared = record.prepared.filter((id) => profile.mode !== 'spellbook' || record.spellbook.includes(id));
    const selectedSpell = byId.get(record.selectedSpell) || byId.get(record.prepared[0]) || byId.get(record.known[0]) || byId.get(record.spellbook[0]) || cantrips[0] || leveledSpells[0];
    if (selectedSpell) record.selectedSpell = selectedSpell.id;
    const spellRow = (spell, actions = '') => `<article class="spellcasting-spell" data-spell-row data-spell-name="${escapeAttribute(spell.name.toLowerCase())}" data-spell-level="${Number(spell.level)}"><button type="button" class="spellcasting-spell__name${record.selectedSpell === spell.id ? ' is-selected' : ''}" data-view-spell="${escapeAttribute(spell.id)}"><strong>${escapeAttribute(spell.name)}</strong><small>${spellLevelLabel(spell.level)} · ${escapeAttribute(spell.school)}</small></button><div>${actions}</div></article>`;
    const actionButton = (action, spell, active, label, disabled = false) => `<button type="button" data-spell-action="${action}" data-spell-id="${escapeAttribute(spell.id)}" aria-pressed="${active}"${disabled ? ' disabled' : ''}>${label}</button>`;
    const cantripRows = cantrips.map((spell) => spellRow(spell, actionButton('cantrip', spell, record.cantrips.includes(spell.id), record.cantrips.includes(spell.id) ? 'Known' : 'Learn', !record.cantrips.includes(spell.id) && cantripLimit > 0 && record.cantrips.length >= cantripLimit))).join('');
    const cantripMarkup = hasCantrips ? `<section class="spellcasting-cantrips"><header><h3>Cantrips</h3><span>${record.cantrips.length} / ${cantripLimit} known</span></header><div class="spellcasting-list">${cantripRows || '<p class="sheet-empty">No cantrips in the class list.</p>'}</div></section>` : '';
    let ownedTitle = 'Known Spells';
    let catalogTitle = 'Class Spell List';
    let ownedSpells = record.known.map((id) => byId.get(id)).filter(Boolean);
    let catalogRows = leveledSpells.map((spell) => spellRow(spell, actionButton('known', spell, record.known.includes(spell.id), record.known.includes(spell.id) ? 'Known' : 'Learn', !record.known.includes(spell.id) && knownLimit > 0 && record.known.length >= knownLimit))).join('');
    let ownedRows = ownedSpells.map((spell) => spellRow(spell, actionButton('known', spell, true, 'Remove'))).join('');
    let ownedCount = knownLimit ? `${ownedSpells.length} / ${knownLimit}` : String(ownedSpells.length);
    if (profile.mode === 'prepared') {
      ownedTitle = 'Prepared Spells';
      ownedSpells = record.prepared.map((id) => byId.get(id)).filter(Boolean);
      ownedRows = ownedSpells.map((spell) => spellRow(spell, actionButton('prepare', spell, true, 'Unprepare'))).join('');
      catalogRows = leveledSpells.map((spell) => spellRow(spell, actionButton('prepare', spell, record.prepared.includes(spell.id), record.prepared.includes(spell.id) ? 'Prepared' : 'Prepare', !record.prepared.includes(spell.id) && record.prepared.length >= preparedLimit))).join('');
      ownedCount = `${ownedSpells.length} / ${preparedLimit}`;
    }
    if (profile.mode === 'spellbook') {
      ownedTitle = 'Spellbook';
      catalogTitle = 'Find Wizard Spells';
      ownedSpells = record.spellbook.map((id) => byId.get(id)).filter(Boolean);
      ownedRows = ownedSpells.map((spell) => spellRow(spell, `${actionButton('prepare', spell, record.prepared.includes(spell.id), record.prepared.includes(spell.id) ? 'Prepared' : 'Prepare', !record.prepared.includes(spell.id) && record.prepared.length >= preparedLimit)}${actionButton('spellbook', spell, true, 'Remove')}`)).join('');
      catalogRows = leveledSpells.map((spell) => {
        const inSpellbook = record.spellbook.includes(spell.id);
        return spellRow(
          spell,
          actionButton('spellbook', spell, inSpellbook, inSpellbook ? 'In Book' : 'Add', inSpellbook)
        );
      }).join('');
      ownedCount = `${record.prepared.length} / ${preparedLimit} prepared · ${ownedSpells.length} in book`;
    }
    const detail = selectedSpell ? `<aside class="spellcasting-detail"><header><span>${spellLevelLabel(selectedSpell.level)} · ${escapeAttribute(selectedSpell.school)}</span><h3>${escapeAttribute(selectedSpell.name)}</h3></header><dl><div><dt>Casting time</dt><dd>${escapeAttribute(selectedSpell.castingTime)}</dd></div><div><dt>Range</dt><dd>${escapeAttribute(selectedSpell.range)}</dd></div><div><dt>Duration</dt><dd>${escapeAttribute(selectedSpell.duration)}</dd></div><div><dt>Components</dt><dd>${escapeAttribute(selectedSpell.components)}</dd></div></dl>${(selectedSpell.description || []).map((paragraph) => `<p>${escapeAttribute(paragraph)}</p>`).join('')}${(selectedSpell.higherLevel || []).map((paragraph) => `<p><strong>At higher levels.</strong> ${escapeAttribute(paragraph)}</p>`).join('')}</aside>` : '';
    panel.innerHTML = `<section class="spellcasting-sheet">${editButton('feature', 'Add a spellcasting statistic feature', 'spellAttack')}<div class="spellcasting-stats"><article><span>Spellcasting Ability</span><strong>${profile.ability}</strong></article><article><span>Spell Attack Bonus</span><strong>${signed(attackBonus)}</strong></article><article><span>Spell Save DC</span><strong>${saveDc}</strong></article><article><span>${spellPoints ? 'Spell Points' : 'Maximum Spell Level'}</span><strong>${spellPoints || maxSpellLevel || '—'}</strong></article></div>${level < profile.starts ? `<section class="spellcasting-empty"><strong>Spellcasting begins at class level ${profile.starts}</strong></section>` : `${cantripMarkup}<div class="spellcasting-browser"><section class="spellcasting-column"><header><h3>${ownedTitle}</h3><span>${ownedCount}</span></header><div class="spellcasting-list">${ownedRows || '<p class="sheet-empty">None selected.</p>'}</div></section><section class="spellcasting-column spellcasting-catalog"><header><h3>${catalogTitle}</h3><input type="search" data-spell-search aria-label="Search spells" placeholder="Search spells"></header><div class="spellcasting-list">${catalogRows || '<p class="sheet-empty">No spells available at this level.</p>'}</div></section>${detail}</div>`}</section>`;
    const enhanceSpellScrollbars = () => {
      const scrollablePanels = panel.querySelectorAll('.spellcasting-list, .spellcasting-detail');

      scrollablePanels.forEach((element) => {
        element.dataset.crtScrollbarPlain = '';
        window.CRTScrollbar?.enhance(element);
      });
    };

    if (window.CRTScrollbar) {
      enhanceSpellScrollbars();
    } else {
      window.addEventListener('load', enhanceSpellScrollbars, { once: true });
    }

    panel.querySelectorAll('[data-view-spell]').forEach((button) => {
      button.addEventListener('click', () => {
        record.selectedSpell = button.dataset.viewSpell;
        renderSpellcastingPanel(panel);
      });
    });

    panel.querySelector('[data-spell-search]')?.addEventListener('input', (event) => {
      const query = clean(event.target.value).toLowerCase();
      const catalogRows = panel.querySelectorAll('.spellcasting-catalog [data-spell-row]');

      catalogRows.forEach((row) => {
        row.hidden = Boolean(query) && !row.dataset.spellName.includes(query);
      });
    });

    panel.querySelectorAll('[data-spell-action]').forEach((button) => button.addEventListener('click', () => {
      const id = button.dataset.spellId;
      const toggle = (key, limit = 0) => {
        const selected = record[key].includes(id);

        if (selected) {
          record[key] = record[key].filter((value) => value !== id);
        } else if (!limit || record[key].length < limit) {
          record[key].push(id);
        }
      };

      if (button.dataset.spellAction === 'cantrip') toggle('cantrips', cantripLimit);
      if (button.dataset.spellAction === 'known') toggle('known', knownLimit);
      if (button.dataset.spellAction === 'prepare') toggle('prepared', preparedLimit);
      if (button.dataset.spellAction === 'spellbook') {
        const removing = record.spellbook.includes(id);

        if (!removing) {
          const spell = byId.get(id);

          openSheetEditor('spellbook-purchase', {
            spell,
            onPurchase: () => {
              record.spellbook.push(id);
              record.selectedSpell = id;
              renderSpellcastingPanel(panel);
            }
          });
          return;
        }

        toggle('spellbook');
        if (removing) {
          record.prepared = record.prepared.filter((value) => value !== id);
        }
      }

      record.selectedSpell = id;
      renderSpellcastingPanel(panel);
    }));
  };

  const renderSheetPanel = (tab = activeSheetTab) => {
    activeSheetTab = tab;
    const panel = $('#sheet-panel');
    if (!panel) return;
    const proficiencySkills = sheetProficiencySkills();
    const expertiseSkills = sheetExpertiseSkills();
    if (tab === 'skills') {
      const scores = calculatedScores();
      const rows = skills.map((skill) => {
        const ability = sheetSkillAbilities[skill];
        const trained = includesName(proficiencySkills, skill);
        const expert = includesName(expertiseSkills, skill);
        const disadvantaged = (state.encumbrance === 'heavy' && ['Strength', 'Dexterity', 'Constitution'].includes(ability)) || allSheetConditions().includes('Poisoned');
        const bonus = calculatedSkillBonus(skill, scores);
        return `<span${disadvantaged ? ' class="is-disadvantaged" title="An active condition gives this check disadvantage"' : ''}><i class="sheet-proficiency-dot${trained ? ' is-filled' : ''}${expert ? ' is-expert' : ''}" aria-hidden="true"></i><b>${skill}</b><small>${ability.slice(0, 3)}</small>${disadvantaged ? '<em>DIS</em>' : ''}<strong>${signed(bonus)}</strong></span>`;
      }).join('');
      panel.innerHTML = `<section class="sheet-actions"><article class="sheet-editable-box"><h3>Skills</h3>${editButton('feature', 'Add a skill feature', 'skillBonus')}<div class="skill-rows">${rows}</div></article></section>`;
      return;
    }
    if (tab === 'inventory') {
      const fixedClassEquipment = [...document.querySelectorAll('#starting-equipment-choices .equipment-grant')].map((node) => clean(node.textContent));
      state.startingEquipment = unique([...fixedClassEquipment, ...chosenValues(state.equipmentChoices), ...chosenValues(state.equipmentItems), ...state.backgroundEquipment]);
      if (window.FableInventory) window.FableInventory.render(panel, state);
      else panel.innerHTML = '<p class="sheet-empty">Inventory could not be loaded.</p>';
      return;
    }
    if (tab === 'spellcasting') {
      renderSpellcastingPanel(panel);
      return;
    }
    if (tab === 'features' || tab === 'perks') {
      sheetEntryEditorPresets = new Map();
      const originalPerkValues = unique([state.levelOnePerk, state.humanPerk]);
      const perkValues = unique([...originalPerkValues, ...(state.addedPerks || [])]);
      const perkEntries = perkValues.map((value) => { const perk = perks.find((candidate) => candidate.value === value) || state.customPerks.find((candidate) => candidate.value === value); return { value, label: perk ? `${perk.label} — ${perk.typeLabel || 'Custom'}` : value, description: perk?.description || '', effects: perk?.effects || [], added: !originalPerkValues.includes(value) }; });
      const initialClassFeatures = [...document.querySelectorAll('#class-details .level-one-features summary')].map((node) => clean(node.childNodes[0]?.textContent || node.textContent.replace(/\+$/, '')));
      const gainedClassFeatures = (state.levelUpFeatures || []).flatMap((entry) => (entry.features || []).map((feature) => `${entry.className} ${entry.classLevel}: ${feature}`));
      const classFeatures = [...initialClassFeatures, ...gainedClassFeatures];
      const initialClassFeatureEntries = [...document.querySelectorAll('#class-details .level-one-features details')].map((detail) => {
        const summary = detail.querySelector('summary'), name = clean(summary?.childNodes[0]?.textContent || summary?.textContent.replace(/\+$/, ''));
        return { key: `class:${$('#class-select').value}:1:${name}`, name, description: clean(detail.querySelector('p')?.textContent) };
      });
      const gainedClassFeatureEntries = (state.levelUpFeatures || []).flatMap((entry) => (entry.features || []).map((feature) => {
        const name = typeof feature === 'string' ? feature : clean(feature?.name), description = typeof feature === 'string' ? clean(entry.featureDetails?.[feature]) : clean(feature?.description);
        return { key: `class:${entry.classValue}:${entry.classLevel}:${name}`, name: `${entry.className} ${entry.classLevel}: ${name}`, description };
      }));
      const classFeatureEntries = [...new Map([...initialClassFeatureEntries, ...gainedClassFeatureEntries].map((feature) => [feature.key, feature])).values()];
      const selections = sheetSelections();
      const section = (heading, entries) => {
        const displayHeading = heading === 'Level 1 Class Features' && characterLevel() > 1 ? 'Class Features' : heading;
        return `<article><h3>${displayHeading}</h3>${entries.length ? `<ul class="sheet-list">${entries.map((entry) => `<li>${escapeAttribute(entry)}</li>`).join('')}</ul>` : '<p class="sheet-empty">None selected.</p>'}</article>`;
      };
      const dropdown = ({ key, name, description, effects = [], removable = false, value = '' }) => {
        const source = { kind: key.startsWith('perk:') ? 'perk' : 'feature', name, description: description || 'No description saved for this feature.' };
        sheetEntryEditorPresets.set(key, source);
        const edited = state.entryEdits?.[key] || {}, displayName = edited.name || source.name, displayDescription = edited.description ?? source.description;
        return `<details class="sheet-feature-entry"><summary>${escapeAttribute(displayName)}<span>+</span></summary><div class="sheet-feature-entry__body">${editButton('sheet-entry', `Edit ${displayName}`, '', '', key)}<p>${escapeAttribute(displayDescription)}</p>${effects.length ? `<ul>${effects.map((effect) => `<li>${escapeAttribute(effectSummary(effect))}</li>`).join('')}</ul>` : ''}${removable ? `<button class="sheet-feature-entry__remove" type="button" data-remove-added-perk="${escapeAttribute(value)}">Remove</button>` : ''}</div></details>`;
      };
      const customFeatures = (state.customFeatures || []).map((feature) => `<article class="sheet-feature-card"><h4>${escapeAttribute(feature.name)}</h4>${editButton('feature', `Edit ${feature.name}`, '', feature.id)}${feature.description ? `<p>${escapeAttribute(feature.description)}</p>` : ''}${feature.effects?.length ? `<ul>${feature.effects.map((effect) => `<li>${escapeAttribute(effectSummary(effect))}</li>`).join('')}</ul>` : '<p class="sheet-empty">Descriptive feature; no calculated effects.</p>'}</article>`).join('');
      panel.innerHTML = `<div class="sheet-panel-grid"><article class="sheet-editable-box"><h3>Perks</h3>${editButton('listed-perk', 'Add a listed perk')}${perkEntries.length ? `<ul class="sheet-list sheet-perk-list">${perkEntries.map((perk) => `<li><span><strong>${escapeAttribute(perk.label)}</strong>${perk.description ? `<small>${escapeAttribute(perk.description)}</small>` : ''}${perk.effects.length ? `<small class="sheet-perk-effects">${perk.effects.map(effectSummary).map(escapeAttribute).join(' · ')}</small>` : ''}</span>${perk.added ? `<button type="button" data-remove-added-perk="${escapeAttribute(perk.value)}" aria-label="Remove ${escapeAttribute(perk.label)}">Remove</button>` : ''}</li>`).join('')}</ul>` : '<p class="sheet-empty">None selected.</p>'}</article><article class="sheet-editable-box sheet-custom-features"><h3>Added Features</h3>${editButton('feature', 'Add a custom feature')}${customFeatures || '<p class="sheet-empty">Add features here to modify calculated statistics.</p>'}</article>${section('Level 1 Class Features', unique(classFeatures))}${section('Feature & Spell Choices', selections)}</div>`;
      panel.innerHTML = `<div class="sheet-panel-grid"><article class="sheet-editable-box"><h3>Perks</h3>${editButton('listed-perk', 'Add a listed perk')}${perkEntries.length ? `<div class="sheet-feature-entries">${perkEntries.map((perk) => dropdown({ key: `perk:${perk.value}`, name: perk.label, description: perk.description, effects: perk.effects, removable: perk.added, value: perk.value })).join('')}</div>` : '<p class="sheet-empty">None selected.</p>'}</article><article class="sheet-editable-box sheet-custom-features"><h3>Added Features</h3>${editButton('feature', 'Add a custom feature')}${customFeatures || '<p class="sheet-empty">Add features here to modify calculated statistics.</p>'}</article><article><h3>${characterLevel() > 1 ? 'Class Features' : 'Level 1 Class Features'}</h3>${classFeatureEntries.length ? `<div class="sheet-feature-entries">${classFeatureEntries.map((feature) => dropdown(feature)).join('')}</div>` : '<p class="sheet-empty">None selected.</p>'}</article>${section('Feature & Spell Choices', selections)}</div>`;
      if (tab === 'perks') {
        panel.innerHTML = `<div class="sheet-panel-grid sheet-perks-grid"><article class="sheet-editable-box"><h3>Perks</h3>${editButton('listed-perk', 'Add a listed perk')}${perkEntries.length ? `<div class="sheet-feature-entries">${perkEntries.map((perk) => dropdown({ key: `perk:${perk.value}`, name: perk.label, description: perk.description, effects: perk.effects, removable: perk.added, value: perk.value })).join('')}</div>` : '<p class="sheet-empty">None selected.</p>'}</article></div>`;
      } else {
        panel.innerHTML = `<div class="sheet-panel-grid sheet-features-grid"><article class="sheet-editable-box sheet-custom-features"><h3>Added Features</h3>${editButton('feature', 'Add a custom feature')}${customFeatures || '<p class="sheet-empty">Add features here to modify calculated statistics.</p>'}</article><article><h3>${characterLevel() > 1 ? 'Class Features' : 'Level 1 Class Features'}</h3>${classFeatureEntries.length ? `<div class="sheet-feature-entries">${classFeatureEntries.map((feature) => dropdown(feature)).join('')}</div>` : '<p class="sheet-empty">None selected.</p>'}</article>${section('Feature & Spell Choices', selections)}</div>`;
      }
      return;
    }
    if (tab === 'details') {
      const race = [selectedLabel('#race-select'), state.raceOption].filter(Boolean).join(' — ');
      const className = [selectedLabel('#class-select'), selectedLabel('#class-subclass-select')].filter(Boolean).join(' — ');
      const background = [selectedLabel('#background-select'), state.backgroundOption].filter(Boolean).join(' — ');
      const license = state.backgroundLicenseGrade ? `Grade ${state.backgroundLicenseGrade} Fixer license` : '';
      const classProficiencies = [...document.querySelectorAll('#class-details .proficiency-row')].map((row) => `${clean(row.querySelector('strong')?.textContent)}: ${clean(row.querySelector('span')?.textContent)}`).filter((entry) => !/^(?:Saving Throws|Tools?):/i.test(entry));
      const addedProficiencies = featureEffects().filter((effect) => effect.type === 'proficiency').map((effect) => effect.target);
      const knownLanguages = unique([...state.raceFixedLanguages, ...state.raceLanguages, ...state.backgroundFixedLanguages, ...state.backgroundLanguages, ...intelligenceProficienciesOfType('Language')]);
      const knownTools = unique([...state.classFixedTools, ...state.classTools, ...state.raceFixedTools, ...state.raceTools, ...state.backgroundFixedTools, ...state.backgroundTools, ...intelligenceProficienciesOfType('Artisan Tool')]);
      const knownIntelligenceWeapons = intelligenceProficienciesOfType('Weapon');
      const details = { age: '', height: '', weight: '', eyes: '', skin: '', hair: '', appearance: '', ...(state.details || {}) };
      const proficiencyEntry = (entry) => {
        const categoryMatch = entry.match(/^(Armor|Weapons|Tools|Languages):\s*(.*)$/i);
        return categoryMatch
          ? `<li><strong class="sheet-proficiency-label">${escapeAttribute(categoryMatch[1])}:</strong> ${escapeAttribute(categoryMatch[2])}</li>`
          : `<li>${escapeAttribute(entry)}</li>`;
      };
      panel.innerHTML = `<div class="sheet-panel-grid sheet-details-grid"><article><h3>Identity</h3><p><strong>Race:</strong> ${escapeAttribute(race)}</p><p><strong>Class:</strong> ${escapeAttribute(className)}</p><p><strong>Background:</strong> ${escapeAttribute(background)}</p><p><strong>Creature type:</strong> ${escapeAttribute($('#sheet-creature-type')?.textContent || 'Humanoid')}</p>${license ? `<p><strong>Identification:</strong> ${escapeAttribute(license)}</p>` : ''}</article><article class="sheet-character-details"><h3>Character Details</h3><div class="sheet-details-fields"><label><span>Age</span><input data-character-detail="age" value="${escapeAttribute(details.age)}"></label><label><span>Height</span><input data-character-detail="height" value="${escapeAttribute(details.height)}"></label><label><span>Weight</span><input data-character-detail="weight" value="${escapeAttribute(details.weight)}"></label><label><span>Eyes</span><input data-character-detail="eyes" value="${escapeAttribute(details.eyes)}"></label><label><span>Skin</span><input data-character-detail="skin" value="${escapeAttribute(details.skin)}"></label><label><span>Hair</span><input data-character-detail="hair" value="${escapeAttribute(details.hair)}"></label><label class="sheet-details-fields__wide"><span>Appearance</span><textarea data-character-detail="appearance">${escapeAttribute(details.appearance)}</textarea></label></div></article><article class="sheet-editable-box"><h3>Proficiencies</h3>${editButton('feature', 'Add another proficiency', 'proficiency')}<ul class="sheet-list">${unique([...classProficiencies, ...(knownIntelligenceWeapons.length ? [`Weapons: ${knownIntelligenceWeapons.join(', ')}`] : []), ...(knownTools.length ? [`Tools: ${knownTools.join(', ')}`] : []), ...(knownLanguages.length ? [`Languages: ${knownLanguages.join(', ')}`] : []), ...addedProficiencies]).map(proficiencyEntry).join('')}</ul></article><article id="sheet-intelligence-proficiency-choices" class="class-skill-proficiencies" hidden></article></div>`;
      panel.querySelector('.sheet-details-grid')?.insertAdjacentHTML('beforeend', `<article class="sheet-character-notes"><h3>Character Notes</h3><textarea data-character-notes aria-label="Character notes" placeholder="Record character notes here.">${escapeAttribute(state.notes)}</textarea></article>`);
      panel.querySelectorAll('[data-character-detail]').forEach((control) => control.addEventListener('input', () => { state.details = { ...(state.details || {}), [control.dataset.characterDetail]: control.value }; }));
      panel.querySelector('[data-character-notes]')?.addEventListener('input', (event) => { state.notes = event.target.value; });
      renderIntelligenceProficiencyChoices($('#sheet-intelligence-proficiency-choices'));
      return;
    }
    panel.innerHTML = `<div class="sheet-panel-grid"><article class="sheet-editable-box"><h3>Character Notes</h3>${editButton('notes', 'Write character notes')}<textarea aria-label="Character notes" placeholder="Record character notes here.">${escapeAttribute(state.notes)}</textarea></article></div>`;
    panel.querySelector('textarea').addEventListener('input', (event) => { state.notes = event.target.value; });
  };

  const populateCharacterSheet = () => {
    const combatEdit = $('.sheet-dashboard__combat > .sheet-edit-button');
    if (combatEdit) { combatEdit.dataset.sheetEdit = 'combat'; delete combatEdit.dataset.effectType; combatEdit.setAttribute('aria-label', 'Edit combat tracking'); combatEdit.title = 'Edit combat tracking'; }
    $('.sheet-hit-points > .sheet-edit-button')?.remove();
    const name = clean($('#character-name').value);
    const race = selectedLabel('#race-select');
    const className = selectedLabel('#class-select');
    const background = selectedLabel('#background-select');
    $('#sheet-name').textContent = name;
    const classBreakdown = Object.entries(state.classLevels || {}).filter(([, levels]) => Number(levels) > 0).map(([value, levels]) => `${clean([...$('#class-select').options].find((option) => option.value === value)?.textContent) || title(value)} ${levels}`).join(' / ') || className;
    $('#sheet-origin').textContent = `${race}${state.raceOption ? ` (${state.raceOption})` : ''} · ${classBreakdown}${selectedLabel('#class-subclass-select') ? ` (${selectedLabel('#class-subclass-select')})` : ''} · ${background}`;
    const level = characterLevel();
    $('#sheet-level').textContent = String(level);
    state.spellcastingLevel = effectiveSpellcasterLevel();
    const warlockLevel = Math.max(0, Math.floor(Number(state.classLevels?.['warlock.html']) || 0));
    $('#sheet-spellcaster-level').textContent = state.spellcastingLevel ? `Level ${state.spellcastingLevel}` : warlockLevel ? `Pact ${warlockLevel}` : '—';
    $('#sheet-spellcaster-level').title = spellcastingSummary();
    renderExperience();
    const sheetCanvas = $('#sheet-avatar');
    sheetCanvas.getContext('2d').drawImage($('#avatar-canvas'), 0, 0, sheetCanvas.width, sheetCanvas.height);
    const scores = calculatedScores();
    $('#sheet-abilities').innerHTML = abilities.map((ability) => `<span class="sheet-ability"><b>${ability}</b><strong>${scores[ability]}</strong><small>${signed(modifier(scores[ability]))}</small></span>`).join('');
    $('#sheet-proficiency').textContent = signed(proficiencyBonus());
    const baseHp = Number($('#hp-value').textContent) || 0;
    const maximumHp = Math.max(1, baseHp + modifier(scores.Constitution) + Math.max(0, Number(state.levelHpBonus) || 0) + effectTotal('hp'));
    if (state.currentHp === null || state.currentHp === undefined || !Number.isFinite(Number(state.currentHp))) state.currentHp = maximumHp;
    state.currentHp = Math.max(0, Math.min(Number(state.currentHp), maximumHp));
    $('#sheet-hp').textContent = String(state.currentHp);
    $('#sheet-hp-max').textContent = String(maximumHp);
    $('#sheet-temp-hp').textContent = String(Math.max(0, Number(state.temporaryHp) || 0));
    $('#sheet-ac').textContent = String(10 + modifier(scores.Dexterity) + effectTotal('ac'));
    $('#sheet-initiative').textContent = signed(modifier(scores.Dexterity) + effectTotal('initiative') - manualExhaustionLevel());
    const combatValues = $('.sheet-combat-values');
    if (combatValues && !$('#sheet-hit-dice')) combatValues.insertAdjacentHTML('beforeend', '<p><strong id="sheet-hit-dice">0 / 1</strong><span id="sheet-hit-dice-label">Hit Dice</span></p>');
    const hitDicePools = normalizeHitDicePools();
    const activeHitDice = hitDiceSizes.map((sides) => ({ sides, ...hitDicePools[`d${sides}`] })).filter((pool) => pool.maximum > 0);
    const remainingHitDice = activeHitDice.reduce((total, pool) => total + pool.remaining, 0);
    const maximumHitDice = activeHitDice.reduce((total, pool) => total + pool.maximum, 0);
    $('#sheet-hit-dice').textContent = `${remainingHitDice} / ${maximumHitDice}`;
    $('#sheet-hit-dice-label').textContent = activeHitDice.length ? `Hit Dice · ${activeHitDice.map((pool) => `d${pool.sides} ${pool.remaining}/${pool.maximum}`).join(' · ')}` : 'Hit Dice';
    const raceText = clean($('#race-details')?.textContent);
    const speed = raceText.match(/\bSpeed\b[^.\d]{0,100}(\d+)\s*(?:feet|ft\.?)/i)?.[1];
    state.baseSpeed = Number(speed) || Number(state.baseSpeed) || 30;
    const movementSpeed = (type) => {
      const name = type === 'fly' ? '(?:fly|flying)' : `${type}(?:ing)?`;
      const explicit = raceText.match(new RegExp(`\\b${name}\\s+speed[^.\\d]{0,100}(\\d+)\\s*(?:feet|ft\\.?)`, 'i'))?.[1];
      const matchesWalking = new RegExp(`\\b${name}\\s+speed[^.]{0,100}equal to (?:your )?(?:walking )?speed`, 'i').test(raceText);
      return Number(explicit) || (matchesWalking ? state.baseSpeed : 0);
    };
    state.speeds = { walk: state.baseSpeed, burrow: movementSpeed('burrow'), climb: movementSpeed('climb'), fly: movementSpeed('fly'), swim: movementSpeed('swim') };
    const size = raceText.match(/\bSize:?[^.]{0,80}\b(Tiny|Small|Medium|Large|Huge|Gargantuan)\b/i)?.[1];
    if (size) $('#sheet-character-size').value = size[0].toUpperCase() + size.slice(1).toLowerCase();
    const selectedPerkNames = unique([state.levelOnePerk, state.humanPerk, ...(state.addedPerks || [])]).map((value) => perks.find((perk) => perk.value === value)?.label || state.customPerks.find((perk) => perk.value === value)?.label || value);
    if (selectedPerkNames.some((perk) => /^Giant Blood$/i.test(perk))) $('#sheet-character-size').value = 'Large';
    if (selectedPerkNames.some((perk) => /^(?:Broonie Blood|Fairy)$/i.test(perk))) $('#sheet-character-size').value = 'Tiny';
    if (!state.equipmentScaleLocked) {
      state.equipmentScaleSize = selectedPerkNames.some((perk) => /^Giant Blood$/i.test(perk)) ? 'Large' : selectedPerkNames.some((perk) => /^Broonie Blood$/i.test(perk)) ? 'Tiny' : 'Medium';
      state.equipmentScaleLocked = true;
    }
    state.scores = scores;
    state.size = $('#sheet-character-size').value;
    [...$('#sheet-character-size').options].forEach((option) => option.toggleAttribute('selected', option.value === state.size));
    const saveProficiencies = unique([...classSaveProficiencies(), ...featureEffects().filter((effect) => effect.type === 'saveProficiency').map((effect) => effect.target)]);
    $('#sheet-saving-throws').innerHTML = abilities.map((ability) => { const proficient = includesName(saveProficiencies, ability); const disadvantaged = state.encumbrance === 'heavy' && ['Strength', 'Dexterity', 'Constitution'].includes(ability); const value = modifier(scores[ability]) + (proficient ? proficiencyBonus() : 0) - manualExhaustionLevel(); return `<span data-save="${ability}"${disadvantaged ? ' class="is-disadvantaged" title="Heavily encumbered: this saving throw has disadvantage"' : ''}><i class="sheet-proficiency-dot${proficient ? ' is-filled' : ''}" aria-hidden="true"></i><b>${ability}</b>${disadvantaged ? '<em>DIS</em>' : ''}<strong>${signed(value)}</strong></span>`; }).join('');
    $('#sheet-passive-perception').textContent = String(10 + calculatedSkillBonus('Perception', scores));
    $('#sheet-passive-insight').textContent = String(10 + calculatedSkillBonus('Insight', scores));
    const creatureTypeEffect = featureEffects().filter((effect) => effect.type === 'creatureType').at(-1)?.target;
    const raceTraits = [...document.querySelectorAll('#race-details .race-trait-list strong')].map((node) => clean(node.textContent));
    const baseCreatureType = ['Fey', 'Construct', 'Undead'].find((type) => raceTraits.includes(type)) || 'Humanoid';
    $('#sheet-creature-type').textContent = creatureTypeEffect || baseCreatureType;
    const fixedClassEquipment = [...document.querySelectorAll('#starting-equipment-choices .equipment-grant')].map((node) => clean(node.textContent));
    state.startingEquipment = unique([...fixedClassEquipment, ...chosenValues(state.equipmentChoices), ...chosenValues(state.equipmentItems), ...state.backgroundEquipment]);
    applyEncumbrance(state.encumbrance || 'clear');
    renderSheetPanel(activeSheetTab);
    window.FableInventory?.sync(state);
  };

  const applyEncumbrance = (mode = 'clear') => {
    state.encumbrance = ['encumbered', 'heavy'].includes(mode) ? mode : 'clear';
    const reduction = state.encumbrance === 'heavy' ? 20 : state.encumbrance === 'encumbered' ? 10 : 0;
    const baseSpeed = Number(state.baseSpeed) || 30;
    const exhaustion = manualExhaustionLevel(), exhaustionSpeedReduction = Math.floor(exhaustion / 2) * 5;
    const activeConditions = allSheetConditions();
    const immobilized = activeConditions.some((condition) => ['Grappled', 'Restrained', 'Paralyzed', 'Petrified', 'Stunned', 'Unconscious'].includes(condition));
    const speedValues = { ...(state.speeds || {}), walk: baseSpeed };
    Object.entries(speedValues).forEach(([type, value]) => {
      const speed = immobilized ? 0 : Math.max(0, Number(value) + movementEffectTotal(type) - reduction - exhaustionSpeedReduction);
      const field = $(`#sheet-speed-${type}`);
      if (field) field.innerHTML = `${speed}<small> ft.</small>`;
    });
    if ($('#sheet-conditions')) $('#sheet-conditions').innerHTML = activeConditions.length ? activeConditions.map((condition) => `<span>${escapeAttribute(condition === 'Exhaustion' ? `Exhaustion ${exhaustion}` : condition)}</span>`).join('') : '<span>None active</span>';
    const exhaustionRule = exhaustion ? `Exhaustion level ${exhaustion}: −${exhaustion} to attack rolls, saving throws, and ability checks.${exhaustionSpeedReduction ? ` All speeds are reduced by ${exhaustionSpeedReduction} feet.` : ''}${exhaustion >= 10 ? ' The character dies.' : ''}` : '';
    const activeRules = activeConditions.map((condition) => condition === 'Exhaustion' ? exhaustionRule : conditionRules[condition]).filter(Boolean);
    if ($('#sheet-condition-effects')) {
      const rules = activeRules.length ? activeRules : [activeConditions.length ? 'Condition rules are active for this character.' : 'No condition effects.'];
      $('#sheet-condition-effects').innerHTML = rules.map((rule) => `<li>${escapeAttribute(rule)}</li>`).join('');
    }
    document.querySelectorAll('[data-save]').forEach((save) => {
      const disadvantaged = (state.encumbrance === 'heavy' && ['Strength', 'Dexterity', 'Constitution'].includes(save.dataset.save)) || (activeConditions.includes('Restrained') && save.dataset.save === 'Dexterity');
      save.classList.toggle('is-disadvantaged', disadvantaged);
      save.title = disadvantaged ? 'Heavily encumbered: this saving throw has disadvantage' : '';
      save.querySelector('em')?.remove();
      if (disadvantaged) save.querySelector('strong')?.insertAdjacentHTML('beforebegin', '<em>DIS</em>');
    });
    if (activeSheetTab === 'skills') renderSheetPanel('skills');
  };

  let pendingLevelUp = null;
  const populateLevelUpPerks = () => {
    const select = $('#level-up-perk-select');
    const chosenPerks = [
      state.levelOnePerk,
      state.humanPerk,
      ...(state.addedPerks || [])
    ];
    const chosen = new Set(chosenPerks.filter(Boolean));
    select.innerHTML = `<option value="">Choose a perk</option>${perks.map((perk) => `<option value="${escapeAttribute(perk.value)}" data-preview="${escapeAttribute(previewSnippet(perk.description))}"${chosen.has(perk.value) ? ' disabled' : ''}>${escapeAttribute(perk.label)} — ${escapeAttribute(perk.typeLabel)}</option>`).join('')}`;
    $('#level-up-perk-choice').hidden = !state.perksPerLevel;
    renderLevelUpPermanentChoices();
  };
  const updateLevelUpApplyState = () => {
    const button = $('#apply-level-up');
    if (!button) return;
    let complete = Boolean(pendingLevelUp);
    if (pendingLevelUp?.requiresSubclass) complete = complete && Boolean(pendingLevelUp.subclass);
    const perkValue = clean($('#level-up-perk-select')?.value);
    if (state.perksPerLevel) {
      complete = complete && Boolean(perkValue);
      const options = perkIncreaseOptions(perkValue);
      if (options.length > 1) complete = complete && options.includes(clean($('#level-up-perk-ability')?.value));
    }
    const hasAsi = Boolean(pendingLevelUp?.features?.some((feature) => /^Ability Score Improvement$/i.test(typeof feature === 'string' ? feature : feature?.name)));
    if (hasAsi) complete = complete && abilities.includes(clean($('#level-up-asi')?.value));
    button.disabled = !complete;
  };
  const renderLevelUpPermanentChoices = () => {
    const perkValue = clean($('#level-up-perk-select')?.value);
    const perkOptions = perkIncreaseOptions(perkValue);
    const perkWrapper = $('#level-up-perk-ability-choice');
    const perkSelect = $('#level-up-perk-ability');
    if (perkWrapper && perkSelect) {
      perkWrapper.hidden = !state.perksPerLevel || perkOptions.length < 2;
      const selected = perkOptions.includes(perkSelect.value) ? perkSelect.value : '';
      perkSelect.innerHTML = `<option value="">Choose an ability</option>${perkOptions.map((ability) => `<option value="${ability}"${selected === ability ? ' selected' : ''}${permanentScore(ability) >= 20 ? ' disabled' : ''}>${ability}</option>`).join('')}`;
    }
    const hasAsi = Boolean(pendingLevelUp?.features?.some((feature) => /^Ability Score Improvement$/i.test(feature)));
    const asiWrapper = $('#level-up-asi-choice');
    const asiSelect = $('#level-up-asi');
    if (asiWrapper && asiSelect) {
      asiWrapper.hidden = !hasAsi;
      const selected = abilities.includes(asiSelect.value) ? asiSelect.value : '';
      asiSelect.innerHTML = `<option value="">Choose an ability</option>${abilities.map((ability) => `<option value="${ability}"${selected === ability ? ' selected' : ''}${permanentScore(ability) >= 20 ? ' disabled' : ''}>${ability}</option>`).join('')}`;
    }
    updateLevelUpApplyState();
  };
  const renderLevelUpPreview = async () => {
    const select = $('#level-up-class-select');
    const classValue = clean(select.value);
    const features = $('#level-up-features');
    const subclassChoice = $('#level-up-subclass-choice');
    const subclassSelect = $('#level-up-subclass-select');

    pendingLevelUp = null;
    renderLevelUpPermanentChoices();
    subclassChoice.hidden = true;
    subclassSelect.innerHTML = '<option value="">Choose an arcane tradition</option>';
    updateLevelUpApplyState();
    if (!classValue) {
      $('#level-up-class-level').textContent = '—';
      $('#level-up-spellcasting').textContent = spellcastingSummary();
      features.innerHTML = '<p>Choose a class to preview its next level.</p>';
      return;
    }
    const savedClassLevel = Number(state.classLevels?.[classValue]) || 0;
    const currentClassLevel = Math.max(0, Math.floor(savedClassLevel));
    const nextClassLevel = currentClassLevel + 1;
    const prospectiveLevels = {
      ...(state.classLevels || {}),
      [classValue]: nextClassLevel
    };
    $('#level-up-class-level').textContent = `${nextClassLevel} (${currentClassLevel ? 'advance' : 'new class'})`;
    $('#level-up-spellcasting').textContent = spellcastingSummary(prospectiveLevels);
    features.innerHTML = '<p>Loading class features…</p>';
    try {
      const doc = await fetchDocument(`../classes/${classValue}`);
      if (select.value !== classValue) return;
      const table = [...doc.querySelectorAll('table')].find((candidate) => {
        const headers = [...candidate.querySelectorAll('thead th')];
        return headers.some((header) => /^features?$/i.test(clean(header.textContent)));
      });
      const headers = table ? [...table.querySelectorAll('thead th')].map((header) => clean(header.textContent)) : [];
      const featureIndex = headers.findIndex((header) => /^features?$/i.test(header));
      const row = table
        ? [...table.querySelectorAll('tbody tr')].find((candidate) => {
            const rowLevel = Number.parseInt(clean(candidate.cells[0]?.textContent), 10);
            return rowLevel === nextClassLevel;
          })
        : null;
      const gainedFeatures = row && featureIndex >= 0 ? clean(row.cells[featureIndex]?.textContent).split(',').map(clean).filter((feature) => feature && feature !== '—' && feature !== '-') : [];
      const progression = row ? headers.map((header, index) => ({ label: header, value: clean(row.cells[index]?.textContent) })).filter((entry, index) => index > 0 && index !== featureIndex && entry.value && !/^—|-$/i.test(entry.value)) : [];
      const featureDetails = Object.fromEntries(gainedFeatures.map((feature) => [feature, featureDescription(doc, feature)]));
      const className = clean(select.selectedOptions[0]?.textContent) || title(classValue);
      const requiresWizardTradition = classValue === 'wizard.html' && nextClassLevel === 2 && !state.subclass;

      pendingLevelUp = {
        classValue,
        className,
        classLevel: nextClassLevel,
        features: gainedFeatures,
        featureDetails,
        requiresSubclass: requiresWizardTradition,
        subclass: ''
      };
      renderLevelUpPermanentChoices();

      if (requiresWizardTradition) {
        const traditions = [...doc.querySelectorAll('a.class-title-link[href*="wizard/"]')]
          .map((link) => ({
            label: clean(link.textContent),
            value: clean(link.getAttribute('href'))
          }))
          .filter((tradition, index, list) => {
            return tradition.value && list.findIndex((candidate) => candidate.value === tradition.value) === index;
          });

        traditions.forEach((tradition) => {
          subclassSelect.append(new Option(tradition.label, tradition.value));
        });
        subclassChoice.hidden = false;
      }
      features.innerHTML = `<h3>${escapeAttribute(className)} ${nextClassLevel}</h3>${gainedFeatures.length ? `<ul>${gainedFeatures.map((feature) => `<li>${escapeAttribute(feature)}</li>`).join('')}</ul>` : '<p>No new named class features at this level.</p>'}${progression.length ? `<p class="level-up-progression">${progression.map((entry) => `<span><strong>${escapeAttribute(entry.label)}:</strong> ${escapeAttribute(entry.value)}</span>`).join('')}</p>` : ''}`;
      updateLevelUpApplyState();
    } catch (error) {
      console.error('Unable to preview class level', error);
      features.innerHTML = '<p>Class features could not be loaded. You can still apply this class level.</p>';
      pendingLevelUp = { classValue, className: clean(select.selectedOptions[0]?.textContent) || title(classValue), classLevel: nextClassLevel, features: [] };
      renderLevelUpPermanentChoices();
      updateLevelUpApplyState();
    }
  };
  const closeLevelUpBuilder = () => {
    $('.character-builder').classList.remove('level-up-mode');
    $('.character-builder').classList.add('sheet-ready');
    $('#builder-page-title').textContent = 'Character Sheet';
    pendingLevelUp = null;
  };
  const openLevelUpBuilder = () => {
    if (state.xp < XP_TO_LEVEL) return;
    const classSelect = $('#level-up-class-select');
    classSelect.innerHTML = '<option value="">Choose a class</option>';
    [...$('#class-select').options]
      .filter((option) => option.value)
      .forEach((option) => {
        classSelect.append(new Option(option.textContent, option.value));
      });
    classSelect.value = $('#class-select').value;
    populateLevelUpPerks();
    $('#level-up-perk-ability').value = '';
    $('#level-up-asi').value = '';
    $('#level-up-character-level').textContent = String(characterLevel() + 1);
    $('.character-builder').classList.remove('sheet-ready');
    $('.character-builder').classList.add('level-up-mode');
    $('#builder-page-title').textContent = 'Level Up';
    renderLevelUpPreview();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const applyLevelUp = () => {
    if (!pendingLevelUp) return;
    const perkValue = clean($('#level-up-perk-select').value);
    if (state.perksPerLevel && !perkValue) {
      $('#level-up-perk-select').focus();
      return;
    }
    const perkOptions = perkIncreaseOptions(perkValue);
    const perkAbility = clean($('#level-up-perk-ability').value);
    if (perkOptions.length > 1 && !perkOptions.includes(perkAbility)) {
      $('#level-up-perk-ability').focus();
      return;
    }
    const hasAsi = pendingLevelUp.features.some((feature) => /^Ability Score Improvement$/i.test(feature));
    const asiAbility = clean($('#level-up-asi').value);
    if (hasAsi && !abilities.includes(asiAbility)) {
      $('#level-up-asi').focus();
      return;
    }
    if (pendingLevelUp.requiresSubclass && !pendingLevelUp.subclass) {
      $('#level-up-subclass-select').focus();
      return;
    }

    const { classValue, className, classLevel, features, featureDetails = {} } = pendingLevelUp;
    const pools = normalizeHitDicePools();
    state.classLevels = { ...(state.classLevels || {}), [classValue]: classLevel };
    state.level = Object.values(state.classLevels).reduce((total, value) => total + (Number(value) || 0), 0);
    state.xp = 0;
    state.spellcastingLevel = effectiveSpellcasterLevel();
    state.levelUpFeatures = Array.isArray(state.levelUpFeatures) ? state.levelUpFeatures : [];
    state.levelUpFeatures.push({ level: state.level, classValue, className, classLevel, features: [...features], featureDetails: { ...featureDetails } });
    if (pendingLevelUp.subclass) {
      state.subclass = pendingLevelUp.subclass;
      state.subclassFeatureChoices = {};
    }

    if (perkValue && !(state.addedPerks || []).includes(perkValue)) {
      state.addedPerks.push(perkValue);
      if (perkOptions.length === 1) state.perkAbilityChoices[perkValue] = perkOptions[0];
      else if (perkAbility) state.perkAbilityChoices[perkValue] = perkAbility;
    }
    if (hasAsi) state.abilityScoreIncreases.push(asiAbility);
    const die = classHitDieSides(classValue);
    if (die && pools[`d${die}`]) {
      pools[`d${die}`].maximum += 1;
      pools[`d${die}`].remaining += 1;
    }
    const hpGain = Math.max(1, Math.floor(die / 2) + 1 + modifier(calculatedScores().Constitution));
    state.levelHpBonus = Math.max(0, Number(state.levelHpBonus) || 0) + hpGain;
    if (state.currentHp !== null && state.currentHp !== undefined) {
      state.currentHp = Number(state.currentHp) + hpGain;
    }
    closeLevelUpBuilder();
    renderExperience();
    populateCharacterSheet();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openCharacterSheet = () => {
    if (!validateSheetIdentity()) return;
    populateCharacterSheet();
    $('.character-builder').classList.remove('level-up-mode');
    $('.character-builder').classList.add('sheet-ready');
    $('#builder-page-title').textContent = 'Character Sheet';
    $('#print-character').textContent = 'Save';
    $('.builder-heading').append($('#print-character'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveCharacter = () => {
    const name = clean($('#character-name').value) || 'character';
    const data = {
      ...state,
      format: 'fable-character-sheet',
      version: 4,
      level: characterLevel(),
      name,
      class: $('#class-select').value,
      race: $('#race-select').value,
      background: $('#background-select').value,
      avatar: $('#avatar-canvas').toDataURL('image/png')
    };
    const filename = name.replace(/[\\/:*?"<>|]+/g, '-');
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.json`;
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const loadImportedCharacter = async (data) => {
    if (!data || typeof data !== 'object') return false;
    const classValue = clean(data.class);
    const raceValue = clean(data.race);
    const backgroundValue = clean(data.background);
    Object.assign(state, data);
    state.xp = Math.max(0, Math.min(XP_TO_LEVEL, Math.floor(Number(data.xp) || 0)));
    state.abilityArray = { ...(data.abilityArray || {}) };
    state.racial = Array.isArray(data.racial) ? data.racial.slice(0, 3) : [];
    state.abilityScoreExchanges = Array.isArray(data.abilityScoreExchanges) ? data.abilityScoreExchanges.slice(0, 2).map((exchange) => ({ decrease: clean(exchange?.decrease), increase: clean(exchange?.increase) })) : [];
    state.abilityScoreIncreases = Array.isArray(data.abilityScoreIncreases) ? data.abilityScoreIncreases.filter((ability) => abilities.includes(ability)) : [];
    state.perkAbilityChoices = data.perkAbilityChoices && typeof data.perkAbilityChoices === 'object' && !Array.isArray(data.perkAbilityChoices) ? { ...data.perkAbilityChoices } : {};
    state.intelligenceProficiencies = Array.isArray(data.intelligenceProficiencies) ? data.intelligenceProficiencies.map((entry) => clean(entry)) : [];
    state.intelligenceProficiencyTypes = Array.isArray(data.intelligenceProficiencyTypes) ? data.intelligenceProficiencyTypes.filter((type) => typeof type === 'string') : [];
    state.skills = Array.isArray(data.skills) ? data.skills.filter(Boolean) : [];
    state.expertise = Array.isArray(data.expertise) ? data.expertise.filter(Boolean) : [];
    state.backgroundSkills = Array.isArray(data.backgroundSkills) ? data.backgroundSkills.filter(Boolean) : [];
    state.classTools = Array.isArray(data.classTools) ? data.classTools.filter(Boolean) : [];
    state.classFixedTools = Array.isArray(data.classFixedTools) ? data.classFixedTools.filter(Boolean) : [];
    state.raceLanguages = Array.isArray(data.raceLanguages) ? data.raceLanguages.filter(Boolean) : [];
    state.raceFixedLanguages = Array.isArray(data.raceFixedLanguages) ? data.raceFixedLanguages.filter(Boolean) : [];
    state.raceTools = Array.isArray(data.raceTools) ? data.raceTools.filter(Boolean) : [];
    state.raceFixedTools = Array.isArray(data.raceFixedTools) ? data.raceFixedTools.filter(Boolean) : [];
    state.backgroundLanguages = Array.isArray(data.backgroundLanguages) ? data.backgroundLanguages.filter(Boolean) : [];
    state.backgroundFixedLanguages = Array.isArray(data.backgroundFixedLanguages) ? data.backgroundFixedLanguages.filter(Boolean) : [];
    state.backgroundTools = Array.isArray(data.backgroundTools) ? data.backgroundTools.filter(Boolean) : [];
    state.backgroundFixedTools = Array.isArray(data.backgroundFixedTools) ? data.backgroundFixedTools.filter(Boolean) : [];
    state.backgroundEquipment = Array.isArray(data.backgroundEquipment) ? data.backgroundEquipment.filter(Boolean) : [];
    state.inventory = Array.isArray(data.inventory) ? data.inventory : [];
    state.details = data.details && typeof data.details === 'object' && !Array.isArray(data.details) ? { ...data.details } : {};
    state.conditions = Array.isArray(data.conditions) ? data.conditions.filter((condition) => condition && clean(condition).toLowerCase() !== 'exhaustion') : [];
    state.exhaustionLevel = Math.max(0, Math.min(10, Math.floor(Number(data.exhaustionLevel ?? (Array.isArray(data.conditions) && data.conditions.some((condition) => clean(condition).toLowerCase() === 'exhaustion') ? 1 : 0)) || 0)));
    state.customFeatures = Array.isArray(data.customFeatures) ? data.customFeatures.filter((feature) => feature?.name) : [];
    state.entryEdits = data.entryEdits && typeof data.entryEdits === 'object' && !Array.isArray(data.entryEdits) ? { ...data.entryEdits } : {};
    state.levelUpFeatures = Array.isArray(data.levelUpFeatures) ? data.levelUpFeatures.filter((entry) => entry?.classValue && Number(entry.classLevel)) : [];
    state.levelHpBonus = Math.max(0, Number(data.levelHpBonus) || 0);
    state.addedPerks = Array.isArray(data.addedPerks) ? data.addedPerks.filter(Boolean) : [];
    state.customPerks = Array.isArray(data.customPerks) ? data.customPerks.filter((perk) => perk?.value && perk?.label).map((perk) => ({ value: clean(perk.value), label: clean(perk.label), description: clean(perk.description), effects: Array.isArray(perk.effects) ? perk.effects.map((effect) => ({ type: clean(effect.type), target: clean(effect.target), value: Number(effect.value) || 0 })) : [] })) : [];
    state.classFeatureChoices = { ...(data.classFeatureChoices || {}) };
    state.classSpells = { ...(data.classSpells || {}) };
    state.subclassFeatureChoices = { ...(data.subclassFeatureChoices || {}) };
    state.equipmentChoices = { ...(data.equipmentChoices || {}) };
    state.equipmentItems = { ...(data.equipmentItems || {}) };
    $('#character-name').value = clean(data.name);
    $('#class-select').value = classValue;
    $('#race-select').value = raceValue;
    $('#background-select').value = backgroundValue;
    restoringImport = true;
    try {
      await loadPerks();
      await loadClass();
      await Promise.all([
        loadSimpleDetails('race', '../races/index.html'),
        loadSimpleDetails('background', '../backgrounds/index.html')
      ]);
    } finally { restoringImport = false; }
    renderAbilityScoreExchanges();
    renderAbilities();
    $('#perks-per-level').checked = Boolean(state.perksPerLevel);
    renderPerkChoices();
    if (data.avatar) await new Promise((resolve) => {
      avatar = new Image();
      avatar.onload = () => { drawAvatar(); resolve(); };
      avatar.onerror = resolve;
      avatar.src = data.avatar;
    });
    openCharacterSheet();
    return true;
  };

  window.FableCharacterBuilder = { renderPanel: renderSheetPanel, applyEncumbrance, editCash: () => openSheetEditor('cash') };

  const init = async () => {
    drawAvatar(); renderAbilityScoreExchanges(); renderAbilities(); renderExperience();
    $('#avatar-change').addEventListener('click', () => $('#avatar-file').click());
    $('#avatar-scale').addEventListener('input', drawAvatar);
    $('#avatar-file').addEventListener('change', (event) => { const file = event.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { avatar = new Image(); avatarPan.x = 0; avatarPan.y = 0; avatar.onload = drawAvatar; avatar.src = reader.result; }; reader.readAsDataURL(file); });
    const avatarCanvas = $('#avatar-canvas');
    let avatarDrag = null;
    const endAvatarDrag = (event) => {
      if (!avatarDrag || event.pointerId !== avatarDrag.pointerId) return;
      avatarCanvas.releasePointerCapture?.(event.pointerId);
      avatarDrag = null;
      avatarCanvas.classList.remove('is-dragging');
    };
    avatarCanvas.addEventListener('pointerdown', (event) => {
      if (!avatar) return;
      avatarDrag = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
      avatarCanvas.setPointerCapture(event.pointerId);
      avatarCanvas.classList.add('is-dragging');
      event.preventDefault();
    });
    avatarCanvas.addEventListener('pointermove', (event) => {
      if (!avatarDrag || event.pointerId !== avatarDrag.pointerId || !avatar) return;
      const rect = avatarCanvas.getBoundingClientRect();
      const crop = Math.min(avatar.width, avatar.height) / Number($('#avatar-scale').value || 1);
      const maxOffsetX = Math.max(0, (avatar.width - crop) / 2);
      const maxOffsetY = Math.max(0, (avatar.height - crop) / 2);
      if (maxOffsetX) avatarPan.x = Math.max(-1, Math.min(1, avatarPan.x - ((event.clientX - avatarDrag.x) / rect.width * crop) / maxOffsetX));
      if (maxOffsetY) avatarPan.y = Math.max(-1, Math.min(1, avatarPan.y - ((event.clientY - avatarDrag.y) / rect.height * crop) / maxOffsetY));
      avatarDrag.x = event.clientX;
      avatarDrag.y = event.clientY;
      drawAvatar();
    });
    avatarCanvas.addEventListener('pointerup', endAvatarDrag);
    avatarCanvas.addEventListener('pointercancel', endAvatarDrag);
    $('#class-select').addEventListener('change', loadClass);
    $('#race-select').addEventListener('change', () => { state.raceOption = ''; state.raceLanguages = []; state.raceFixedLanguages = []; state.raceTools = []; state.raceFixedTools = []; loadSimpleDetails('race', '../races/index.html'); renderPerkChoices(); });
    $('#background-select').addEventListener('change', () => {
      state.backgroundOption = '';
      state.backgroundLicenseGrade = '';
      state.backgroundSkills = [];
      state.backgroundLanguages = [];
      state.backgroundFixedLanguages = [];
      state.backgroundTools = [];
      state.backgroundFixedTools = [];
      $('#background-choice-controls')?.replaceChildren();
      if (classSkillDefinition) renderSkillChoices(classSkillDefinition);
      renderExpertiseChoices();
      renderPerkChoices();
      updateOriginChoiceSection();
      loadSimpleDetails('background', '../backgrounds/index.html');
    });
    $('#perks-per-level').addEventListener('change', (event) => { state.perksPerLevel = event.target.checked; if (!state.perksPerLevel) state.levelOnePerk = ''; renderPerkChoices(); renderAbilities(); });
    $('#add-ability-score-exchange').addEventListener('click', () => {
      if (state.abilityScoreExchanges.length >= 2) return;
      state.abilityScoreExchanges.push({ decrease: '', increase: '' });
      renderAbilityScoreExchanges();
    });
    $('#xp-input').addEventListener('input', (event) => { state.xp = event.target.value; renderExperience(); });
    $('#open-level-up').addEventListener('click', openLevelUpBuilder);
    $('#cancel-level-up').addEventListener('click', closeLevelUpBuilder);
    $('#level-up-class-select').addEventListener('change', renderLevelUpPreview);
    $('#level-up-subclass-select').addEventListener('change', (event) => {
      if (!pendingLevelUp) return;

      pendingLevelUp.subclass = event.target.value;
      updateLevelUpApplyState();
    });
    $('#apply-level-up').addEventListener('click', applyLevelUp);
    $('#level-one-perk').addEventListener('change', (event) => { state.levelOnePerk = event.target.value; renderPerkChoices(); renderAbilities(); });
    $('#human-perk').addEventListener('change', (event) => { state.humanPerk = event.target.value; renderPerkChoices(); renderAbilities(); });
    $('#level-one-perk-ability').addEventListener('change', (event) => { if (state.levelOnePerk) state.perkAbilityChoices[state.levelOnePerk] = event.target.value; renderPerkChoices(); renderAbilities(); });
    $('#human-perk-ability').addEventListener('change', (event) => { if (state.humanPerk) state.perkAbilityChoices[state.humanPerk] = event.target.value; renderPerkChoices(); renderAbilities(); });
    $('#level-up-perk-select').addEventListener('change', renderLevelUpPermanentChoices);
    $('#level-up-perk-ability').addEventListener('change', updateLevelUpApplyState);
    $('#level-up-asi').addEventListener('change', updateLevelUpApplyState);
    $('#perk-skill').addEventListener('change', (event) => {
      state.perkSkill = event.target.value;
      state.skills = state.skills.filter((skill) => skill !== state.perkSkill);
      if (state.humanSkill === state.perkSkill) state.humanSkill = '';
      if (classSkillDefinition) renderSkillChoices(classSkillDefinition);
      renderExpertiseChoices();
      renderPerkChoices();
    });
    $('#human-skill').addEventListener('change', (event) => {
      state.humanSkill = event.target.value;
      state.skills = state.skills.filter((skill) => skill !== state.humanSkill);
      if (state.perkSkill === state.humanSkill) state.perkSkill = '';
      if (classSkillDefinition) renderSkillChoices(classSkillDefinition);
      renderExpertiseChoices();
      renderPerkChoices();
    });
    $('#print-character').addEventListener('click', () => {
      if ($('.character-builder').classList.contains('sheet-ready')) saveCharacter();
      else openCharacterSheet();
    });
    document.addEventListener('click', (event) => {
      const edit = event.target.closest('[data-sheet-edit]');
      if (edit) {
        if (edit.dataset.sheetEdit === 'notes') {
          document.querySelector('[data-sheet-tab="details"]')?.click();
          window.setTimeout(() => $('#sheet-panel [data-character-notes]')?.focus(), 0);
        } else openSheetEditor(edit.dataset.sheetEdit, { effectType: edit.dataset.effectType, target: edit.dataset.effectTarget, featureId: edit.dataset.featureId, entryKey: edit.dataset.entryKey });
        return;
      }
      const removePerk = event.target.closest('[data-remove-added-perk]');
      if (removePerk) {
        state.addedPerks = state.addedPerks.filter((value) => value !== removePerk.dataset.removeAddedPerk);
        state.customPerks = state.customPerks.filter((perk) => perk.value !== removePerk.dataset.removeAddedPerk);
        delete state.entryEdits?.[`perk:${removePerk.dataset.removeAddedPerk}`];
        refreshSheet();
      }
    });
    $('[data-sheet-editor-close]').addEventListener('click', () => $('#sheet-editor-dialog').close());
    $('[data-sheet-editor-cancel]').addEventListener('click', () => $('#sheet-editor-dialog').close());
    document.addEventListener('input', (event) => {
      if (!$('#builder-validation-notice').hidden && event.target.closest('.character-builder')) validateSheetIdentity(false);
    });
    document.addEventListener('change', (event) => {
      if (!$('#builder-validation-notice').hidden && event.target.closest('.character-builder')) validateSheetIdentity(false);
    });
    document.querySelectorAll('[data-sheet-tab]').forEach((button) => button.addEventListener('click', () => {
      document.querySelectorAll('[data-sheet-tab]').forEach((tab) => tab.setAttribute('aria-selected', String(tab === button)));
      renderSheetPanel(button.dataset.sheetTab);
    }));
    $('#sheet-character-size').addEventListener('change', (event) => { state.size = event.target.value; });
    await Promise.all([appendOptions('race', '../races/index.html'), appendOptions('background', '../backgrounds/index.html'), loadPerks()]);
    renderPerkChoices();
    const imported = sessionStorage.getItem('fable-character-import');
    if (imported) {
      sessionStorage.removeItem('fable-character-import');
      try { await loadImportedCharacter(JSON.parse(imported)); }
      catch (error) { console.error('Unable to open the saved character', error); }
    }
  };
  init();
})();
