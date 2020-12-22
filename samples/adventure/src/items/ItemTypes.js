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
		this.sprite = spec.sprite || 0;
		this.text = {
			name: (spec.text && spec.text.name) || "Unknown Item",
			flavor: (spec.text && spec.text.flavor) || "Not sure what this is..."
		}
		this.values = spec.values || {};

		// just a fail safe for messing up during coding... :)
		if (this.id === "UNKOWN") {
			fail(`Broken Item created ${spec.id || this.id}!`, "ItemPool");
		}

		_types[spec.id] = this;
	}

	get(s) {
		return this.values[s];
	}
}

ItemType.create = function(spec) {
	return new ItemType(spec);
}

/**
 * All Item categories
 */
const categories = {
	GENERAL: "general",
	WEAPON: "weapon",
	CONSUMABLE: "consumable",
	INSTANT_USE: "instant_use",
	QUEST: "quest",
	TREASURE: "treasure",
	MAP: "map"
}

/**
 * Actual ItemType definitions
 */
ItemType.create({
	id: "HEART_SMALL",
	category: categories.INSTANT_USE,
	sprite: 0,
	text: {
		name: "a small heart",
		flavor: "Restores 1 HP"
	},
	values: {
		restore: 1
	}
});

ItemType.create({
	id: "HEART_BIG",
	category: categories.INSTANT_USE,
	sprite: 1,
	text: {
		name: "a big heart",
		flavor: "Restores 2 HP"
	},
	values: {
		restore: 2
	}
});

export default _types;

exposeOnWindow("ItemTypes", _types);