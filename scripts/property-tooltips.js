(() => {
  const explanations = {
    ammunition: 'You can use a weapon with ammunition to make a ranged attack only if you have ammunition to fire. Each attack expends one piece. Drawing ammunition is part of the attack and requires a free hand for a one-handed weapon. After battle, you can recover half the expended ammunition by searching for a minute. Using it for a melee attack treats it as an improvised weapon.',
    finesse: 'When attacking with a finesse weapon, choose Strength or Dexterity for both attack and damage rolls; use the same modifier for both.',
    heavy: "Small creatures have disadvantage on attack rolls with heavy weapons because their size and bulk make them too large to use effectively.",
    light: 'A light weapon is small and easy to handle, making it ideal for fighting with two weapons.',
    loading: 'Because of the time required to load this weapon, you can fire only one piece of ammunition when using an action, bonus action, or reaction to fire it, regardless of the number of attacks you can normally make.',
    range: "The first range number is the weapon's normal range in feet and the second is its long range. Beyond normal range, attacks have disadvantage; you cannot attack beyond long range.",
    reach: 'This weapon adds 5 feet to your reach when attacking with it and when determining reach for opportunity attacks.',
    special: 'A weapon with this property has unusual rules explained in its weapon description.',
    thrown: 'You can throw this weapon to make a ranged attack. For a melee weapon, use the same ability modifier for the ranged attack and damage that you would use for a melee attack.',
    'two-handed': 'This weapon requires two hands when you attack with it.',
    versatile: 'This weapon can be used with one or two hands. The parenthesized damage is the damage when used with two hands for a melee attack.',
    reload: 'The weapon can be fired a number of times equal to its Reload score before you must spend 1 attack or 1 action to reload. You must have one free hand to reload a firearm.',
    misfire: "If a firearm attack roll is equal to or lower than its Misfire score, it misfires: the attack misses and the firearm cannot be used until repaired with a successful Tinker's Tools check (DC 8 + misfire score). A failed check breaks it and requires mending out of combat at one-quarter cost. An unproficient user increases the misfire score by 1.",
    explosive: "On a hit, creatures within the listed distance make a DC 13 basic Dexterity saving throw or take the weapon's damage. On a miss or failed detonation, the ammunition bounces away harmlessly.",
    'burst fire': "The weapon can make a normal single-target attack or spray a 10-foot cube within normal range. Each creature there makes a DC 15 basic Dexterity saving throw or takes normal weapon damage. The action uses ten pieces of ammunition.",
    bulky: 'Using this shield in one hand reduces speed by 10 feet, imposes disadvantage on Dexterity-based checks except initiative, and prevents use while mounted.',
    deployable: 'When doffed, deploy this shield in an unoccupied space within 5 feet; it provides three-quarters cover to a Medium or smaller creature, occupies no hand, and can be picked up as an action or bonus action.',
    'mounted defense': 'The AC provided by this shield also applies to your mount.',
    parrying: 'When another creature hits you, use your reaction to add half your proficiency bonus, rounded up, to this shield’s AC for that attack. If the parry fails, you regain your reaction.',
    'shield wall': 'This shield gives +1 base AC for each ally within 5 feet using a shield with this property, up to +2. It imposes disadvantage on attacks while mounted, and everyone in the wall must stand on the ground.',
    stable: 'The hand holding this shield can still lift, drop, hold, push, or pull an object or creature; open or close a door or container; or wield a light simple melee weapon. Such weapon use is not proficient use.',
  };
  const specialWeaponExplanations = {
    lance: "You have disadvantage when you use a lance to attack a target within 5 feet of you. A lance requires two hands to wield when you aren't mounted.",
    net: 'A Large or smaller creature hit by a net is restrained until freed. A net has no effect on formless creatures or creatures that are Huge or larger. A creature can use its action to make a DC 10 Strength check to free itself or another creature within its reach. Dealing 5 slashing damage to the net (AC 10) also frees the creature without harming it, destroying the net. When you attack with a net, you can make only one attack regardless of how many attacks you can normally make.',
  };
  let keys = Object.keys(explanations).sort((a, b) => b.length - a.length);
  const pattern = () => new RegExp(`^(${keys.map((key) => key.replace(/[.*+?^${}()|[\\]\\]/g, '\\\\$&')).join('|')})(\\s*(?:\\([^)]*\\)|\\d+))?$`, 'i');
  let propertyPattern = pattern();
  const concise = (text) => text.replace(/\s*For example,.*$/i, '').replace(/\s*Examples?:.*$/i, '').trim();
  const loadAuthoritativeDefinitions = async () => {
    const definitions = {};
    await Promise.all(['../systems/adventuring/weapons.html', '../systems/adventuring/armor.html'].map(async (source) => {
      const response = await fetch(new URL(source, document.baseURI));
      if (!response.ok) return;
      const page = new DOMParser().parseFromString(await response.text(), 'text/html');
      page.querySelectorAll('main h3').forEach((section) => {
        if (!/properties/i.test(section.textContent)) return;
        let current = '';
        for (let node = section.nextElementSibling; node && !/^H[1-6]$/.test(node.tagName); node = node.nextElementSibling) {
          if (node.tagName !== 'P') continue;
          const strong = node.querySelector('strong');
          const text = node.textContent.replace(/\s+/g, ' ').trim();
          if (strong && strong.parentElement === node) {
            current = strong.textContent.trim().replace(/[.:]$/, '').toLowerCase();
            if (explanations[current]) definitions[current] = concise(text.slice(strong.textContent.trim().length).replace(/^\s*\.?\s*/, '')); else current = '';
          } else if (current && text) definitions[current] = concise(`${definitions[current]} ${text}`);
        }
      });
    }));
    Object.assign(explanations, definitions);
    keys = Object.keys(explanations).sort((a, b) => b.length - a.length);
    propertyPattern = pattern();
    document.querySelectorAll('.property-tooltip').forEach((tip) => { const key = tip.textContent.trim().match(propertyPattern)?.[1]?.toLowerCase(); const weaponName = tip.closest('tr')?.querySelector('td:first-child')?.textContent.trim().toLowerCase(); if (key) tip.dataset.tooltip = key === 'special' && specialWeaponExplanations[weaponName] ? specialWeaponExplanations[weaponName] : explanations[key]; });
  };
  const enhance = (cell) => {
    if (cell.dataset.propertyTooltipsReady) return;
    const pieces = cell.textContent.replace(/\s+/g, ' ').trim().split(/,\s*/);
    if (!pieces.some((piece) => propertyPattern.test(piece.trim()))) return;
    cell.replaceChildren();
    pieces.forEach((piece, index) => { if (index) cell.append(', '); const value = piece.trim(); const match = value.match(propertyPattern); if (!match) { cell.append(value); return; } const tip = document.createElement('span'); tip.className = 'property-tooltip'; tip.tabIndex = 0; tip.textContent = value; const key = match[1].toLowerCase(); tip.dataset.tooltip = explanations[key]; const weaponName = cell.closest('tr')?.querySelector('td:first-child')?.textContent.trim().toLowerCase(); if (key === 'special' && specialWeaponExplanations[weaponName]) tip.dataset.tooltip = specialWeaponExplanations[weaponName]; cell.append(tip); });
    cell.dataset.propertyTooltipsReady = 'true';
  };
  document.querySelectorAll('.weapons-table td:last-child, .firearms-table td:last-child, .apparel-table--shields td:nth-child(5)').forEach(enhance);
  loadAuthoritativeDefinitions().catch(() => {});
})();
