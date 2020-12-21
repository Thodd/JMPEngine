import Entity from "../../../../src/game/Entity.js";
import { fail } from "../../../../src/utils/Log.js";
import Constants from "../Constants.js";
import ItemPool from "./ItemPool.js";

class BaseItem extends Entity {
	constructor() {
		super();

		this.layer = Constants.Layers.BELOW_ACTORS;
		this.active = false;

		this.type = null;

		this.gameTile = null;
	}

	/**
	 * Sets the tile reference and places the item on a tile (visually).
	 * @param {GameTile} gameTile the tile on which the item is placed
	 */
	_setTile(gameTile) {
		this.gameTile = gameTile;
		this.x = gameTile.x * Constants.TILE_WIDTH;
		this.y = gameTile.y * Constants.TILE_HEIGHT;
	}

	getTile() {
		return this.gameTile;
	}

	/**
	 * Moves the item instance to the given GameTile instance.
	 * @param {GameTile} tile goal tile to which the item should be moved
	 */
	moveToTile(tile) {
		if (tile) {
			// remove from old tile (if dropped already)
			if (this.gameTile) {
				this.gameTile.removeItem(this);
			}
			// connect to the tile instance
			tile.dropItem(this);
		} else {
			fail("Item cannot be moved to unknown tile!", "BaseItem");
		}
	}

	/**
	 * Removes the Item from its current tile.
	 */
	removeFromTile() {
		if (this.gameTile) {
			this.gameTile.removeItem(this);
		}
	}

	/**
	 * Picks up the item from the tile and returns it to the ItemPool.
	 */
	pickup() {
		// first remove the item from the tile
		this.removeFromTile();
		// then release if (automatically removes it from the screen if added)
		ItemPool.release(this);
	}

	reset(type) {
		this.type = type;

		// update Sprite based on type
		// simple blink animation so the player notices the item
		let sprId = this.type.sprite || 0;
		this.configSprite({
			sheet: "items",
			animations: {
				default: "blink",
				blink: {
					frames: [{id: sprId, color: 0xFFFF00, dt: 10}, {id: sprId, color: 0xFFFFFF, dt: 120}],
				}
			}
		});
	}
}

export default BaseItem;