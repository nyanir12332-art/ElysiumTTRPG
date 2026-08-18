(() => {
  const browser = document.querySelector('[data-spell-browser]');
  const spells = Array.isArray(window.SPELLS) ? window.SPELLS : [];
  if (!browser || spells.length === 0) return;

  const classFilter = browser.querySelector('[data-spell-class-filter]');
  const schoolFilter = browser.querySelector('[data-spell-school-filter]');
  const searchInput = browser.querySelector('[data-spell-search]');
  const componentFilters = [...browser.querySelectorAll('[data-spell-component]')];
  const tagFilters = [...browser.querySelectorAll('[data-spell-tag]')];
  const levelTabs = [...browser.querySelectorAll('[data-spell-level]')];
  const tbody = browser.querySelector('tbody');
  const emptyRow = browser.querySelector('[data-spell-empty]');
  const classNames = {
    artificer: 'Artificer', bard: 'Bard', cleric: 'Cleric', druid: 'Druid',
    paladin: 'Paladin', ranger: 'Ranger', sorcerer: 'Sorcerer', warlock: 'Warlock', wizard: 'Wizard'
  };
  let selectedLevel = '0';
  let selectedSchool = 'all';

  const escapeHtml = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const renderInline = (value, linkBasicSave = false) => {
    const escaped = escapeHtml(value);
    const withSaveRule = linkBasicSave
      ? escaped.replace(/\b(?:(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma)\s+)?(saving throws?)\b/gi, (_match, ability, savingThrow) => `<a class="spell-rule-reference" href="rules/degrees-of-success.html#basic-saving-throws">basic</a> ${ability ? `${ability} ` : ''}${savingThrow}`)
      : escaped;
    return withSaveRule.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
  };

  const adaptSpellPointTerminology = (value) => String(value || '')
    .replace(/\busing (?:a|an) spell slot of a higher level\b/gi, 'at a higher level')
    .replace(/\busing (?:a|an) spell slot of (\d+(?:st|nd|rd|th)) level\b/gi, 'at $1 level')
    .replace(/\busing a higher level spell slot\b/gi, 'at a higher level')
    .replace(/\buse (?:a|an) spell slot of a higher level\b/gi, 'cast this spell at a higher level')
    .replace(/\buse (?:a|an) spell slot of (\d+(?:st|nd|rd|th)) level\b/gi, 'cast this spell at $1 level')
    .replace(/\b(?:using|with) (?:a|an) (\d+(?:st|nd|rd|th))(?:-level| level) spell slot\b/gi, 'at $1 level')
    .replace(/\buse (?:a|an) (\d+(?:st|nd|rd|th))(?:-level| level) spell slot\b/gi, 'cast this spell at $1 level')
    .replace(/\b(?:using|with) (?:a|an) (\d+(?:st|nd|rd|th))-level slot\b/gi, 'at $1 level')
    .replace(/\busing certain higher-level spell slots\b/gi, 'at certain higher levels')
    .replace(/\bhigher-level spell slots\b/gi, 'higher-level castings')
    .replace(/\b(\d+(?:st|nd|rd|th))-level slots?\b/gi, 'castings at $1 level')
    .replace(/\bspell slot above\b/gi, 'spell level above')
    .replace(/\bslot levels?\b/gi, (match) => match.toLowerCase() === 'slot levels' ? 'spell levels' : 'spell level')
    .replace(/\bthe level of the spell slot you used\b/gi, 'the level at which you cast this spell')
    .replace(/\bthe same level as the spell slot you use\b/gi, 'the same level at which you cast this spell')
    .replace(/\bthe level of the slot you used\b/gi, 'the level at which you cast this spell')
    .replace(/\bthe same level as the slot you use\b/gi, 'the same level at which you cast this spell')
    .replace(/\bspell slots?\b/gi, 'spell points');

  const renderDescription = (paragraphs, linkBasicSave = false) => {
    const markup = [];

    for (let index = 0; index < paragraphs.length; index += 1) {
      const paragraph = paragraphs[index];
      const heading = paragraph.match(/^#{1,6}\s+(.+)$/);

      if (heading) {
        markup.push(`<h3>${renderInline(heading[1], linkBasicSave)}</h3>`);
        continue;
      }

      if (paragraph.startsWith('|')) {
        const rows = [];
        while (index < paragraphs.length && paragraphs[index].startsWith('|')) {
          const cells = paragraphs[index].split('|').slice(1, -1).map((cell) => cell.trim());
          if (!cells.every((cell) => /^:?-{3,}:?$/.test(cell))) rows.push(cells);
          index += 1;
        }
        index -= 1;

        const [header, ...body] = rows;
        if (header) {
          markup.push(`<table><thead><tr>${header.map((cell) => `<th>${renderInline(cell, linkBasicSave)}</th>`).join('')}</tr></thead><tbody>${body.map((row) => `<tr>${row.map((cell) => `<td>${renderInline(cell, linkBasicSave)}</td>`).join('')}</tr>`).join('')}</tbody></table>`);
        }
        continue;
      }

      if (paragraph.startsWith('- ')) {
        const items = [];
        while (index < paragraphs.length && paragraphs[index].startsWith('- ')) {
          items.push(paragraphs[index].slice(2));
          index += 1;
        }
        index -= 1;
        markup.push(`<ul>${items.map((item) => `<li>${renderInline(item, linkBasicSave)}</li>`).join('')}</ul>`);
        continue;
      }

      // Imported spell data represents source lists with bullet markers in a
      // single paragraph. Restore those markers as a real list instead of
      // rendering every item as one long line of text.
      if (paragraph.startsWith('• ') || paragraph.includes('\n• ')) {
        const items = paragraph.split(/(?:^|\n)•\s+/).filter(Boolean);
        markup.push(`<ul>${items.map((item) => `<li>${renderInline(item.trim(), linkBasicSave)}</li>`).join('')}</ul>`);
        continue;
      }

      const numbered = paragraph.split(/(?:^|\n)\s*\d+[.)]\s+/).filter(Boolean);
      if (numbered.length > 1) {
        markup.push(`<ol>${numbered.map((item) => `<li>${renderInline(item.trim(), linkBasicSave)}</li>`).join('')}</ol>`);
        continue;
      }

      if (paragraph.includes('\n')) {
        markup.push(paragraph.split(/\n+/).filter(Boolean).map((line) => `<p>${renderInline(line.trim(), linkBasicSave)}</p>`).join(''));
        continue;
      }

      markup.push(`<p>${renderInline(paragraph, linkBasicSave)}</p>`);
    }

    return markup.join('');
  };

  const ordinal = (value) => ({
    0: 'Cantrip', 1: '1st', 2: '2nd', 3: '3rd', 4: '4th', 5: '5th',
    6: '6th', 7: '7th', 8: '8th', 9: '9th'
  }[value] || value);

  const labelClasses = (classes) => classes.map((item) => classNames[item] || item).join(', ');

  const setActiveLevel = (level) => {
    selectedLevel = String(level);
    levelTabs.forEach((tab) => {
      const active = tab.dataset.spellLevel === selectedLevel;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });
  };

  const setActiveSchool = (school) => {
    selectedSchool = school;
    schoolFilter.value = school;
  };

  const searchScore = (spell, query) => {
    const name = spell.name.toLowerCase();
    if (name === query) return 0;
    if (name.startsWith(query)) return 1;
    if (name.includes(query)) return 2;
    const summary = [spell.school, spell.castingTime, spell.range, spell.duration, spell.components, ...spell.classes].join(' ').toLowerCase();
    if (summary.includes(query)) return 3;
    return 4;
  };

  const matchingSpells = () => {
    const query = searchInput.value.trim().toLowerCase();

    if (query) {
      return spells
        .filter((spell) => [spell.name, spell.school, spell.castingTime, spell.range, spell.duration, spell.components, ...spell.classes, ...spell.description, ...spell.higherLevel.filter(Boolean)].join(' ').toLowerCase().includes(query))
        .sort((left, right) => searchScore(left, query) - searchScore(right, query) || left.name.localeCompare(right.name));
    }

    return spells
      .filter((spell) => String(spell.level) === selectedLevel)
      .filter((spell) => selectedSchool === 'all' || spell.school === selectedSchool)
      .filter((spell) => classFilter.value === 'all' || spell.classes.includes(classFilter.value))
      .filter((spell) => componentFilters.filter((input) => input.checked).every((input) => spell.components.includes(input.dataset.spellComponent)))
      .filter((spell) => tagFilters.filter((input) => input.checked).every((input) => Boolean(spell[input.dataset.spellTag])))
      .sort((left, right) => left.name.localeCompare(right.name));
  };

  const detailMarkup = (spell) => {
    const traits = [spell.ritual ? 'Ritual' : '', spell.concentration ? 'Concentration' : ''].filter(Boolean);
    const linkBasicSave = /\b(?:damage|damages|damaging|takes?\s+\d|deals?\s+\d|suffers?\s+\d)\b/i.test(spell.description.join(' '));
    const paragraphs = renderDescription(spell.description.map(adaptSpellPointTerminology), linkBasicSave);
    const higherLevelText = adaptSpellPointTerminology(spell.higherLevel.filter(Boolean).join(' '));
    const higherLevel = higherLevelText
      ? `<p><strong>At Higher Levels.</strong> ${renderInline(higherLevelText, linkBasicSave)}</p>`
      : '';
    return `<tr class="spell-browser__detail" data-spell-detail="${escapeHtml(spell.id)}" hidden>
      <td colspan="4">
        <div class="spell-browser__detail-copy">
          <dl>
            <div><dt>Level</dt><dd>${ordinal(spell.level)} ${escapeHtml(spell.school)}</dd></div>
            <div><dt>Class Lists</dt><dd>${escapeHtml(labelClasses(spell.classes))}</dd></div>
            <div><dt>Components</dt><dd>${escapeHtml(spell.components)}</dd></div>
            <div><dt>Range</dt><dd>${escapeHtml(spell.range)}</dd></div>
          </dl>
          ${paragraphs}${higherLevel}${traits.length ? `<dl class="spell-browser__tags"><div><dt>Tags</dt><dd>${escapeHtml(traits.join(', '))}</dd></div></dl>` : ''}
        </div>
      </td>
    </tr>`;
  };

  const renderRows = () => {
    tbody.querySelectorAll('[data-spell-row], [data-spell-detail]').forEach((row) => row.remove());
    const matching = matchingSpells();
    const markup = matching.map((spell) => `<tr data-spell-row="${escapeHtml(spell.id)}">
      <td><button class="spell-browser__toggle" type="button" data-spell-toggle="${escapeHtml(spell.id)}" aria-expanded="false"><span aria-hidden="true">+</span>${escapeHtml(spell.name)}</button></td>
      <td>${escapeHtml(spell.school)}</td>
      <td>${escapeHtml(spell.castingTime)}</td>
      <td>${escapeHtml(spell.duration)}</td>
    </tr>${detailMarkup(spell)}`).join('');
    emptyRow.hidden = matching.length > 0;
    if (matching.length === 0) {
      const query = searchInput.value.trim();
      const className = classFilter.options[classFilter.selectedIndex].text;
      emptyRow.cells[0].textContent = query
        ? `No spells match "${query}".`
        : `No ${ordinal(selectedLevel).toLowerCase()} ${selectedSchool === 'all' ? '' : `${selectedSchool.toLowerCase()} `}spells are available for ${className}.`;
      return;
    }
    emptyRow.insertAdjacentHTML('beforebegin', markup);
  };

  const openSpell = (id, shouldScroll = false) => {
    const spell = spells.find((entry) => entry.id === id);
    if (!spell) return;
    setActiveLevel(spell.level);
    setActiveSchool('all');
    searchInput.value = '';
    if (classFilter.value !== 'all' && !spell.classes.includes(classFilter.value)) classFilter.value = 'all';
    renderRows();
    const toggle = browser.querySelector(`[data-spell-toggle="${CSS.escape(id)}"]`);
    const detail = browser.querySelector(`[data-spell-detail="${CSS.escape(id)}"]`);
    if (!toggle || !detail) return;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.querySelector('span').textContent = '-';
    detail.hidden = false;
    if (shouldScroll) window.setTimeout(() => toggle.scrollIntoView({ block: 'center', behavior: 'smooth' }), 0);
  };

  [...classFilter.options].forEach((option) => {
    if (option.value !== 'all') option.hidden = !spells.some((spell) => spell.classes.includes(option.value));
  });

  levelTabs.forEach((tab) => tab.addEventListener('click', () => {
    setActiveLevel(tab.dataset.spellLevel);
    renderRows();
  }));

  schoolFilter.addEventListener('change', () => {
    setActiveSchool(schoolFilter.value);
    renderRows();
  });

  classFilter.addEventListener('change', renderRows);
  searchInput.addEventListener('input', renderRows);
  componentFilters.forEach((input) => input.addEventListener('change', renderRows));
  tagFilters.forEach((input) => input.addEventListener('change', renderRows));
  tbody.addEventListener('click', (event) => {
    const row = event.target.closest('[data-spell-row]');
    if (!row || !tbody.contains(row)) return;
    const toggle = row.querySelector('[data-spell-toggle]');
    if (!toggle) return;
    const detail = browser.querySelector(`[data-spell-detail="${CSS.escape(toggle.dataset.spellToggle)}"]`);
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    toggle.querySelector('span').textContent = expanded ? '+' : '-';
    detail.hidden = expanded;
  });

  renderRows();
  const spellParameters = new URLSearchParams(window.location.search);
  const linkedSearch = spellParameters.get('search');
  const linkedClass = spellParameters.get('class');
  const linkedSpell = spellParameters.get('spell');
  if (linkedSearch) {
    searchInput.value = linkedSearch;
    renderRows();
  } else if (linkedClass && [...classFilter.options].some((option) => option.value === linkedClass)) {
    classFilter.value = linkedClass;
    renderRows();
  } else if (linkedSpell) {
    openSpell(linkedSpell, true);
  }
})();
