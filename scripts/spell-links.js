(() => {
  if (document.documentElement.dataset.spellLinksReady) return;
  const manifest = Array.isArray(window.SPELL_MANIFEST) ? window.SPELL_MANIFEST : [];
  if (!manifest.length) return;
  document.documentElement.dataset.spellLinksReady = 'true';

  const source = document.currentScript;
  const indexPath = source?.dataset.spellIndex || new URL('../systems/spellcasting.html', source?.src || document.baseURI).href;
  const nameToId = new Map(manifest.map((spell) => [spell.name.toLowerCase(), spell.id]));
  const displayNames = new Map(manifest.map((spell) => [spell.name.toLowerCase(), spell.name]));

  const escapePattern = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Include both multi-word and one-word titles. This makes ordinary prose
  // references (for example, “fireball” or “shield”) link as well.
  const candidates = [...nameToId.keys()]
    .sort((left, right) => right.length - left.length);
  const titlePattern = new RegExp(`\\b(${candidates.map(escapePattern).join('|')})\\b`, 'gi');
  const classNames = ['artificer', 'bard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'warlock', 'wizard'];
  const classListPattern = new RegExp(`\\b(${classNames.join('|')})\\s+spell list\\b`, 'gi');
  const protectedTags = new Set(['A', 'BUTTON', 'CODE', 'SCRIPT', 'STYLE', 'TEXTAREA', 'OPTION']);

  const makeLink = (matched) => {
    const lookup = matched.toLowerCase();
    const id = nameToId.get(lookup);
    if (!id) return document.createTextNode(matched);
    const link = document.createElement('a');
    link.className = 'spell-reference';
    link.dataset.spellReference = id;
    link.href = `${indexPath}?search=${encodeURIComponent(displayNames.get(lookup) || matched)}`;
    link.textContent = displayNames.get(lookup) || matched;
    return link;
  };

  const shouldLinkMatch = (text, matched, offset) => {
    const lookup = matched.toLowerCase();
    if (lookup.includes(' ')) return true;
    const before = text.slice(Math.max(0, offset - 48), offset);
    const after = text.slice(offset + matched.length, Math.min(text.length, offset + matched.length + 48));
    // One-word titles overlap heavily with ordinary rules vocabulary. Require
    // an explicit spell reference or a casting/preparation verb nearby.
    return new RegExp(`(?:\\b(?:cast|casts|casting|prepare|prepared|learn|known|choose|select|use|using)\\s+(?:the\\s+)?|\\b(?:the\\s+)?(?:spell|cantrip)\\s+(?:named\\s+)?$)`, 'i').test(before)
      || /^\\s+(?:spell|cantrip)\\b/i.test(after)
      || /^\\s+(?:spell|cantrip)\\s+(?:of|from)\\b/i.test(after);
  };

  const makeClassListLink = (matched, className) => {
    const link = document.createElement('a');
    link.className = 'spell-reference';
    link.dataset.spellListReference = className.toLowerCase();
    link.href = `${indexPath}?class=${encodeURIComponent(className.toLowerCase())}`;
    link.textContent = matched;
    return link;
  };

  const replaceClassListText = (node) => {
    const text = node.nodeValue;
    if (!text || !classListPattern.test(text)) {
      classListPattern.lastIndex = 0;
      return;
    }
    classListPattern.lastIndex = 0;
    const fragment = document.createDocumentFragment();
    let cursor = 0;
    text.replace(classListPattern, (matched, className, offset) => {
      fragment.append(document.createTextNode(text.slice(cursor, offset)), makeClassListLink(matched, className));
      cursor = offset + matched.length;
      return matched;
    });
    fragment.append(document.createTextNode(text.slice(cursor)));
    node.replaceWith(fragment);
  };

  const replaceText = (node) => {
    const text = node.nodeValue;
    if (!text || !titlePattern.test(text)) {
      titlePattern.lastIndex = 0;
      return;
    }
    titlePattern.lastIndex = 0;
    const fragment = document.createDocumentFragment();
    let cursor = 0;
    text.replace(titlePattern, (matched, _capture, offset) => {
      if (!shouldLinkMatch(text, matched, offset)) {
        fragment.append(document.createTextNode(text.slice(cursor, offset + matched.length)));
        cursor = offset + matched.length;
        return matched;
      }
      fragment.append(document.createTextNode(text.slice(cursor, offset)), makeLink(matched));
      cursor = offset + matched.length;
      return matched;
    });
    fragment.append(document.createTextNode(text.slice(cursor)));
    node.replaceWith(fragment);
  };

  const collectEligibleTextNodes = () => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      const parent = walker.currentNode.parentElement;
      if (parent && !protectedTags.has(parent.tagName) && !parent.closest('a, button, code, pre')) nodes.push(walker.currentNode);
    }
    return nodes;
  };

  document.querySelectorAll('a').forEach((link) => {
    const text = link.textContent.trim();
    const match = text.match(new RegExp(`^(${classNames.join('|')})\\s+spell list$`, 'i'));
    if (match) {
      link.classList.add('spell-reference');
      link.dataset.spellListReference = match[1].toLowerCase();
      link.href = `${indexPath}?class=${encodeURIComponent(match[1].toLowerCase())}`;
      return;
    }
    const spellName = displayNames.get(text.toLowerCase());
    if (!spellName) return;
    link.classList.add('spell-reference');
    link.dataset.spellReference = nameToId.get(text.toLowerCase());
    link.textContent = spellName;
    link.href = `${indexPath}?search=${encodeURIComponent(spellName)}`;
  });

  collectEligibleTextNodes().forEach(replaceClassListText);
  collectEligibleTextNodes().forEach(replaceText);
})();
