(() => {
  const browser = document.querySelector('[data-discipline-browser]');
  const disciplines = Array.isArray(window.PSIONIC_DISCIPLINES) ? window.PSIONIC_DISCIPLINES : [];
  if (!browser || !disciplines.length) return;

  const groups = ['Avatar', 'Awakened', 'Immortal', 'Nomad', 'Wu Jen'];
  const orderTabs = browser.querySelector('[data-discipline-orders]');
  const disciplineTabs = browser.querySelector('[data-discipline-tabs]');
  const introduction = browser.querySelector('[data-discipline-introduction]');
  const catalogBody = browser.querySelector('[data-discipline-catalog]');
  let selectedGroup = groups[0];
  let selectedDiscipline = null;

  const splitAbilityTitle = (title) => {
    const match = String(title).match(/^(.*?)\s*\(([^)]+)\)\.?$/);
    return match ? { name: match[1].trim(), cost: match[2].trim() } : { name: title, cost: '—' };
  };

  const abilityMetadata = (title) => {
    if (String(title).trim() === 'Bestial Transformation.') {
      return { name: 'Bestial Transformation', cost: 'Varies', tags: [], duration: '1 hour' };
    }
    if (!/\([^)]+\)\.?$/.test(String(title).trim())) {
      return { name: String(title).replace(/\.$/, ''), cost: '—', tags: [], duration: '—' };
    }
    const { name, cost: encodedCost } = splitAbilityTitle(title);
    const parts = encodedCost.split(';').map((part) => part.trim()).filter(Boolean);
    const cost = parts.shift() || '—';
    const concentrationIndex = parts.findIndex((part) => /^conc\.?$/i.test(part));
    const concentration = concentrationIndex !== -1;
    if (concentration) parts.splice(concentrationIndex, 1);
    return { name, cost, tags: concentration ? ['Concentration'] : [], duration: parts.join('; ') || '—' };
  };

  const formatDuration = (duration) => {
    const value = String(duration);
    if (!/\d/.test(value)) return '-';
    return value
      .replace(/\b1 min\./i, '1 minute')
      .replace(/\b(\d+) min\./i, '$1 minutes')
      .replace(/\b1 hr\./i, '1 hour')
      .replace(/\b(\d+) hr\./i, '$1 hours');
  };

  const clearExpandedAbility = () => {
    catalogBody.querySelectorAll('.discipline-browser__detail-row').forEach((row) => row.remove());
    catalogBody.querySelectorAll('.discipline-choice[aria-expanded="true"]')
      .forEach((button) => {
        button.setAttribute('aria-expanded', 'false');
        button.querySelector('[aria-hidden="true"]').textContent = '+';
      });
  };

  const showAbility = (ability, metadata, button) => {
    const sourceRow = button.closest('tr');
    const existingDetail = sourceRow?.nextElementSibling;
    if (!sourceRow) return;
    if (existingDetail?.classList.contains('discipline-browser__detail-row')) {
      clearExpandedAbility();
      return;
    }

    clearExpandedAbility();
    button.setAttribute('aria-expanded', 'true');
    button.querySelector('[aria-hidden="true"]').textContent = '−';
    const detailRow = document.createElement('tr');
    detailRow.className = 'discipline-browser__detail-row';
    const tags = metadata.tags.length
      ? `<dl class="discipline-browser__tags"><div><dt>Tags</dt><dd>${metadata.tags.join(', ')}</dd></div></dl>`
      : '';
    detailRow.innerHTML = `<td colspan="3"><div class="discipline-browser__detail-copy">${ability.content}${tags}</div></td>`;
    sourceRow.insertAdjacentElement('afterend', detailRow);
  };

  const renderCatalog = () => {
    clearExpandedAbility();
    introduction.innerHTML = selectedDiscipline.introduction;
    catalogBody.replaceChildren();
    selectedDiscipline.abilities.forEach((ability) => {
      const metadata = abilityMetadata(ability.title);
      const { name, cost, tags, duration } = metadata;
      const row = document.createElement('tr');
      const nameCell = document.createElement('td');
      const button = document.createElement('button');
      button.className = 'discipline-choice';
      button.type = 'button';
      button.innerHTML = `<span aria-hidden="true">+</span>${name}`;
      button.setAttribute('aria-expanded', 'false');
      button.addEventListener('click', () => showAbility(ability, metadata, button));
      nameCell.appendChild(button);
      const costCell = document.createElement('td');
      costCell.textContent = cost;
      const tagsCell = document.createElement('td');
      if (tags.length) {
        tags.forEach((tag) => {
          const badge = document.createElement('span');
          badge.className = 'discipline-browser__tag';
          badge.textContent = tag;
          tagsCell.appendChild(badge);
        });
      } else {
        tagsCell.textContent = '—';
      }
      const durationCell = document.createElement('td');
      durationCell.textContent = formatDuration(duration);
      row.append(nameCell, costCell, durationCell);
      catalogBody.appendChild(row);
    });
  };

  const renderDisciplineTabs = () => {
    const options = disciplines.filter((discipline) => discipline.group === selectedGroup);
    selectedDiscipline = options.find((discipline) => discipline.title === selectedDiscipline?.title) || options[0];
    disciplineTabs.replaceChildren();
    options.forEach((discipline) => {
      const button = document.createElement('button');
      button.className = 'discipline-browser__discipline-tab';
      button.type = 'button';
      button.textContent = discipline.title;
      const selected = discipline === selectedDiscipline;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-pressed', String(selected));
      button.addEventListener('click', () => {
        selectedDiscipline = discipline;
        renderDisciplineTabs();
        renderCatalog();
      });
      disciplineTabs.appendChild(button);
    });
    renderCatalog();
  };

  groups.forEach((group) => {
    const button = document.createElement('button');
    button.className = 'lore-tab';
    button.type = 'button';
    button.textContent = group;
    const selected = group === selectedGroup;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-selected', String(selected));
    button.addEventListener('click', () => {
      selectedGroup = group;
      selectedDiscipline = null;
      orderTabs.querySelectorAll('.lore-tab').forEach((tab) => {
        const active = tab === button;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', String(active));
      });
      renderDisciplineTabs();
    });
    orderTabs.appendChild(button);
  });

  renderDisciplineTabs();
})();
