import { fail } from "../../../../../src/utils/Log.js";

/**
 * ItemType class
 */
class ItemType {
	constructor(spec) {
		// define some defaults
		this.id = spec.id || "UNKNOWN";
		this.category = spec.category || "GENERAL";

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
			fail(`Broken Item created ${spec.id || this.id}!`, "ItemType");
		}
	}

	toString() {
		return `${this.text.name}`;
	}

	/**
	 * Checks if the ItemType fits into one or more categories.
	 *
	 * @param {ItemCategories[]|ItemCategories} cats the categories/category which should be checked
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

export default ItemType;