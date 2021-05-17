import ItemType from "../../engine/inventory/ItemType.js"

import ItemCategories from "./ItemCategories.js";
import EquipmentSlots from "./EquipmentSlots.js";
import { char2id } from "../../engine/utils/RLTools.js";
import Colors from "../../engine/Colors.js";

// TODO: is a projectile type necessary? why not just render "*" for each projectile?
//       But it looks nicer if we render "/" or "←" though...
const ProjectileTypes = {}

/**
 * A map of all existing weapons.
 * Melee and ranged.
 */
const Weapons = {};

/**
 * Shorthand factory for creating a new Weapon ItemType.
 *
 * @param {object} spec weapon definition
 * @returns {ItemType} the new ItemType instance for the weapon
 */
const _create = function(spec) {
	spec.category = ItemCategories.WEAPON;
	let t = new ItemType(spec);
	Weapons[spec.id] = t;
}



// ----------------------------- Weapon definitons begin here -----------------------------

_create({
	id: "FANGS",
	equippableAs: [EquipmentSlots.MELEE],
	visuals: {
		id: char2id(`"`),
		color: Colors[7]
	},
	text: {
		name: "Fangs",
		innerName: "a pair of fangs",
		flavor: "Don't bite off more than you can chew!"
	},
	values: {
		dmg: 1,
		acc: 0.9
	}
});
_create({
	id: "CLAWS",
	equippableAs: [EquipmentSlots.MELEE],
	visuals: {
		id: char2id(`"`),
		color: Colors[7]
	},
	text: {
		name: "Claws",
		innerName: "a set of claws",
		flavor: "Don't get caught by those!"
	},
	values: {
		dmg: 2.5,
		acc: 0.7
	}
});

/**
 * WEAPONS: melee
 */
_create({
	id: "KNIFE_POCKET",
	equippableAs: [EquipmentSlots.MELEE],
	visuals: {
		id: char2id("`"),
		color: Colors[0]
	},
	text: {
		name: "Pocket Knife",
		innerName: "a small pocket knife",
		flavor: "Not really a weapon... but you still feel stabby."
	},
	values: {
		dmg: 0.5,
		acc: 1,
	}
});
_create({
	id: "SHOVEL",
	equippableAs: [EquipmentSlots.MELEE],
	visuals: {
		id: char2id("♂"),
		color: Colors[0]
	},
	text: {
		name: "Shovel",
		innerName: "a shovel",
		flavor: "Every treasure hunter needs a shovel."
	},
	values: {
		dmg: 0.5,
		acc: 1,
	}
});
_create({
	id: "KNIFE_KITCHEN",
	equippableAs: [EquipmentSlots.MELEE],
	visuals: {
		id: char2id("`"),
		color: Colors[0]
	},
	text: {
		name: "Kitchen Knife",
		innerName: "a kitchen knife",
		flavor: "Simple but effective. A true classic."
	},
	values: {
		dmg: 1,
		acc: 1,
	}
});
_create({
	id: "WRENCH",
	equippableAs: [EquipmentSlots.MELEE],
	visuals: {
		id: char2id("♀"),
		color: Colors[0]
	},
	text: {
		name: "Wrench",
		innerName: "a wrench",
		flavor: "More a tool than a weapon. But then again, so is a chainsaw."
	},
	values: {
		dmg: 1,
		acc: 1,
	}
});
_create({
	id: "HAMMER",
	equippableAs: [EquipmentSlots.MELEE],
	visuals: {
		id: char2id("╤"),
		color: Colors[13]
	},
	text: {
		name: "Hammer",
		innerName: "a hammer",
		flavor: "Not exactly Mjölnir, but better than nothing."
	},
	values: {
		dmg: 1,
		acc: 0.9,
	}
});
_create({
	id: "HATCHET",
	equippableAs: [EquipmentSlots.MELEE],
	visuals: {
		id: char2id("╒"),
		color: Colors[0]
	},
	text: {
		name: "Hatchet",
		innerName: "a hatchet",
		flavor: "Not yet an axe but still pretty sharp."
	},
	values: {
		dmg: 1.25,
		acc: 0.95,
	}
});
_create({
	id: "SPEAR",
	equippableAs: [EquipmentSlots.MELEE],
	visuals: {
		id: char2id("/"),
		color: Colors[13]
	},
	text: {
		name: "Spear",
		innerName: "a spear",
		flavor: "An antique hunting weapon. There is a faded engraving on the shaft."
	},
	values: {
		dmg: 1.25,
		acc: 0.95,
	}
});
_create({
	id: "METAL_ROD",
	equippableAs: [EquipmentSlots.MELEE],
	visuals: {
		id: char2id("/"),
		color: Colors[0]
	},
	text: {
		name: "Metal Rod",
		innerName: "a metal rod",
		flavor: "Ah yes, the good old slum scepter."
	},
	values: {
		dmg: 1.5,
		acc: 0.9,
	}
});
_create({
	id: "MACHETE",
	equippableAs: [EquipmentSlots.MELEE],
	visuals: {
		id: char2id("/"),
		color: Colors[0]
	},
	text: {
		name: "Machete",
		innerName: "a machete",
		flavor: "A deadly and brutish tool. Can also be used for chopping sugar cane."
	},
	values: {
		dmg: 2,
		acc: 0.85,
	}
});
_create({
	id: "AXE",
	equippableAs: [EquipmentSlots.MELEE],
	visuals: {
		id: char2id("⌠"),
		color: Colors[7]
	},
	text: {
		name: "Axe",
		innerName: "an axe",
		flavor: "History has proven that an axe is deadly. A fan favorite."
	},
	values: {
		dmg: 2.5,
		acc: 0.8,
	}
});

/**
 * WEAPONS: ranged
 */
_create({
	id: "THROWING_KNIFES",
	equippableAs: [EquipmentSlots.RANGED],
	visuals: {
		id: char2id("»"),
		color: Colors[5]
	},
	text: {
		name: "Throwing Knifes",
		innerName: "a set of throwing knifes",
		flavor: "A staple of carnival culture."
	},
	values: {
		ammoType: "THROWING_KNIFES",
		magazine: 0,
		projectileType: ProjectileTypes.THROWING_KNIFES,
		dmg: 0.5,
		acc: 0.95,
	}
});
_create({
	id: "PISTOL",
	equippableAs: [EquipmentSlots.RANGED],
	visuals: {
		id: char2id("⌐"),
		color: Colors[0]
	},
	text: {
		name: "Pistol",
		innerName: "a pistol",
		flavor: "The most common ranged weapon in these parts. Conveniently semi-automatic."
	},
	values: {
		ammoType: "BULLETS",
		magazine: 12,
		projectileType: ProjectileTypes.BULLET,
		dmg: 1,
		acc: 1,
	}
});
_create({
	id: "BOW",
	equippableAs: [EquipmentSlots.RANGED],
	visuals: {
		id: char2id(")"),
		color: Colors[3]
	},
	text: {
		name: "Bow",
		innerName: "a bow",
		flavor: "A classic sport shooting weapon. Though it looks easy, mastering a bow takes a lot of practice."
	},
	values: {
		ammoType: "ARROW",
		magazine: 12,
		projectileType: ProjectileTypes.ARROW,
		dmg: 1.5,
		acc: 0.7,
	}
});
_create({
	id: "REVOLVER",
	equippableAs: [EquipmentSlots.RANGED],
	visuals: {
		id: char2id("⌐"),
		color: Colors[0]
	},
	text: {
		name: "Revolver",
		innerName: "a revolver",
		flavor: "A gunslingers wife packs quite a punch. In both directions."
	},
	values: {
		ammoType: "REVOLVER_BULLETS",
		magazine: 6,
		projectileType: ProjectileTypes.BULLET,
		dmg: 2,
		acc: 0.8,
	}
});
_create({
	id: "SHOTGUN",
	equippableAs: [EquipmentSlots.RANGED],
	visuals: {
		id: char2id("¶"),
		color: Colors[7]
	},
	text: {
		name: "Shotgun",
		innerName: "a shotgun",
		flavor: "This is your boom stick."
	},
	values: {
		ammoType: "SHELLS",
		magazine: 2,
		projectileType: ProjectileTypes.BULLET,
		dmg: 2.5,
		acc: 0.7,
	}
});



export default Weapons;