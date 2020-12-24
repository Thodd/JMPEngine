import { fail } from "../../../../src/utils/Log.js";
import { exposeOnWindow } from "../../../../src/utils/Helper.js";
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
		this.subCategory = spec.subCategory; // can be empty for simple items
		this.sprite = spec.sprite || 0;
		this.text = {
			name: (spec.text && spec.text.name) || "an unknown Item",
			result: (spec.text && spec.text.result) || "Nothing happens.",
			flavor: (spec.text && spec.text.flavor) || "Not sure what this is..."
		}
		this.values = spec.values || {};

		// just a fail safe for messing up during coding... :)
		if (this.id === "UNKOWN") {
			fail(`Broken Item created ${spec.id || this.id}!`, "ItemPool");
		}

		_types[spec.id] = this;
	}

	/**
	 * Retrieves the given ItemType by name.
	 * @param {string} s the item type name
	 */
	get(s) {
		return this.values[s];
	}

	/**
	 * Checks the given ItemType if it fits into the given categories
	 * @param {ItemType} item the ItemType
	 * @param {string[]} categories an array of ItemType (sub)categories
	 */
	is(cat, subCat) {
		let fits = false;
		if (cat == this.category) {
			fits = true;
			// check if the sub-category matches
			if (subCat && subCat != this.subCategory) {
				fits = false;
			}
		}
		return fits;
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

const subCategories = {
	MELEE: "melee",
	RANGED: "ranged",
	MAGIC: "magic",
	INSTANT_USE: "instant_use"
};

/**
 * Public Access to Categories.
 */
_types.Categories = categories;
_types.SubCategories = subCategories;

/**
 * INSTANT_USE
 */
_create({
	id: "HEART_SMALL",
	category: categories.CONSUMABLE,
	subCategory: subCategories.INSTANT_USE,
	sprite: 0,
	text: {
		name: "a small heart",
		result: "1 HP restored",
		flavor: "Restores 1 HP."
	},
	values: {
		restore: 1
	}
});

_create({
	id: "HEART_BIG",
	category: categories.CONSUMABLE,
	subCategory: subCategories.INSTANT_USE,
	sprite: 1,
	text: {
		name: "a big heart",
		result: "2 HP restored",
		flavor: "Restores 2 HP."
	},
	values: {
		restore: 2
	}
});

/**
 * WEAPON
 */
_create({
	id: "KNIFE",
	category: categories.WEAPON,
	subCategory: subCategories.RANGED,
	sprite: 53,
	text: {
		name: "a knife",
		flavor: "Simple but effective. A true classic."
	},
	values: {
		dmg: 1,
		acc: 1,
	}
});

export default _types;

exposeOnWindow("ItemTypes", _types);