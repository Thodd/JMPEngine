import { warn } from "../../../../src/utils/Log.js";

/**
 * A Bag containing items.
 * Keeps track of the inventory content of an actor
 */
class Backpack {
	constructor() {
		// we store items by their category for easier sorting and rendering
		this._itemsByCategory = {};
	}

	/**
	 * Returns the items stored in the backpack for the given category.
	 * @param {string} cat category name
	 */
	getItemsForCategory(cat) {
		this._itemsByCategory[cat] = this._itemsByCategory[cat] || {};
		return this._itemsByCategory[cat];
	}

	/**
	 * Returns all items sorted by their category.
	 */
	getAllItemsByCategory() {
		return this._itemsByCategory;
	}

	/**
	 * Adds 1 item of the given type from the Backpack.
	 * @param {ItemType} type the type of item that should be added to the Backpack
	 */
	addItem(type) {
		let cat = this.getItemsForCategory(type.category);

		// count the number of items of the given type
		cat[type.id] = cat[type.id] || 0;
		cat[type.id]++;

		return type;
	}

	/**
	 * Removes 1 item of the given type from the Backpack.
	 * @param {ItemType} type the type of item that should be removed from the Backpack
	 */
	removeItem(type) {
		let cat = this.getItemsForCategory(type.category);

		if (cat[type.id] > 0) {
			cat[type.id]--;
		} else {
			warn(`No item of type '${type.id}' found in backpack`, "Backpack");
		}

		return type;
	}
}

export default Backpack;