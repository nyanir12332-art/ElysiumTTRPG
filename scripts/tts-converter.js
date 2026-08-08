(() => {
  const WIDTH = 750;
  const HEIGHT = 1050;
  const CARD_TOP = 25;
  const CARD_BOTTOM = HEIGHT - 25;
  const CARD_CENTER_Y = (CARD_TOP + CARD_BOTTOM) / 2;
  const COLORS = {
    black: '#030704',
    green: '#39ff88',
    soft: '#b7ffd1',
    line: '#668d79',
    mint: '#9de4cb',
  };
  const CARD_FONT = '"Courier New", monospace';

  const front = document.querySelector('#card-front');
  const back = document.querySelector('#card-back');
  const type = document.querySelector('#card-type');
  const title = document.querySelector('#card-title');
  const subtitle = document.querySelector('#card-subtitle');
  const description = document.querySelector('#card-description');
  const itemFields = document.querySelector('#item-fields');
  const itemCost = document.querySelector('#item-cost');
  const itemWeight = document.querySelector('#item-weight');
  const itemProperties = document.querySelector('#item-properties');
  const spellFields = document.querySelector('#spell-fields');
  const spellCastingTime = document.querySelector('#spell-casting-time');
  const spellRange = document.querySelector('#spell-range');
  const spellDuration = document.querySelector('#spell-duration');
  const spellComponentV = document.querySelector('#spell-component-v');
  const spellComponentS = document.querySelector('#spell-component-s');
  const spellComponentM = document.querySelector('#spell-component-m');
  const spellMaterial = document.querySelector('#spell-material');
  const spellMaterialField = document.querySelector('#spell-material-field');
  const status = document.querySelector('#tts-status');

  if (!front || !back) return;

  const frontContext = front.getContext('2d');
  const backContext = back.getContext('2d');
  const iconSources = {
    feature: '../Images/FEAT.png',
    race: '../Images/RACE.png',
    class: '../Images/CLASS.png',
    spell: '../Images/SPELL.png',
    technique: '../Images/TECHNIQUE.png',
    item: '../Images/ITEM.png',
  };
  const icons = {};

  Object.entries(iconSources).forEach(([key, source]) => {
    const image = new Image();
    image.onload = () => { icons[key] = image; draw(); };
    image.src = source;
  });

  const roundedRect = (context, x, y, width, height, radius) => {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.arcTo(x + width, y, x + width, y + height, radius);
    context.arcTo(x + width, y + height, x, y + height, radius);
    context.arcTo(x, y + height, x, y, radius);
    context.arcTo(x, y, x + width, y, radius);
    context.closePath();
  };

  const parseRichText = (text) => {
    const parser = new DOMParser();
    const document = parser.parseFromString(`<div>${String(text || '')}</div>`, 'text/html');
    const root = document.body.firstElementChild;
    const lines = [];
    let currentRuns = [];
    let currentIndent = 0;
    let currentScale = 1;

    const appendRun = (value, style) => {
      if (!value) return;
      currentRuns.push({
        text: value,
        bold: Boolean(style.bold),
        italic: Boolean(style.italic),
        scale: style.scale || 1,
        preserveWhitespace: Boolean(style.preserveWhitespace),
      });
      currentScale = Math.max(currentScale, style.scale || 1);
    };

    const flushLine = (gapAfter = 0, force = false) => {
      if (!currentRuns.length && !force) return;
      lines.push({ runs: currentRuns, indent: currentIndent, scale: currentScale, gapAfter });
      currentRuns = [];
      currentIndent = 0;
      currentScale = 1;
    };

    const startBlock = () => {
      if (currentRuns.length) flushLine();
    };

    const appendText = (value, style) => {
      const explicitLines = value.replace(/\r\n?/g, '\n').split('\n');
      explicitLines.forEach((part, index) => {
        const normalized = part.replace(/\s+/g, ' ');
        if (normalized.trim() || currentRuns.length) appendRun(normalized, style);
        if (index < explicitLines.length - 1) flushLine(0, true);
      });
    };

    const walk = (node, style = {}, list = null) => {
      if (node.nodeType === Node.TEXT_NODE) {
        appendText(node.nodeValue || '', style);
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;

      const tag = node.tagName.toLowerCase();
      if (tag === 'br') {
        flushLine(0, true);
        return;
      }

      if (tag === 'table') {
        startBlock();
        const rows = Array.from(node.querySelectorAll('tr')).map((row) => Array.from(row.children)
          .filter((cell) => cell.tagName && /^(TH|TD)$/.test(cell.tagName))
          .map((cell) => ({
            text: (cell.textContent || '').replace(/\s+/g, ' ').trim(),
            header: cell.tagName === 'TH',
          })));
        const widths = [];
        rows.forEach((row) => row.forEach((cell, index) => {
          widths[index] = Math.max(widths[index] || 0, cell.text.length);
        }));
        rows.forEach((row) => {
          row.forEach((cell, index) => {
            const cellStyle = { ...style, bold: style.bold || cell.header };
            appendRun(cell.text, cellStyle);
            if (index < row.length - 1) {
              appendRun(' '.repeat(Math.max(3, (widths[index] || 0) - cell.text.length + 3)), { ...style, preserveWhitespace: true });
            }
          });
          flushLine();
        });
        flushLine(0.55);
        return;
      }

      if (tag === 'p' || tag === 'div') {
        startBlock();
        Array.from(node.childNodes).forEach((child) => walk(child, style, list));
        flushLine(0.55);
        return;
      }

      if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4' || tag === 'subtitle') {
        startBlock();
        const headingScale = tag === 'h1' ? 1.2 : tag === 'h2' ? 1.12 : 1.06;
        const headingStyle = { ...style, bold: true, scale: Math.max(style.scale || 1, headingScale) };
        Array.from(node.childNodes).forEach((child) => walk(child, headingStyle, list));
        flushLine(0.45);
        return;
      }

      if (tag === 'ul' || tag === 'ol') {
        startBlock();
        const listType = tag === 'ol' ? 'ol' : 'ul';
        let index = 1;
        Array.from(node.children).forEach((child) => {
          walk(child, style, { type: listType, index });
          index += 1;
        });
        flushLine(0.35);
        return;
      }

      if (tag === 'li') {
        startBlock();
        currentIndent = 34;
        const marker = list && list.type === 'ol' ? `${list.index}. ` : '• ';
        appendRun(marker, style);
        Array.from(node.childNodes).forEach((child) => walk(child, style, list));
        flushLine();
        return;
      }

      const childStyle = {
        ...style,
        bold: style.bold || tag === 'b' || tag === 'strong',
        italic: style.italic || tag === 'i' || tag === 'em',
        scale: tag === 'small' ? Math.min(style.scale || 1, 0.82) : style.scale || 1,
      };
      Array.from(node.childNodes).forEach((child) => walk(child, childStyle, list));
    };

    Array.from(root.childNodes).forEach((child) => walk(child));
    if (currentRuns.length) flushLine();
    return lines;
  };

  const wrapText = (context, text, maxWidth) => {
    const lines = [];
    const explicitLines = String(text || '').replace(/\r\n?/g, '\n').split('\n');
    explicitLines.forEach((explicitLine) => {
      const words = explicitLine.trim().split(/\s+/).filter(Boolean);
      let line = '';
      if (!words.length) {
        lines.push('');
        return;
      }
      words.forEach((word) => {
        while (context.measureText(word).width > maxWidth) {
          let cut = 1;
          while (cut < word.length && context.measureText(word.slice(0, cut + 1)).width <= maxWidth) cut += 1;
          if (line) {
            lines.push(line);
            line = '';
          }
          lines.push(word.slice(0, cut));
          word = word.slice(cut);
        }
        const candidate = line ? `${line} ${word}` : word;
        if (context.measureText(candidate).width > maxWidth && line) {
          lines.push(line);
          line = word;
        } else {
          line = candidate;
        }
      });
      if (line) lines.push(line);
    });
    return lines;
  };

  const fontForRun = (baseSize, run) => {
    const style = run.italic ? 'italic ' : '';
    const weight = run.bold ? '700' : '400';
    return `${style}${weight} ${Math.max(6, Math.round(baseSize * (run.scale || 1)))}px ${CARD_FONT}`;
  };

  const wrapRichLine = (context, logicalLine, width, baseSize) => {
    const wrapped = [];
    let current = [];
    let currentWidth = 0;
    let firstLine = true;
    let pendingSpace = false;

    const availableWidth = () => width - (firstLine ? 0 : logicalLine.indent);
    const pushLine = () => {
      wrapped.push({
        runs: current,
        indent: firstLine ? 0 : logicalLine.indent,
        scale: current.reduce((max, run) => Math.max(max, run.scale || 1), 1),
      });
      current = [];
      currentWidth = 0;
      firstLine = false;
    };
    const addPiece = (text, style) => {
      if (!text) return;
      context.font = fontForRun(baseSize, style);
      current.push({ ...style, text });
      currentWidth += context.measureText(text).width;
    };

    logicalLine.runs.forEach((run) => {
      const tokens = run.text.match(/\S+|\s+/g) || [];
      tokens.forEach((token) => {
        if (/^\s+$/.test(token)) {
          if (run.preserveWhitespace && current.length) {
            context.font = fontForRun(baseSize, run);
            if (currentWidth + context.measureText(token).width <= availableWidth()) addPiece(token, run);
            else pushLine();
            return;
          }
          if (current.length) pendingSpace = true;
          return;
        }

        context.font = fontForRun(baseSize, run);
        if (pendingSpace && current.length) {
          const spaceWidth = context.measureText(' ').width;
          if (currentWidth + spaceWidth <= availableWidth()) addPiece(' ', run);
          else pushLine();
        }
        pendingSpace = false;

        let remaining = token;
        while (remaining) {
          context.font = fontForRun(baseSize, run);
          const remainingWidth = context.measureText(remaining).width;
          const room = availableWidth() - currentWidth;
          if (remainingWidth <= room) {
            addPiece(remaining, run);
            remaining = '';
          } else if (current.length) {
            pushLine();
          } else {
            let cut = 1;
            while (cut < remaining.length && context.measureText(remaining.slice(0, cut + 1)).width <= availableWidth()) cut += 1;
            addPiece(remaining.slice(0, cut), run);
            remaining = remaining.slice(cut);
            if (remaining) pushLine();
          }
        }
      });
    });

    if (current.length || !wrapped.length) pushLine();
    return wrapped;
  };

  const layoutRichText = (context, text, width, baseSize) => {
    const logicalLines = parseRichText(text);
    const physicalLines = [];
    logicalLines.forEach((logicalLine) => {
      const wrapped = wrapRichLine(context, logicalLine, width, baseSize);
      wrapped.forEach((line, index) => {
        physicalLines.push({
          ...line,
          gapAfter: index === wrapped.length - 1 ? logicalLine.gapAfter : 0,
        });
      });
    });
    return physicalLines.map((line) => ({
      ...line,
      lineHeight: Math.ceil(baseSize * line.scale * 1.35),
    }));
  };

  const drawFittedTextBlock = (context, text, x, y, width, height, baseSize, color) => {
    let fontSize = baseSize;
    let lines = [];
    let totalHeight = Infinity;

    while (fontSize >= 6) {
      lines = layoutRichText(context, text, width, fontSize);
      totalHeight = lines.reduce((total, line) => total + line.lineHeight + (fontSize * (line.gapAfter || 0)), 0);
      if (totalHeight <= height) break;
      fontSize -= 1;
    }

    context.fillStyle = color;
    let cursorY = y;
    lines.forEach((line) => {
      let cursorX = x + line.indent;
      line.runs.forEach((run) => {
        context.font = fontForRun(fontSize, run);
        context.fillText(run.text, cursorX, cursorY);
        cursorX += context.measureText(run.text).width;
      });
      cursorY += line.lineHeight + (fontSize * (line.gapAfter || 0));
    });
  };

  const drawTintedIcon = (context, image, x, y, size) => {
    if (!image) return;
    const iconCanvas = document.createElement('canvas');
    iconCanvas.width = size;
    iconCanvas.height = size;
    const iconContext = iconCanvas.getContext('2d');
    iconContext.drawImage(image, 0, 0, size, size);
    iconContext.globalCompositeOperation = 'source-in';
    iconContext.fillStyle = COLORS.green;
    iconContext.fillRect(0, 0, size, size);
    context.drawImage(iconCanvas, x, y);
  };

  const drawFront = () => {
    const context = frontContext;
    const cardType = type.value;
    context.clearRect(0, 0, WIDTH, HEIGHT);
    context.fillStyle = COLORS.black;
    context.fillRect(0, 0, WIDTH, HEIGHT);
    context.strokeStyle = COLORS.line;
    context.lineWidth = 2;
    context.strokeRect(30, CARD_TOP, 690, CARD_BOTTOM - CARD_TOP);
    context.strokeRect(31, 26, 104, 64);
    context.beginPath();
    context.moveTo(30, 90);
    context.lineTo(720, 90);
    context.stroke();

    drawTintedIcon(context, icons[cardType], 56, 35, 46);
    context.fillStyle = COLORS.green;
    const cardTitle = title.value || 'Untitled';
    let titleSize = 31;
    let titleLines = [];
    while (titleSize > 12) {
      context.font = `700 ${titleSize}px ${CARD_FONT}`;
      titleLines = wrapText(context, cardTitle, 555);
      if (titleLines.length <= 2 && titleLines.every((line) => context.measureText(line).width <= 555)) break;
      titleSize -= 1;
    }
    const titleLineHeight = Math.ceil(titleSize * 1.08);
    const titleStart = titleLines.length > 1 ? 46 : 67;
    titleLines.slice(0, 2).forEach((line, index) => context.fillText(line, 150, titleStart + index * titleLineHeight));
    context.fillStyle = COLORS.soft;
    const cardSubtitle = subtitle.value.trim().toUpperCase();
    let subtitleSize = 32;
    let subtitleLines = [];
    if (cardSubtitle) {
      while (subtitleSize > 12) {
        context.font = `700 ${subtitleSize}px ${CARD_FONT}`;
        subtitleLines = wrapText(context, cardSubtitle, 670);
        if (subtitleLines.length <= 2 && subtitleLines.every((line) => context.measureText(line).width <= 670)) break;
        subtitleSize -= 1;
      }
      context.font = `700 ${subtitleSize}px ${CARD_FONT}`;
      const subtitleLineHeight = Math.ceil(subtitleSize * 1.08);
      const subtitleStart = 125;
      subtitleLines.slice(0, 2).forEach((line, index) => context.fillText(line, 40, subtitleStart + index * subtitleLineHeight));
    }

    const meta = cardType === 'item'
      ? [
        itemCost.value.trim() ? `<b>COST</b>  ${itemCost.value.trim()}` : '',
        itemWeight.value.trim() ? `<b>WEIGHT</b>  ${itemWeight.value.trim()}` : '',
        itemProperties.value.trim() ? `<b>PROPERTIES</b>  ${itemProperties.value.trim()}` : '',
      ].filter(Boolean).join('    ')
      : '';
    const spellComponents = [
      spellComponentV.checked ? 'V' : '',
      spellComponentS.checked ? 'S' : '',
      spellComponentM.checked ? `M${spellMaterial.value.trim() ? ` (${spellMaterial.value.trim()})` : ''}` : '',
    ].filter(Boolean).join(', ');
    const spellMeta = cardType === 'spell'
      ? [
        spellCastingTime.value.trim() ? `<b>CASTING TIME</b>  ${spellCastingTime.value.trim()}` : '',
        spellRange.value.trim() ? `<b>RANGE</b>  ${spellRange.value.trim()}` : '',
        spellComponents ? `<b>COMPONENTS</b>  ${spellComponents}` : '',
        spellDuration.value.trim() ? `<b>DURATION</b>  ${spellDuration.value.trim()}` : '',
      ].filter(Boolean).join('\n')
      : '';
    const body = [description.value, meta, spellMeta].filter((value) => value && value.trim()).join('\n\n');
    // Do not reserve the subtitle band when it is empty. Keep a small reading
    // gap below the title divider, then give the description the full height.
    const bodyStart = subtitleLines.length > 1 ? 190 : subtitleLines.length === 1 ? 165 : 115;
    drawFittedTextBlock(context, body, 40, bodyStart, 670, CARD_BOTTOM - bodyStart, 24, COLORS.soft);
  };

  const drawBack = () => {
    const context = backContext;
    context.clearRect(0, 0, WIDTH, HEIGHT);
    context.fillStyle = '#020503';
    context.fillRect(0, 0, WIDTH, HEIGHT);
    context.strokeStyle = COLORS.mint;
    context.lineWidth = 4;
    roundedRect(context, 30, CARD_TOP, 690, CARD_BOTTOM - CARD_TOP, 36);
    context.stroke();
    context.lineWidth = 2;
    context.strokeStyle = 'rgba(157,228,203,0.78)';
    roundedRect(context, 48, 43, 654, CARD_BOTTOM - 43 - 18, 22);
    context.stroke();

    context.save();
    context.beginPath();
    roundedRect(context, 48, 43, 654, CARD_BOTTOM - 43 - 18, 22);
    context.clip();
    context.strokeStyle = 'rgba(157,228,203,0.7)';
    context.lineWidth = 2;
    [70, 130, 190].forEach((y) => {
      context.beginPath();
      context.moveTo(48, y);
      context.quadraticCurveTo(375, y + 100, 702, y);
      context.stroke();
    });
    [860, 920, 980].forEach((y) => {
      context.beginPath();
      context.moveTo(48, y);
      context.quadraticCurveTo(375, y - 100, 702, y);
      context.stroke();
    });
    context.beginPath();
    context.moveTo(375, 43);
    context.lineTo(375, CARD_BOTTOM - 18);
    context.stroke();
    context.restore();

    context.strokeStyle = COLORS.mint;
    context.lineWidth = 2;
    const orb = context.createRadialGradient(330, CARD_CENTER_Y - 40, 30, 385, CARD_CENTER_Y + 25, 180);
    orb.addColorStop(0, '#d5fff0');
    orb.addColorStop(0.5, '#86cdb5');
    orb.addColorStop(1, '#397c69');
    context.fillStyle = orb;
    context.beginPath();
    context.arc(375, CARD_CENTER_Y, 148, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = COLORS.mint;
    context.lineWidth = 5;
    context.beginPath();
    context.arc(375, CARD_CENTER_Y, 164, 0, Math.PI * 2);
    context.stroke();
  };

  const draw = () => {
    itemFields.hidden = type.value !== 'item';
    spellFields.hidden = type.value !== 'spell';
    spellMaterialField.hidden = type.value !== 'spell' || !spellComponentM.checked;
    drawFront();
    drawBack();
  };

  const download = (canvas, filename) => {
    const anchor = document.createElement('a');
    anchor.download = filename;
    anchor.href = canvas.toDataURL('image/jpeg', 0.94);
    anchor.click();
    status.textContent = `${filename} downloaded at 750 × 1050 pixels.`;
  };

  document.querySelectorAll('#tts-editor input, #tts-editor textarea, #tts-editor select').forEach((field) => {
    field.addEventListener('input', draw);
    field.addEventListener('change', draw);
  });
  document.querySelector('#download-front').addEventListener('click', () => download(front, `${(title.value || 'card').trim().replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-front.jpg`));
  document.querySelector('#download-back').addEventListener('click', () => download(back, 'elysium-card-back.jpg'));
  document.querySelector('#reset-card').addEventListener('click', () => {
    document.querySelector('#tts-editor').reset();
    draw();
  });
  draw();
})();
