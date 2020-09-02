import Tile from "../../../../src/game/Tile.js";
import Tileset from "./Tileset.js";

class GameTile extends Tile {
	set(id, isAnimationUpdate) {
		super.set(id, isAnimationUpdate);

		// we only have to update something if the tile-ID is changed explicitly and not via an animation!
		if (!isAnimationUpdate) {
			// we copy the values so we don't run into unwanted side-effects by accident
			let tileProps = Tileset.getProperties(id);

			// list of all supported props, must be enhanced if necessary
			this.isBlocking = tileProps.isBlocking || false;

			// if there is no animation defined in the Tileset for this tile,
			// the setAnimation() call will just reset the animation info for this tile instance
			this.setAnimation(tileProps.animation || null);
		}
	}
}

export default GameTile;