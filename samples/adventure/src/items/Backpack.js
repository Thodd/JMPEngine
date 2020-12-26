import { warn } from "../../../../src/utils/Log.js";

/**
 * A Bag containing items.
 * Keeps track of the inventory content of an actor
 */
class Backpack {
	constructor() {
		// we store items by their category for easier sorting and rendering
		this._itemsByCategory = {};

		// equipment is split into different "slots"
		this._equiped = {
			"melee": null,
			"ranged": null,
			"quick": null
		};
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
	 * Returns the item quipped in the given slot.
	 * @param {string} slot slot name
	 */
	getItemFromSlot(slot) {
		return this._equiped[slot];
	}

	/**
	 * Adds 1 item of the given type from the Backpack.
	 * @param {ItemType} type the type of item that should be added to the Backpack
	 */
	addItem(type) {
		let cat = this.getItemsForCategory(type.category);

		// count the number of items of the given type
		cat[type.id] = cat[type.id] || {
			type: type,
			amount: 0
		};
		cat[type.id].amount++;

		return type;
	}

	/**
	 * Removes 1 item of the given type from the Backpack.
	 * @param {ItemType} type the type of item that should be removed from the Backpack
	 */
	removeItem(type) {
		let cat = this.getItemsForCategory(type.category);

		if (cat[type.id]) {
			cat[type.id].amount--;
		} else {
			// TODO: this log happens for initial weapons...
			// warn(`No item of type '${type.id}' found in backpack`, "Backpack");
		}

		return type;
	}

	equipItem(type, slot) {
		if (type.isEquippable) {
			// check if current item needs to be unequipped
			let currentItem = this._equiped[slot];
			if (currentItem) {
				this.unequip(slot);
			}

			// and now equip the new item
			this._equiped[slot] = type;
		} else {
			warn(`${type.id} cannot be equipped.`, "Backpack");
		}
	}

	/**
	 * Unequips the item in the given slot.
	 * Unequipping works a bit different than equipping.
	 * You don't need an item but just need to know the slot you are unequipping.
	 * Item will be placed in the Backpack.
	 * @param {string} slot The slot to unequip
	 */
	unequip(slot) {
		// For now we can only unequip weapons
		// TODO: QuickSlot Items
		let currentItem = this._equiped[slot];

		if (currentItem) {
			this.addItem(currentItem);
		}

		this._equiped[slot] = null;
	}
}

export default Backpack;