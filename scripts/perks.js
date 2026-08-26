/*
  Editable perk records for the perk table.
  Keep one perk object per block and use a unique id for each record.
*/
window.PERKS = [
  {
    "id": "monster-blood",
    "name": "Monster Blood",
    "description": "You learn a cantrip of your choice from the sorcerer spell list. In addition, choose a 1st-level spell from the sorcerer spell list. You can cast that spell without expending spell points. Once you cast it this way, you can't cast it this way again until you finish a long rest. You can also cast it using spell points you have. Constitution is your spellcasting ability for these spells.",
    "requirements": ""
  },
  {
    "id": "monstrous-vigor",
    "name": "Monstrous Vigor",
    "description": "When you cast the 1st-level spell, you can expend one of your Hit Dice and roll it. You gain a number of temporary hit points equal to the number rolled or your Constitution modifier.",
    "requirements": "Monster Blood"
  },
  {
    "id": "monstrous-consitution",
    "name": "Monstrous Constitution",
    "description": "Increase your Constitution score by 1, to a maximum of 20.",
    "requirements": "Monstrous Vigor"
  },
  {
    "id": "mime",
    "name": "Mime",
    "description": "You have an advantage on Charisma (Deception) and Charisma (Performance) checks when trying to pass yourself off as a different person.",
    "requirements": ""
  },
  {
    "id": "actor",
    "name": "Actor",
    "description": "You can mimic the speech of another person or the sounds made by other creatures. You must have heard the person speaking, or heard the creature make the sound, for at least 1 minute. A successful Wisdom (Insight) check contested by your Charisma (Deception) check allows a listener to determine that the effect is faked.",
    "requirements": "Mime"
  },
  {
    "id": "actor-s-charisma",
    "name": "Actor's Charisma",
    "description": "Increase your Charisma score by 1, to a maximum of 20.",
    "requirements": "Actor"
  },
  {
    "id": "alert",
    "name": "Alert",
    "description": "You can't be surprised while you are conscious.",
    "requirements": ""
  },
  {
    "id": "malice-detection",
    "name": "Malice Detection",
    "description": "Other creatures don't gain advantage on attack rolls against you as a result of being unseen by you.",
    "requirements": "Alert"
  },
  {
    "id": "inhuman-senses",
    "name": "Inhuman Senses",
    "description": "Increase your Wisdom score by 1, to a maximum of 20.",
    "requirements": "Malice Detection"
  },
  {
    "id": "early-bird",
    "name": "Early Bird",
    "description": "You have advantage on Initiative rolls. You can add your Wisdom modifier to your Initiative rolls instead of your Dexterity modifier.",
    "requirements": "Inhuman Senses"
  },
  {
    "id": "artificer-initiate",
    "name": "Artificer Initiate",
    "description": "You learn one cantrip of your choice from the Artificer spell list, and you learn one 1st-level spell of your choice from that list. Intelligence is your spellcasting ability for these spells.",
    "requirements": ""
  },
  {
    "id": "artificer-studies",
    "name": "Artificer Studies",
    "description": "You can cast this perk's 1st-level spell without expending spell points. Once you cast it this way, you can't cast it this way again until you finish a long rest. You can also cast it using spell points you have.",
    "requirements": "Artificer Initiate"
  },
  {
    "id": "artificer-specialization",
    "name": "Artificer Specialization",
    "description": "You gain proficiency with one type of artisan's tools of your choice, and you can use that type of tool as a spellcasting focus for any spell you cast that uses Intelligence as its spellcasting ability.",
    "requirements": "Artificer Initiate"
  },
  {
    "id": "artificer-s-intellect",
    "name": "Artificer's Intellect",
    "description": "Increase your Intelligence score by 1, to a maximum of 20.",
    "requirements": "2 Artificer perks"
  },
  {
    "id": "athlete-jumper",
    "name": "Athlete Jumper",
    "description": "You can make a running long jump or a running high jump after moving only 5 feet on foot, rather than 10 feet. You can jump 5 feet further and 2 feet taller, double these values with a running start.",
    "requirements": ""
  },
  {
    "id": "athlete-climber",
    "name": "Athlete Climber",
    "description": "You gain a climbing speed equal to your walking speed.",
    "requirements": ""
  },
  {
    "id": "athlete-skulker",
    "name": "Athlete Skulker",
    "description": "When you are prone, you can stand up without expending any speed or an action. You don't have disadvantage on attack rolls while prone.",
    "requirements": ""
  },
  {
    "id": "athlete-s-body",
    "name": "Athlete's Body",
    "description": "Increase your Strength, Dexterity, or Constitution score by 1, to a maximum of 20.",
    "requirements": "2 Athlete perks"
  },
  {
    "id": "cartomancer-initiate",
    "name": "Cartomancer Initiate",
    "description": "You can use a card deck as your spellcasting focus. You learn the Prestidigitation cantrip and can use it to create illusions that duplicate the effects of stage magic. When you use Prestidigitation in this way, you can conceal the verbal and somatic components of the spell as ordinary conversation and card handling.",
    "requirements": ""
  },
  {
    "id": "cartomancer-s-ace",
    "name": "Cartomancer's Ace",
    "description": "When you finish a long rest, you can choose one spell from your class’s spell list and imbue that spell into a card. The chosen spell must have a casting time of 1 action, and it must be a level for which you have spell slots. The card remains imbued with this spell for 8 hours. While the card is imbued with the spell, you can use a bonus action to flourish the card and cast the spell within. The card then immediately loses its magic.",
    "requirements": "Cartomancer Initiate"
  },
  {
    "id": "cartomancer-s-gambit",
    "name": "Cartomancer's Gambit",
    "description": "You gain proficiency with Playing Card Sets, they count as simple melee weapons for you that return back to you like boomerangs when thrown, a card deals 1d4 slashing damage and has the following properties: Finesse, thrown (20/60)",
    "requirements": "Cartomancer Initiate"
  },
  {
    "id": "cartomancer-s-cunning",
    "name": "Cartomancer's Cunning",
    "description": "Increase your Dexterity, Intelligence, or Charisma by 1, to a maximum of 20.",
    "requirements": "2 Cartomancer perks"
  },
  {
    "id": "acceleration",
    "name": "Acceleration",
    "description": "Once per turn, if you moved at least 15 feet in a straight line, you can move an additional 5 feet to an adjacent space without consuming any speed.",
    "requirements": ""
  },
  {
    "id": "momentum",
    "name": "Momentum",
    "description": "When you use your action to Dash, you can use a bonus action to make one melee weapon attack. If you moved at least 10 feet in a straight line immediately before taking this bonus action, on a succesful hit, you can either gain a +5 bonus to attack's damage roll, push the target up to 20 feet (-5 feet for each size larger than Tiny) away from you in a straight line, or knock it prone.",
    "requirements": "Acceleration"
  },
  {
    "id": "bull-s-force",
    "name": "Bull's Force",
    "description": "Momentum's damage increases by 3 and the amount the creature is pushed by starts at 30 feet instead of 20 feet. Additionally, you can choose 2 succesful hit options from Momentum instead of 1.",
    "requirements": "Momentum"
  },
  {
    "id": "bull-s-build",
    "name": "Bull's Build",
    "description": "Increase your Strength, Dexterity, or Constitution score by 1, to a maximum of 20.",
    "requirements": "Momentum"
  },
  {
    "id": "chef-initiate",
    "name": "Chef Initiate",
    "description": "You gain proficiency with cook's utensils if you don't have it already. As part of a short rest, you can cook special food, provided you have cook's utensils on hand and expend up to $50 in ingredients. You can prepare enough of this food for a number of creatures for each $5 you spent for ingredients. At the end of the short rest, anyone who eats the food regains 6 + your Constitution modifier hit points.",
    "requirements": ""
  },
  {
    "id": "chef-s-treats",
    "name": "Chef's Treats",
    "description": "With one hour of work or when you finish a long rest, you can cook a number of treats equal to your proficiency bonus. These special treats last until you take a long rest or for a day. A creature can use a bonus action to eat one of those treats to gain temporary hit points equal to your proficiency bonus or your Constitution modifier, whichever is the highest.",
    "requirements": "Chef Initiate"
  },
  {
    "id": "chef-s-kiss",
    "name": "Chef's Kiss",
    "description": "You gain a number of d4s equal to your proficiency bonus or your Constitution modifier, whichever is the highest. These d4s are your Chef dice and you may roll 1 whenever a creature gains temporary hit points or heals from eating your food, add the result to the value of temporary hit points or hit points they heal. You regain all of your Chef dice when you finish a long rest.",
    "requirements": "Chef Initiate"
  },
  {
    "id": "chef-s-experience",
    "name": "Chef's Experience",
    "description": "Increase your Constitution or Wisdom score by 1, to a maximum of 20.",
    "requirements": "2 Chef perks"
  },
  {
    "id": "crossbow-handling",
    "name": "Crossbow Handling",
    "description": "You gain proficiency with all crossbows. You ignore their loading property.",
    "requirements": ""
  },
  {
    "id": "spare-bolt",
    "name": "Spare Bolt",
    "description": "When you use the Attack action and attack with a one handed weapon, you can use a bonus action to attack with a hand crossbow you are holding.",
    "requirements": "Crossbow Handling"
  },
  {
    "id": "keen-aim",
    "name": "Keen Aim",
    "description": "Increase your Dexterity score by 1, to a maximum of 20.",
    "requirements": "Spare Bolt"
  },
  {
    "id": "close-shot",
    "name": "Close Shot",
    "description": "Being within 5 feet of a hostile creature doesn’t impose disadvantage on your ranged attack rolls.",
    "requirements": ""
  },
  {
    "id": "quick-finger",
    "name": "Quick Finger",
    "description": "If you're holding a ranged weapon, creatures provoke opportunity attacks from you if they move 5 feet away from you, you can use your ranged weapon for this attack. On a Critical Success, that creature becomes prone.",
    "requirements": "Close Shot"
  },
  {
    "id": "shooter-s-eye",
    "name": "Shooter's Eye",
    "description": "Increase your Dexterity or Wisdom score by 1, to a maximum of 20.",
    "requirements": "Quick Finger"
  },
  {
    "id": "desperado",
    "name": "Desperado",
    "description": "Creatures targeting you with a spell or ranged attack within the normal range of your ranged weapon count as provoking opportunity attacks for Quickdraw.",
    "requirements": "Quick Finger, Anti-Mage"
  },
  {
    "id": "break",
    "name": "Break",
    "description": "When you score a Critical Success with an attack that deals bludgeoning damage to a creature, attack rolls against that creature are made with advantage until the end of its next turn. That creature cannot be elected to take a turn unless it's the last one in its party.",
    "requirements": ""
  },
  {
    "id": "pressure",
    "name": "Pressure",
    "description": "Once per turn, when you hit a creature with an attack that deals bludgeoning damage, you can move it 5 feet to an unoccupied space, provided the target is no more than one size larger than you. On a critical success, you can make that creature fall prone instead.",
    "requirements": "Break"
  },
  {
    "id": "crusher-s-force",
    "name": "Crusher's Force",
    "description": "Increase your Strength or Constitution score by 1, to a maximum of 20.",
    "requirements": "Pressure"
  },
  {
    "id": "crunch",
    "name": "Crunch",
    "description": "When attacking with a weapon that deals bludgeoning damage, rolling a 19 or succeeding by 9 counts as a Critical Success for you.",
    "requirements": "Crusher's Force"
  },
  {
    "id": "dual-wielder",
    "name": "Dual Wielder",
    "description": "You can use two-weapon fighting even when the one-handed melee weapons you are wielding aren't light.",
    "requirements": ""
  },
  {
    "id": "fanged-protection",
    "name": "Fanged Protection",
    "description": "You gain a +1 bonus to AC while you are wielding a separate melee weapon in each hand.",
    "requirements": "Dual Wielder"
  },
  {
    "id": "twofold-posture",
    "name": "Twofold Posture",
    "description": "Increase your Strength or Dexterity score by 1, to a maximum of 20.",
    "requirements": "Fanged Protection"
  },
  {
    "id": "vital-strikes",
    "name": "Vital Strikes",
    "description": "Whenever you make an opportunity attack, you can immediately expend your movement for your turn to make an additional attack against the same target with a melee weapon you're wielding on the other hand.",
    "requirements": "Twofold Posture"
  },
  {
    "id": "delver-initiate",
    "name": "Delver Initiate",
    "description": "You have resistance to the damage dealt by traps and have advantage on saving throws made to avoid or resist traps.",
    "requirements": ""
  },
  {
    "id": "delver-s-eye",
    "name": "Delver's Eye",
    "description": "You have advantage on checks made to detect the presence of hidden objects, entrances, or exits.",
    "requirements": "Delver Initiate"
  },
  {
    "id": "delver-s-extraction",
    "name": "Delver's Extraction",
    "description": "You gain proficiency with Carpenter's Tools, Mason's Tools, Tinker's Tools, or Woodcarver's Tools. Given 1 hour or less (GM's discretion), you are able to disassemble simple traps and recycle them to increase your profit margins. Make a Dexterity check adding the proficiency of a tool that could apply in disassembling the trap, the DC of which is the DC to avoid or resist the trap. The trap could misfire or activate on you on a failure. On a success, you gain 1d10 dollars for each level of severity of the trap.",
    "requirements": "Delver Initiate"
  },
  {
    "id": "delver-s-intuition",
    "name": "Delver's Intuition",
    "description": "Increase your Dexterity or Intelligence score by 1, to a maximum of 20.",
    "requirements": "2 Delver perks"
  },
  {
    "id": "durable",
    "name": "Durable",
    "description": "You gain a bonus to your hit point maximum equal to your level. This bonus increases by 1 each time you level up.",
    "requirements": ""
  },
  {
    "id": "tough",
    "name": "Tough",
    "description": "When you roll a Hit Die to regain hit points, the minimum number of hit points you regain from the roll equals your Constitution modifier (minimum of 1).",
    "requirements": "Durable"
  },
  {
    "id": "stout",
    "name": "Stout",
    "description": "Increase your Constitution score by 1, to a maximum of 20.",
    "requirements": "Tough"
  },
  {
    "id": "stoic",
    "name": "Stoic",
    "description": "Double the minimum values of Tough and double the hit point maximum increase of Durable.",
    "requirements": " Stout"
  },
  {
    "id": "eldritch-initiate",
    "name": "Eldritch Initiate",
    "description": "You learn the Eldritch Blast cantrip, your spellcasting ability for this spell is Intelligence, Wisdom, or Charisma (choose when you select this perk). If you already know this cantrip, select another cantrip from the warlock spell list.",
    "requirements": "Spellcasting or Pact Magic feature"
  },
  {
    "id": "eldritch-adept",
    "name": "Eldritch Adept",
    "description": "Studying occult lore, you learn one Eldritch Invocation option of your choice from the warlock class. Your spellcasting ability for the invocation is Intelligence, Wisdom, or Charisma (choose when you select this perk). If the invocation has a prerequisite of any kind, you can choose that invocation only if you’re a warlock who meets the prerequisite.",
    "requirements": "Eldritch Initiate"
  },
  {
    "id": "dark-knowledge",
    "name": "Dark Knowledge",
    "description": "Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 20.",
    "requirements": "Eldritch Adept"
  },
  {
    "id": "elementalist",
    "name": "Elementalist",
    "description": "When you select this perk, choose one of the following damage types: acid, cold, fire, lightning, or thunder. When you roll damage for a spell you cast that deals damage of that type, you can treat any 1 on a damage die as a 2.",
    "requirements": ""
  },
  {
    "id": "anti-factor",
    "name": "Anti-Factor",
    "description": "Spells you cast ignore resistance to damage of the type you chose for Elementalist.",
    "requirements": "Elementalist"
  },
  {
    "id": "elementalist-s-prowess",
    "name": "Elementalist's Prowess",
    "description": "Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 20.",
    "requirements": "Anti-Factor"
  },
  {
    "id": "fey-affiliate",
    "name": "Fey Affiliate",
    "description": "You learn the Misty Step spell. You can cast it without expending spell points. Once you cast it this way, you can't cast it this way again until you finish a long rest. You can also cast it using spell points you have.",
    "requirements": ""
  },
  {
    "id": "fey-related",
    "name": "Fey Related",
    "description": "You learn a 1st-level spell of your choice. The 1st-level spell must be from the Divination or Enchantment school of magic. You can cast it without expending spell points. Once you cast it this way, you can't cast it this way again until you finish a long rest. You can also cast it using spell points you have. The spell's spellcasting ability is Intelligence, Wisdom, or Charisma (choose when you select this perk).",
    "requirements": "Fey Affiliate"
  },
  {
    "id": "fey-touched",
    "name": "Fey Touched",
    "description": "Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 20.",
    "requirements": "Fey Related"
  },
  {
    "id": "martial-student",
    "name": "Martial Student",
    "description": "You gain proficiency with a martial weapon you choose.",
    "requirements": ""
  },
  {
    "id": "focused-combatant",
    "name": "Focused Combatant",
    "description": "You learn one Fighting Style option of your choice from the fighter class. If you already have a style, the one you choose must be different.",
    "requirements": "Martial Student"
  },
  {
    "id": "elite-s-might",
    "name": "Elite's Might",
    "description": "Increase your Strength, Dexterity, or Constitution score by 1, to a maximum of 20.",
    "requirements": "Focused Combatant"
  },
  {
    "id": "wrestler-initiate",
    "name": "Wrestler Initiate",
    "description": "You have advantage on attack rolls against a creature you are grappling.",
    "requirements": ""
  },
  {
    "id": "wrestler-pin",
    "name": "Wrestler Pin",
    "description": "You can use your action to try to pin a creature grappled by you. To do so, make another grapple attempt. If the creature fails, you and the creature are both restrained until the grapple ends.",
    "requirements": "Wrestler Initiate"
  },
  {
    "id": "mountain-wrestler",
    "name": "Mountain Wrestler",
    "description": "You can grapple something up to two sizes larger than you.",
    "requirements": "Wrestler Initiate"
  },
  {
    "id": "wrestler-s-grit",
    "name": "Wrestler's Grit",
    "description": "Increase your Strength or Constitution score by 1, to a maximum of 20.",
    "requirements": "2 Wrestler perks"
  },
  {
    "id": "great-weapon-student",
    "name": "Great Weapon Student",
    "description": "On your turn, when you score a Critical Success on an attack with a melee weapon or reduce a creature to 0 hit points with one, you can make one melee weapon attack as a bonus action.",
    "requirements": ""
  },
  {
    "id": "great-weapon-gambit",
    "name": "Great Weapon Gambit",
    "description": "Before you make a melee attack with a heavy weapon that you are proficient with, you can choose to take a -5 penalty to the attack roll. If the attack hits, you add +10 to the attack's damage.",
    "requirements": "Great Weapon Student"
  },
  {
    "id": "greater-strength",
    "name": "Greater Strength",
    "description": "Increase your Strength or Constitution score by 1, to a maximum of 20.",
    "requirements": "Great Weapon Gambit"
  },
  {
    "id": "gunner",
    "name": "Gunner",
    "description": "You gain proficiency with basic firearms.",
    "requirements": ""
  },
  {
    "id": "tricky-shooting",
    "name": "Tricky Shooting",
    "description": "You learn one Trick Shot of your choice from among those available to the Gunslinger archetype in the fighter class. The trick shot save DC = 8 + your proficiency bonus + your Dexterity modifier. You gain 1 grit point, you regain 1 expended grit point each time you get a Critical Success for an attack with a firearm, or deal a killing blow to a creature of significant threat (DM's discretion). You regain all expended grit points after a short or long rest.",
    "requirements": "Gunner"
  },
  {
    "id": "shooter-s-accuracy",
    "name": "Shooter's Accuracy",
    "description": "Increase your Dexterity score by 1, to a maximum of 20.",
    "requirements": "Tricky Shooting"
  },
  {
    "id": "extended-mag",
    "name": "Extended Mag",
    "description": "Receive the benefits of Tricky Shooting again, increasing your known Trick Shots and grit points from Tricky Shooting to two.",
    "requirements": "Shooter's Accuracy"
  },
  {
    "id": "healer-initiate",
    "name": "Healer Initiate",
    "description": "You gain proficiency with trauma kits. When you use a trauma kit to stabilize a dying creature, that creature also regains hit points equal to your Wisdom modifier.",
    "requirements": ""
  },
  {
    "id": "healer-s-patchwork",
    "name": "Healer's Patchwork",
    "description": "As an action you can spend one use of a trauma kit to tend to a creature and restore 1d6 + 4 hit points to it, plus your level. The creature can't regain hit points from this perk again until it finishes a short or long rest.",
    "requirements": "Healer Initiate"
  },
  {
    "id": "healer-s-supply-line",
    "name": "Healer's Supply Line",
    "description": "At the end of a long rest, you regain 1d4+1 uses of a trauma kit you have. Additionally, you may expend $25 to regain 5 more uses of your trauma kit.",
    "requirements": "Healer Initiate"
  },
  {
    "id": "healer-s-fortitude",
    "name": "Healer's Fortitude",
    "description": "Increase your Constitution or Wisdom score by 1, to a maximum of 20.",
    "requirements": "2 Healer Perks"
  },
  {
    "id": "feather-wearer",
    "name": "Feather-Wearer",
    "description": "You gain proficiency with light armor, or medium armor if you're already proficient.",
    "requirements": ""
  },
  {
    "id": "leather-wearer",
    "name": "Leather-Wearer",
    "description": "You gain proficiency with medium armor, or heavy armor if you're already proficient.",
    "requirements": "Feather-Wear"
  },
  {
    "id": "steel-wearer",
    "name": "Steel-Wearer",
    "description": "You gain proficiency with heavy armor.",
    "requirements": "Leather-Wear"
  },
  {
    "id": "armorer-s-mettle",
    "name": "Armorer's Mettle",
    "description": "Increase your Strength, Dexterity, or Constitution score by 1, to a maximum of 20.",
    "requirements": "2 Wearer perks"
  },
  {
    "id": "linguist",
    "name": "Linguist",
    "description": "You learn three languages of your choice and have advantage on attempting to figure out a written text's language.",
    "requirements": ""
  },
  {
    "id": "encoding",
    "name": "Encoding",
    "description": "You can ably create written ciphers. Others can't decipher a code you create unless you teach them, they succeed on an Intelligence check (DC equal to your Intelligence score + your proficiency bonus), or they use magic to decipher it.",
    "requirements": "Linguist"
  },
  {
    "id": "writer-s-wit",
    "name": "Writer's Wit",
    "description": "Increase your Intelligence score by 1, to a maximum of 20.",
    "requirements": "Encoding"
  },
  {
    "id": "shared-opinion",
    "name": "Shared Opinion",
    "description": "Other players may allow you to use their Inspiration and vice versa.",
    "requirements": ""
  },
  {
    "id": "shared-hand",
    "name": "Shared Hand",
    "description": "You may play a Drama Card, choosing another willing creature to receive its intended benefit. Other players may play Drama Cards for you in this way as well.",
    "requirements": "Shared Opinion"
  },
  {
    "id": "director-s-allowance",
    "name": "Director's Allowance",
    "description": "Increase one ability score of your choice by 1, to a maximum of 20.",
    "requirements": "Shared Hand"
  },
  {
    "id": "concentration-breaker",
    "name": "Concentration Breaker",
    "description": "When you damage a creature that is concentrating on a spell, that creature has disadvantage on the saving throw it makes to maintain its concentration.",
    "requirements": ""
  },
  {
    "id": "anti-mage",
    "name": "Anti-Mage",
    "description": "When a creature within 5 feet of you casts a spell, you can use your reaction to make a melee weapon attack against that creature.",
    "requirements": "Concentration Breaker"
  },
  {
    "id": "mirror-shield",
    "name": "Mirror Shield",
    "description": "You have advantage on saving throws against spells cast by creatures within 5 feet of you.",
    "requirements": "Concentration Breaker"
  },
  {
    "id": "mage-slayer-s-insight",
    "name": "Mage Slayer's Insight",
    "description": "Increase your Strength, Dexterity, or Wisdom score by 1, to a maximum of 20.",
    "requirements": "Anti-Mage"
  },
  {
    "id": "magic-initiate",
    "name": "Magic Initiate",
    "description": "When you select this perk, choose a class: bard, cleric, druid, sorcerer, warlock, or wizard. You learn two cantrips of your choice from that class's spell list. Your spellcasting ability for these spells depends on the class you chose: Charisma for bard, sorcerer, or warlock; Wisdom for cleric or druid; or Intelligence for wizard.",
    "requirements": ""
  },
  {
    "id": "magic-student",
    "name": "Magic Student",
    "description": "Choose a 1st-level spell from the class's spell list you chose with Magic Initiate. You can cast the spell once at its lowest level without expending spell points. Once you cast it this way, you can't cast it this way again until you finish a long rest. You can also cast it using spell points you have. Your spellcasting ability for this spell is the same as the spells you chose for Magic Initiate.",
    "requirements": "Magic Initiate"
  },
  {
    "id": "magic-recovery",
    "name": "Magic Recovery",
    "description": "Once every long rest, as a bonus action, you may expend and roll one of your hit dice. You regain spell points equal to half the amount rolled (rounded down). These spell points disappear after you finish a long rest.",
    "requirements": "Magic Initiate"
  },
  {
    "id": "awareness-of-magic",
    "name": "Awareness of Magic",
    "description": "Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 20.",
    "requirements": "2 Magic perks"
  },
  {
    "id": "magic-border",
    "name": "Magic Border",
    "description": "As a reaction, you may expend 2 spell points, expend and roll one of your hit dice. You gain temporary hit points equal to the result + your spellcasting modifier for the spells you took for Magic Initiate. These temporary hit points last until the end of your next turn.",
    "requirements": "Tough, Magic Recovery"
  },
  {
    "id": "metamagic-initiate",
    "name": "Metamagic Initiate",
    "description": "You learn one Metamagic options of your choice from the sorcerer class. You can use only one Metamagic option on a spell when you cast it, unless the option says otherwise. You gain 1 sorcery point to spend on Metamagic (these points are added to any sorcery points you have from another source but can be used only on Metamagic). You regain all spent sorcery points when you finish a long rest.",
    "requirements": "Spellcasting or Pact Magic feature"
  },
  {
    "id": "versatile-metamagic",
    "name": "Versatile Metamagic",
    "description": "When you select this perk and when you reach a level that grants the Ability Score Improvement feature, you can replace one of your Metamagic options with another one from the sorcerer class.",
    "requirements": "Metamagic Initiate"
  },
  {
    "id": "recycling-metamagic",
    "name": "Recycling Metamagic",
    "description": "You regain 1 of your expended sorcery points after finishing a short rest.",
    "requirements": "Metamagic Initiate"
  },
  {
    "id": "meta",
    "name": "Meta",
    "description": "Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 20.",
    "requirements": "2 Metamagic perks"
  },
  {
    "id": "vast-metamagic",
    "name": "Vast Metamagic",
    "description": "Receive the benefits of Metamagic Initiate again, increasing your known Metamagic options and sorcery points from Metamagic Initiate to two.",
    "requirements": "Versatile Metamagic, Meta"
  },
  {
    "id": "odd-blood",
    "name": "Odd Blood",
    "description": "Monstrous Vigor activates for any spell that you used sorcery points on.",
    "requirements": "Monstrous Vigor, Metamagic Initiate"
  },
  {
    "id": "scout-initiate",
    "name": "Scout Initiate",
    "description": "Your speed increases by 5 feet.",
    "requirements": ""
  },
  {
    "id": "scout-s-tenacity",
    "name": "Scout's Tenacity",
    "description": "When you use the Dash action, difficult terrain doesn't cost you extra movement on that turn.",
    "requirements": "Scout Initiate"
  },
  {
    "id": "scout-s-cunning",
    "name": "Scout's Cunning",
    "description": "When you make a melee attack against a creature, you don't provoke opportunity attacks from that creature for the rest of the turn, whether you hit or not.",
    "requirements": "Scout Initiate"
  },
  {
    "id": "scout-s-tactics",
    "name": "Scout's Tactics",
    "description": "A creature is considered flanked by you and an ally you're adjacent to if the creature is adjacent to both of you.",
    "requirements": "Scout Initiate"
  },
  {
    "id": "scout-s-perserverance",
    "name": "Scout's Perseverance",
    "description": "Increase your Strength, Dexterity, or Intelligence score by 1, to a maximum of 20.",
    "requirements": "2 Scout perks"
  },
  {
    "id": "scout-s-mobility",
    "name": "Scout's Mobility",
    "description": "Your speed increases by 5 feet.",
    "requirements": "Scout Initiate, Athlete's Body"
  },
  {
    "id": "scout-weird",
    "name": "Scout Weird",
    "description": "You can climb while leaving your hands free.",
    "requirements": "Scout Initiate, Athlete Climber"
  },
  {
    "id": "rider-initiate",
    "name": "Rider Initiate",
    "description": "You can force an attack targeted at your mount to target you instead.",
    "requirements": ""
  },
  {
    "id": "guardian-rider",
    "name": "Guardian Rider",
    "description": "If your mount is subjected to an effect that allows it to make a basic Dexterity saving throw, if it succeeds, it counts as a Critical Success.",
    "requirements": "Rider Initiate"
  },
  {
    "id": "bully-rider",
    "name": "Bully Rider",
    "description": "You have advantage on melee attack rolls against any unmounted creature that is smaller than your mount.",
    "requirements": "Rider Initiate"
  },
  {
    "id": "professional-rider",
    "name": "Professional Rider",
    "description": "Increase your Strength, Dexterity, or Constitution score by 1, to a maximum of 20.",
    "requirements": "2 Rider perks"
  },
  {
    "id": "dullahan",
    "name": "Dullahan",
    "description": "When you or your mount receives damage, you may divide that damage between each other freely. When you reach 0 hit points, your mount's hit points also becomes 0 and vice versa.",
    "requirements": "Dark Knowledge, Professional Rider"
  },
  {
    "id": "lip-reading",
    "name": "Lip Reading",
    "description": "If you can see a creature's mouth while it is speaking a language you understand, you can interpret what it's saying by reading its lips.",
    "requirements": ""
  },
  {
    "id": "observant",
    "name": "Observant",
    "description": "You have a +5 bonus to your passive Wisdom (Perception) and passive Intelligence (Investigation) scores, disadvantage to either negates this bonus.",
    "requirements": "Lip Reading"
  },
  {
    "id": "clever-eye",
    "name": "Clever Eye",
    "description": "Increase your Intelligence or Wisdom score by 1, to a maximum of 20.",
    "requirements": "Observant"
  },
  {
    "id": "pressure-point",
    "name": "Pressure Point",
    "description": "Once per turn, when you hit a creature with an attack that deals piercing damage, you can re-roll one of the attack’s damage dice, and you must use the new roll.",
    "requirements": ""
  },
  {
    "id": "splinter",
    "name": "Splinter",
    "description": "When you deal maximum piercing damage with a damage die against a creature, that creature takes additional damage equal to your proficiency bonus.",
    "requirements": "Pressure Point"
  },
  {
    "id": "fencer-s-accuracy",
    "name": "Fencer's Accuracy",
    "description": "Increase your Strength or Dexterity score by 1, to a maximum of 20.",
    "requirements": "Splinter"
  },
  {
    "id": "vital-point",
    "name": "Vital Point",
    "description": "When you score a Critical Success on an attack with a weapon that deals piercing damage, you can roll one additional damage die when determining the extra piercing damage the target takes.",
    "requirements": "Fencer's Accuracy"
  },
  {
    "id": "poisoner-initiate",
    "name": "Poisoner Initiate",
    "description": "You gain proficiency with the poisoner's kit if you don't already have it. With one hour of work using a poisoner's kit and expending $500 worth of materials, you can create a number of doses of potent poison equal to your proficiency bonus. Once applied to a weapon or piece of ammunition, the poison retains its potency for 1 minute or until you hit with the weapon or ammunition. When a creature takes damage from the coated weapon or ammunition, that creature must succeed on a DC 14 Constitution saving throw or take 2d8 poison damage and become poisoned until the end of your next turn.",
    "requirements": ""
  },
  {
    "id": "poisoner-s-prescription",
    "name": "Poisoner's Prescription",
    "description": "When you make a damage roll, you ignore resistance to poison damage.",
    "requirements": "Poisoner Initiate"
  },
  {
    "id": "poisoner-s-application",
    "name": "Poisoner's Application",
    "description": "You can coat a weapon in poison as a bonus action, instead of an action. If you coat ammunition, you can coat 10 pieces of that ammunition.",
    "requirements": "Poisoner Initiate"
  },
  {
    "id": "poisoner-s-knowledge",
    "name": "Poisoner's Knowledge",
    "description": "Increase your Dexterity, Intelligence, or Wisdom score by 1, to a maximum of 20.",
    "requirements": "2 Poisoner perks"
  },
  {
    "id": "esoteric-elementalist",
    "name": "Esoteric Elementalist",
    "description": "Whenever you deal poison damage, you can instead choose to deal the damage type you chose for Elementalist. For poisons you craft, you must choose whether they deal poison damage or the damage type you chose for elementalist before you announce crafting them.",
    "requirements": "Elementalist, Poisoner's Knowledge"
  },
  {
    "id": "polearm-initiate",
    "name": "Polearm Initiate",
    "description": "When you take the Attack action and attack with only a glaive, halberd, quarterstaff, or spear, you can use a bonus action to make a melee attack with the opposite end of the weapon. This attack uses the same ability modifier as the primary attack. The weapon's damage die for this attack is a d4, and it deals bludgeoning damage.",
    "requirements": ""
  },
  {
    "id": "polearm-prodding",
    "name": "Polearm Prodding",
    "description": "While you are wielding a glaive, halberd, pike, quarterstaff, or spear, other creatures provoke an opportunity attack from you when they cast a spell or attempt to hide within the reach you have with that weapon.",
    "requirements": "Polearm Initiate"
  },
  {
    "id": "polearm-versatility",
    "name": "Polearm Versatility",
    "description": "You are considered to be making a running long jump or high jump whenever you jump as long as you're wielding a glaive, halberd, pike, quarterstaff, or spear.",
    "requirements": "Polearm Initiate"
  },
  {
    "id": "polearm-mastery",
    "name": "Polearm Mastery",
    "description": "Increase your Strength or Dexterity score by 1, to a maximum of 20.",
    "requirements": "2 Polearm perks"
  },
  {
    "id": "dragoon",
    "name": "Dragoon",
    "description": "You have resistance to damage from falling and don't fall prone from landing as long as you have hit points left.  You have advantage on checks made to jump and have advantage on attacks made while falling and while wielding a glaive, halberd, pike, quarterstaff, or spear.",
    "requirements": "Athlete Jumper, Polearm Versatility"
  },
  {
    "id": "elite-dragoon",
    "name": "Elite Dragoon",
    "description": "Once on each of your turns, when landing an attack with a glaive, halberd, pike, quarterstaff, or spear while falling, add the fall's damage dice that you would take to the damage roll of the attack.",
    "requirements": "Dragoon"
  },
  {
    "id": "determined",
    "name": "Determined",
    "description": "When you roll a 1 with a saving throw, you may choose to reroll it, you must take the new result.",
    "requirements": ""
  },
  {
    "id": "resilience",
    "name": "Resilience",
    "description": "When you select this perk, choose an ability score. You gain proficiency in saving throws using the chosen ability.",
    "requirements": "Determined"
  },
  {
    "id": "stubborn",
    "name": "Stubborn",
    "description": "Increase the ability score you chose for Resilience by 1, to a maximum of 20.",
    "requirements": "Resilience"
  },
  {
    "id": "ritualist-initiate",
    "name": "Ritualist Initiate",
    "description": "When you choose this perk, you acquire a ritual book holding two 1st-level spells of your choice. Choose one of the following classes: bard, cleric, druid, sorcerer, warlock, or wizard. You must choose your spells from that class's spell list, and the spells you choose must have the ritual tag. The class you choose also must have the ritual tag. The class you choose also determines your spellcasting ability for these spells: Charisma for bard, sorcerer, or warlock; Wisdom for cleric or druid; or Intelligence for wizard.",
    "requirements": ""
  },
  {
    "id": "ritualist-s-collection",
    "name": "Ritualist's Collection",
    "description": "If you come across a spell in written form, such as a magical spell scroll or a wizard's spellbook, you might be able to add it to your ritual book. The spell must be on the spell list for the class you chose, the spell's level can be no higher than half your level (rounded up), and it must have the ritual tag. The spell is treated as a spell you gained from Ritualist Initiate. The process of copying the spell into your ritual book takes 2 hours per level of the spell, and costs $500 per level. The cost represents the material components you expend as you experiment with the spell to master it, as well as the fine inks you need to record it.",
    "requirements": "Ritualist Initiate"
  },
  {
    "id": "ritualist-s-library",
    "name": "Ritualist's Library",
    "description": "When you choose this perk, add two more 1st-level spells of your choice to your ritual book. They must have the ritual tag and are treated as spells from Ritualist Initiate.",
    "requirements": "Ritualist Initiate"
  },
  {
    "id": "ritualist-s-knowledge",
    "name": "Ritualist's Knowledge",
    "description": "Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 20.",
    "requirements": "2 Ritualist perks"
  },
  {
    "id": "grievious-wounder",
    "name": "Grievous Wounder",
    "description": "When you roll damage for a melee weapon attack, you may reroll any roll of 1 once.",
    "requirements": ""
  },
  {
    "id": "savage-attacker",
    "name": "Savage Attacker",
    "description": "Once per turn when you roll damage for a melee weapon attack, you can reroll one of that weapon's damage dice and use either result.",
    "requirements": "Grievous Wounder"
  },
  {
    "id": "savage-s-strength",
    "name": "Savage's Strength",
    "description": "Increase your Strength score by 1, to a maximum of 20.",
    "requirements": "Savage Attacker"
  },
  {
    "id": "sentinel",
    "name": "Sentinel",
    "description": "When you hit a creature with an opportunity attack within 5 feet of you, the creature's speed becomes 0 for the rest of the turn.",
    "requirements": ""
  },
  {
    "id": "sentinel-s-eye",
    "name": "Sentinel's Eye",
    "description": "When a creature within 5 feet of you makes an attack against a target other than you, you can use your reaction to make a melee weapon attack against the attacking creature.",
    "requirements": "Sentinel"
  },
  {
    "id": "sentinel-s-vitality",
    "name": "Sentinel's Vitality",
    "description": "Increase your Strength or Constitution score by 1, to a maximum of 20.",
    "requirements": "Sentinel's Eye"
  },
  {
    "id": "shadow-haunted",
    "name": "Shadow Haunted",
    "description": "You learn the Invisibility spell. You can cast it without expending spell points. Once you cast it this way, you can't cast it this way again until you finish a long rest. You can also cast it using spell points you have.",
    "requirements": ""
  },
  {
    "id": "shadow-engrossed",
    "name": "Shadow Engrossed",
    "description": "You learn a 1st-level spell of your choice. The 1st-level spell must be from the Illusion or Necromancy school of magic. You can cast it without expending spell points. Once you cast it this way, you can't cast it this way again until you finish a long rest. You can also cast it using spell points you have. The spell's spellcasting ability is Intelligence, Wisdom, or Charisma (choose when you select this perk).",
    "requirements": "Shadow Haunted"
  },
  {
    "id": "shadow-touched",
    "name": "Shadow Touched",
    "description": "Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 20.",
    "requirements": "Shadow Engrossed"
  },
  {
    "id": "shielder",
    "name": "Shielder",
    "description": "If you aren't incapacitated, you can add your shield's AC bonus to any Dexterity saving throw you make against a spell or other harmful effect that targets only you.",
    "requirements": ""
  },
  {
    "id": "brick-wall",
    "name": "Brick Wall",
    "description": "If you are subjected to an effect that allows you to make a basic Dexterity saving throw, if you succeed and are wielding a shield, you may use your reaction to count it as a Critical Success.",
    "requirements": "Shielder"
  },
  {
    "id": "ramming",
    "name": "Ramming",
    "description": "If you take the Attack action on your turn, you can use a bonus action to try to shove a creature within 5 feet of you with your shield.",
    "requirements": "Shielder"
  },
  {
    "id": "shielder-s-endurance",
    "name": "Shielder's Endurance",
    "description": "Increase your Strength or Constitution score by 1, to a maximum of 20.",
    "requirements": "Brick Wall"
  },
  {
    "id": "skilled",
    "name": "Skilled",
    "description": "You gain proficiency in one skill of your choice.",
    "requirements": ""
  },
  {
    "id": "expert",
    "name": "Expert",
    "description": "Choose one skill in which you have proficiency. You gain expertise with that skill, which means your proficiency bonus is doubled for any ability check you make with it. The skill you choose must be one that isn't already benefiting from a feature, such as Expertise, that doubles your proficiency bonus.",
    "requirements": "Skilled"
  },
  {
    "id": "talented",
    "name": "Talented",
    "description": "Increase one ability score of your choice by 1, to a maximum of 20.",
    "requirements": "Expert"
  },
  {
    "id": "sharpshooter-student",
    "name": "Sharpshooter Student",
    "description": "Attacking at long range doesn't impose disadvantage on your ranged weapon attack rolls and your ranged weapon attacks ignore half cover.",
    "requirements": ""
  },
  {
    "id": "sharpshooter-gambit",
    "name": "Sharpshooter Gambit",
    "description": "Before you make an attack with a ranged weapon that you are proficient with, you can choose to take a -5 penalty to the attack roll. If that attack hits, you add +10 to the attack's damage.",
    "requirements": "Sharpshooter Student"
  },
  {
    "id": "sharper-dexterity",
    "name": "Sharper Dexterity",
    "description": "Increase your Dexterity or Wisdom score by 1, to a maximum of 20.",
    "requirements": "Sharpshooter Gambit"
  },
  {
    "id": "artisan-skills",
    "name": "Artisan Skills",
    "description": "You gain proficiency with two artisan tools of your choice.",
    "requirements": "Skilled"
  },
  {
    "id": "weapon-skills",
    "name": "Weapon Skills",
    "description": "You gain proficiency with two weapons of your choice, each one must be a simple weapon, martial weapon, or a basic firearm.",
    "requirements": "Skilled"
  },
  {
    "id": "extra-skills",
    "name": "Extra Skills",
    "description": "You gain proficiency with two skills of your choice.",
    "requirements": "Skilled"
  },
  {
    "id": "prowler-initiate",
    "name": "Prowler Initiate",
    "description": "You can try to hide when you are lightly obscured from the creature from which you are hiding.",
    "requirements": ""
  },
  {
    "id": "prowler-s-retreat",
    "name": "Prowler's Retreat",
    "description": "When you are hidden from a creature and miss it with a ranged weapon attack, making the attack doesn't reveal your position.",
    "requirements": "Prowler Initiate"
  },
  {
    "id": "prowler-s-eye",
    "name": "Prowler's Eye",
    "description": "Dim light doesn't impose disadvantage on your Wisdom (Perception) checks relying on sight.",
    "requirements": "Prowler Initiate"
  },
  {
    "id": "prowler-s-deftness",
    "name": "Prowler's Deftness",
    "description": "Increase your Dexterity or Intelligence score by 1, to a maximum of 20.",
    "requirements": "2 Prowler perks"
  },
  {
    "id": "crawler",
    "name": "Crawler",
    "description": "Crawling doesn't cost you extra movement. Additionally, as long as you are conscious, attackers don't have advantage on you due to you being prone and being within 5 feet of you.",
    "requirements": "Athlete Skulker, Prowler's Deftness"
  },
  {
    "id": "incision",
    "name": "Incision",
    "description": "When you score a Critical Success with an attack that deals slashing damage to a creature, you grievously wound it. Until the end of its next turn, the target has disadvantage on all attack rolls.",
    "requirements": ""
  },
  {
    "id": "deep-cuts",
    "name": "Deep Cuts",
    "description": "When you deal slashing damage to a creature, the next time that creature willingly moves on their turn on the same round, that creature takes slashing damage equal to your proficiency bonus.",
    "requirements": "Incision"
  },
  {
    "id": "slasher-s-precision",
    "name": "Slasher's Precision",
    "description": "Increase your Strength or Dexterity score by 1, to a maximum of 20.",
    "requirements": "Deep Cuts"
  },
  {
    "id": "blood-drinker",
    "name": "Blood Drinker",
    "description": "When you score a Critical Success with an attack that deals slashing damage to a creature, gain temporary hit points equal to the result of the weapon's damage dice, without any modifiers, for 1 minute.",
    "requirements": "Slasher's Precision"
  },
  {
    "id": "spell-sniper-initiate",
    "name": "Spell Sniper Initiate",
    "description": "When you cast a spell that requires you to make an attack roll, the spell's range is doubled.",
    "requirements": "Spellcasting or Pact Magic feature"
  },
  {
    "id": "spell-sniper-s-tracking",
    "name": "Spell Sniper's Tracking",
    "description": "Your ranged spell attacks ignore half cover. Spells that requires you to make an attack roll and have a range of touch now has a range of 10 feet for you.",
    "requirements": "Spell Sniper Initiate"
  },
  {
    "id": "spell-sniper-s-repertoire",
    "name": "Spell Sniper's Repertoire",
    "description": "You learn one cantrip that requires an attack roll. Choose the cantrip from the bard, cleric, druid, sorcerer, warlock, or wizard spell list. Your spellcasting ability for this cantrip depends on the spell list you chose from: Charisma for bard, sorcerer, and warlock; Wisdom for cleric or druid; or Intelligence for wizard.",
    "requirements": "Spell Sniper Initiate"
  },
  {
    "id": "spell-sniper-s-experience",
    "name": "Spell Sniper's Experience",
    "description": "Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 20.",
    "requirements": "2 Spell Sniper perks"
  },
  {
    "id": "slugger",
    "name": "Slugger",
    "description": "You gain proficiency with improvised weapons. Your unarmed strike uses a d4 for damage, you may use your Dexterity instead of Strength when making attack and damage rolls with unarmed strikes or improvised weapons.",
    "requirements": ""
  },
  {
    "id": "headlock",
    "name": "Headlock",
    "description": "When you hit a creature with an unarmed strike or an improvised weapon on your turn, you can use a bonus action to attempt to grapple the target.",
    "requirements": "Slugger"
  },
  {
    "id": "brawler-s-might",
    "name": "Brawler's Might",
    "description": "Increase your Strength, Dexterity, or Constitution score by 1, to a maximum of 20.",
    "requirements": "Headlock"
  },
  {
    "id": "void-claw",
    "name": "Void Claw",
    "description": "Attempts to grapple can be made up to 10 feet away from you, grapples made this way are treated as if you had a third hand. As a bonus action, you may move a creature you've grappled to an unoccupied space within 10 feet of you, provided the path from the origin and the destination of this forced movement isn't obstructed by objects or creatures other than you.",
    "requirements": "Mountain Wrestler, Headlock, Shadow Touched"
  },
  {
    "id": "telekinetic",
    "name": "Telekinetic",
    "description": "You learn the mage hand cantrip. You can cast it without verbal or somatic components, and you can make the spectral hand invisible. If you already know this spell, its range increases by 30 feet when you cast it. Its spellcasting ability is Intelligence, Wisdom, or Charisma (choose when you select this perk).",
    "requirements": ""
  },
  {
    "id": "amplify-gravity",
    "name": "Amplify Gravity",
    "description": "As a bonus action, you can try to shove one creature you can see within 30 feet of you. When you do so, the target must succeed on a Strength saving throw (DC 8 + your proficiency bonus + the spellcasting ability you chose for Telekinetic). If you choose the push the creature, instead of pushing it 5 feet away from you, you can choose to push it 5 feet towards any direction.",
    "requirements": "Telekinetic"
  },
  {
    "id": "evolved-mind",
    "name": "Evolved Mind",
    "description": "Increase your Intelligence or Wisdom by 1, to a maximum of 20.",
    "requirements": "Amplify Gravity"
  },
  {
    "id": "curved-shot",
    "name": "Curved Shot",
    "description": "Your ranged attacks ignore three-quarters cover. On a Critical Success with ranged attacks, you may add your Intelligence modifier to the damage roll of the ranged attack.",
    "requirements": "Amplify Gravity, Spell Sniper's Tracking/Sharpshooter Student"
  },
  {
    "id": "telepathic",
    "name": "Telepathic",
    "description": "You can speak telepathically to any creature you can see within 60 feet of you. Your telepathic utterances are in a language you know, and the creature understands you only if it knows that language. Your communication doesn't give the creature the ability to respond to you telepathically.",
    "requirements": ""
  },
  {
    "id": "stringed-thoughts",
    "name": "Stringed Thoughts",
    "description": "You can cast the Detect Thoughts spell without expending spell points or components. Once you cast it this way, you can't cast it this way again until you finish a long rest. You can also cast it using spell points you have. Your spellcasting ability for the spell is Intelligence, Wisdom, or Charisma (choose when you select this perk).",
    "requirements": "Telepathic"
  },
  {
    "id": "expanded-mind",
    "name": "Expanded Mind",
    "description": "Increase your Intelligence or Charisma by 1, to a maximum of 20.",
    "requirements": "Stringed Thoughts"
  },
  {
    "id": "hivemind",
    "name": "Hivemind",
    "description": "At the end of a long rest, you may select creatures up to your proficiency bonus to be added to your network of thoughts. Until your next long rest, when you cast a spell of 3rd level or lower with a range of self, you may instead select a creature within 60 feet that is in your network to receive the effects of the spell instead of you. Additionally, whenever you cast a cantrip with an attack, the point of origin for the attack can be a creature within 60 feet of you that is in your network instead of you, meaning spells that have a range of touch can be used on enemies that are within touching distance of creatures in your network. You are still required to be able to see the target.",
    "requirements": "Fey Touched, Evolved Mind/Expanded Mind"
  },
  {
    "id": "war-caster-initiate",
    "name": "War Caster Initiate",
    "description": "You have advantage on Constitution saving throws that you make to maintain your concentration on a spell when you take damage. Additionally, you gain the ability to perform the somatic components of spells even when you have weapons or a shield in one or both hands.",
    "requirements": "Spellcasting or Pact Magic feature"
  },
  {
    "id": "war-caster-s-reaction",
    "name": "War Caster's Reaction",
    "description": "When a hostile creature's movement provokes an opportunity attack from you, you can use your reaction to cast a spell at the creature, rather than making an opportunity attack. The spell must have a casting time of 1 action and must target only that creature.",
    "requirements": "War Caster Initiate"
  },
  {
    "id": "war-caster-s-resilience",
    "name": "War Caster's Resilience",
    "description": "Whenever you are subjected to a spell effect that makes you roll a saving throw, you can expend a hit die and add it to your roll.",
    "requirements": "War Caster Initiate"
  },
  {
    "id": "war-caster-s-mentality",
    "name": "War Caster's Mentality",
    "description": "Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 20.",
    "requirements": "2 War Caster perks"
  },
  {
    "id": "mana-flux",
    "name": "Mana Flux",
    "description": "Whenever you deal damage with spells against a creature that's concentrating on a spell, add additional damage to the spell's damage roll equal to the level of the spell you casted (minimum of 1). If the creature lost concentration as a result of the damage, the creature also takes psychic damage equal to the spell points used for the spell.",
    "requirements": "Mage Slayer's Insight, War Caster's Mentality"
  },
  {
    "id": "inventor-initiate",
    "name": "Inventor Initiate",
    "description": "When you choose this perk, you master two magical effects, each of which recreates the effect of a 1st-level spell that has the ritual tag. These spells can come from any class list, but Intelligence is your spellcasting ability for them.",
    "requirements": ""
  },
  {
    "id": "inventor-s-curiosity",
    "name": "Inventor's Curiosity",
    "description": "If you come across a schematic geared toward quicksmithing or study with another quicksmith, you might be able to add another spell to the effects you have mastered. The spell’s level can be no higher than half your level (rounded up), and it must have the ritual tag. The process of mastering the spell takes 2 hours per level of the spell, and costs $5,000 per level. The cost represents aether you use as you experiment with the spell effect to master it.",
    "requirements": "Inventor Initiate"
  },
  {
    "id": "inventor-s-knick-knacks",
    "name": "Inventor's Knick Knacks",
    "description": "You gain proficiency with quicksmith’s tools. Using those tools, you can spend 1 hour and $1,000 worth of materials to construct a Tiny clockwork device (AC 5, 1 hp). The device ceases to function after 24 hours unless you spend 1 hour repairing it to keep it functioning. You can use your action to dismantle the device, at which point you can reclaim the materials used to create it. You can have up to three such devices active at a time. When you create a device, choose one of the following options:\n\n    Clockwork Toy. This toy is a clockwork animal, monster, or person, such as a frog, mouse, bird, dragon, or soldier. When placed on the ground, the toy moves 5 feet across the ground on each of your turns in a random direction. It makes noises as appropriate to the creature it represents.\n\n    Fire Starter. This device produces a miniature flame, which you can use to light a candle, torch, or campfire. Using the device requires your action.\n\n    Music Box. When opened, this music box plays a single song at a moderate volume. The box stops playing when it reaches the song’s end or when it is closed.",
    "requirements": "Inventor Initiate"
  },
  {
    "id": "inventor-s-smarts",
    "name": "Inventor's Smarts",
    "description": "Increase your Intelligence score by 1, to a maximum of 20.",
    "requirements": "2 Inventor perks"
  },
  {
    "id": "servo-crafter-initiate",
    "name": "Servo Crafter Initiate",
    "description": "You are skilled in the creation of servos—tiny constructs that function as personal assistants. You can cast the Find Familiar spell as a ritual, creating a servo to serve as your familiar instead of an animal. It uses the Servo stat block, but in every other way, a servo familiar functions as described in the find familiar spell. Servo\nTiny construct, unaligned\nArmor Class: 11 (natural armor)\nHit Points: 10 (3d4 + 3)\nSpeed: 20 ft.\nSTR  DEX  CON  INT  WIS  CHA\n4 (-3)  11 (+0)  12 (+1)  3 (-4)  10 (+0)  7 (-2)\nDamage Immunities: poison\nCondition Immunities: charmed, poisoned\nSenses: passive Perception 10\nLanguages: —\nChallenge: 0 (10 XP)\nActions\nClaw. Melee Weapon Attack: +0 to hit, reach 5 ft., one target. Hit: 1 slashing damage.",
    "requirements": ""
  },
  {
    "id": "servo-crafter-s-remote",
    "name": "Servo Crafter's Remote",
    "description": "You can communicate telepathically with your servo familiar and perceive through its senses as long as you are on the same plane of existence. You can speak through your servo in your own voice. Additionally, when you take the Attack action, you can forgo one of your own attacks to allow your servo familiar to make one attack of its own.",
    "requirements": "Servo Crafter Initiate"
  },
  {
    "id": "servo-crafter-s-new-gears",
    "name": "Servo Crafter's New Gears",
    "description": "Your servo gains maximum hit points equal to twice your modifier, 10 feet of speed, and AC equal to your proficiency bonus. Additionally, your servo's claw attack uses your proficiency and Intelligence modifier to attack roll, it now deals 1d6  + your Intelligence modifier slashing damage.",
    "requirements": "Servo Crafter Initiate"
  },
  {
    "id": "servo-crafter-s-spell-mote",
    "name": "Servo Crafter's Spell Mote",
    "description": "You may cast cantrips through your servo as if it's the origin of the spell.",
    "requirements": "Servo Crafter Initiate"
  },
  {
    "id": "servo-crafter-s-know-how",
    "name": "Servo Crafter's Know-How",
    "description": "Increase your Intelligence score by 1, to a maximum of 20.",
    "requirements": "2 Servo Crafter perks"
  },
  {
    "id": "thrown-arms-initiate",
    "name": "Thrown Arms Initiate",
    "description": "Simple and martial melee weapons without the thrown property have the thrown property for you. One-handed weapons have a normal range of 20 feet and a long range of 60 feet, while two-handed weapons have a normal range of 15 feet and a long range of 30 feet.",
    "requirements": ""
  },
  {
    "id": "thrown-arms-lugger",
    "name": "Thrown Arms Lugger",
    "description": "Weapons that already have the thrown property increase their short range by 20 feet and their long range by 40 feet for you.",
    "requirements": "Thrown Arms Initiate"
  },
  {
    "id": "thrown-arms-returner",
    "name": "Thrown Arms Returner",
    "description": "When you miss with a thrown weapon attack using a light weapon, the weapon returns to your grasp like a boomerang at the end of your turn, unless something prevents it from returning. You can catch and stow as many weapons as you threw in this way.",
    "requirements": "Thrown Arms Initiate"
  },
  {
    "id": "thrown-arms-power",
    "name": "Thrown Arms Power",
    "description": "Increase your Strength, Dexterity, or Constitution score by 1, to a maximum of 20.",
    "requirements": "2 Thrown Arms perks"
  },
  {
    "id": "explosive-thrower",
    "name": "Explosive Thrower",
    "description": "When you score a Critical Success with a thrown weapon attack, the target falls prone and is crushed by the weapon. The target cannot stand up until they make a Strength (Athletics) check to remove the weapon, on an 11 or higher, they are able to stand up.",
    "requirements": "Thrown Arms Lugger, Thrown Arms Power"
  },
  {
    "id": "flail-trick",
    "name": "Flail Trick",
    "description": "When you hit with an opportunity attack using a flail, the target must succeed on a Strength saving throw (DC 8 + your proficiency bonus + your Strength modifier) or be knocked prone.",
    "requirements": ""
  },
  {
    "id": "flail-bypass",
    "name": "Flail Bypass",
    "description": "As a bonus action on your turn, you can prepare yourself to extend your flail to sweep over targets’ shields. Until the end of this turn, your attack rolls with a flail gain a +2 bonus against any target using a shield.",
    "requirements": "Flail Trick"
  },
  {
    "id": "flailer-s-strength",
    "name": "Flailer's Strength",
    "description": "Increase your Strength or Constitution score by 1, to a maximum of 20.",
    "requirements": "Flail Bypass"
  },
  {
    "id": "medical-arts",
    "name": "Medical Arts",
    "description": "You gain proficiency in the Medicine skill. If you are already proficient in the skill, you add double your proficiency bonus to checks you make with it.",
    "requirements": ""
  },
  {
    "id": "medic-s-patchwork",
    "name": "Medic's Patchwork",
    "description": "During a short rest, you can clean and bind the wounds of up to six willing beasts and humanoids. Make a DC 15 Wisdom (Medicine) check for each creature. On a success, if a creature spends a Hit Die during this rest, that creature can forgo the roll and instead regain the maximum number of hit points the die can restore. A creature can do so only once per rest, regardless of how many Hit Dice it spends.",
    "requirements": "Medical Arts"
  },
  {
    "id": "medic-s-experience",
    "name": "Medic's Experience",
    "description": "Increase your Constitution, Intelligence, or Wisdom score by 1, to a maximum of 20.",
    "requirements": "Medic's Patchwork"
  },
  {
    "id": "menace",
    "name": "Menace",
    "description": "When you take the Attack action on your turn, you can replace one attack with an attempt to demoralize one humanoid you can see within 30 feet of you that can see and hear you. Make a Charisma (Intimidation) check contested by the target's Wisdom (Insight) check. If your check succeeds, the target is frightened until the end of its next turn. If your check fails, the target can't be frightened by you in this way for 1 hour.",
    "requirements": ""
  },
  {
    "id": "skilled-beration",
    "name": "Skilled Beration",
    "description": "You gain proficiency in the Intimidation skill. If you are already proficiency in the skill, you add double your proficiency bonus to checks you make with it.",
    "requirements": "Menace"
  },
  {
    "id": "strict-eye",
    "name": "Strict Eye",
    "description": "Increase your Wisdom or Charisma score by 1, to a maximum of 20.",
    "requirements": "Skilled Beration"
  },
  {
    "id": "backhand-comment",
    "name": "Backhand Comment",
    "description": "You may use Menace as a bonus action instead of an Attack action. If you failed at frightening a creature with Menace, you are able to frighten them again if you score a Critical Success with an attack against them.",
    "requirements": "Strict Eye"
  },
  {
    "id": "naturalist",
    "name": "Naturalist",
    "description": "You gain proficiency in the Nature skill. If you are already proficient in the skill, you add double your proficiency bonus to checks you make with it.",
    "requirements": ""
  },
  {
    "id": "nature-s-boon",
    "name": "Nature's Boon",
    "description": "You learn the Druidcraft and Detect Poison and Disease spells. You can cast Detect Poison and Disease once without expending spell points. You regain the ability to do so when you finish a long rest. You can also cast it using spell points you have.",
    "requirements": "Naturalist"
  },
  {
    "id": "dryad-s-likeness",
    "name": "Dryad's Likeness",
    "description": "Increase your Wisdom or Charisma score by 1, to a maximum of 20.",
    "requirements": "Nature's Boon"
  },
  {
    "id": "helper",
    "name": "Helper",
    "description": "You can use the Help action as a bonus action.",
    "requirements": ""
  },
  {
    "id": "backseat",
    "name": "Backseat",
    "description": "When you use the Help action to aid an ally in attacking a creature, increase the range of the Help action by 10 feet.",
    "requirements": "Helper"
  },
  {
    "id": "critical-eye",
    "name": "Critical Eye",
    "description": "Increase your Intelligence or Wisdom score by 1, to a maximum of 20.",
    "requirements": "Backseat"
  },
  {
    "id": "focus-attack",
    "name": "Focus Attack",
    "description": "You can help a number of allies up to your proficiency modifier that's targeting the same creature within range when you use Backseat.",
    "requirements": "Critical Eye"
  },
  {"id":"whipper","name":"Whipper","description":"You gain proficiency with whips if you do not already have it. The whip's damage die becomes a d6 instead of a d4.","requirements":""},
  {"id":"whip-crack","name":"Whip Crack","description":"As a bonus action, you can increase your reach with a whip by 5 feet until the start of your next turn.","requirements":"Whipper"},
  {"id":"whippers-agility","name":"Whipper's Agility","description":"Increase your Strength or Dexterity score by 1, to a maximum of 20.","requirements":"Whip Crack"},
  {"id":"whip-tricks","name":"Whip Tricks","description":"When you take the Attack action and make an attack with a whip, you can make a shove or grapple attempt instead, using the whip's reach. The DC uses your Dexterity modifier instead of your Strength modifier. When you shove a creature this way, you pull it up to 5 feet toward you instead of pushing it away. If you grapple a creature this way, the grapple ends if you use the whip to interact with another creature, such as by attacking a creature other than the grappled creature.","requirements":"Whipper's Agility"},
  {"id":"occult-initiate","name":"Occult Initiate","description":"You learn Divine Favor. You can cast it once without expending spell points, regaining the ability to do so when you finish a long rest. You can also cast it using spell points. When you cast it, it deals necrotic damage instead of radiant damage.","requirements":""},
  {"id":"occult-teachings","name":"Occult Teachings","description":"Choose a 1st-level Divination or Necromancy spell. You can cast it once without expending spell points, regaining the ability to do so when you finish a long rest. You can also cast it using spell points. Constitution, Wisdom, or Charisma is your spellcasting ability for it (choose when you select this perk).","requirements":"Occult Initiate"},
  {"id":"occult-weird","name":"Occult Weird","description":"You can target an unwilling creature with a healing spell that rolls dice. The target makes a basic Wisdom saving throw. On a failure, it takes damage equal to the healing the spell would restore. When you cast a healing spell this way, you either regain 1 spell point or add one additional die to the spell's healing.","requirements":"Occult Initiate"},
  {"id":"occult-belief","name":"Occult Belief","description":"Increase your Constitution, Wisdom, or Charisma score by 1, to a maximum of 20.","requirements":"2 Occult perks"},
  {"id":"rise-from-the-deep","name":"Rise from the Deep","description":"As a bonus action, you cause a tentacle to sprout from an unoccupied space you can see within 30 feet. It is an extension of you, cannot move, and any attack or spell that targets it targets you. You can dismiss it for free on your turn or as a reaction. You can cast spells as if you occupied its space or attack from its space as if wielding a whip, with which you are proficient. You can use the spellcasting ability chosen for Occult Teachings for its attack and damage rolls. The tentacle lasts for 1 minute, disappears if you become unconscious, and cannot be summoned again until you finish a short or long rest.","requirements":"Occult Teachings, Whip Crack/Occult Belief"},
  {"id":"the-deeps-favor","name":"The Deep's Favor","description":"When you cast a leveled spell, you can also summon a tentacle using Rise from the Deep. You can have a number of tentacles equal to your proficiency bonus at one time and can dismiss them at any time.","requirements":"Rise from the Deep"},
  {"id":"lycan-curse","name":"Lycan Curse","description":"Decrease your Intelligence or Charisma score by 1. The DM can introduce unforeseen circumstances around full moons. You can take a perk that requires Lycan Curse only when you gain a level.","requirements":"No other curse perks, DM's permission"},
  {"id":"werewolf","name":"Werewolf","description":"Your hit point maximum increases by twice your level and increases by 2 whenever you gain a level. You gain vulnerability to silver, advantage on Wisdom (Perception) checks that rely on hearing or smell, and the following natural melee weapons: Claw. It deals 1d8 slashing damage; you can gain temporary hit points equal to half the damage dealt until the start of your next turn. Bite. It deals 2d4 piercing damage. A humanoid hit by it must succeed on a DC 12 Constitution saving throw or replace one of its perks with Lycan Curse.","requirements":"Lycan Curse"},
  {"id":"kitsune","name":"Kitsune","description":"Increase your Wisdom or Charisma score by 1, to a maximum of 20. You can take the Dash action as a bonus action. You gain foxfire, a natural ranged weapon with a normal range of 20 feet and a long range of 40 feet. It deals 1d4 fire or cold damage, and you add the ability modifier increased by this perk to its attack and damage rolls. You can transform into a fox following the druid's Wild Shape rules and can use foxfire while transformed.\nFox\nTiny beast, unaligned\nArmor Class 12\nHit Points 2 (1d4)\nSpeed 30 ft.\nSTR 3 (-4) DEX 15 (+2) CON 10 (+0) INT 3 (-4) WIS 12 (+1) CHA 7 (-2)\nSkills Perception +3, Stealth +4\nSenses passive Perception 13\nLanguages -\nChallenge 0\nKeen Hearing and Smell. The fox has advantage on Wisdom (Perception) checks that rely on hearing or smell.\nActions\nBite. Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 1 piercing damage.","requirements":"Lycan Curse"},
  {"id":"rat","name":"Rat","description":"Increase your Dexterity score by 1, to a maximum of 20. Your size becomes Small if it is not already. You gain resistance to poison damage, advantage on saving throws against being poisoned, and darkvision out to 60 feet. You cannot discern color in darkness. Your vicious incisors are finesse natural melee weapons that deal 1d4 + your Dexterity modifier piercing damage and benefit from Sneak Attack. For Sneak Attack's extra damage, you count as a rogue of half your character level if you do not already have that feature.","requirements":"Lycan Curse"},
  {"id":"rotting-curse","name":"Rotting Curse","description":"Decrease your Strength or Constitution score by 1. You gain resistance to necrotic and poison damage. You can take a perk that requires Rotting Curse only when you gain a level.","requirements":"No other curse perks, DM's permission"},
  {"id":"zombie","name":"Zombie","description":"Decrease your Intelligence score by 1 and your speed by 5 feet. You gain immunity to the poisoned condition and disease, and your creature type becomes Undead. Your jaws are natural melee weapons that deal 1d8 piercing damage. When you hit a creature with them while crawling, its speed is halved until the end of its next turn. You can crawl without spending extra movement, do not have disadvantage on attacks while crawling, and gain 5 feet of speed until the end of your turn if you start it prone. You cannot make nonlethal unarmed strikes. When damage reduces you to 0 hit points, make a Constitution saving throw (DC 5 + damage taken), unless the damage is radiant or from a critical success. On a success, you drop to 1 hit point; on a failure, you gain 2 exhaustion levels. You cannot remove exhaustion through a long rest unless you have eaten fresh humanoid flesh since your last long rest.","requirements":"Rotting Curse"},
  {"id":"vampire","name":"Vampire","description":"Increase your Charisma score by 1, to a maximum of 20. You gain immunity to necrotic damage, vulnerability to radiant damage, darkvision out to 60 feet, and the Undead creature type. You regain 4 hit points at the start of each turn while you have at least 1 hit point and are not in sunlight or running water. Direct sunlight deals 4 radiant damage to you at the start of your turn; running water deals 4 acid damage. You cannot enter a residence without an invitation from an occupant. Your bite is a finesse natural melee weapon that deals 1d8 piercing damage. You cannot remove exhaustion through a long rest unless you have drunk humanoid blood since your last long rest. You can transform into a bat following the druid's Wild Shape rules.\nBat\nTiny beast, unaligned\nArmor Class 12\nHit Points 1 (1d4 - 1)\nSpeed 5 ft., fly 30 ft.\nSTR 2 (-4) DEX 15 (+2) CON 8 (-1) INT 2 (-4) WIS 12 (+1) CHA 4 (-3)\nSenses blindsight 60 ft., passive Perception 11\nLanguages -\nChallenge 0\nEcholocation. The bat cannot use its blindsight while deafened.\nKeen Hearing. The bat has advantage on Wisdom (Perception) checks that rely on hearing.\nActions\nBite. Melee Weapon Attack: +0 to hit, reach 5 ft., one target. Hit: 1 piercing damage.","requirements":"Rotting Curse"},
  {"id":"skeleton","name":"Skeleton","description":"Decrease your Constitution score by 1. You gain immunity to poison damage, the poisoned condition, and disease; vulnerability to necrotic and radiant damage; and the Undead creature type. When you take necrotic damage, regain hit points equal to half that damage. You cannot be healed by spells or drink potions, and do not need to eat or sleep. During a long rest, you can remain motionless but conscious. When damage reduces you to 0 hit points, make a Constitution saving throw (DC 5 + damage taken), unless the damage is radiant or from a critical success. On a success, you drop to 1 hit point; on a failure, gain 2 exhaustion levels.","requirements":"Rotting Curse"},
  {"id":"mana-curse","name":"Mana Curse","description":"Decrease your Constitution, Wisdom, or Charisma score by 1. You gain blindsight out to 10 feet while conscious; within that range, you perceive each creature's shape but not specific details or color, and attackers cannot gain advantage on melee attacks against you because of flanking or being hidden. This sense functions while blinded. You can take a perk that requires Mana Curse only when you gain a level.","requirements":"No other curse perks, DM's permission, Spellcasting or Pact Magic feature"},
  {"id":"oozekin","name":"Oozekin","description":"You gain immunity to acid damage, vulnerability to fire damage, and the Ooze creature type. You can move through a space as narrow as 1 inch without squeezing. Creatures grappled by you take 1d6 acid damage at the start of their turns. When you cast a fire-damage spell, convert its damage to acid or take fire damage equal to its spell point cost. Your unarmed strikes can deal 1d6 + your Constitution modifier acid damage. On a critical success with acid damage, the target takes a -1 AC penalty for 1 hour, or -2 if wearing armor until it is repaired. You can digest 2-inch-thick non-Relic metal in 6 seconds.","requirements":"Mana Curse"},
  {"id":"beholderkin","name":"Beholderkin","description":"You gain the Aberration creature type and can hover instead of falling, descending 10 feet every 6 seconds or at the end of your turn; you cannot do so while overencumbered. You learn Counterspell and can cast it once without spell points per long rest, or using spell points. Intelligence, Wisdom, or Charisma is your spellcasting ability for Counterspell (choose when you select this perk). Your eyes are a spellcasting focus and remove the need for a free hand to cast spells. At the start of your turn, you can gain one additional action usable only to cast a spell; a leveled spell cast with it does not count against your action spell limit. Once used, you cannot use this ability again until a short or long rest.","requirements":"Mana Curse"},
  {"id":"rootkin","name":"Rootkin","description":"You gain the Plant creature type, resistance to bludgeoning and piercing damage, vulnerability to fire damage, and deal double damage to objects and structures. You roll twice when attempting to pass as a plant. You can animate two plants or trees you can see within 60 feet. They copy your statistics but cannot speak. Plants are Tiny, have 1 hit point, cannot move, and can cast only your cantrips. Trees are Medium, have one-quarter of your hit points, and copy your unarmed strikes or gain a 1d6 bludgeoning slam. Once used, you cannot use this ability again until a long rest.","requirements":"Mana Curse"},
  {"id":"fairy","name":"Fairy","description":"You gain the Fey creature type, decrease your Strength score by 1, and gain Minify, ignoring its requirements. You can hover instead of falling, descending 10 feet every 6 seconds or at the end of your turn; you cannot do so while overencumbered. You learn Fly and can cast it once without spell points per long rest, or using spell points.","requirements":"Mana Curse"},
  {"id":"magnify","name":"Magnify","description":"Decrease your Dexterity score by 2 and increase your Constitution score by 1, to a maximum of 20. Your speed increases by 5 feet and your size becomes Large. See the size rules for equipment and carrying capacity. A feature that treats you as one size larger cannot increase your carrying capacity beyond Large.","requirements":"Be one of the following races: Changeling, Goliath, Minotaur, Dragonborn, Orc, Tortle, Warforged, Centaur, does not have Minify"},
  {"id":"minify","name":"Minify","description":"Increase your Dexterity score by 2, to a maximum of 20, and decrease your Strength score by 1. Your race's speed decreases by 5 feet, unless that speed is 25 feet, and your size becomes Tiny. See the size rules for equipment and carrying capacity.","requirements":"Be one of the following races: Changeling, Gnome, Grung, Lizardfolk, Warforged, Harengon, Locathah, does not have Magnify"},
  {"id":"vehicular-shield-slaughter","name":"Vehicular Shield-Slaughter","description":"When you use Momentum, you can attack with your shield instead. Use your proficiency bonus and Strength modifier for the attack roll. On a hit, it deals 1d6 + your Strength modifier bludgeoning damage for each 10 feet you moved before the attack.","requirements":"Momentum, Ramming"},
  {"id":"meteor","name":"Meteor","description":"You can make Vehicular Shield-Slaughter deal fire damage instead of bludgeoning damage. You can take a -5 penalty to its attack roll; on a hit, add your AC to the damage.","requirements":"Vehicular Shield-Slaughter"},
  {"id":"high-noon","name":"High Noon","description":"When combat begins, enemy creatures provoke opportunity attacks from you as though you used Quick Finger. You have advantage on those attacks.","requirements":"Quick Finger, Inhuman Senses"},
  {"id":"lights-camera-action","name":"Lights, Camera, Action!","description":"Choose a willing NPC. As a reaction when an enemy creature ends its turn, the NPC can take an additional turn. You can use this feature a number of times equal to your proficiency bonus per long rest. If opposing parties contain more creatures than your party, or if you expend an additional use, you can target a PC instead.","requirements":"Writer's Wit, Actor's Charisma"},
  {"id":"star-struck","name":"Star Struck","description":"Once per turn, one attack you make with a flail gains reach and deals force damage instead of its normal damage. On a critical success with that attack, add 1d4 force damage.","requirements":"Flail Bypass, Awareness of Magic"},
  {"id":"weakpoint-mark","name":"Weakpoint Mark","description":"Once per turn when your thrown weapon attack hits a creature, you have advantage on your next off-hand thrown weapon attack against that creature.","requirements":"Vital Strikes, Thrown Arms Power"},
  {"id":"paper-cuts","name":"Paper Cuts","description":"You can give your cards the explosive property (5 feet). When you do, increase the card's damage die by two sides, to a maximum of d12, and reduce the cost of your Playing Card Set by $1. If its cost becomes $0, it is destroyed.","requirements":"Explosive Thrower, Cartomancer's Cunning"}
];
