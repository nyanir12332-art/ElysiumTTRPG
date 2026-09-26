(() => {
  const columns = 15;
  const capacityMultipliers = { Tiny: 0.5, Small: 1, Medium: 1, Large: 2, Huge: 4, Gargantuan: 8 };
  const equipmentSizeMultipliers = { Tiny: 0.5, Small: 1, Medium: 1, Large: 2, Huge: 3, Gargantuan: 4 };
  const objectHitPoints = {
    Tiny: { Fragile: 2, Resilient: 5 },
    Small: { Fragile: 3, Resilient: 10 },
    Medium: { Fragile: 4, Resilient: 18 },
    Large: { Fragile: 5, Resilient: 27 }
  };
  const numberWords = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, ten: 10 };
  const packContents = {
    "Burglar's Pack": [['Backpack', 1], ['City Card', 1], ['Ball Bearings', 1], ['String', 1], ['Bell', 1], ['Candle', 5], ['Crowbar', 1], ['Hammer', 1], ['Hooded Lantern', 1], ['Oil', 2], ['Rations', 5], ['Tinderbox', 1], ['Waterskin', 1], ['Rope', 1]],
    "Diplomat's Pack": [['City Card', 1], ['Chest', 1], ['Case', 2], ['Fine Clothes', 1], ['Ink', 1], ['Ink Pen', 1], ['Lamp', 1], ['Oil', 2], ['Paper', 5], ['Perfume', 1], ['Sealing Wax', 1], ['Soap', 1]],
    "Dungeoneer's Pack": [['Backpack', 1], ['City Card', 1], ['Crowbar', 1], ['Hammer', 1], ['Torch', 10], ['Rations', 10], ['Waterskin', 1], ['Rope', 1]],
    "Entertainer's Pack": [['Backpack', 1], ['City Card', 1], ['Bedroll', 1], ['Costume', 2], ['Candle', 5], ['Rations', 5], ['Waterskin', 1], ['Disguise Kit', 1]],
    "Explorer's Pack": [['Backpack', 1], ['City Card', 1], ['Bedroll', 1], ['Mess Kit', 1], ['Tinderbox', 1], ['Torch', 10], ['Rations', 10], ['Waterskin', 1], ['Rope', 1]],
    "Priest's Pack": [['Backpack', 1], ['City Card', 1], ['Blanket', 1], ['Candle', 10], ['Tinderbox', 1], ['Alms Box', 1], ['Incense', 2], ['Censer', 1], ['Vestments', 1], ['Rations', 2], ['Waterskin', 1]],
    "Scholar's Pack": [['Backpack', 1], ['City Card', 1], ['Book', 1], ['Ink', 1], ['Ink Pen', 1], ['Parchment', 10], ['Sand', 1], ['Knife', 1]]
  };
  let catalog = [];
  let dragged = null;
  const pencilIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4M4 16l4 4"/></svg>';
  const bagIcon = '<svg class="inventory-bag-mark" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 7c0-3 1.5-4 4-4s4 1 4 4M6 8h12l2 12H4L6 8Z"/><path d="M9 11c.4 1.2 1.4 2 3 2s2.6-.8 3-2"/></svg>';

  const text = (node) => (node?.textContent || '').replace(/\s+/g, ' ').trim();
  const escapeHtml = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const parseWeight = (value) => { const found = String(value || '').replace(/,/g, '').match(/\d+(?:\.\d+)?/); return found ? Number(found[0]) : 0.25; };
  const normalized = (value) => String(value || '').toLowerCase().replace(/[’]/g, "'").replace(/^\s*(?:a|an|the)\s+/, '').replace(/[^a-z0-9]+/g, ' ').trim();
  const capacityMultiplier = (size) => capacityMultipliers[size] || 1;
  const equipmentSizeMultiplier = (size) => equipmentSizeMultipliers[size] || 1;
  const isPortableContainer = (item) => {
    const name = String(item?.name || '');
    return /\b(backpack|basket|briefcase|chest|pouch|quiver|sack|satchel|saddlebags|case)\b/i.test(name) || /^bag\b|\bbag$/i.test(name.trim());
  };
  const averageDice = (value) => {
    const match = String(value ?? '').trim().match(/^(\d*)d(\d+)(?:\s*([+-])\s*(\d+))?$/i);
    if (!match) return null;
    const count = Number(match[1] || 1), sides = Number(match[2]), modifier = Number(match[4] || 0) * (match[3] === '-' ? -1 : 1);
    return count > 0 && sides > 0 ? Math.max(0, Math.ceil(count * (sides + 1) / 2 + modifier)) : null;
  };
  const explicitItemHp = (item) => {
    const formula = item.hpFormula || (typeof item.baseHp === 'string' ? item.baseHp : null) || (typeof item.hp === 'string' ? item.hp : null);
    const rolled = averageDice(formula);
    if (rolled !== null) return rolled;
    const description = String(item.description || '');
    const describedRoll = description.match(/\b(?:has|have)\s+((?:\d*)d\d+(?:\s*[+-]\s*\d+)?)\s+hit points?\b/i);
    const describedAverage = averageDice(describedRoll?.[1]);
    if (describedAverage !== null) return describedAverage;
    const fixed = description.match(/\b(?:has|have)\s+(\d+)\s+hit points?\b/i);
    return fixed ? Number(fixed[1]) : null;
  };
  const defaultDurability = (item) => /weapon|armor|tool/i.test(String(item.type || '')) || isPortableContainer(item) ? 'Resilient' : 'Fragile';
  const workshopProfile = (item) => {
    const category = `${item.category || ''} ${item.type || ''}`;
    if (/\badvanced\b/i.test(category) && /weapon|firearm/i.test(category)) return { label: 'Advanced weapon', dice: 3, sides: 6 };
    if (/\bmartial\b/i.test(category) && /weapon/i.test(category)) return { label: 'Martial weapon', dice: 2, sides: 6 };
    if (/\b(?:simple|basic)\b/i.test(category) && /weapon|firearm/i.test(category)) return { label: /basic/i.test(category) ? 'Basic firearm' : 'Simple weapon', dice: 1, sides: 6 };
    const apparel = category.match(/\b(light|medium|heavy)\b/i)?.[1]?.toLowerCase();
    if (apparel && /armor|shield/i.test(category)) return { label: `${apparel[0].toUpperCase()}${apparel.slice(1)} apparel`, dice: { light: 2, medium: 3, heavy: 4 }[apparel], sides: 8 };
    return null;
  };
  const workshopItemHp = (item) => {
    const profile = item.workshop ? workshopProfile(item) : null;
    if (!profile) return null;
    const displayedBonus = Number(document.querySelector('#sheet-proficiency')?.textContent?.match(/\d+/)?.[0]);
    const proficiency = Math.max(2, Number(item.workshopProficiencyBonus) || displayedBonus || 2);
    const bonus = proficiency * (item.workshopExpertise ? 2 : 1);
    return Math.ceil(profile.dice * (profile.sides + 1) / 2 + bonus);
  };
  const isWeapon = (item) => /weapon|firearm/i.test(`${item?.type || ''} ${item?.category || ''}`);
  const isArmor = (item) => /armor|shield/i.test(`${item?.type || ''} ${item?.category || ''}`);
  const setWorkshopProperty = (item, enabled) => {
    const properties = String(item.properties || '').split(',').map((property) => property.trim()).filter((property) => property && !/^workshop$/i.test(property));
    if (enabled) properties.push('Workshop');
    item.properties = properties.join(', ');
  };
  const dictatedItemHp = (item) => {
    const workshop = workshopItemHp(item);
    if (workshop !== null) return workshop;
    const explicit = explicitItemHp(item);
    if (explicit !== null) return explicit;
    const rulesSize = ['Tiny', 'Small', 'Medium', 'Large'].includes(item.size) ? item.size : 'Large';
    const durability = item.durability === 'Resilient' ? 'Resilient' : item.durability === 'Fragile' ? 'Fragile' : defaultDurability(item);
    return objectHitPoints[rulesSize][durability];
  };
  const syncItemHp = (item, reset = false) => {
    if (!item.hpFormula && typeof item.hp === 'string' && averageDice(item.hp) !== null) item.hpFormula = item.hp;
    item.durability ||= defaultDurability(item);
    const maximum = dictatedItemHp(item), previousMaximum = Number(item.maxHp);
    if (reset || item.hpRuleVersion !== 2 || !Number.isFinite(Number(item.hp))) item.hp = maximum;
    else if (Number.isFinite(previousMaximum) && Number(item.hp) === previousMaximum) item.hp = maximum;
    else item.hp = Math.min(maximum, Math.max(0, Math.floor(Number(item.hp) || 0)));
    item.maxHp = maximum;
    item.hpRuleVersion = 2;
    return item;
  };
  const carriedItems = (state) => state.inventory.filter((item) => !item.containerId);
  const contentsFor = (state, container) => state.inventory.filter((item) => item.containerId === container.id);
  const containersFor = (state, item) => state.inventory.filter((candidate) => isPortableContainer(candidate) && candidate !== item);
  const containerMaxLoadedWeight = (container) => /\bbackpack\b/i.test(String(container?.name || '')) ? 30 : Infinity;
  const storeInContainer = (content, container, state) => {
    if (!content || !container || content === container || isPortableContainer(content)) return false;
    const currentContentsWeight = state
      ? contentsFor(state, container).filter((item) => item !== content).reduce((sum, item) => sum + Math.max(0, Number(item.weight) || 0), 0)
      : Math.max(0, Number(container.contentsWeight) || 0);
    const loadedWeight = Math.max(0, Number(container.weight) || 0) + currentContentsWeight + Math.max(0, Number(content.weight) || 0);
    if (loadedWeight > containerMaxLoadedWeight(container)) return false;
    content.containerId = container.id;
    content.x = null;
    content.y = null;
    content.manuallyPlaced = false;
    content.unplaced = false;
    return true;
  };
  const takeOutOfContainer = (content) => {
    if (!content?.containerId) return false;
    delete content.containerId;
    content.x = null;
    content.y = null;
    content.manuallyPlaced = false;
    content.unplaced = false;
    return true;
  };
  const syncContainerLoads = (state) => {
    const containerIds = new Set(state.inventory.filter(isPortableContainer).map((item) => item.id));
    state.inventory.forEach((item) => {
      delete item.loadedWeight;
      delete item.contentsWeight;
      if (item.containerId && !containerIds.has(item.containerId)) delete item.containerId;
    });
    state.inventory.filter(isPortableContainer).forEach((container) => {
      let contents = contentsFor(state, container);
      const maximumLoadedWeight = containerMaxLoadedWeight(container);
      let loadedWeight = Math.max(0, Number(container.weight) || 0) + contents.reduce((sum, item) => sum + Math.max(0, Number(item.weight) || 0), 0);
      while (loadedWeight > maximumLoadedWeight && contents.length) {
        const overflow = contents.pop();
        loadedWeight -= Math.max(0, Number(overflow.weight) || 0);
        takeOutOfContainer(overflow);
      }
      contents = contentsFor(state, container);
      container.contentsWeight = contents.reduce((sum, item) => sum + Math.max(0, Number(item.weight) || 0), 0);
      container.loadedWeight = Math.max(0, Number(container.weight) || 0) + container.contentsWeight;
    });
  };
  const cubeUnits = (item) => {
    if (!(item.contentsWeight > 0) && Number.isFinite(Number(item.customCubes))) return Math.max(0.25, Math.floor(Number(item.customCubes) * 4) / 4);
    const pounds = Math.max(0, Number(item.loadedWeight ?? item.weight) || 0);
    return pounds <= 0.5 ? 0.25 : Math.max(1, Math.floor(pounds));
  };
  const rotateCells = (cells, rotation = 0) => {
    let rotated = cells.map((cell) => ({ ...cell }));
    for (let turn = 0; turn < ((rotation % 360) + 360) % 360 / 90; turn += 1) {
      const height = Math.max(...rotated.map((cell) => cell.y)) + 1;
      rotated = rotated.map((cell) => ({ x: height - 1 - cell.y, y: cell.x }));
    }
    const left = Math.min(...rotated.map((cell) => cell.x)), top = Math.min(...rotated.map((cell) => cell.y));
    return rotated.map((cell) => ({ x: cell.x - left, y: cell.y - top }));
  };
  const weaponCells = (item, whole) => {
    if (!isWeapon(item) || whole < 2) return null;
    const name = normalized(item.name), firearm = /firearm/i.test(`${item.type || ''} ${item.category || ''}`), cells = [];
    const shaftWithHead = (headWidth = 3) => {
      const width = Math.min(headWidth, Math.max(2, whole - 1)), handleX = Math.floor(width / 2);
      for (let x = 0; x < width; x += 1) cells.push({ x, y: 0 });
      for (let y = 1; cells.length < whole; y += 1) cells.push({ x: handleX, y });
    };
    if (/maul|hammer|mallet|pick|axe|hatchet|mace|morningstar/.test(name)) shaftWithHead(/maul|great|battle|morningstar/.test(name) ? 3 : 2);
    else if (/crossbow|trident|glaive|halberd/.test(name)) shaftWithHead(3);
    else if (/bow/.test(name) && whole >= 4) {
      cells.push({ x: 1, y: 0 }, { x: 0, y: 0 });
      for (let y = 1; cells.length < whole - 1; y += 1) cells.push({ x: 0, y });
      cells.push({ x: 1, y: Math.max(1, whole - 3) });
    } else if ((firearm || /rifle|musket|shotgun|carbine|pistol|revolver|blunderbuss|pepperbox|gatling|rpg|smg/.test(name)) && whole >= 3) {
      for (let y = 0; y < whole - 1; y += 1) cells.push({ x: 0, y });
      cells.push({ x: 1, y: whole - 2 });
    } else if (/sword|blade|rapier|scimitar|saber|sabre|katana/.test(name) && whole >= 5) {
      for (let y = 0; cells.length < whole - 4; y += 1) cells.push({ x: 1, y });
      const guardY = Math.max(1, whole - 4);
      cells.push({ x: 0, y: guardY }, { x: 1, y: guardY }, { x: 2, y: guardY }, { x: 1, y: guardY + 1 });
    } else if (/flail|whip|chain|sickle/.test(name) && whole >= 4) {
      for (let y = 0; y < whole - 2; y += 1) cells.push({ x: 0, y });
      cells.push({ x: 1, y: whole - 3 }, { x: 1, y: whole - 2 });
    } else {
      for (let y = 0; y < whole; y += 1) cells.push({ x: 0, y });
    }
    return cells;
  };
  const capacity = (state) => {
    const strength = Math.max(0, Number(state.scores?.Strength) || 0), multiplier = capacityMultiplier(state.size), rows = Math.floor(strength * multiplier);
    return { strength, multiplier, rows, clear: rows * 5, heavy: rows * 10, total: rows * 15 };
  };
  const itemShape = (item) => {
    const units = cubeUnits(item), whole = Math.max(1, Math.ceil(units));
    const container = isPortableContainer(item);
    const exactRectangle = () => { let width = Math.min(5, Math.floor(Math.sqrt(whole))); while (width > 1 && whole % width) width -= 1; return { width, height: whole / width }; };
    let width, height, cells = null;
    if (container) { width = Math.min(5, whole); height = Math.ceil(whole / 5); }
    else if (item.customShape && !(item.contentsWeight > 0)) { width = Math.min(columns, Math.max(1, Math.floor(Number(item.customShape.w) || 1))); height = Math.max(1, Math.floor(Number(item.customShape.h) || 1)); }
    else {
      cells = weaponCells(item, whole);
      if (!cells) ({ width, height } = exactRectangle());
    }
    if (container) cells = Array.from({ length: whole }, (_, index) => ({ x: index % 5, y: Math.floor(index / 5) }));
    if (cells) {
      cells = rotateCells(cells, item.rotation || 0);
      width = Math.max(...cells.map((cell) => cell.x)) + 1;
      height = Math.max(...cells.map((cell) => cell.y)) + 1;
    } else if ((item.rotation || 0) % 180) [width, height] = [height, width];
    const fractional = units === 0.25;
    return { width, height, units, occupiedUnits: fractional ? 0.25 : cells ? cells.length : width * height, fractional, cells };
  };
  const shapeCells = (shape) => shape.cells || Array.from({ length: shape.width * shape.height }, (_, index) => ({ x: index % shape.width, y: Math.floor(index / shape.width) }));
  const shapeSegments = (shape) => {
    const rowRuns = [];
    for (let row = 0; row < shape.height; row += 1) {
      const xs = shapeCells(shape).filter((cell) => cell.y === row).map((cell) => cell.x).sort((left, right) => left - right);
      xs.forEach((x) => {
        const previous = rowRuns.at(-1);
        if (previous?.row === row && previous.start + previous.width === x) previous.width += 1;
        else rowRuns.push({ row, start: x, width: 1, height: 1 });
      });
    }
    return rowRuns.reduce((segments, run) => {
      let previous = null;
      for (let index = segments.length - 1; index >= 0; index -= 1) {
        const segment = segments[index];
        if (segment.start === run.start && segment.width === run.width && segment.row + segment.height === run.row) { previous = segment; break; }
      }
      if (previous) previous.height += 1;
      else segments.push({ ...run });
      return segments;
    }, []);
  };
  const scaledDamage = (damage, size) => {
    const multiplier = equipmentSizeMultiplier(size);
    return String(damage || '').replace(/\b(\d+)d(\d+)\b/gi, (_, count, die) => `${Math.max(1, Math.floor(Number(count) * multiplier))}d${die}`);
  };
  const scaleForSize = (item, size) => {
    item.size = size || item.size || 'Medium'; item.baseWeight ??= Number(item.weight) || 0.25; item.baseDamage ??= item.damage || '';
    item.weight = Math.max(0.01, item.baseWeight * equipmentSizeMultiplier(item.size));
    item.damage = scaledDamage(item.baseDamage, item.size);
    return item;
  };
  const freshId = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;

  const loadCatalog = async () => {
    if (catalog.length) return catalog;
    const doc = new DOMParser().parseFromString(await fetch('../items/index.html').then((response) => response.text()), 'text/html');
    const items = [];
    doc.querySelectorAll('.item-card').forEach((card) => {
      const fields = card.querySelectorAll('.item-card__heading span'), name = text(card.querySelector('h3'));
      if (!name) return;
      const description = text(card.querySelector('p, .tool-details')) || 'No catalog description.', pounds = parseWeight(fields[1]?.textContent);
      const type = text(card.closest('.item-group')?.querySelector('.item-group-title')) || 'Gear';
      items.push({ name, weight: pounds, baseWeight: pounds, description, type, category: type, damage: '', properties: '' });
    });
    doc.querySelectorAll('table').forEach((table) => {
      const headers = [...table.querySelectorAll('thead th')].map((header) => text(header).toLowerCase());
      const nameIndex = headers.findIndex((header) => /name|shield type|ammunition/.test(header)), weightIndex = headers.findIndex((header) => /weight/.test(header));
      if (nameIndex < 0 || weightIndex < 0) return;
      const damageIndex = headers.findIndex((header) => /damage/.test(header)), propertiesIndex = headers.findIndex((header) => /properties/.test(header)), armorIndex = headers.findIndex((header) => /armor class/.test(header));
      const sectionTitle = text(table.closest('section')?.querySelector('.item-group-title')) || 'Equipment';
      const type = /weapon/i.test(table.className) ? 'Weapon' : /apparel|shield|armor/i.test(`${table.className} ${sectionTitle}`) ? 'Armor' : sectionTitle;
      let apparelSubcategory = '';
      table.querySelectorAll('tbody tr').forEach((row) => {
        if (row.classList.contains('apparel-subcategory')) { apparelSubcategory = text(row); return; }
        const cells = [...row.cells]; if (!cells[nameIndex] || cells.length <= weightIndex) return;
        const name = text(cells[nameIndex]), pounds = parseWeight(text(cells[weightIndex])), damage = damageIndex >= 0 ? text(cells[damageIndex]) : '', properties = propertiesIndex >= 0 ? text(cells[propertiesIndex]) : '', armor = armorIndex >= 0 ? text(cells[armorIndex]) : '';
        const description = [damage && `Damage: ${damage}.`, armor && `Armor Class: ${armor}.`, properties && `Properties: ${properties}.`].filter(Boolean).join(' ') || 'See the item catalog for details.';
        const category = /^shield$/i.test(sectionTitle) && apparelSubcategory ? apparelSubcategory : sectionTitle;
        if (name) items.push({ name, weight: pounds, baseWeight: pounds, description, type, category, damage, baseDamage: damage, properties });
      });
    });
    const byName = new Map();
    items.forEach((item) => { const key = normalized(item.name), current = byName.get(key); if (!current || (item.damage && !current.damage) || item.description.length > current.description.length) byName.set(key, item); });
    catalog = [...byName.values()].sort((left, right) => left.name.localeCompare(right.name));
    return catalog;
  };

  const catalogItem = (name) => { const key = normalized(name); return catalog.find((item) => normalized(item.name) === key) || catalog.find((item) => normalized(item.name).includes(key) || key.includes(normalized(item.name))); };
  const createItem = (source, state, overrides = {}) => {
    const size = overrides.size || 'Medium';
    return syncItemHp(scaleForSize({ ...source, ...overrides, id: freshId(), rotation: 0, x: null, y: null, fractionSlot: 0, size, characterSized: overrides.characterSized ?? false }, size), true);
  };
  const quantityBefore = (source, name) => {
    const index = normalized(source).indexOf(normalized(name)), prefix = normalized(source).slice(Math.max(0, index - 18), index).trim(), match = prefix.match(/(?:^|\s)(\d+|a|an|one|two|three|four|five|ten)$/);
    return match ? Number(match[1]) || numberWords[match[1]] || 1 : 1;
  };
  const expandSeed = (source, state) => {
    const exact = catalogItem(source), packName = Object.keys(packContents).find((name) => normalized(name) === normalized(exact?.name || source));
    if (packName) {
      const items = packContents[packName].flatMap(([name, quantity]) => { const found = catalogItem(name) || { name, weight: 0.25, baseWeight: 0.25, description: `Part of ${packName}.`, type: 'Gear' }; return Array.from({ length: quantity }, () => createItem(found, state, { sourceSeed: source, pack: packName, size: state.equipmentScaleSize || 'Medium', characterSized: true })); });
      const backpack = items.find((item) => /\bbackpack\b/i.test(item.name));
      if (backpack) items.forEach((item) => { if (item !== backpack) storeInContainer(item, backpack); });
      return items;
    }
    if (exact && normalized(exact.name) === normalized(source)) return [createItem(exact, state, { sourceSeed: source, size: state.equipmentScaleSize || 'Medium', characterSized: true })];
    const matches = catalog.filter((item) => normalized(item.name).length > 3 && normalized(source).includes(normalized(item.name))).sort((left, right) => right.name.length - left.name.length);
    const accepted = matches.filter((item, index) => !matches.slice(0, index).some((other) => normalized(other.name).includes(normalized(item.name))));
    if (accepted.length) return accepted.flatMap((item) => Array.from({ length: Math.min(20, quantityBefore(source, item.name)) }, () => createItem(item, state, { sourceSeed: source, size: state.equipmentScaleSize || 'Medium', characterSized: true })));
    if (/\bor\b|choose|weapon|firearm|armor|pack/i.test(source)) return [];
    return [createItem({ name: source, weight: 0.25, baseWeight: 0.25, description: 'Equipment granted during character creation.', type: 'Gear' }, state, { sourceSeed: source, size: state.equipmentScaleSize || 'Medium', characterSized: true })];
  };
  const seedInventory = (state) => {
    state.inventory ||= []; state.seededEquipment ||= [];
    (state.startingEquipment || []).filter(Boolean).forEach((source) => { if (!state.seededEquipment.includes(source)) { state.inventory.push(...expandSeed(source, state)); state.seededEquipment.push(source); } });
  };
  const resizeCharacterEquipment = (state, size = state.size || 'Medium') => {
    state.inventory ||= [];
    state.inventory.forEach((item) => {
      if (item.characterSized === false) return;
      const previousSize = item.size;
      const previousWeight = Number(item.weight) || 0;
      const previousDamage = item.damage || '';
      scaleForSize(item, size);
      syncItemHp(item);
      item.characterSized = true;
      if (previousSize !== item.size || previousWeight !== item.weight || previousDamage !== item.damage) {
        item.x = null;
        item.y = null;
        item.manuallyPlaced = false;
      }
    });
  };
  const applyInitialEquipmentScale = (state) => {
    if (state.inventoryScaleVersion === 2) return;
    resizeCharacterEquipment(state, state.equipmentScaleSize || 'Medium');
    state.inventoryScaleVersion = 2;
  };

  const autoPlace = (state) => {
    syncContainerLoads(state);
    const occupied = new Map(), capacityRows = capacity(state).rows;
    const spaceIsOpen = (item) => {
      const shape = itemShape(item);
      if (shape.fractional) {
        const existing = occupied.get(`${item.x},${item.y}`);
        return existing !== true && !(existing instanceof Set && existing.has(item.fractionSlot || 0));
      }
      if (shapeCells(shape).some((cell) => occupied.has(`${item.x + cell.x},${item.y + cell.y}`))) return false;
      return true;
    };
    const reserve = (item) => {
      const shape = itemShape(item);
      if (shape.fractional) { const key = `${item.x},${item.y}`, slots = occupied.get(key) instanceof Set ? occupied.get(key) : new Set(); slots.add(item.fractionSlot || 0); occupied.set(key, slots); return; }
      shapeCells(shape).forEach((cell) => occupied.set(`${item.x + cell.x},${item.y + cell.y}`, true));
    };
    carriedItems(state).forEach((item) => {
      if (!Number.isFinite(item.x) || !Number.isFinite(item.y)) return;
      const shape = itemShape(item);
      if (item.x < 0 || item.y < 0 || item.x + shape.width > columns || item.y + shape.height > capacityRows || !spaceIsOpen(item)) {
        item.x = null;
        item.y = null;
        item.manuallyPlaced = false;
        item.unplaced = true;
        return;
      }
      reserve(item);
    });
    carriedItems(state).forEach((item) => {
      if (Number.isFinite(item.x) && Number.isFinite(item.y)) return;
      const shape = itemShape(item);
      const tryPosition = (x, y) => {
          if (shape.fractional) {
            const key = `${x},${y}`, existing = occupied.get(key); if (existing === true) return false;
            const slots = existing instanceof Set ? existing : new Set(), slot = [0, 1, 2, 3].find((candidate) => !slots.has(candidate)); if (slot === undefined) return false;
            item.x = x; item.y = y; item.fractionSlot = slot; item.unplaced = false; slots.add(slot); occupied.set(key, slots); return true;
          }
          const clear = !shapeCells(shape).some((cell) => occupied.has(`${x + cell.x},${y + cell.y}`));
          if (clear) { item.x = x; item.y = y; item.unplaced = false; reserve(item); return true; }
          return false;
      };
      let placed = false;
      const placementBands = shape.width > 5 ? [[0, columns]] : [[0, 5], [5, 10], [10, 15]];
      for (const [start, end] of placementBands) {
        if (shape.width > end - start) continue;
        for (let y = 0; y + shape.height <= capacityRows && !placed; y += 1) {
          for (let x = start; x + shape.width <= end; x += 1) if (tryPosition(x, y)) { placed = true; break; }
        }
        if (placed) break;
      }
      if (!placed) { item.x = null; item.y = null; item.manuallyPlaced = false; item.unplaced = true; }
    });
  };
  const statusFor = (state) => {
    syncContainerLoads(state);
    const topLevel = carriedItems(state), limits = capacity(state), weight = state.inventory.reduce((sum, item) => sum + Math.max(0, Number(item.weight) || 0), 0), cubes = topLevel.reduce((sum, item) => sum + itemShape(item).occupiedUnits, 0);
    let mode = cubes > limits.heavy ? 'heavy' : cubes > limits.clear ? 'encumbered' : 'clear';
    topLevel.forEach((item) => {
      if (!Number.isFinite(item.x) || !Number.isFinite(item.y)) return;
      const shape = itemShape(item), right = item.x + shape.width, bottom = item.y + shape.height;
      if (right > 10 || bottom > limits.rows) mode = 'heavy';
      else if (right > 5 && mode === 'clear') mode = 'encumbered';
    });
    const label = mode === 'heavy' ? 'Heavily Encumbered: -20 speed; disadvantage on Strength, Dexterity, and Constitution checks, attacks, and saves.' : mode === 'encumbered' ? 'Encumbered: -10 speed.' : 'Not Encumbered';
    return { ...limits, weight, cubes, mode, label };
  };
  const compactItemLabel = (item, shape) => {
    const name = String(item.name || 'Item').trim();
    if (shape.fractional) return name.charAt(0).toUpperCase();
    if (shape.width === 1 && shape.height === 1 && name.length > 7) {
      const words = name.split(/\s+/).filter(Boolean);
      return words.length > 1 ? words.map((word) => word[0]).join('').slice(0, 3).toUpperCase() : name.slice(0, 3);
    }
    return name;
  };
  const itemLabelMarkup = (item, shape) => {
    const label = compactItemLabel(item, shape);
    const detail = label.match(/^(.+?)\s*(\([^)]*\))$/);
    return detail ? `${escapeHtml(detail[1])}<br><small>${escapeHtml(detail[2])}</small>` : escapeHtml(label);
  };
  const renderItem = (item) => {
    const shape = itemShape(item), container = isPortableContainer(item), fractionClass = shape.fractional ? ' inventory-item--fraction' : '', verticalClass = !shape.fractional && shape.width <= 2 && shape.height > shape.width * 1.5 ? ' inventory-item--vertical' : '', containerClass = container ? ' inventory-item--container' : '', zone = item.x + shape.width > 10 ? 'heavy' : item.x + shape.width > 5 ? 'encumbered' : 'clear', displayWeight = Number(item.loadedWeight ?? item.weight) || 0;
    if (shape.cells) {
      const segments = shapeSegments(shape);
      const labelSegment = segments.reduce((best, segment, index) => segment.width * segment.height > segments[best].width * segments[best].height ? index : best, 0);
      return segments.map((segment, index) => {
        const isVertical = segment.width <= 2 && segment.height > segment.width * 1.5;
        const label = index === labelSegment ? `<span class="inventory-item__label" aria-hidden="true">${itemLabelMarkup(item, shape)}${container ? bagIcon : ''}</span>` : '';
        return `<button type="button" class="inventory-item inventory-item--shape-segment${container ? ' inventory-item--container inventory-item--container-segment' : ' inventory-item--weapon-segment'}${isVertical ? ' inventory-item--vertical' : ''}" data-item-id="${escapeHtml(item.id)}"${container ? ` data-container-id="${escapeHtml(item.id)}"` : ''} data-shape-row="${segment.row}" data-shape-column="${segment.start}" data-shape-height="${segment.height}" data-shape-width="${segment.width}" data-zone="${zone}" draggable="true"${index === labelSegment ? '' : ' tabindex="-1" aria-hidden="true"'} style="grid-column:${item.x + segment.start + 1} / span ${segment.width};grid-row:${item.y + segment.row + 1} / span ${segment.height}" title="${escapeHtml(item.name)} · ${displayWeight} lb.${container ? ' · Drop items here' : ''}" aria-label="${escapeHtml(item.name)}, ${displayWeight} pounds${container ? ', item container' : ''}">${label}</button>`;
      }).join('');
    }
    return `<button type="button" class="inventory-item${fractionClass}${verticalClass}${containerClass}" data-item-id="${escapeHtml(item.id)}"${container ? ` data-container-id="${escapeHtml(item.id)}"` : ''} data-zone="${zone}" data-fraction-slot="${item.fractionSlot || 0}" draggable="true" style="grid-column:${item.x + 1} / span ${shape.width};grid-row:${item.y + 1} / span ${shape.height}" title="${escapeHtml(item.name)} · ${displayWeight} lb.${container ? ' · Drop items here' : ''}" aria-label="${escapeHtml(item.name)}, ${displayWeight} pounds${container ? ', item container' : ''}"><span class="inventory-item__label" aria-hidden="true">${itemLabelMarkup(item, shape)}${container ? bagIcon : ''}</span></button>`;
  };
  const renderUnplacedItem = (item) => `<button type="button" class="inventory-unplaced__item${isPortableContainer(item) ? ' inventory-item--container' : ''}" data-item-id="${escapeHtml(item.id)}"${isPortableContainer(item) ? ` data-container-id="${escapeHtml(item.id)}"` : ''} draggable="true" title="Drag this item into an open area of the inventory grid">${escapeHtml(item.name)}${isPortableContainer(item) ? bagIcon : ''}</button>`;
  const overlapsAnotherItem = (state, item) => {
    const shape = itemShape(item);
    return carriedItems(state).some((other) => {
      if (other === item || !Number.isFinite(other.x) || !Number.isFinite(other.y)) return false;
      const otherShape = itemShape(other);
      if (shape.fractional && otherShape.fractional) return item.x === other.x && item.y === other.y && item.fractionSlot === other.fractionSlot;
      const occupiedByOther = new Set(shapeCells(otherShape).map((cell) => `${other.x + cell.x},${other.y + cell.y}`));
      return shapeCells(shape).some((cell) => occupiedByOther.has(`${item.x + cell.x},${item.y + cell.y}`));
    });
  };
  const download = (name, data) => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })), link = document.createElement('a');
    link.hidden = true; link.href = url; link.download = name.replace(/[\\/:*?"<>|]+/g, '-') + '.json'; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const refresh = () => window.FableCharacterBuilder?.renderPanel('inventory');

  const openItem = (host, state, item) => {
    const aside = host.querySelector('.inventory-inspector'), shape = itemShape(item), container = isPortableContainer(item), contents = container ? contentsFor(state, item) : [], loaded = contents.length > 0;
    state.selectedInventoryItemId = item.id;
    const availableContainers = containersFor(state, item);
    const workshop = workshopProfile(item);
    const weapon = isWeapon(item);
    const armor = isArmor(item);
    const displayedProficiency = Math.max(2, Number(document.querySelector('#sheet-proficiency')?.textContent?.match(/\d+/)?.[0]) || 2);
    const workshopProficiency = Math.max(2, Number(item.workshopProficiencyBonus) || displayedProficiency);
    const workshopBonus = workshopProficiency * (item.workshopExpertise ? 2 : 1);
    const itemStatus = Number(item.hp) <= 0 ? 'Destroyed' : Number(item.hp) <= Number(item.maxHp) / 2 ? 'Broken' : 'Intact';
    const conditionRule = weapon ? 'Broken weapons make attack rolls with disadvantage.' : armor ? 'Broken armor and shields impose a −1 AC penalty.' : '';
    const conditionMarkup = `<section class="inventory-item-condition"><header><strong>Item condition</strong><span class="inventory-item-condition__status inventory-item-condition__status--${itemStatus.toLowerCase()}">${itemStatus}</span></header><div><span><small>Current HP</small><b>${item.hp} / ${item.maxHp}</b></span><span><small>Broken at</small><b>${Math.floor(Number(item.maxHp) / 2)} HP</b></span></div>${conditionRule ? `<p>${conditionRule}</p>` : ''}</section>`;
    const workshopMarkup = workshop ? `<section class="inventory-workshop"><header><strong>Workshop property</strong><button type="button" data-workshop-toggle aria-pressed="${Boolean(item.workshop)}">${item.workshop ? 'On' : 'Off'}</button></header><div class="inventory-workshop__grid"><span><small>Category</small><b>${escapeHtml(workshop.label)}</b></span><span><small>HP formula</small><b>${workshop.dice}d${workshop.sides} + ${workshopBonus}</b></span><label>Crafter proficiency<input data-workshop-proficiency type="number" min="2" step="1" value="${workshopProficiency}"${item.workshop ? '' : ' disabled'}></label><span><small>Tool expertise</small><button type="button" data-workshop-expertise aria-pressed="${Boolean(item.workshopExpertise)}"${item.workshop ? '' : ' disabled'}>${item.workshopExpertise ? 'On' : 'Off'}</button></span></div></section>` : '';
    const weaponMarkup = weapon ? `<label class="inventory-edit-fields__wide">Damage<input data-damage value="${escapeHtml(item.baseDamage || item.damage || '')}"></label><label class="inventory-edit-fields__wide">Properties<input data-properties value="${escapeHtml(item.properties || '')}"></label>` : '';
    const storageMarkup = !container && availableContainers.length ? `<section class="inventory-storage-actions"><span>Move to container</span><div>${availableContainers.map((target) => `<button type="button" data-store-in="${escapeHtml(target.id)}">${bagIcon}${escapeHtml(target.name)}</button>`).join('')}</div></section>` : '';
    const contentsMarkup = container ? `<section class="inventory-container-contents"><div class="inventory-container-contents__heading"><span>${bagIcon}<strong>Inside</strong></span><small>${contents.length} item${contents.length === 1 ? '' : 's'} · ${Number(item.contentsWeight || 0).toFixed(2)} lb.</small></div>${contents.length ? contents.map((content) => `<div class="inventory-container-content"><span>${escapeHtml(content.name)}<small>${Number(content.weight || 0).toFixed(2)} lb.</small></span><button type="button" data-remove-contained="${escapeHtml(content.id)}">Take out</button></div>`).join('') : '<p>Drag an item onto this container to store it.</p>'}</section>` : '';
    aside.innerHTML = `<div class="inventory-inspector__heading"><div><span>${escapeHtml(item.type || 'Item')}</span><h3>${escapeHtml(item.name)}${container ? bagIcon : ''}</h3></div><button type="button" data-close aria-label="Close item details">×</button></div><p>${escapeHtml(item.description || 'No description.')}</p>${item.damage ? `<p><strong>Damage:</strong> ${escapeHtml(item.damage)}</p>` : ''}${item.properties ? `<p><strong>Properties:</strong> ${escapeHtml(item.properties)}</p>` : ''}${container ? `<p class="inventory-container-load"><strong>Loaded weight:</strong> ${Number(item.loadedWeight || item.weight || 0).toFixed(2)} lb. · ${shape.occupiedUnits} cubes</p>` : ''}${contentsMarkup}<div class="inventory-edit-fields"><label>Weight (lb.)<input data-weight type="number" min="0" step="0.01" value="${item.weight}"></label><label>HP (max ${item.maxHp})<input data-hp type="number" min="0" max="${item.maxHp}" step="1" value="${item.hp}"></label><label>Item size<select data-size>${Object.keys(equipmentSizeMultipliers).map((size) => `<option${item.size === size ? ' selected' : ''}>${size}</option>`).join('')}</select></label><label>Durability<select data-durability><option${item.durability === 'Fragile' ? ' selected' : ''}>Fragile</option><option${item.durability === 'Resilient' ? ' selected' : ''}>Resilient</option></select></label><label>Cubes<input data-cubes type="number" min="0.25" step="0.25" value="${shape.occupiedUnits}"${loaded ? ' disabled title="Loaded containers use their combined weight"' : ''}></label><label>Cube width<input data-width type="number" min="1" max="15" step="1" value="${shape.width}"${loaded ? ' disabled title="Loaded containers use their combined weight"' : ''}></label><label>Cube height<input data-height type="number" min="1" step="1" value="${shape.height}"${loaded ? ' disabled title="Loaded containers use their combined weight"' : ''}></label></div><div class="inventory-inspector__actions"><button type="button" data-rotate>Rotate</button><button type="button" data-export>Export Item</button><button type="button" data-delete>Delete</button></div>`;
    aside.hidden = false;
    if (storageMarkup) aside.querySelector('.inventory-edit-fields').insertAdjacentHTML('beforebegin', storageMarkup);
    if (workshopMarkup) aside.querySelector('.inventory-edit-fields').insertAdjacentHTML('beforebegin', workshopMarkup);
    aside.querySelector('.inventory-edit-fields').insertAdjacentHTML('beforebegin', conditionMarkup);
    if (weaponMarkup) aside.querySelector('.inventory-edit-fields').insertAdjacentHTML('afterbegin', weaponMarkup);
    aside.querySelector('[data-close]').onclick = () => { state.selectedInventoryItemId = ''; aside.hidden = true; };
    aside.querySelector('[data-workshop-toggle]')?.addEventListener('click', () => { item.workshop = !item.workshop; item.workshopProficiencyBonus ||= displayedProficiency; setWorkshopProperty(item, item.workshop); syncItemHp(item, true); refresh(); });
    aside.querySelector('[data-workshop-proficiency]')?.addEventListener('change', (event) => { item.workshopProficiencyBonus = Math.max(2, Math.floor(Number(event.target.value) || displayedProficiency)); syncItemHp(item, true); refresh(); });
    aside.querySelector('[data-workshop-expertise]')?.addEventListener('click', () => { item.workshopExpertise = !item.workshopExpertise; syncItemHp(item, true); refresh(); });
    aside.querySelector('[data-damage]')?.addEventListener('change', (event) => { item.baseDamage = event.target.value.trim(); item.damage = scaledDamage(item.baseDamage, item.size); refresh(); });
    aside.querySelector('[data-properties]')?.addEventListener('change', (event) => { item.properties = event.target.value.trim(); item.workshop = /(?:^|,)\s*workshop\s*(?:,|$)/i.test(item.properties); syncItemHp(item, true); refresh(); });
    aside.querySelector('[data-weight]').onchange = (event) => { item.weight = Math.max(0, Number(event.target.value) || 0); item.baseWeight = item.weight / equipmentSizeMultiplier(item.size); if (!Number.isFinite(Number(item.customCubes))) { item.x = null; item.y = null; item.manuallyPlaced = false; } refresh(); };
    aside.querySelector('[data-hp]').onchange = (event) => { item.hp = Math.min(item.maxHp, Math.max(0, Math.floor(Number(event.target.value) || 0))); event.target.value = item.hp; refresh(); };
    aside.querySelector('[data-size]').onchange = (event) => { scaleForSize(item, event.target.value); syncItemHp(item, true); item.characterSized = false; item.x = null; item.y = null; item.manuallyPlaced = false; refresh(); };
    aside.querySelector('[data-durability]').onchange = (event) => { item.durability = event.target.value; syncItemHp(item, true); refresh(); };
    aside.querySelectorAll('[data-remove-contained]').forEach((button) => { button.onclick = () => { const content = state.inventory.find((entry) => entry.id === button.dataset.removeContained); if (takeOutOfContainer(content)) refresh(); }; });
    aside.querySelectorAll('[data-store-in]').forEach((button) => { button.onclick = () => { const target = state.inventory.find((entry) => entry.id === button.dataset.storeIn); if (storeInContainer(item, target, state)) { state.selectedInventoryItemId = target.id; refresh(); } }; });
    aside.querySelector('[data-cubes]').onchange = (event) => { item.customCubes = Math.max(0.25, Math.floor((Number(event.target.value) || 0.25) * 4) / 4); item.x = null; item.y = null; item.manuallyPlaced = false; refresh(); };
    const updateShape = () => { item.customShape = { w: Number(aside.querySelector('[data-width]').value) || 1, h: Number(aside.querySelector('[data-height]').value) || 1 }; item.customCubes = item.customShape.w * item.customShape.h; item.rotation = 0; item.x = null; item.y = null; item.manuallyPlaced = false; refresh(); };
    aside.querySelector('[data-width]').onchange = updateShape; aside.querySelector('[data-height]').onchange = updateShape;
    aside.querySelector('[data-rotate]').onclick = () => { item.rotation = ((item.rotation || 0) + 90) % (isWeapon(item) && !item.customShape ? 360 : 180); item.x = null; item.y = null; item.manuallyPlaced = false; refresh(); };
    aside.querySelector('[data-export]').onclick = () => { const exported = { ...item, id: undefined, x: null, y: null, loadedWeight: undefined, contentsWeight: undefined, containerId: undefined }; download(item.name || 'item', { format: 'fable-inventory-item', version: 1, item: exported }); };
    aside.querySelector('[data-delete]').onclick = () => { contentsFor(state, item).forEach((content) => { delete content.containerId; content.x = null; content.y = null; content.manuallyPlaced = false; }); state.selectedInventoryItemId = ''; state.inventory = state.inventory.filter((entry) => entry.id !== item.id); refresh(); };
  };

  const render = async (host, state) => {
    await loadCatalog(); if (!host.isConnected) return;
    seedInventory(state); applyInitialEquipmentScale(state); state.inventory.forEach((item) => { item.category ||= catalogItem(item.name)?.category; item.size ||= 'Medium'; if (item.workshop === undefined) item.workshop = /(?:^|,)\s*workshop\s*(?:,|$)/i.test(item.properties || ''); syncItemHp(item); }); autoPlace(state);
    const status = statusFor(state), rows = Math.max(1, status.rows);
    window.FableCharacterBuilder?.applyEncumbrance(status.mode);
    const cells = Array.from({ length: rows * columns }, (_, index) => { const column = index % columns, zone = index >= status.total ? 'overflow' : column < 5 ? 'clear' : column < 10 ? 'encumbered' : 'heavy'; return `<span class="inventory-cell inventory-cell--${zone}" style="grid-column:${column + 1};grid-row:${Math.floor(index / columns) + 1}"></span>`; }).join('');
    const topLevel = carriedItems(state);
    const placedItems = topLevel.filter((item) => Number.isFinite(item.x) && Number.isFinite(item.y));
    const unplacedItems = topLevel.filter((item) => !Number.isFinite(item.x) || !Number.isFinite(item.y));
    host.innerHTML = `<section class="inventory-shell"><header class="inventory-summary"><div><span>Strength ${status.strength} · ${state.size || 'Medium'} ×${status.multiplier}</span><strong>${status.label}</strong></div><div><span>Carried weight</span><strong>${status.weight.toFixed(2)} lb.</strong></div><div><span>Occupied cubes</span><strong>${status.cubes.toFixed(2)} / ${status.total}</strong></div><div class="inventory-cash"><span>Cash</span><strong>$${Number(state.cash || 0).toLocaleString()}</strong><button class="sheet-edit-button" type="button" data-sheet-edit="cash" aria-label="Edit cash" title="Edit cash">${pencilIcon}</button></div></header><div class="inventory-toolbar"><div class="inventory-catalog-search"><label for="inventory-catalog-search">Website item catalog</label><div class="inventory-catalog-search__field"><input id="inventory-catalog-search" type="text" placeholder="Find equipment…" autocomplete="off" role="combobox" aria-autocomplete="list" aria-controls="inventory-catalog-results" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 9 5 6 5-6"/></svg></div><div class="inventory-catalog-results" id="inventory-catalog-results" role="listbox" hidden></div></div><button type="button" data-add-catalog>Add Item</button><button type="button" data-import-item>Import Item</button><input data-item-file type="file" accept="application/json,.json" hidden></div><div class="inventory-zones"><span class="inventory-zones__clear">Not Encumbered <small>up to ${status.clear} cubes</small></span><span class="inventory-zones__encumbered">Encumbered <small>${Math.floor(status.clear) + 1}–${status.heavy} cubes</small></span><span class="inventory-zones__heavy">Heavily Encumbered <small>${Math.floor(status.heavy) + 1}–${status.total} cubes</small></span></div><div class="inventory-workspace"><div class="inventory-grid" style="--inventory-rows:${rows}">${cells}${placedItems.map(renderItem).join('')}</div>${unplacedItems.length ? `<section class="inventory-unplaced" aria-label="Items that do not fit"><strong>Not enough open cubes</strong><span>Rearrange the grid, rotate an item, or remove equipment.</span><div>${unplacedItems.map(renderUnplacedItem).join('')}</div></section>` : ''}<aside class="inventory-inspector" aria-label="Selected item details" hidden></aside></div></section>`;
    const search = host.querySelector('#inventory-catalog-search'), searchBox = host.querySelector('.inventory-catalog-search'), results = host.querySelector('.inventory-catalog-results');
    let catalogMatches = [], activeCatalogIndex = -1;
    const closeCatalogResults = () => { results.hidden = true; search.setAttribute('aria-expanded', 'false'); search.removeAttribute('aria-activedescendant'); activeCatalogIndex = -1; };
    const paintCatalogResults = () => {
      results.innerHTML = catalogMatches.length ? catalogMatches.map((item, index) => `<button type="button" id="inventory-catalog-result-${index}" class="select-menu__option inventory-catalog-result${index === activeCatalogIndex ? ' is-selected' : ''}" data-catalog-index="${index}" role="option" aria-selected="${index === activeCatalogIndex}"><span><strong>${escapeHtml(item.name)}${isPortableContainer(item) ? bagIcon : ''}</strong><small>${escapeHtml(item.type || 'Equipment')}</small></span><b>${Number(item.weight || 0).toFixed(2)} lb.</b></button>`).join('') : '<p class="inventory-catalog-results__empty">No matching equipment</p>';
      results.hidden = false; search.setAttribute('aria-expanded', 'true');
      if (activeCatalogIndex >= 0) search.setAttribute('aria-activedescendant', `inventory-catalog-result-${activeCatalogIndex}`); else search.removeAttribute('aria-activedescendant');
      results.querySelectorAll('[data-catalog-index]').forEach((option) => { option.onmousedown = (event) => { event.preventDefault(); const selected = catalogMatches[Number(option.dataset.catalogIndex)]; if (!selected) return; search.value = selected.name; closeCatalogResults(); search.focus(); }; });
    };
    const updateCatalogResults = () => {
      const query = normalized(search.value);
      catalogMatches = catalog.filter((item) => !query || normalized(item.name).includes(query)).slice(0, 8);
      activeCatalogIndex = -1; paintCatalogResults();
    };
    search.onfocus = updateCatalogResults;
    search.oninput = updateCatalogResults;
    search.onkeydown = (event) => {
      if (event.key === 'Escape') { closeCatalogResults(); return; }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault(); if (results.hidden) updateCatalogResults();
        if (!catalogMatches.length) return;
        const direction = event.key === 'ArrowDown' ? 1 : -1;
        activeCatalogIndex = Math.max(0, Math.min(catalogMatches.length - 1, activeCatalogIndex + direction)); paintCatalogResults();
      } else if (event.key === 'Enter' && activeCatalogIndex >= 0) {
        event.preventDefault(); search.value = catalogMatches[activeCatalogIndex].name; closeCatalogResults();
      }
    };
    searchBox.onfocusout = () => setTimeout(() => { if (!searchBox.contains(document.activeElement)) closeCatalogResults(); }, 0);
    host.querySelector('[data-add-catalog]').onclick = () => { const found = catalogItem(search.value.trim()); if (!found) { search.focus(); return; } state.inventory.push(createItem(found, state)); refresh(); };
    const file = host.querySelector('[data-item-file]'); host.querySelector('[data-import-item]').onclick = () => file.click();
    file.onchange = () => {
      const selected = file.files?.[0]; if (!selected) return; const reader = new FileReader();
      reader.onload = () => { try { const data = JSON.parse(reader.result); if (data.format !== 'fable-inventory-item' || !data.item?.name) throw new Error('Invalid item file'); const imported = { ...data.item, id: freshId(), x: null, y: null, containerId: undefined, loadedWeight: undefined, contentsWeight: undefined, characterSized: false }; syncItemHp(imported, true); state.inventory.push(imported); refresh(); } catch { file.value = ''; file.insertAdjacentHTML('afterend', '<span class="inventory-file-error" role="alert">That is not a valid Fable item file.</span>'); } };
      reader.readAsText(selected);
    };
    host.querySelectorAll('[data-item-id]').forEach((node) => {
      const item = state.inventory.find((entry) => entry.id === node.dataset.itemId);
      node.ondragstart = (event) => {
        const shape = itemShape(item), box = node.getBoundingClientRect();
        const segmentRow = Number(node.dataset.shapeRow);
        const segmentColumn = Number(node.dataset.shapeColumn);
        const segmentWidth = Number(node.dataset.shapeWidth) || shape.width;
        const segmentHeight = Number(node.dataset.shapeHeight) || shape.height;
        const grabColumn = (Number.isFinite(segmentColumn) ? segmentColumn : 0) + Math.max(0, Math.min(segmentWidth - 1, Math.floor(((event.clientX - box.left) / Math.max(1, box.width)) * segmentWidth)));
        const grabRow = (Number.isFinite(segmentRow) ? segmentRow : 0) + Math.max(0, Math.min(segmentHeight - 1, Math.floor(((event.clientY - box.top) / Math.max(1, box.height)) * segmentHeight)));
        dragged = { item, x: item.x, y: item.y, fractionSlot: item.fractionSlot, containerId: item.containerId, grabColumn, grabRow };
        event.dataTransfer.effectAllowed = 'move'; host.querySelector('.inventory-grid')?.classList.add('is-dragging');
      };
      node.ondragend = () => { host.querySelectorAll('.is-container-target').forEach((target) => target.classList.remove('is-container-target')); host.querySelector('.inventory-grid')?.classList.remove('is-dragging'); dragged = null; };
      node.onclick = () => openItem(host, state, item);
      if (!isPortableContainer(item)) return;
      node.ondragover = (event) => { if (!dragged || dragged.item === item || isPortableContainer(dragged.item)) return; event.preventDefault(); event.stopPropagation(); node.classList.add('is-container-target'); };
      node.ondragleave = (event) => { if (!node.contains(event.relatedTarget)) node.classList.remove('is-container-target'); };
      node.ondrop = (event) => {
        event.preventDefault(); event.stopPropagation(); node.classList.remove('is-container-target');
        if (!dragged || dragged.item === item || isPortableContainer(dragged.item)) return;
        const content = dragged.item;
        if (!storeInContainer(content, item, state)) return;
        state.selectedInventoryItemId = item.id; dragged = null; refresh();
      };
    });
    const selectedItem = state.inventory.find((item) => item.id === state.selectedInventoryItemId);
    if (selectedItem) openItem(host, state, selectedItem);
    const grid = host.querySelector('.inventory-grid'); grid.ondragover = (event) => event.preventDefault();
    grid.ondrop = (event) => {
      event.preventDefault(); if (!dragged) return;
      const firstCell = grid.querySelector('.inventory-cell'), cellBox = firstCell.getBoundingClientRect(), gridStyle = getComputedStyle(grid), columnGap = parseFloat(gridStyle.columnGap) || 0, rowGap = parseFloat(gridStyle.rowGap) || 0;
      const cellWidth = cellBox.width, cellHeight = cellBox.height, columnPitch = cellWidth + columnGap, rowPitch = cellHeight + rowGap;
      const item = dragged.item;
      const shape = itemShape(item), maximumY = rows - shape.height;
      if (shape.width > columns || maximumY < 0) { dragged = null; return; }
      // The first cell's viewport rectangle already includes the grid's scroll
      // position. Adding scrollLeft/scrollTop again shifts the drop target.
      const gridX = event.clientX - cellBox.left, gridY = event.clientY - cellBox.top;
      delete item.containerId;
      item.x = Math.max(0, Math.min(columns - shape.width, Math.floor(gridX / columnPitch) - (dragged.grabColumn || 0))); item.y = Math.max(0, Math.min(maximumY, Math.floor(gridY / rowPitch) - (dragged.grabRow || 0)));
      if (itemShape(item).fractional) { const localX = ((gridX % columnPitch) + columnPitch) % columnPitch / cellWidth, localY = ((gridY % rowPitch) + rowPitch) % rowPitch / cellHeight; item.fractionSlot = (localY >= 0.5 ? 2 : 0) + (localX >= 0.5 ? 1 : 0); }
      if (overlapsAnotherItem(state, item)) { item.containerId = dragged.containerId; item.x = dragged.x; item.y = dragged.y; item.fractionSlot = dragged.fractionSlot; item.unplaced = !Number.isFinite(item.x) || !Number.isFinite(item.y); }
      else { item.manuallyPlaced = true; item.unplaced = false; }
      dragged = null; refresh();
    };
  };
  const sync = async (state) => {
    await loadCatalog();
    seedInventory(state);
    applyInitialEquipmentScale(state);
    state.inventory.forEach((item) => { item.category ||= catalogItem(item.name)?.category; item.size ||= 'Medium'; if (item.workshop === undefined) item.workshop = /(?:^|,)\s*workshop\s*(?:,|$)/i.test(item.properties || ''); syncItemHp(item); });
    autoPlace(state);
    const status = statusFor(state);
    window.FableCharacterBuilder?.applyEncumbrance(status.mode);
    return status;
  };
  window.FableInventory = { render, sync };
})();
