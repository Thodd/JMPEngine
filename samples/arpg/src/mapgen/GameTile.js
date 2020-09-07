import Tile from "../../../../src/game/Tile.js";
import Tileset from "./Tileset.js";

class GameTile extends Tile {
	/**
	 * Changes the tile's type.
	 * @param {int} id The tile id to set.
	 * @param {*} isAnimationUpdate Only used internally to mark a tile update based on an animation.
	 *                              Only use the tile's type to check for a specific tile.
	 */
	set(id, isAnimationUpdate) {
		super.set(id, isAnimationUpdate);

		// we only have to update something if the tile-ID is changed explicitly and not via an animation!
		if (!isAnimationUpdate) {
			// we copy the values so we don't run into unwanted side-effects by accident
			let tileProps = Tileset.getProperties(id);
			Object.assign(this, tileProps);

			// let's delete the original animation information so we don't accidentally modify the original object
			delete this.animation;

			// if there is no animation defined in the Tileset for this tile,
			// the setAnimation() call will just reset the animation info for this tile instance
			this.setAnimation(tileProps.animation || null);
		}
	}
}

export default GameTile;