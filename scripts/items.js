(() => {
  const input = document.querySelector('#item-search-input');
  const tabs = [...document.querySelectorAll('.item-tab')];
  const panels = [...document.querySelectorAll('.item-panel')];

  if (!input || !tabs.length || !panels.length) return;

  let activeCategory = tabs.find((tab) => tab.classList.contains('is-active'))?.dataset.category || tabs[0].dataset.category;

  const egoTab = tabs.find((tab) => tab.dataset.category === 'ego');
  const hideTriggeredEgoTab = () => {
    if (egoTab && sessionStorage.getItem('elysium-ego-triggered') === 'true') {
      egoTab.hidden = true;
      egoTab.setAttribute('aria-hidden', 'true');
    }
  };
  hideTriggeredEgoTab();

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
    const panel = panels.find((candidate) => candidate.dataset.category === activeCategory);
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
      const active = panel.dataset.category === activeCategory;
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

    const glyphs = '✠✦⚑☠☣☍⚙☒♆⟁⟟⌁⌖✹';
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

    document.body.classList.add('ego-glitch');
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
      window.location.href = '../index.html';
    }, 1200);
  };

  tabs.forEach((tab) => tab.addEventListener('click', () => {
    if (tab.dataset.category === 'ego') {
      sessionStorage.setItem('elysium-ego-triggered', 'true');
      triggerEgoGlitch();
      return;
    }
    activateTab(tab);
  }));

  document.querySelectorAll('.item-card').forEach((item) => {
    const toggle = () => {
      const expanded = item.classList.toggle('is-expanded');
      item.setAttribute('aria-expanded', String(expanded));
    };
    item.addEventListener('click', toggle);
    item.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggle();
      }
    });
  });

  input.addEventListener('input', filterItems);
  window.addEventListener('resize', updateOverflowMarkers);
  window.addEventListener('pageshow', hideTriggeredEgoTab);
  updateOverflowMarkers();
})();
