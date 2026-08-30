(() => {
  const enhanced = new WeakMap();

  const close = (menu) => {
    const state = enhanced.get(menu);
    if (!state) return;
    state.list.hidden = true;
    state.trigger.setAttribute('aria-expanded', 'false');
    state.shell.classList.remove('is-open');
  };

  const closeAll = (except) => {
    document.querySelectorAll('[data-select-menu]').forEach((menu) => {
      const select = menu.querySelector('select');
      if (select !== except) close(select);
    });
  };

  const enhance = (select) => {
    if (!(select instanceof HTMLSelectElement) || select.multiple || enhanced.has(select)) return;

    const shell = document.createElement('span');
    shell.className = 'select-menu';
    shell.dataset.selectMenu = '';
    const trigger = document.createElement('button');
    trigger.className = 'select-menu__trigger';
    trigger.type = 'button';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    const value = document.createElement('span');
    value.className = 'select-menu__value';
    const marker = document.createElement('span');
    marker.className = 'select-menu__marker';
    marker.setAttribute('aria-hidden', 'true');
    marker.textContent = 'v';
    trigger.append(value, marker);
    const list = document.createElement('span');
    list.className = 'select-menu__list';
    list.hidden = true;
    list.setAttribute('role', 'listbox');

    select.before(shell);
    shell.append(select, trigger, list);
    select.classList.add('select-menu__native');

    const positionList = () => {
      const rect = trigger.getBoundingClientRect();
      const availableHeight = Math.max(96, window.innerHeight - rect.bottom - 8);
      list.style.left = `${rect.left}px`;
      list.style.maxHeight = `${availableHeight}px`;
      list.style.top = `${rect.bottom + 3}px`;
      list.style.width = `${rect.width}px`;
    };

    const state = { shell, trigger, value, list, positionList };
    enhanced.set(select, state);

    const render = () => {
      const selected = select.options[select.selectedIndex];
      value.textContent = selected ? selected.textContent.trim() : '';
      trigger.disabled = select.disabled;
      list.replaceChildren();

      [...select.options].forEach((option) => {
        if (option.hidden) return;
        const choice = document.createElement('button');
        choice.className = 'select-menu__option';
        choice.type = 'button';
        choice.dataset.value = option.value;
        choice.setAttribute('role', 'option');
        choice.setAttribute('aria-selected', String(option.selected));
        choice.classList.toggle('is-selected', option.selected);
        choice.textContent = option.textContent.trim();
        choice.disabled = option.disabled;
        choice.addEventListener('click', () => {
          select.value = option.value;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          render();
          close(select);
          trigger.focus();
        });
        list.append(choice);
      });
    };

    trigger.addEventListener('click', () => {
      const opening = list.hidden;
      closeAll(select);
      list.hidden = !opening;
      if (opening) positionList();
      trigger.setAttribute('aria-expanded', String(opening));
      shell.classList.toggle('is-open', opening);
      if (opening) list.querySelector('[aria-selected="true"]')?.focus();
    });

    trigger.addEventListener('keydown', (event) => {
      const options = [...select.options].filter((option) => !option.hidden && !option.disabled);
      const current = options.findIndex((option) => option.value === select.value);
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const step = event.key === 'ArrowDown' ? 1 : -1;
        const next = options[(current + step + options.length) % options.length];
        if (!next) return;
        select.value = next.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        render();
      }
      if (event.key === 'Escape') close(select);
    });

    list.addEventListener('wheel', (event) => {
      event.preventDefault();
      event.stopPropagation();
      list.scrollTop += event.deltaY;
    }, { passive: false });

    select.addEventListener('change', render);
    new MutationObserver(render).observe(select, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'disabled', 'selected'] });
    window.addEventListener('resize', () => {
      if (!list.hidden) positionList();
    });
    document.addEventListener('scroll', () => {
      if (!list.hidden) positionList();
    }, true);
    render();
  };

  const enhanceWithin = (root) => {
    if (!(root instanceof Element || root instanceof Document)) return;
    if (root instanceof HTMLSelectElement) enhance(root);
    root.querySelectorAll?.('select').forEach(enhance);
  };

  enhanceWithin(document);
  new MutationObserver((records) => records.forEach((record) => record.addedNodes.forEach(enhanceWithin)))
    .observe(document.documentElement, { childList: true, subtree: true });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('[data-select-menu]')) closeAll();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAll();
  });
})();
