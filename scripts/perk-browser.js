(() => {
  const browser = document.querySelector('[data-perk-browser]');
  const perks = Array.isArray(window.PERKS) ? window.PERKS : [];
  const spellManifest = Array.isArray(window.SPELL_MANIFEST) ? window.SPELL_MANIFEST : [];

  if (!browser || perks.length === 0) return;

  const searchInput = browser.querySelector('[data-perk-search]');
  const typeButtons = [...browser.querySelectorAll('[data-perk-type]')];
  let selectedType = 'all';
  const tbody = browser.querySelector('tbody');
  const emptyRow = browser.querySelector('[data-perk-empty]');
  const perkById = new Map(perks.map((perk) => [perk.id, perk]));
  const requirementNames = [...perks]
    .sort((left, right) => right.name.length - left.name.length)
    .map((perk) => perk.name);
  const requirementAliases = [...new Set(perks
    .reduce((fragments, perk) => fragments.concat(perk.requirements.split(',')), [])
    .map((requirement) => requirement
      .replace(/^\s*\d+\s+/, '')
      .replace(/\s+perks\s*$/i, '')
      .trim())
    .filter((requirement) => requirement && !perks.some((perk) => perk.name.toLowerCase() === requirement.toLowerCase()))
    .map((requirement) => {
      const target = perks.find((perk) => perk.name.toLowerCase() === `${requirement}er`.toLowerCase());
      return target ? { text: requirement, target } : null;
    })
    .filter(Boolean))];
  const perkCategoryNames = [...new Set(perks
    .map((perk) => perk.requirements.match(/(?:^|,)\s*(?:\d+\s+)?([^,]+?)\s+perks\b/i))
    .filter(Boolean)
    .map((match) => match[1].trim()))]
    .sort((left, right) => right.length - left.length);
  const featCategoryNames = [...new Set(perks
    .map((perk) => perk.requirements.match(/(?:^|,)\s*(?:\d+\s+)?([^,]+?)\s+feats\b/i))
    .filter(Boolean)
    .map((match) => match[1].trim()))]
    .sort((left, right) => right.length - left.length);
  const categoryNames = new Set([...perkCategoryNames, ...featCategoryNames].map((name) => name.toLowerCase()));
  const requirementSearchNames = [...new Set(perks
    .reduce((fragments, perk) => fragments.concat(perk.requirements.split(/[,/]/)), [])
    .map((requirement) => requirement
      .replace(/^\s*\d+\s+/, '')
      .replace(/\s+(?:perks|feats)\s*$/i, '')
      .trim())
    .filter((requirement) => requirement
      && !requirementNames.some((name) => name.toLowerCase() === requirement.toLowerCase())
      && !requirementAliases.some((alias) => alias.text.toLowerCase() === requirement.toLowerCase())
      && !categoryNames.has(requirement.toLowerCase())
      && !/(?:spellcasting|pact magic|\bfeature\b|\bproficiency\b)/i.test(requirement)))]
    .sort((left, right) => right.length - left.length);
  const dependentsById = new Map(perks.map((perk) => [perk.id, []]));

  // A dependency must be an exact requirement fragment.  Substring matching
  // would incorrectly make "Break" match "Concentration Breaker".
  const normalizedRequirementFragments = (requirements) => requirements
    .split(/[,/]/)
    .map((requirement) => requirement
      .replace(/^\s*\d+\s+/, '')
      .replace(/\s+(?:perks|feats)\s*$/i, '')
      .trim()
      .toLowerCase())
    .filter(Boolean);

  const perkGroupRequirements = (requirements) => requirements
    .split(/[,/]/)
    .map((requirement) => requirement.trim().match(/^(?:\d+\s+)?(.+?)\s+(?:perks|feats)$/i))
    .filter(Boolean)
    .map((match) => match[1].trim().toLowerCase());

  const words = (value) => value
    .toLowerCase()
    .replace(/[’']/g, ' ')
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

  const containsWordSequence = (value, sequence) => {
    const valueWords = words(value);
    const sequenceWords = words(sequence);
    return sequenceWords.length > 0 && valueWords.some((_, index) =>
      sequenceWords.every((word, offset) => valueWords[index + offset] === word));
  };

  perks.forEach((perk) => {
    const requirements = normalizedRequirementFragments(perk.requirements);
    perks.forEach((candidate) => {
      if (candidate.id !== perk.id && requirements.includes(candidate.name.toLowerCase())) {
        dependentsById.get(candidate.id).push(perk);
      }
    });

    // A requirement such as "2 Cartomancer perks" applies to any two perks
    // in that named group, so expose it from each qualifying perk as well.
    perkGroupRequirements(perk.requirements).forEach((group) => {
      perks.forEach((candidate) => {
        if (candidate.id !== perk.id
          && containsWordSequence(candidate.name, group)
          && !dependentsById.get(candidate.id).includes(perk)) {
          dependentsById.get(candidate.id).push(perk);
        }
      });
    });
  });

  const perkByName = new Map(perks.map((perk) => [perk.name.toLowerCase(), perk]));
  const dependencyInfo = new Map(perks.map((perk) => {
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
      const target = perkByName.get(normalized) || perkByName.get(`${normalized}er`);
      if (target && target.id !== perk.id && !named.includes(target)) named.push(target);
    });
    return [perk.id, { named, groups }];
  }));

  const curseIds = new Set(perks
    .filter((perk) => /\bCurse$/i.test(perk.name) || /\bcurse perks\b/i.test(perk.requirements))
    .map((perk) => perk.id));
  let addedCurse = true;
  while (addedCurse) {
    addedCurse = false;
    perks.forEach((perk) => {
      if (!curseIds.has(perk.id) && dependencyInfo.get(perk.id).named.some((parent) => curseIds.has(parent.id))) {
        curseIds.add(perk.id);
        addedCurse = true;
      }
    });
  }

  const rootCache = new Map();
  const lineRoots = (perk, visiting = new Set()) => {
    if (rootCache.has(perk.id)) return rootCache.get(perk.id);
    if (visiting.has(perk.id)) return new Set([perk.id]);
    const nextVisiting = new Set(visiting).add(perk.id);
    const info = dependencyInfo.get(perk.id);
    const parents = info.named.filter((parent) => !curseIds.has(parent.id));
    const roots = new Set();
    parents.forEach((parent) => lineRoots(parent, nextVisiting).forEach((root) => roots.add(root)));
    info.groups.forEach((group) => {
      const groupRoots = perks.filter((candidate) => {
        const candidateInfo = dependencyInfo.get(candidate.id);
        return !curseIds.has(candidate.id) && candidateInfo.named.length === 0
          && candidateInfo.groups.length === 0 && containsWordSequence(candidate.name, group);
      });
      if (groupRoots.length) groupRoots.forEach((root) => roots.add(root.id));
      else roots.add(`group:${group}`);
    });
    if (roots.size === 0) roots.add(perk.id);
    rootCache.set(perk.id, roots);
    return roots;
  };

  const perkTypeById = new Map(perks.map((perk) => {
    if (curseIds.has(perk.id)) return [perk.id, 'curse'];
    const info = dependencyInfo.get(perk.id);
    if (info.named.length === 0 && info.groups.length === 0) return [perk.id, 'primary'];
    // A numbered group requirement (for example, "2 Athlete perks") always
    // stays within one named perk line and is therefore a Branch perk.
    if (info.named.length === 0 && info.groups.length === 1) return [perk.id, 'branch'];
    return [perk.id, lineRoots(perk).size > 1 ? 'fusion' : 'branch'];
  }));
  const perkTypes = [
    { id: 'primary', label: 'Primary Perks' },
    { id: 'branch', label: 'Branch Perks' },
    { id: 'fusion', label: 'Fusion Perks' },
    { id: 'curse', label: 'Curse Perks' }
  ];

  const escapeHtml = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const magicSchools = [
    'Abjuration', 'Conjuration', 'Divination', 'Enchantment',
    'Evocation', 'Illusion', 'Necromancy', 'Transmutation'
  ];
  const featureReferences = [
    { name: 'Wild Shape', href: '../classes/druid.html#wild-shape' },
    { name: 'Sneak Attack', href: '../classes/rogue.html#sneak-attack' }
  ];
  const spellByName = new Map(spellManifest.map((spell) => [spell.name.toLowerCase(), spell]));
  const featureByName = new Map(featureReferences.map((feature) => [feature.name.toLowerCase(), feature]));
  const referenceCandidates = [...spellByName.keys(), ...magicSchools.map((school) => school.toLowerCase()), ...featureByName.keys()]
    .sort((left, right) => right.length - left.length);
  const referencePattern = referenceCandidates.length
    ? new RegExp(`\\b(${referenceCandidates.map(escapeRegExp).join('|')})\\b`, 'gi')
    : null;

  const spellHref = (spell) => `../systems/spellcasting.html?spell=${encodeURIComponent(spell.id)}`;
  const schoolHref = (school) => `../systems/spellcasting.html?school=${encodeURIComponent(school)}`;

  // One-word spell names frequently overlap with ordinary prose. Match the
  // site-wide spell linker by requiring nearby spell-specific language.
  const shouldLinkSpell = (text, matched, offset) => {
    if (matched.includes(' ')) return true;
    const before = text.slice(Math.max(0, offset - 48), offset);
    const after = text.slice(offset + matched.length, Math.min(text.length, offset + matched.length + 48));
    return new RegExp(`(?:\\b(?:cast|casts|casting|prepare|prepared|learn|known|choose|select|use|using)\\s+(?:the\\s+)?|\\b(?:the\\s+)?(?:spell|cantrip)\\s+(?:named\\s+)?$)`, 'i').test(before)
      || /^\\s+(?:spell|cantrip)\\b/i.test(after)
      || /^\\s+(?:spell|cantrip)\\s+(?:of|from)\\b/i.test(after);
  };

  const renderReferenceLinks = (value) => {
    const text = String(value || '');
    if (!referencePattern) return escapeHtml(text);

    let output = '';
    let cursor = 0;
    text.replace(referencePattern, (matched, _capture, offset) => {
      const lookup = matched.toLowerCase();
      const spell = spellByName.get(lookup);
      const school = magicSchools.find((entry) => entry.toLowerCase() === lookup);
      const feature = featureByName.get(lookup);
      output += escapeHtml(text.slice(cursor, offset));
      if (spell && shouldLinkSpell(text, matched, offset)) {
        output += `<a class="spell-reference perk-browser__reference" data-spell-reference="${escapeHtml(spell.id)}" href="${spellHref(spell)}">${escapeHtml(spell.name)}</a>`;
      } else if (school) {
        output += `<a class="spell-reference perk-browser__reference" data-spell-school-reference="${escapeHtml(school)}" href="${schoolHref(school)}">${escapeHtml(school)}</a>`;
      } else if (feature) {
        output += `<a class="perk-browser__reference" href="${feature.href}">${escapeHtml(feature.name)}</a>`;
      } else {
        output += escapeHtml(matched);
      }
      cursor = offset + matched.length;
      return matched;
    });
    return output + escapeHtml(text.slice(cursor));
  };

  const renderText = (value) => renderReferenceLinks(value).replace(/\r?\n/g, '<br>');
  const abilityGrid = (values) => `<span class="ability-grid">${values.map((value) => `<span>${escapeHtml(value)}</span>`).join('')}</span>`;

  const renderServoStatBlock = (description) => {
    const normalizedDescription = String(description)
      .split(String.fromCharCode(92) + 'n').join('\n')
      .replace(/\r\n/g, '\n');
    const marker = 'Servo\nTiny construct, unaligned\n';
    const markerIndex = normalizedDescription.lastIndexOf(marker);
    if (markerIndex === -1) return null;

    const intro = normalizedDescription.slice(0, markerIndex).trim();
    const lines = normalizedDescription.slice(markerIndex).split(/\r?\n/);
    const [name, subtitle, armorClass, hitPoints, speed, abilityNames, abilityScores,
      damageImmunities, conditionImmunities, senses, languages, challenge, actionHeading,
      ...actionLines] = lines;
    const abilityHeaders = abilityNames.trim().split(/\s+/);
    const abilityValues = abilityScores.trim().split(/\s{2,}/);
    const labelledRow = (label, value) => `<tr><th scope="row">${escapeHtml(label.replace(/:$/, ''))}</th><td>${escapeHtml(value.replace(/^\s*[^:]+:\s*/, ''))}</td></tr>`;
    const actionText = actionLines.join(' ').trim();
    const actionMatch = actionText.match(/^([^.:]+)\.\s*(.*)$/);
    const actionName = actionMatch ? actionMatch[1] : actionText;
    const actionDescription = actionMatch ? actionMatch[2] : '';

    const statBlock = `<table class="stat-block perk-browser__stat-block">
      <caption>${escapeHtml(name)}</caption>
      <tbody>
        <tr><th colspan="2" class="stat-section">${escapeHtml(subtitle)}</th></tr>
        ${labelledRow('Armor Class', armorClass)}
        ${labelledRow('Hit Points', hitPoints)}
        ${labelledRow('Speed', speed)}
        <tr class="ability-header"><th colspan="2">${abilityGrid(abilityHeaders)}</th></tr>
        <tr><th colspan="2">${abilityGrid(abilityValues)}</th></tr>
        ${labelledRow('Damage Immunities', damageImmunities)}
        ${labelledRow('Condition Immunities', conditionImmunities)}
        ${labelledRow('Senses', senses)}
        ${labelledRow('Languages', languages)}
        ${labelledRow('Challenge', challenge)}
        <tr><th colspan="2" class="stat-section">${escapeHtml(actionHeading)}</th></tr>
        <tr><th scope="row">${escapeHtml(actionName)}</th><td>${escapeHtml(actionDescription)}</td></tr>
      </tbody>
    </table>`;

    return `${intro ? `<p>${renderText(intro)}</p>` : ''}${statBlock}`;
  };

  const renderAnimalStatBlock = (description) => {
    const normalized = String(description).replace(/\\n/g, '\n').replace(/\r\n/g, '\n');
    const markerMatch = normalized.match(/\n(Fox|Bat)\nTiny beast, unaligned\n/);
    if (!markerMatch) return null;

    const intro = normalized.slice(0, markerMatch.index).trim();
    const lines = normalized.slice(markerMatch.index + 1).split('\n');
    const [name, subtitle, armorClass, hitPoints, speed, abilities, ...remaining] = lines;
    const actionsIndex = remaining.indexOf('Actions');
    const detailLines = actionsIndex === -1 ? remaining : remaining.slice(0, actionsIndex);
    const actionLines = actionsIndex === -1 ? [] : remaining.slice(actionsIndex + 1);
    const labelledRow = (line) => {
      const separator = line.indexOf(' ');
      const label = separator === -1 ? line : line.slice(0, separator);
      const value = separator === -1 ? '' : line.slice(separator + 1);
      return `<tr><th scope="row">${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`;
    };
    const traits = detailLines.filter((line) => !/^(Skills|Senses|Languages|Challenge)\b/.test(line));
    const details = detailLines.filter((line) => /^(Skills|Senses|Languages|Challenge)\b/.test(line));
    const actionRows = actionLines.map((line) => {
      const split = line.indexOf('. ');
      const label = split === -1 ? line : line.slice(0, split + 1);
      const value = split === -1 ? '' : line.slice(split + 2);
      return `<tr><th scope="row">${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`;
    }).join('');

    return `${intro ? `<p>${renderText(intro)}</p>` : ''}<table class="stat-block perk-browser__stat-block">
      <caption>${escapeHtml(name)}</caption><tbody>
        <tr><th colspan="2" class="stat-section">${escapeHtml(subtitle)}</th></tr>
        ${labelledRow(armorClass)}${labelledRow(hitPoints)}${labelledRow(speed)}
        <tr class="ability-header"><th colspan="2">${abilityGrid(['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'])}</th></tr>
        <tr><th colspan="2">${abilityGrid(abilities.match(/(?:STR|DEX|CON|INT|WIS|CHA)\s+\d+\s+\([^)]+\)/g) || [abilities])}</th></tr>
        ${details.map(labelledRow).join('')}
        ${traits.length ? `<tr><th colspan="2" class="stat-section">Traits</th></tr>${traits.map((line) => { const split = line.indexOf('. '); return `<tr><th scope="row">${escapeHtml(split === -1 ? line : line.slice(0, split + 1))}</th><td>${escapeHtml(split === -1 ? '' : line.slice(split + 2))}</td></tr>`; }).join('')}` : ''}
        <tr><th colspan="2" class="stat-section">Actions</th></tr>${actionRows}
      </tbody></table>`;
  };

  const renderDescription = (description) => renderAnimalStatBlock(description)
    || renderServoStatBlock(description)
    || `<p>${renderText(description)}</p>`;

  const perkHref = (perk) => `?search=${encodeURIComponent(perk.name)}&perk=${encodeURIComponent(perk.id)}`;
  const searchHref = (query) => `?search=${encodeURIComponent(query)}`;

  const perkLink = (perk) => `<a class="perk-browser__reference" href="${perkHref(perk)}">${escapeHtml(perk.name)}</a>`;
  const searchLink = (label, query) => `<a class="perk-browser__reference" href="${searchHref(query)}">${escapeHtml(label)}</a>`;

  const renderRequirementLinks = (value) => {
    if (!value) return '';

    const raceRequirement = value.match(/^(Be one of the following races:\s*)(.+?)(,\s*does not have\s+(?:Giant Blood|Broonie Blood))$/i);
    if (raceRequirement) {
      const racePaths = {
        changeling: 'changeling.html', goliath: 'goliath.html', minotaur: 'minotaur.html', dragonborn: 'dragonborn.html',
        orc: 'orc.html', tortle: 'tortle.html', warforged: 'warforged.html', centaur: 'centaur.html', gnome: 'gnome.html',
        grung: 'grung.html', lizardfolk: 'lizardfolk.html', harengon: 'harengon.html', locathah: 'locathah.html'
      };
      const races = raceRequirement[2].split(',').map((race) => race.trim());
      return `${escapeHtml(raceRequirement[1])}${races.map((race) => {
        const path = racePaths[race.toLowerCase()];
        return path ? `<a class="perk-browser__reference" href="../races/${path}">${escapeHtml(race)}</a>` : escapeHtml(race);
      }).join(', ')}${escapeHtml(raceRequirement[3])}`;
    }

    const curseRequirement = value.match(/^No other curse perks\b/i);
    if (curseRequirement) {
      const remainder = value.slice(curseRequirement[0].length);
      return `No other ${searchLink('Curse', 'Curse')} perks${renderText(remainder)}`;
    }

    const linkCandidates = [
      ...requirementNames.map((name) => ({ text: name, query: null })),
      ...requirementAliases.map((alias) => ({ text: alias.text, query: null, target: alias.target })),
      ...perkCategoryNames.map((name) => ({ text: `${name} perks`, query: name })),
      ...featCategoryNames.map((name) => ({ text: `${name} feats`, query: name })),
      ...requirementSearchNames.map((name) => ({ text: name, query: name }))
    ].sort((left, right) => right.text.length - left.text.length);
    const names = linkCandidates.map((candidate) => escapeRegExp(candidate.text)).join('|');
    if (!names) return renderText(value);

    const matcher = new RegExp(names, 'gi');
    const matches = [];
    let match;
    while ((match = matcher.exec(value)) !== null) {
      matches.push(match);
    }
    if (matches.length === 0) return renderText(value);

    let output = '';
    let cursor = 0;
    matches.forEach((match) => {
      const candidate = linkCandidates.find((item) => item.text.toLowerCase() === match[0].toLowerCase());
      const target = candidate && candidate.target
        ? candidate.target
        : perks.find((perk) => perk.name.toLowerCase() === match[0].toLowerCase());
      if (!target && !candidate) return;
      output += renderText(value.slice(cursor, match.index));
      output += target ? perkLink(target) : searchLink(match[0], candidate.query);
      cursor = match.index + match[0].length;
    });
    return output + renderText(value.slice(cursor));
  };

  const searchScore = (perk, query) => {
    const name = perk.name.toLowerCase();
    const requirements = perk.requirements.toLowerCase();
    const description = perk.description.toLowerCase();

    if (name === query) return 0;
    if (name.startsWith(query)) return 1;
    if (name.includes(query)) return 2;
    if (requirements.includes(query)) return 3;
    if (description.includes(query)) return 4;
    return 5;
  };

  const matchingPerks = () => {
    const query = searchInput.value.trim().toLowerCase();
    let matching = perks.slice();

    if (selectedType !== 'all') {
      matching = matching.filter((perk) => perkTypeById.get(perk.id) === selectedType);
    }

    if (query) {
      matching = matching.filter((perk) => [perk.name, perk.requirements, perk.description]
        .join(' ')
        .toLowerCase()
        .includes(query));
      matching.sort((left, right) => searchScore(left, query) - searchScore(right, query)
        || left.name.localeCompare(right.name));
    } else {
      matching.sort((left, right) => left.name.localeCompare(right.name));
    }

    return matching;
  };

  const detailMarkup = (perk) => {
    const dependents = dependentsById.get(perk.id) || [];
    const requiredBy = dependents.length
      ? `<p class="perk-browser__related"><strong>Required by.</strong> ${dependents.map(perkLink).join(', ')}</p>`
      : '';

    return `<tr class="perk-browser__detail" data-perk-detail="${escapeHtml(perk.id)}" hidden>
      <td colspan="3">
        <div class="perk-browser__detail-copy">
          ${renderDescription(perk.description)}
          ${requiredBy}
        </div>
      </td>
    </tr>`;
  };

  const renderRows = () => {
    tbody.querySelectorAll('[data-perk-row], [data-perk-detail]').forEach((row) => row.remove());
    const matching = matchingPerks();

    emptyRow.hidden = matching.length > 0;
    if (matching.length === 0) {
      const query = searchInput.value.trim();
      emptyRow.cells[0].textContent = query
        ? `No perks match "${query}".`
        : 'No perks match the selected filter.';
      return;
    }

    const markup = matching.map((perk) => {
      const type = perkTypes.find((entry) => entry.id === perkTypeById.get(perk.id));
      return `<tr data-perk-row="${escapeHtml(perk.id)}">
        <td><button class="perk-browser__toggle" type="button" data-perk-toggle="${escapeHtml(perk.id)}" aria-expanded="false"><span aria-hidden="true">+</span>${escapeHtml(perk.name)}</button></td>
        <td><span class="perk-browser__type perk-browser__type--${type.id}">${escapeHtml(type.label.replace(/ Perks$/, ''))}</span></td>
        <td>${perk.requirements.trim() ? renderRequirementLinks(perk.requirements) : '&mdash;'}</td>
      </tr>${detailMarkup(perk)}`;
    }).join('');

    emptyRow.insertAdjacentHTML('beforebegin', markup);
  };

  const togglePerk = (row) => {
    const toggle = row.querySelector('[data-perk-toggle]');
    if (!toggle) return;

    const detail = browser.querySelector(`[data-perk-detail="${CSS.escape(toggle.dataset.perkToggle)}"]`);
    if (!detail) return;

    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    toggle.querySelector('span').textContent = expanded ? '+' : '-';
    detail.hidden = expanded;
  };

  const openPerk = (id) => {
    const row = browser.querySelector(`[data-perk-row="${CSS.escape(id)}"]`);
    if (!row) return;
    const toggle = row.querySelector('[data-perk-toggle]');
    if (!toggle || toggle.getAttribute('aria-expanded') !== 'true') togglePerk(row);
    row.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };

  searchInput.addEventListener('input', renderRows);
  typeButtons.forEach((button) => button.addEventListener('click', () => {
    selectedType = button.dataset.perkType;
    typeButtons.forEach((candidate) => candidate.setAttribute('aria-pressed', String(candidate === button)));
    renderRows();
  }));
  tbody.addEventListener('click', (event) => {
    const row = event.target.closest('[data-perk-row]');
    if (row && tbody.contains(row)) togglePerk(row);
  });

  renderRows();

  const parameters = new URLSearchParams(window.location.search);
  const linkedSearch = parameters.get('search');
  const linkedPerk = parameters.get('perk');
  const targetPerk = linkedPerk ? perkById.get(linkedPerk) : null;
  if (linkedSearch || targetPerk) {
    selectedType = 'all';
    typeButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.perkType === 'all')));
    searchInput.value = linkedSearch || targetPerk.name;
    renderRows();
    if (targetPerk) openPerk(targetPerk.id);
  }
})();
