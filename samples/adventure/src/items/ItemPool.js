import { log } from "../../../../../src/utils/Log.js";
import { exposeOnWindow } from "../../../../../src/utils/Helper.js";

import BaseItem from "./BaseItem.js";
import { fail } from "../../../../src/utils/Log.js";

const _itemEntities = {};

/**
 * Allows to retreive an Item instance.
 * Items are purely visual representations of a certain Item type.
 */
const ItemPool = {
	get(type) {
		if (!type) {
			fail(`Cannot create Item without type '${type}'.`, "ItemPool");
		}

		// we store the items by their ID
		if (!_itemEntities[type.id]) {
			_itemEntities[type.id] = [];
		}

		let item = _itemEntities[type.id].pop();

		if (!item) {
			log(`new BaseItem instance created with type '${type.id}.`, "ItemPool");
			item = new BaseItem();
		}

		// reset the item's visuals
		item.reset(type);

		return item;
	},

	_pool() {
		return _itemEntities;
	},

	release(item) {
		// remove item from the screen (if added)
		let scr = item.getScreen();
		if (scr) {
			scr.remove(item);
		}

		// remove the item from the tile
		item.removeFromTile();

		// put it back into the pool under its type name
		_itemEntities[item.type.id].push(item);
	}
};

exposeOnWindow("ItemPool", ItemPool);

export default ItemPool;