(() => {
  const prices = {
    Clothes: { "Common Clothes": "$25", Costume: "$80", "Fine Clothes": "$500", Robes: "$60", "Traveler's Clothes": "$75" },
    Containers: { Backpack: "$50", Barrel: "$40", Basket: "$10", Briefcase: "$75", Bucket: "$5", "City Card": "$0", "Crossbow Bolt Case": "$20", "Map/Scroll Case": "$15", Chest: "$150", "Flask or Tankard": "$5", "Glass Bottle": "$10", "Jug or Pitcher": "$8", "Iron Pot": "$30", Pouch: "$15", Quiver: "$20", Sack: "$2", Vial: "$2", Wallet: "$15", Waterskin: "$15" },
    "Common Items": { Abacus: "$15", Bedroll: "$40", Bell: "$5", Blanket: "$25", "Block and Tackle": "$35", Book: "$40", Candle: "$1", "Chain (10 ft)": "$30", "Chalk (1 piece)": "$1", "Component Pouch": "$100", Dollar: "$1", "Fishing Tackle": "$40", "Grappling Hook": "$25", Hammer: "$15", Hourglass: "$80", "Ink (1 oz.)": "$10", "Ink Pen": "$2", "Ladder (10 ft)": "$50", Lock: "$50", "Magnifying Glass": "$40", Manacles: "$60", "Mess Kit": "$20", "Miner's Pick": "$30", "Paper (1 sheet)": "$0.25", "Parchment (1 sheet)": "$1", "Perfume (vial)": "$35", "Pole (10 ft)": "$12", "Portable Ram": "$75", "Rations (1 day)": "$12", Rope: "$25", "Sealing Wax": "$4", Shovel: "$30", "Signal Whistle": "$3", "Signet Ring": "$150", Sledgehammer: "$35", Spellbook: "$250", "Spikes, Iron (10)": "$15", Spyglass: "$300", "Two-Person Tent": "$120", Whetstone: "$2", "Ball Bearings (bag of 1,000)": "$20", "Caltrops (bag of 20)": "$25", "Climber's Kit": "$180", Crowbar: "$25", "Trauma Kit": "$75", "Hunting Trap": "$80", Lamp: "$15", "Lantern - Bullseye": "$80", "Lantern - Hooded": "$45", "Oil (flask)": "$8", Tinderbox: "$10", Torch: "$3" },
    "Equipment Pack": { "Burglar's Pack": "$260", "Diplomat's Pack": "$650", "Dungeoneer's Pack": "$300", "Entertainer's Pack": "$500", "Explorer's Pack": "$300", "Priest's Pack": "$400", "Scholar's Pack": "$650" },
    "Trade Goods": { Wheat: "$2", "Flour or Chicken": "$4", Salt: "$1", "Iron or Canvas": "$10", "Copper or Cotton Cloth": "$8", "Ginger or Goat": "$25", "Cinnamon, Pepper, or Sheep": "$40", "Cloves or Pig": "$60", "Silver or Linen": "$30", "Silk or Cow": "$300", "Saffron or Ox": "$250", Gold: "$30,000", Platinum: "$50,000" },
  };
  const tradePriceBands = { "$100": "$250", "$500": "$1,000", "$1,000": "$2,500", "$5,000": "$10,000", "$10,000": "$25,000", "$50,000": "$100,000" };
  const additions = {
    Containers: [
      ["Locking Hard Case", "$120", "4 lb.", "A locking hard case holds up to 1 cubic foot or 40 pounds of gear. It has a combination lock that uses the same DC as a standard lock, and it can be sealed with a corporate evidence tag."],
      ["Insulated Bottle", "$18", "1 lb.", "An insulated bottle holds 1 pint of liquid and keeps its contents hot or cold for 8 hours."],
    ],
    "Common Items": [
      ["District Transit Pass", "$50", "-", "This pass pays for 1 week of ordinary District transit. WARP travel, restricted routes, and corporate checkpoints require separate authorization."],
      ["Identity Badge Holder", "$8", "-", "This holder carries a Nest visa, work visa, or similar identification. It provides no authorization by itself, but keeps the document ready for inspection."],
      ["Bug Spray", "$15", "0.5 lb.", "This aerosol can has 10 uses. As an action, you can spray yourself, one willing creature within reach, or one 5-foot square. For 1 hour, ordinary insects and other nonmagical vermin avoid the sprayed creature or area unless directly threatened or forced into it."],
      ["Barbed Wire (50 ft.)", "$25", "5 lb.", "As an action, you can unspool up to 10 feet of this wire across a 5-foot-wide passage, low barrier, or similar space. A creature that moves through the wire must succeed on a DC 12 Dexterity saving throw or take 1 piercing damage and have its speed reduced by 10 feet until the end of its turn. A creature moving through the wire at half speed does not need to make the save."],
      ["Air Filter Cartridge", "$15", "0.25 lb.", "This replacement cartridge provides 8 hours of filtration when used in a filter mask against smoke, dust, and similar airborne hazards."],
      ["Cellphone", "$120", "0.5 lb.", "This V Corp. handheld phone provides local voice, text, camera, and network access where service is available. It consumes 1 power cell every 24 hours of operation. Its cost includes 30 days of ordinary local voice and data service; each additional 30 days costs $30. WARP travel, restricted routes, corporate checkpoints, blackouts, and unavailable networks can prevent the phone from functioning."],
      ["City Card", "$0", "-", "This City-issued payment card is linked to an account. Dollars held in that account have no carrying weight and can be spent wherever the local payment network accepts the card. The card holds no money by itself and cannot be used where the network is unavailable, restricted, or refused."],
      ["Dollar", "$1", "0.1 lb./$100", "A dollar is physical City currency. A bundle of up to 100 dollars weighs 0.1 lb.; round the weight of larger amounts up to the next 0.1 lb. For example, $101 weighs 0.2 lb. Dollars held on a City Card have no carrying weight while its account and payment network function."],
      ["Filter Mask", "$45", "1 lb.", "While wearing this mask with a functioning cartridge, you have advantage on saving throws against inhaled smoke, dust, and similar nonmagical airborne hazards."],
      ["Glasses", "$50", "-", "These corrective lenses are made for a specific wearer. While wearing them, you ignore disadvantage on Wisdom (Perception) checks caused solely by ordinary impaired distance vision. They do not improve darkvision or reveal hidden or invisible creatures."],
      ["Glow Stick", "$3", "-", "This stick sheds dim light in a 10-foot radius for 8 hours once activated. It cannot be extinguished early."],
      ["Fire Extinguisher", "$60", "6 lb.", "This pressurized extinguisher has 5 uses. As an action, you can expend 1 use to extinguish a nonmagical fire in a 5-foot cube within 10 feet of you. It cannot extinguish magical fire or a fire too large to fit in that area, though repeated uses can contain a larger blaze at the DM's discretion."],
      ["Lighter", "$3", "-", "This lighter has 100 uses. As an action, you can use it to ignite a candle, torch, fuse, or another flammable object within reach. It cannot ignite an object that is soaked, wind-drenched, or otherwise unable to catch fire."],
      ["Laptop", "$700", "3 lb.", "This portable V Corp. computer can be used for documents, research, and local network access where service is available. It consumes 1 power cell every 8 hours of operation. It can store ordinary records, but recording a spell formula on it is a City-wide Taboo."],
      ["Metal Detector", "$150", "3 lb.", "While operating this device, you can use an action to scan a 15-foot cone. The detector alerts you to a sizable ferrous-metal object in that area, such as a weapon, lock, or metal container, if it is not behind a solid barrier. It consumes 1 power cell every 8 hours of operation."],
      ["Night-Vision Goggles", "$600", "1 lb.", "While wearing these goggles, you have darkvision out to 60 feet. If you already have darkvision, its range increases by 30 feet while you wear them. The goggles consume 1 power cell every 4 hours of operation and do not allow you to discern color in darkness."],
      ["Notebook", "$5", "1 lb.", "This bound notebook has 100 blank pages for notes, maps, sketches, and records. It cannot lawfully contain a spell formula; a spell formula must be recorded in a spellbook or remembered by its caster."],
      ["Pencils (5)", "$2", "-", "This bundle contains 5 graphite pencils for writing and sketching. A pencil can write on paper in rain or poor conditions where ink would run, but its marks can be erased or smudged."],
      ["Pocket Camera", "$100", "0.5 lb.", "This camera records still images and short video. It consumes 1 power cell every 8 hours of recording or ordinary camera use. Recording or reporting the Night in the Backstreets remains a City-wide Taboo."],
      ["Power Cell", "$10", "-", "A power cell powers one compatible rechargeable item for the duration stated in that item's description."],
      ["Pepper Spray", "$25", "0.25 lb.", "This canister has 2 uses. As an action, you can spray one creature within 5 feet of you. The target must succeed on a DC 13 Constitution saving throw or be blinded until the end of its next turn and poisoned for 1 minute. The target can repeat the saving throw at the end of each of its turns, ending the poisoned condition on a success. This spray has no effect on a creature that does not need to breathe or is immune to poison."],
      ["Rat Poison", "$20", "0.25 lb.", "This package contains 3 doses. As an action, you can place 1 dose in food, water, or bait. A Tiny beast that consumes a dose must succeed on a DC 12 Constitution saving throw or take 2d6 poison damage. A creature reduced to 0 hit points by this damage dies. Larger creatures have advantage on this saving throw and take no damage on a success."],
      ["Rechargeable Flashlight", "$25", "1 lb.", "This flashlight sheds bright light in a 20-foot radius and dim light for an additional 20 feet. It consumes 1 power cell every 10 hours of operation."],
      ["Signal Flare", "$25", "0.5 lb.", "As an action, you can launch or ignite this flare. It sheds bright red light in a 30-foot radius and dim light for an additional 30 feet for 10 minutes."],
    ],
    "Equipment Pack": [
      ["City Runner's Pack", "$450", "22 lb.", "Backpack, City Card, cellphone, district transit pass, rechargeable flashlight, power cell, filter mask, 2 air filter cartridges, 3 days of rations, waterskin, and trauma kit."],
      ["Ruin Delver's Pack", "$680", "35 lb.", "Backpack, City Card, climber's kit, rechargeable flashlight, 2 power cells, filter mask, 2 air filter cartridges, 5 days of rations, waterskin, and hammer."],
    ],
  };
  window.ELYSIUM_ITEM_CATALOG = { prices, additions };

  document.querySelectorAll(".item-group").forEach((group) => {
    const title = group.querySelector(":scope > .item-group-title")?.textContent.trim();
    const groupPrices = prices[title];
    if (!groupPrices && !additions[title]) return;
    group.querySelectorAll(":scope > .item-card").forEach((card) => {
      const name = card.querySelector("h3")?.textContent.trim();
      const cost = card.querySelector(".item-card__heading span");
      if (groupPrices?.[name] && cost) cost.textContent = groupPrices[name];
    });
    if (title === "Trade Goods") {
      group.querySelectorAll(":scope > .item-card .item-card__heading span").forEach((cost) => {
        if (tradePriceBands[cost.textContent]) cost.textContent = tradePriceBands[cost.textContent];
      });
    }
    (additions[title] || []).forEach(([name, cost, weight, description]) => {
      const card = document.createElement("article");
      const expandControl = title === "Equipment Pack"
        ? '<button class="item-card__expand" type="button" aria-label="Show pack contents" aria-expanded="false">+</button>'
        : "";
      card.className = "item-card";
      card.dataset.elysiumDynamic = "true";
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-expanded", "false");
      card.innerHTML = `<div class="item-card__heading"><h3>${name}</h3><span>${cost}</span><span>${weight}</span></div><p>${description}</p>${expandControl}`;
      group.appendChild(card);
    });

    if (["Containers", "Common Items", "Equipment Pack"].includes(title)) {
      [...group.querySelectorAll(":scope > .item-card")]
        .sort((first, second) =>
          (first.querySelector("h3")?.textContent || "").localeCompare(
            second.querySelector("h3")?.textContent || "",
          ),
        )
        .forEach((card) => group.appendChild(card));
    }
  });

  document.querySelectorAll(".item-card").forEach((card) => {
    if (!card.querySelector(":scope > p")) return;

    card.classList.add("needs-expansion", "has-overflow");
    if (!card.hasAttribute("aria-expanded")) card.setAttribute("aria-expanded", "false");
    if (!card.hasAttribute("tabindex")) card.tabIndex = 0;
    if (!card.hasAttribute("role")) card.setAttribute("role", "button");
    if (card.dataset.elysiumExpandBound || !card.dataset.elysiumDynamic) return;

    const toggle = () => {
      const expanded = card.classList.toggle("is-expanded");
      card.setAttribute("aria-expanded", String(expanded));
      card.querySelector(".item-card__expand")?.setAttribute("aria-expanded", String(expanded));
    };
    card.addEventListener("click", toggle);
    card.addEventListener("keydown", (event) => {
      if (event.target.closest("button")) return;
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      toggle();
    });
    card.querySelector(".item-card__expand")?.addEventListener("keydown", (event) => event.stopPropagation());
    card.dataset.elysiumExpandBound = "true";
  });
})();
