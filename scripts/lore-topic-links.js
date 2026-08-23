(() => {
  const panel = document.querySelector("#lore-panel");
  if (!panel) return;

  const entries = [...panel.querySelectorAll(":scope > .lore-entry")];
  const topics = entries
    .map((entry) => {
      const heading = entry.querySelector(":scope > h2");
      if (!heading) return null;

      const label = heading.textContent.trim();
      const id = label
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      heading.id = id;
      return { entry, id, label };
    })
    .filter(Boolean);

  const escapePattern = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  for (const entry of entries) {
    for (const topic of topics) {
      if (topic.entry === entry) continue;

      const matcher = new RegExp(`\\b${escapePattern(topic.label)}\\b`, "i");
      const walker = document.createTreeWalker(entry, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          if (!node.parentElement || node.parentElement.closest("a, h2")) {
            return NodeFilter.FILTER_REJECT;
          }
          return matcher.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        },
      });

      const matchNode = walker.nextNode();
      if (!matchNode) continue;

      const match = matchNode.nodeValue.match(matcher);
      const before = document.createTextNode(matchNode.nodeValue.slice(0, match.index));
      const link = document.createElement("a");
      link.href = `#${topic.id}`;
      link.textContent = match[0];
      const after = document.createTextNode(matchNode.nodeValue.slice(match.index + match[0].length));
      matchNode.replaceWith(before, link, after);
    }
  }
})();
