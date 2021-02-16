import { fail } from "../../../../../src/utils/Log.js";
import DropTypes from "./DropTypes.js";
import DropItem from "./DropItem.js";

/**
 * A DropSystem is part of each map/level screen.
 * The DropItem entities are tracked per Screen.
 */
class DropSystem {
	constructor(screen) {
		this._screen = screen;

		this._itemPool = {};
	}

	_get(type) {
		if (!DropTypes[type]) {
			fail(`Unknown drop type '${type}'!`, "DropSystem");
		}

		// try to get item entity from pool
		this._itemPool[type] = this._itemPool[type] || [];
		let item = this._itemPool[type].pop();

		// create new drop item if the pool is empty
		if(!item) {
			item = new DropItem(this._release.bind(this));
			this._screen.add(item);
		}

		item.setType(type);

		return item;
	}

	_release(item) {
		item.deactivate();
		this._itemPool[item._type].push(item);
	}

	/**
	 * Drops an item of the given type at the given GameTile.
	 *
	 * @param {DropType} type the type of item to drop
	 * @param {GameTile} tile the game tile on which the item will be dropped
	 */
	dropAtTile(type, tile) {
		let item = this._get(type);

		item.x = tile.screenX;
		item.y = tile.screenY;

		item.activate();
	}

	/**
	 * Drops an item of the given type at the give coordinates.
	 *
	 * @param {DropType} type the type of item to drop
	 * @param {int} x x position
	 * @param {int} y y position
	 */
	dropAt(type, x, y) {
		let item = this._get(type);
		item.x = x;
		item.y = y;
		item.activate();
	}
}

export default DropSystem;