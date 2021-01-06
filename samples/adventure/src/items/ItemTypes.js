import { fail } from "../../../../src/utils/Log.js";
import { exposeOnWindow } from "../../../../src/utils/Helper.js";

import Constants from "../Constants.js";

/**
 * Constants for all items.
 * Hard-coded values like attack power, sprite ID, ...
 */
const _types = {};

class ItemType {
	constructor(spec) {
		// define some defaults
		this.id = spec.id || "UNKNOWN";
		this.category = spec.category || "GENERAL";

		this.sprite = spec.sprite || 0;

		this.text = {
			name: (spec.text && spec.text.name) || this.id.toLowerCase(),
			innerName: (spec.text && spec.text.innerName) || "an unknown Item",
			flavor: (spec.text && spec.text.flavor) || "Not sure what this is..."
		}

		this.values = spec.values || {};

		// Equippable
		this.equippableAs = spec.equippableAs || [];

		// just a fail safe for messing up during coding... :)
		if (this.id === "UNKOWN") {
			fail(`Broken Item created ${spec.id || this.id}!`, "ItemPool");
		}

		_types[spec.id] = this;
	}

	toString() {
		return `<span style='color: #FF00FF'>${this.text.name}</span>`;
	}

	/**
	 * Checks if the ItemType fits into one or more categories.
	 *
	 * @param {ItemTypes.Categories[]|ItemTypes.Categories} cats the categories/category which should be checked
	 */
	hasCategory(cats) {
		// mutliple categorys given
		if (Array.isArray(cats)) {
			return cats.indexOf(this.category) >= 0;
		} else {
			// only one category given
			return this.category == cats;
		}
	}

	/**
	 * Checks the given ItemType if it fits into the given categories
	 * @param {ItemType} item the ItemType
	 * @param {string[]} categories an array of ItemType (sub)categories
	 */
	isEquippableAs(equipSlot) {
		return this.equippableAs.indexOf(equipSlot) >= 0;
	}
}

const _create = function(spec) {
	return new ItemType(spec);
}

/**
 * All Item categories
 */
const categories = {
	GENERAL: "general",
	WEAPON: "weapon",
	CONSUMABLE: "consumable",
	QUEST: "quest",
	TREASURE: "treasure",
	MAP: "map"
};

/**
 * Public Access to Categories.
 */
_types.Categories = categories;


/**
 * CONSUMABLES -> only used from within the backpack
 */
_create({
	id: "APPLE",
	category: categories.CONSUMABLE,
	equippableAs: [Constants.EquipmentSlots.QUICK_A, Constants.EquipmentSlots.QUICK_S],
	sprite: 25,
	text: {
		name: "Apple",
		innerName: "an apple",
		flavor: "A good old fashioned apple. Nothing much, only restores 0.5 HP."
	},
	values: {
		restore: 0.5
	}
});
_create({
	id: "BANANA",
	category: categories.CONSUMABLE,
	equippableAs: [Constants.EquipmentSlots.QUICK_A, Constants.EquipmentSlots.QUICK_S],
	sprite: 26,
	text: {
		name: "Banana",
		innerName: "a banana",
		flavor: "Rich in potassium... at least that's what they say. Restores 1 HP."
	},
	values: {
		restore: 1
	}
});
_create({
	id: "ORANGE",
	category: categories.CONSUMABLE,
	equippableAs: [Constants.EquipmentSlots.QUICK_A, Constants.EquipmentSlots.QUICK_S],
	sprite: 27,
	text: {
		name: "Orange",
		innerName: "an orange",
		flavor: "The king of citrus fruits. Restores 1.5 HP."
	},
	values: {
		restore: 1.5
	}
});
_create({
	id: "WATERMELON",
	category: categories.CONSUMABLE,
	equippableAs: [Constants.EquipmentSlots.QUICK_A, Constants.EquipmentSlots.QUICK_S],
	sprite: 28,
	text: {
		name: "Watermelon",
		innerName: "a slice of watermelon",
		flavor: "Mouthwatering watery... Restores 2 HP."
	},
	values: {
		restore: 2
	}
});
_create({
	id: "GRAPES",
	category: categories.CONSUMABLE,
	equippableAs: [Constants.EquipmentSlots.QUICK_A, Constants.EquipmentSlots.QUICK_S],
	sprite: 29,
	text: {
		name: "Grapes",
		innerName: "a couple of grapes",
		flavor: "I like them more in liquid form, but well they are certainly rich in sugar. Restores 2.5 HP."
	},
	values: {
		restore: 2.5
	}
});
_create({
	id: "CHERRIES",
	category: categories.CONSUMABLE,
	equippableAs: [Constants.EquipmentSlots.QUICK_A, Constants.EquipmentSlots.QUICK_S],
	sprite: 30,
	text: {
		name: "Cherries",
		innerName: "a couple of cherries",
		flavor: "Sweet and sour at the same time. Restores 3 HP."
	},
	values: {
		restore: 3
	}
});
_create({
	id: "MEAT",
	category: categories.CONSUMABLE,
	equippableAs: [Constants.EquipmentSlots.QUICK_A, Constants.EquipmentSlots.QUICK_S],
	sprite: 31,
	text: {
		name: "Meat",
		innerName: "a nice chunk of meat",
		flavor: "Now that's some real food. Restores 3.5 HP."
	},
	values: {
		restore: 3.5
	}
});

/**
 * WEAPONS
 */
_create({
	id: "FANGS",
	category: categories.WEAPON,
	equippableAs: [Constants.EquipmentSlots.MELEE],
	sprite: 81, // mystery sprite
	text: {
		name: "Fangs",
		innerName: "a pair of fangs",
		flavor: "Don't bite off more than you can chew!"
	},
	values: {
		dmg: 1,
		acc: 0.9
	}
})
_create({
	id: "CLAWS",
	category: categories.WEAPON,
	equippableAs: [Constants.EquipmentSlots.MELEE],
	sprite: 81, // mystery sprite
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
	category: categories.WEAPON,
	equippableAs: [Constants.EquipmentSlots.MELEE],
	sprite: 52,
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
	category: categories.WEAPON,
	equippableAs: [Constants.EquipmentSlots.MELEE],
	sprite: 34,
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
	category: categories.WEAPON,
	equippableAs: [Constants.EquipmentSlots.MELEE],
	sprite: 53,
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
	category: categories.WEAPON,
	equippableAs: [Constants.EquipmentSlots.MELEE],
	sprite: 35,
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
	category: categories.WEAPON,
	equippableAs: [Constants.EquipmentSlots.MELEE],
	sprite: 37,
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
	category: categories.WEAPON,
	equippableAs: [Constants.EquipmentSlots.MELEE],
	sprite: 55,
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
	id: "METAL_ROD",
	category: categories.WEAPON,
	equippableAs: [Constants.EquipmentSlots.MELEE],
	sprite: 51,
	text: {
		name: "Metal Rod",
		innerName: "a metal rod",
		flavor: "Ah yes, the good old slum scepter."
	},
	values: {
		dmg: 1.25,
		acc: 0.95,
	}
});
_create({
	id: "SPEAR",
	category: categories.WEAPON,
	equippableAs: [Constants.EquipmentSlots.MELEE],
	sprite: 47,
	text: {
		name: "Spear",
		innerName: "a spear",
		flavor: "A classic hunting weapon used by great warriors of."
	},
	values: {
		dmg: 1.5,
		acc: 0.9,
	}
});
_create({
	id: "MACHETE",
	category: categories.WEAPON,
	equippableAs: [Constants.EquipmentSlots.MELEE],
	sprite: 54,
	text: {
		name: "Machete",
		innerName: "a machete",
		flavor: "A trusty but brutish tool. Can also be used for chopping sugar cane."
	},
	values: {
		dmg: 2,
		acc: 0.85,
	}
});
_create({
	id: "AXE",
	category: categories.WEAPON,
	equippableAs: [Constants.EquipmentSlots.MELEE],
	sprite: 36,
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
	category: categories.WEAPON,
	equippableAs: [Constants.EquipmentSlots.RANGED],
	sprite: 58,
	text: {
		name: "Throwing Knifes",
		innerName: "a set of throwing knifes",
		flavor: "A staple of carnival culture."
	},
	values: {
		dmg: 0.5,
		acc: 0.95,
	}
});

export default _types;

exposeOnWindow("ItemTypes", _types);