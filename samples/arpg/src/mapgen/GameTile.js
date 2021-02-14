import Tile from "../../../../src/game/Tile.js";
import Tileset from "./Tileset.js";

import SmallEffect from "../actors/effects/SmallEffect.js";
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
			let tileProps = Tileset.getProperties(id);
			this.setAnimation(tileProps.animation || null);
		}
	}

	/**
	 * Changes the properties of the tile.
	 * @param {object} props a map containing the properties of a tile
	 */
	setProperties(props) {
		if (typeof props === "number") {
			props = Tileset.getProperties(props);
		}

		this._props = props;

		// change rendering
		this.set(props.id);

		// collision detection
		// engine internal stuff, has to be set on the instance for automatic collision detection
		// the engine does not know about any additional tile properties
		this.isBlocking = props.isBlocking;
		this._hitbox = props.hitbox || null;
	}

	/**
	 * Returns the current tile properties.
	 */
	getProperties() {
		return this._props || Tileset.getProperties(this.id);
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
			if (tileProps.destroyed_type) {
				let destroyedTileProps = Tileset.getProperties(tileProps.destroyed_type);
				this.setProperties(destroyedTileProps);

				// create grass cutting effect and position it on the screen
				let grassCuttingEffect = SmallEffect.get();
				grassCuttingEffect.x = this.screenX;
				grassCuttingEffect.y = this.screenY;
				grassCuttingEffect.show();
				this.getTilemap().getScreen().add(grassCuttingEffect);
			}
		}
	}
}

export default GameTile;