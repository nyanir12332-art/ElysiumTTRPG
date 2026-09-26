document.querySelectorAll('.record-toggle').forEach((toggle) => {
  const content = document.getElementById(toggle.getAttribute('aria-controls'));
  if (!content) return;
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    content.hidden = expanded;
  });
});
