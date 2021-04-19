import { warn } from "../../../../src/utils/Log.js";

import EventBus from "../../../../src/utils/EventBus.js";
import Constants from "../Constants.js";

/**
 * A Bag containing items.
 * Keeps track of the inventory content of an actor
 */
class Backpack {
	constructor(fireEvents) {
		// if none are given, the changes are not listened to
		this._fireEvents = fireEvents;

		// we store items by their category for easier sorting and rendering
		this._itemsByCategory = {};

		// equipment is split into different "slots"
		this._equipped = {};
	}

	/**
	 * If requested fires an event everytime the Backpack content is changed somehow.
	 *
	 * @param {string} changeType either "add", "remove", "equip" or "unequip"
	 * @param {ItemType} type the item type which is affected
	 * @param {string} newSlot the slot name which was changed (only for "equip" and "unequip")
	 */
	_fireChange(changeType, type, newSlot) {
		if (this._fireEvents) {
			EventBus.publish(Constants.Events.LOGIC_UPDATE_BACKPACK, {
				changeType: changeType,
				changedItem: type,
				newSlot: newSlot,
				backpack: this
			});
		}
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
	 * Returns the list of ALL items in the backpack, NOT grouped by their category.
	 * @returns {object[]} an array containing the item info objects; might be an empty array
	 */
	getAllItemsFlat() {
		let allItemsFlat = [];

		for (let catName in this._itemsByCategory) {
			let category = this._itemsByCategory[catName];
			for (let itemID in category) {
				allItemsFlat.push(category[itemID]);
			}
		}

		// sort items alphabetically
		return allItemsFlat.sort(function(a, b) {
			let name_a = a.type.text.name;
			let name_b = b.type.text.name;
			return name_a.localeCompare(name_b);
		});
	}

	/**
	 * Returns the item quipped in the given slot.
	 * @param {string} slot slot name
	 */
	getItemFromSlot(slot) {
		return this._equipped[slot];
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

		// notify listeners for item change
		this._fireChange("add", type);

		return type;
	}

	/**
	 * Removes 1 item of the given type from the Backpack.
	 * If the item is not in the backpack, but is equipped, the equipped item will be removed.
	 * @param {ItemType} type the type of item that should be removed from the Backpack
	 */
	removeItem(type, fallbackSlot) {
		let cat = this.getItemsForCategory(type.category);

		if (cat[type.id]) {
			cat[type.id].amount--;

			if (cat[type.id].amount <= 0) {
				delete cat[type.id];
			}

			// notify listeners for item change
			this._fireChange("remove", type);
		} else {
			// item is not in the backpack, check the given equipment slots as a fallback
			if (fallbackSlot && this.getItemFromSlot(fallbackSlot)) {
				// unequip item (necessary to trigger an "equipment change event")
				this.unequip(fallbackSlot);
				// and then remove it again
				this.removeItem(type);
			}
		}

		return type;
	}

	/**
	 * Checks if the given ItemType is equipped in any slot.
	 * @param {ItemType} type type to check if it is equipped
	 * @returns {string} the slot name in which the item is equipped; or <code>false</code> if not equipped
	 */
	isEquipped(type) {
		for (let slot in this._equipped) {
			if (this._equipped[slot] == type) {
				return slot;
			}
		}
		return false;
	}

	/**
	 * Equips the given item.
	 *
	 * @param {ItemType} type the item to equip
	 * @param {string} slot the slot name into which the item should be equipped
	 */
	equipItem(type, slot) {
		if (type.isEquippableAs(slot)) {
			// check if current item needs to be unequipped
			let currentItem = this._equipped[slot];
			if (currentItem) {
				this.unequip(slot);
			}

			// remove 1 item from the backpack to equip it
			this.removeItem(type);

			// and now equip the new item
			this._equipped[slot] = type;

			// notify listeners for equipment change
			this._fireChange("equip", type, slot);

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
		let currentItem = this._equipped[slot];

		if (currentItem) {
			this.addItem(currentItem);
		}

		this._equipped[slot] = null;

		// notify listeners for equipment change
		this._fireChange("unequip", currentItem, slot);
	}
}

export default Backpack;