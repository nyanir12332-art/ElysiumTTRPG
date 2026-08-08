(() => {
  const input = document.querySelector('#item-search-input');
  const tabs = [...document.querySelectorAll('.item-tab')];
  const panels = [...document.querySelectorAll('.item-panel')];

  if (!input || !tabs.length || !panels.length) return;

  let activeCategory = tabs.find((tab) => tab.classList.contains('is-active'))?.dataset.category || tabs[0].dataset.category;

  const requestedItem = new URLSearchParams(window.location.search).get('item');

  const updateOverflowMarkers = () => {
    document.querySelectorAll('.item-card').forEach((item) => {
      const description = item.querySelector('p');
      let needsExpansion = false;

      if (description) {
        needsExpansion = true;
      }

      const notes = item.querySelector('span:nth-of-type(4)');
      if (notes && notes.scrollWidth > notes.clientWidth) needsExpansion = true;

      item.classList.toggle('needs-expansion', needsExpansion);
      item.classList.toggle('has-overflow', needsExpansion);
    });
  };

  const filterItems = () => {
    const query = input.value.trim().toLowerCase();
    const panel = activeCategory === 'all'
      ? panels.find((candidate) => candidate.dataset.category === 'adventuring-gear')
      : panels.find((candidate) => candidate.dataset.category === activeCategory);
    if (!panel) return;

    let visibleItems = 0;
    panel.querySelectorAll('.item-group').forEach((group) => {
      let groupVisible = 0;
      group.querySelectorAll('.item-card').forEach((item) => {
        const matches = !query || item.textContent.toLowerCase().includes(query);
        item.hidden = !matches;
        if (matches) groupVisible += 1;
      });
      group.hidden = Boolean(query && !groupVisible);
      visibleItems += groupVisible;
    });

    let noResults = panel.querySelector('.item-no-results');
    if (query && panel.querySelectorAll('.item-card').length && !visibleItems) {
      if (!noResults) {
        noResults = document.createElement('p');
        noResults.className = 'item-no-results';
        panel.appendChild(noResults);
      }
      noResults.textContent = `No items match “${input.value}”.`;
      noResults.hidden = false;
    } else if (noResults) {
      noResults.hidden = true;
    }
  };

  const activateTab = (tab) => {
    activeCategory = tab.dataset.category;
    tabs.forEach((candidate) => {
      const active = candidate === tab;
      candidate.classList.toggle('is-active', active);
      candidate.setAttribute('aria-selected', String(active));
    });
    panels.forEach((panel) => {
      const active = activeCategory === 'all'
        ? panel.dataset.category !== 'ego'
        : panel.dataset.category === activeCategory;
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
    });
    filterItems();
    updateOverflowMarkers();
  };

  const triggerEgoGlitch = () => {
    const blockInteraction = (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
    };

    ['click', 'pointerdown', 'keydown', 'keyup', 'focusin'].forEach((eventName) => {
      document.addEventListener(eventName, blockInteraction, true);
    });

    const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()[]{}<>?/\\|+=-';
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    let node;

    while ((node = walker.nextNode())) {
      if (!node.parentElement.closest('script, style, input, textarea')) textNodes.push(node);
    }

    textNodes.forEach((textNode, index) => {
      const scrambled = [...textNode.textContent].map((character) => {
        if (/\s/.test(character)) return character;
        return glyphs[Math.floor(Math.random() * glyphs.length)];
      }).join('');

      const flicker = document.createElement('span');
      flicker.className = 'ego-flicker';
      flicker.textContent = scrambled;
      flicker.style.setProperty('--flicker-delay', `${Math.random() * 180}ms`);
      flicker.style.setProperty('--flicker-duration', `${180 + Math.random() * 420}ms`);
      textNode.replaceWith(flicker);

      const flickerText = () => {
        flicker.style.visibility = flicker.style.visibility === 'hidden' ? 'visible' : 'hidden';
        window.setTimeout(flickerText, 35 + Math.random() * 150 + index * 3);
      };
      window.setTimeout(flickerText, 40 + Math.random() * 220 + index * 5);
    });

    const egoSymbolFonts = [
      'Wingdings',
      'Webdings',
      'Wingdings 2',
    ];
    let fontIndex = 0;
    const fontTimer = window.setInterval(() => {
      const font = egoSymbolFonts[fontIndex % egoSymbolFonts.length];
      document.querySelectorAll('.ego-flicker, input[type="search"], .site-search button').forEach((node) => {
        node.style.fontFamily = `'${font}'`;
      });
      fontIndex += 1;
    }, 90);

    document.body.classList.add('ego-glitch');

    const orderTargets = [
      document.querySelectorAll('.topbar a'),
      document.querySelectorAll('.item-tabs .item-tab'),
    ];
    let orderOffset = 0;
    const orderTimer = window.setInterval(() => {
      orderTargets.forEach((nodes) => {
        nodes.forEach((node, index) => {
          node.style.order = String((index + orderOffset) % nodes.length);
        });
      });
      orderOffset += 1;
    }, 90);
    const tear = document.createElement('div');
    tear.className = 'ego-tear';
    tear.setAttribute('aria-hidden', 'true');
    tear.setAttribute('tabindex', '-1');
    document.body.appendChild(tear);
    tear.focus({ preventScroll: true });

    const lightFlash = document.createElement('img');
    lightFlash.className = 'ego-light-flash';
    lightFlash.src = '../Images/light.jpg';
    lightFlash.alt = '';
    lightFlash.setAttribute('aria-hidden', 'true');
    lightFlash.style.setProperty('--light-delay', `${Math.random() * 180}ms`);
    document.body.appendChild(lightFlash);

    window.setTimeout(() => {
      window.clearInterval(fontTimer);
      window.clearInterval(orderTimer);
      window.location.href = '../index.html';
    }, 1200);
  };

  tabs.forEach((tab) => tab.addEventListener('click', () => {
    if (tab.dataset.category === 'ego') {
      triggerEgoGlitch();
      return;
    }
    activateTab(tab);
  }));

  document.querySelectorAll('.item-card').forEach((item) => {
    const toggle = () => {
      const expanded = item.classList.toggle('is-expanded');
      item.setAttribute('aria-expanded', String(expanded));
      const expandButton = item.querySelector('.item-card__expand');
      if (expandButton) expandButton.setAttribute('aria-expanded', String(expanded));
    };
    item.addEventListener('click', toggle);
    item.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggle();
      }
    });
  });

  document.querySelectorAll('.item-card__expand').forEach((button) => {
    button.addEventListener('keydown', (event) => event.stopPropagation());
  });

  document.querySelectorAll('.item-group, .apparel-section').forEach((group) => {
    const title = group.querySelector(':scope > .item-group-title');
    if (!title) return;

    title.setAttribute('role', 'button');
    title.setAttribute('tabindex', '0');
    title.setAttribute('aria-expanded', 'true');
    title.addEventListener('mousedown', (event) => event.preventDefault());

    const toggleGroup = () => {
      const collapsed = group.classList.toggle('is-collapsed');
      title.setAttribute('aria-expanded', String(!collapsed));
    };

    title.addEventListener('click', toggleGroup);
    title.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleGroup();
      }
    });
  });

  input.addEventListener('input', filterItems);
  window.addEventListener('resize', updateOverflowMarkers);
  if (requestedItem) input.value = requestedItem;
  updateOverflowMarkers();
  filterItems();
})();
