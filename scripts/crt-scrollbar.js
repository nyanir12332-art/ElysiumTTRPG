(() => {
  if (document.querySelector('.crt-scrollbar')) {
    return;
  }

  const track = document.createElement('div');
  const up = document.createElement('div');
  const thumb = document.createElement('div');
  const down = document.createElement('div');

  track.className = 'crt-scrollbar';
  up.className = 'crt-scrollbar-button up';
  thumb.className = 'crt-scrollbar-thumb';
  down.className = 'crt-scrollbar-button down';
  up.textContent = '^';
  down.textContent = 'v';
  track.append(up, thumb, down);
  document.body.appendChild(track);

  const scrollByAmount = (amount) => {
    window.scrollBy({ top: amount, behavior: 'smooth' });
  };

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
    const thumbTop = buttonSpace + (doc.scrollTop / maxScroll) * (trackHeight - thumbHeight);
    thumb.style.height = `${thumbHeight}px`;
    thumb.style.transform = `translateY(${thumbTop}px)`;
  };

  const scrollToPointer = (event) => {
    if ([up, down, thumb].includes(event.target)) {
      return;
    }

    const rect = track.getBoundingClientRect();
    const buttonSpace = 16;
    const trackHeight = window.innerHeight - (buttonSpace * 2);
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const position = Math.min(Math.max(event.clientY - rect.top - buttonSpace, 0), trackHeight);
    window.scrollTo({ top: (position / trackHeight) * maxScroll, behavior: 'smooth' });
  };

  const startDrag = (event) => {
    event.preventDefault();
    const doc = document.documentElement;
    const maxScroll = doc.scrollHeight - window.innerHeight;
    const buttonSpace = 16;
    const trackHeight = window.innerHeight - (buttonSpace * 2);
    const thumbHeight = thumb.offsetHeight;
    const startY = event.clientY;
    const startScroll = doc.scrollTop;

    const onMove = (moveEvent) => {
      const delta = moveEvent.clientY - startY;
      const scrollDelta = delta * (maxScroll / (trackHeight - thumbHeight));
      window.scrollTo(0, startScroll + scrollDelta);
    };

    const onUp = () => {
      thumb.classList.remove('dragging');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    thumb.classList.add('dragging');
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  up.addEventListener('click', () => scrollByAmount(-window.innerHeight * 0.85));
  down.addEventListener('click', () => scrollByAmount(window.innerHeight * 0.85));
  track.addEventListener('click', scrollToPointer);
  thumb.addEventListener('pointerdown', startDrag);
  window.addEventListener('scroll', updateScrollbar, { passive: true });
  window.addEventListener('resize', updateScrollbar);
  window.addEventListener('load', updateScrollbar);
  updateScrollbar();
})();
