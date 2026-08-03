(() => {
  const setupTableScrollbars = () => {
    document.querySelectorAll('.table-wrap').forEach((wrap) => {
      if (wrap.nextElementSibling?.classList.contains('table-scrollbar')) {
        return;
      }

      const bar = document.createElement('div');
      const left = document.createElement('div');
      const rail = document.createElement('div');
      const grip = document.createElement('div');
      const right = document.createElement('div');

      bar.className = 'table-scrollbar';
      left.className = 'table-scrollbar-button';
      rail.className = 'table-scrollbar-track';
      grip.className = 'table-scrollbar-thumb';
      right.className = 'table-scrollbar-button';
      left.textContent = '<';
      right.textContent = '>';

      rail.appendChild(grip);
      bar.appendChild(left);
      bar.appendChild(rail);
      bar.appendChild(right);
      wrap.insertAdjacentElement('afterend', bar);

      const updateTableScrollbar = () => {
        const maxScroll = wrap.scrollWidth - wrap.clientWidth;

        if (maxScroll <= 0) {
          bar.hidden = true;
          return;
        }

        bar.hidden = false;
        const railWidth = rail.clientWidth;
        const gripWidth = Math.max(42, railWidth * (wrap.clientWidth / wrap.scrollWidth));
        const maxGripLeft = railWidth - gripWidth;
        const gripLeft = (wrap.scrollLeft / maxScroll) * maxGripLeft;

        grip.style.width = `${gripWidth}px`;
        grip.style.transform = `translateX(${gripLeft}px)`;
      };

      const scrollTableBy = (amount) => {
        wrap.scrollBy({ left: amount, behavior: 'smooth' });
      };

      const scrollTableToPointer = (event) => {
        if (event.target === grip) {
          return;
        }

        const rect = rail.getBoundingClientRect();
        const maxScroll = wrap.scrollWidth - wrap.clientWidth;
        const gripWidth = grip.offsetWidth;
        const maxGripLeft = rail.clientWidth - gripWidth;
        const position = Math.min(Math.max(event.clientX - rect.left - (gripWidth / 2), 0), maxGripLeft);
        wrap.scrollTo({ left: (position / maxGripLeft) * maxScroll, behavior: 'smooth' });
      };

      const startTableDrag = (event) => {
        event.preventDefault();
        grip.classList.add('dragging');
        const maxScroll = wrap.scrollWidth - wrap.clientWidth;
        const maxGripLeft = rail.clientWidth - grip.offsetWidth;
        const startX = event.clientX;
        const startScroll = wrap.scrollLeft;

        const onMove = (moveEvent) => {
          const delta = moveEvent.clientX - startX;
          const scrollDelta = delta * (maxScroll / maxGripLeft);
          wrap.scrollLeft = startScroll + scrollDelta;
        };

        const onUp = () => {
          grip.classList.remove('dragging');
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
      };

      left.addEventListener('click', () => scrollTableBy(-wrap.clientWidth * 0.85));
      right.addEventListener('click', () => scrollTableBy(wrap.clientWidth * 0.85));
      rail.addEventListener('click', scrollTableToPointer);
      grip.addEventListener('pointerdown', startTableDrag);
      wrap.addEventListener('scroll', updateTableScrollbar, { passive: true });
      window.addEventListener('resize', updateTableScrollbar);
      updateTableScrollbar();
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    setupTableScrollbars();
    const pageNav = document.querySelector('.page-nav');
    const header = document.querySelector('header');
    if (pageNav && header) {
      header.appendChild(pageNav);
    }
  });
  window.addEventListener('load', setupTableScrollbars);
  window.addEventListener('resize', setupTableScrollbars);
})();
