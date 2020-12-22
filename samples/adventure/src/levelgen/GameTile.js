import Tile from "../../../../src/game/Tile.js";
import Helper from "../../../../src/utils/Helper.js";
import { error } from "../../../../src/utils/Log.js";
import RNG from "../../../../src/utils/RNG.js";
import EffectPool from "../animations/effects/EffectPool.js";

import GameTileTypes from "./GameTileTypes.js";

import ItemPool from "../items/ItemPool.js";
import ItemTypes from "../items/ItemTypes.js";

/**
 * GameTile class.
 * Contains gameplay logic related to a single Tile.
 * Is defined via its GameTileType.
 */
class GameTile extends Tile {
	constructor({tilemap, x, y}) {
		super({tilemap, x, y});

		// Movable actors, e.g. Player, Enemies, Pick-ups, Items, ...
		this._actors = [];

		this._items = [];

		this.setType(GameTileTypes.VOID);
	}

	addActor(a) {
		this._actors.push(a);
		return a;
	}

	removeActor(a) {
		let i = this._actors.indexOf(a);
		if (i >= 0) {
			this._actors.splice(i, 1);
		}
		return a;
	}

	getActors() {
		return this._actors;
	}

	/**
	 * Drops the given ItemEntity instance on the tile
	 * @param {BaseItem} item the item entity instance to drop
	 */
	dropItem(item) {
		// track item on the tile
		if (item && item.gameTile == null) {
			this._items.push(item);
			item._setTile(this);
		}
	}

	/**
	 *
	 * @param {BaseItem} item the item to remove from the tile
	 */
	removeItem(item) {
		// remove item from the list
		let i = this._items.indexOf(item);
		if (i >= 0) {
			this._items.splice(i, 1);
			item.gameTile = null;
		}
		return item;
	}

	/**
	 * Returns all BaseItem instances on this tile.
	 */
	getItems() {
		return this._items;
	}

	/**
	 * Pick's up all item instances and releases them safely into the Pool.
	 * Returns an array of ItemTypes corresponding to all items that were picked up.
	 * @returns {ItemType[]} the list of all item types (incl. multiples) which were picked up from this tile.
	 */
	pickupItems() {
		let types = [];

		// we need a copy here, because releasing an item to the ItemPool also removes the Item from the tile
		// which will modify the items list inplace (splice(...)).
		let _itemsCopy = this._items.slice();
		_itemsCopy.forEach((item) => {
			types.push(item.type);
			ItemPool.release(item);
		});

		return types;
	}

	/**
	 * Check if the Tile is free to walk on.
	 * Depends on the type of actors, which are currently on the tile.
	 *
	 * Since a roguelike does not use a hitbox based tilemap collision,
	 * we don't use the isBlocking flag of the Tile class, but the game specific tile type.
	 */
	isFree() {
		// first check, is the tile walkable -> if not, that obviously means the tile is not free
		let isFree = this.type.walkable;
		if (isFree) {
			// now check the actor stack
			// there might be some actors, like pickups, health potions etc which are not blocking another Actor from moving here
			for (let a of this._actors) {
					isFree = isFree && !a.isBlocking;
			}
		}
		return isFree;
	}

	/**
	 * Changes the type of this GameTile instance.
	 * Updates the visuals and the gameplay properties like "walkable" etc.
	 * @param {GameTileTypes} type the new type to set for this tile instance
	 */
	setType(type) {
		// sanity check
		if (!type || !type.name || !GameTileTypes[type.name]) {
			error(`Unknown tile type '${type}'. Using FLOOR instead.`, "GameTile.setType");
			type = GameTileTypes.FLOOR;
		}

		this.type = type;

		// set visuals (not used right now)
		// this.color = this.type.color;

		// set id
		let newId = this.type.id;
		if (Array.isArray(this.type.id)) {
			let defaultId = this.type.id[0];
			// change ID based ob the given probability
			let prob = this.type.probability || 1;
			if (RNG.random() < prob) {
				newId = Helper.choose(this.type.id.slice(1));
			} else {
				newId = defaultId;
			}
		}
		this.set(newId);
	}

	destroy() {
		// get the destroy effect and add it to the screen
		if (this.type.destroyEffect) {
			let destroyEffectInstance = EffectPool.get(this.type.destroyEffect, this);
			this.tilemap.getScreen().add(destroyEffectInstance);
		}

		// check if the tile drops something on destroy, e.g. cutting down a bush
		if (this.type.drops) {
			this.dropStandardLoot();
		}

		// change to the new type on destroy
		if (this.type.replaceWith) {
			this.setType(GameTileTypes[this.type.replaceWith]);
		}
	}

	/**
	 * Drops a random standard Item on the tile.
	 */
	dropStandardLoot() {
		let item;

		// Drop some random loot
		let dropProb = 0.05; //RNG.random();
		if (dropProb <= 0.02) {
			// drop ammo
			//item = ItemPool.get(ItemTypes.AMMO, this);
		} else if (dropProb <= 0.05) {
			// drop health
			item = ItemPool.get(ItemTypes.HEART_SMALL);
		} else if (dropProb <= 0.1) {
			// drop money
			//item = ItemPool.get(ItemTypes.MONEY, this);
		}

		if (item) {
			// place item on tile
			this.dropItem(item);

			// add to screen for rendering
			this.tilemap.getScreen().add(item);
		}
	}
}

export default GameTile;