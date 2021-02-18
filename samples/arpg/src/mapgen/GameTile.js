import Tile from "../../../../src/game/Tile.js";
import TileTypes from "./TileTypes.js";

import SmallEffect from "../actors/effects/SmallEffect.js";
import DropSystem from "../actors/drops/DropSystem.js";
import DropTypes from "../actors/drops/DropTypes.js";
import RNG from "../../../../src/utils/RNG.js";
class GameTile extends Tile {
	/**
	 * Changes the tile's rendering ID.
	 * Additional tile properties are retrieved via the Tileset class.
	 *
	 * @param {int} id The tile id to set.
	 * @param {*} isAnimationUpdate Only used internally to mark a tile update based on an animation.
	 *                              Only use the tile's type to check for a specific tile.
	 */
	set(id, isAnimationUpdate) {
		super.set(id, isAnimationUpdate);

		// we only have to update something if the tile-ID is changed explicitly and not via an animation!
		if (!isAnimationUpdate) {
			// let's delete the original animation information so we don't accidentally modify the original object
			delete this.animation;

			// if there is no animation defined in the Tileset for this tile,
			// the setAnimation() call will just reset the animation info for this tile instance
			let tileProps = TileTypes.getProperties(id);
			this.setAnimation(tileProps.animation || null);
		}
	}

	/**
	 * Changes the properties of the tile.
	 * @param {int|object} the id or TileType object to which this tile should be changed
	 */
	change(id) {
		// get the id from the TileType object
		if (typeof id === "object") {
			id = id.id;
			this._props = id;
		} else {
			this._props = TileTypes.getProperties(id);
		}

		// change rendering
		this.set(id);

		// collision detection
		// engine internal stuff, has to be set on the instance for automatic collision detection
		// the engine does not know about any additional tile properties
		this.isBlocking = this._props.isBlocking;
		this._hitbox = this._props.hitbox || null;
	}

	/**
	 * Returns the current tile properties.
	 */
	getProperties() {
		return this._props || TileTypes.getProperties(this.id);
	}

	/**
	 * Destroys the tile (if possible).
	 * Destroyed tiles are replaced with a corresponding counterpart and
	 * may show an additional effect.
	 *
	 * e.g. Grass or Bushes
	 */
	destroy() {
		// we only look at destroyable tiles
		let tileProps = this.getProperties();
		if (tileProps && tileProps.destroyable) {
			let destroyedTileProps = TileTypes[tileProps.destroyed_replacement];

			// change to destroyed tile
			this.change(destroyedTileProps);

			// drop default loot
			let screen = this.getScreen();
			if (screen) {

				// ~33% drop chance for random standard loot
				let dropSystem = screen.getDropSystem();
				if (RNG.random() < 0.33) {
					// TODO: Add Money and Ammo to the loot pool
					dropSystem.dropAtTile(DropTypes.HEART, this);
				}

				// TODO: Make this based on the Tile Type (not always Leaves :)
				// create grass cutting effect and position it on the screen
				let grassCuttingEffect = SmallEffect.get();
				grassCuttingEffect.x = this.screenX;
				grassCuttingEffect.y = this.screenY;
				grassCuttingEffect.show();
				screen.add(grassCuttingEffect);
			}
		}
	}
}

export default GameTile;