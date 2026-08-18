(() => {
  const createParts = (className) => {
    const track = document.createElement('div');
    const up = document.createElement('div');
    const thumb = document.createElement('div');
    const down = document.createElement('div');
    track.className = className;
    up.className = 'crt-scrollbar-button up';
    thumb.className = 'crt-scrollbar-thumb';
    down.className = 'crt-scrollbar-button down';
    up.textContent = '^';
    down.textContent = 'v';
    track.append(up, thumb, down);
    return { track, up, thumb, down };
  };

  const enhance = (element) => {
    if (!element || element.dataset.crtScrollbarReady) return;
    element.dataset.crtScrollbarReady = 'true';
    element.classList.add('crt-scrollbar-host');
    const scrollTarget = element.querySelector('[data-crt-scroll-target]') || element;
    scrollTarget.classList.add('crt-scrollbar-native-hidden');
    const { track, up, thumb, down } = createParts('crt-scrollbar crt-scrollbar--embedded');
    element.appendChild(track);

    const update = () => {
      const maxScroll = scrollTarget.scrollHeight - scrollTarget.clientHeight;
      track.hidden = scrollTarget.clientHeight <= 32 || maxScroll <= 0;
      if (track.hidden) return;
      const buttonSpace = 16;
      const trackHeight = scrollTarget.clientHeight - (buttonSpace * 2);
      const thumbHeight = Math.max(42, trackHeight * (scrollTarget.clientHeight / scrollTarget.scrollHeight));
      thumb.style.height = `${thumbHeight}px`;
      thumb.style.transform = `translateY(${buttonSpace + (scrollTarget.scrollTop / maxScroll) * (trackHeight - thumbHeight)}px)`;
    };
    const scrollByAmount = (amount) => scrollTarget.scrollBy({ top: amount, behavior: 'smooth' });
    up.addEventListener('click', () => scrollByAmount(-scrollTarget.clientHeight * 0.85));
    down.addEventListener('click', () => scrollByAmount(scrollTarget.clientHeight * 0.85));
    track.addEventListener('click', (event) => {
      if ([up, down, thumb].includes(event.target)) return;
      const buttonSpace = 16;
      const trackHeight = scrollTarget.clientHeight - (buttonSpace * 2);
      const maxScroll = scrollTarget.scrollHeight - scrollTarget.clientHeight;
      const position = Math.min(Math.max(event.clientY - track.getBoundingClientRect().top - buttonSpace, 0), trackHeight);
      scrollTarget.scrollTo({ top: (position / trackHeight) * maxScroll, behavior: 'smooth' });
    });
    thumb.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      const maxScroll = scrollTarget.scrollHeight - scrollTarget.clientHeight;
      const trackHeight = scrollTarget.clientHeight - 32;
      const thumbHeight = thumb.offsetHeight;
      const startY = event.clientY;
      const startScroll = scrollTarget.scrollTop;
      const onMove = (moveEvent) => {
        scrollTarget.scrollTop = startScroll + ((moveEvent.clientY - startY) * (maxScroll / (trackHeight - thumbHeight)));
      };
      const onUp = () => {
        thumb.classList.remove('dragging');
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };
      thumb.classList.add('dragging');
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    });
    scrollTarget.addEventListener('scroll', update, { passive: true });
    new ResizeObserver(update).observe(scrollTarget);
    new MutationObserver(() => requestAnimationFrame(update)).observe(element, { childList: true });
    requestAnimationFrame(update);
  };

  if (!document.querySelector('.crt-scrollbar')) {
    const { track, up, thumb, down } = createParts('crt-scrollbar');
    document.body.appendChild(track);
    const scrollByAmount = (amount) => window.scrollBy({ top: amount, behavior: 'smooth' });
    const updateScrollbar = () => {
      const doc = document.documentElement;
      const maxScroll = doc.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) {
        track.style.display = 'none';
        return;
      }
      track.style.display = 'block';
      const buttonSpace = 16;
      const trackHeight = window.innerHeight - (buttonSpace * 2);
      const thumbHeight = Math.max(42, trackHeight * (window.innerHeight / doc.scrollHeight));
      thumb.style.height = `${thumbHeight}px`;
      thumb.style.transform = `translateY(${buttonSpace + (doc.scrollTop / maxScroll) * (trackHeight - thumbHeight)}px)`;
    };
    track.addEventListener('click', (event) => {
      if ([up, down, thumb].includes(event.target)) return;
      const buttonSpace = 16;
      const trackHeight = window.innerHeight - (buttonSpace * 2);
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const position = Math.min(Math.max(event.clientY - track.getBoundingClientRect().top - buttonSpace, 0), trackHeight);
      window.scrollTo({ top: (position / trackHeight) * maxScroll, behavior: 'smooth' });
    });
    thumb.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const trackHeight = window.innerHeight - 32;
      const thumbHeight = thumb.offsetHeight;
      const startY = event.clientY;
      const startScroll = document.documentElement.scrollTop;
      const onMove = (moveEvent) => {
        window.scrollTo(0, startScroll + ((moveEvent.clientY - startY) * (maxScroll / (trackHeight - thumbHeight))));
      };
      const onUp = () => {
        thumb.classList.remove('dragging');
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };
      thumb.classList.add('dragging');
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    });
    up.addEventListener('click', () => scrollByAmount(-window.innerHeight * 0.85));
    down.addEventListener('click', () => scrollByAmount(window.innerHeight * 0.85));
    window.addEventListener('scroll', updateScrollbar, { passive: true });
    window.addEventListener('resize', updateScrollbar);
    window.addEventListener('load', updateScrollbar);
    updateScrollbar();
  }

  document.querySelectorAll('[data-crt-scrollbar]').forEach(enhance);
  window.CRTScrollbar = { enhance };
})();
