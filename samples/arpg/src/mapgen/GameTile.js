import Tile from "../../../../src/game/Tile.js";
import Tileset from "./Tileset.js";

class GameTile extends Tile {
	set(id) {
		super.set(id);

		// copy all tile properties from the Tileset definition
		let tileProps = Tileset.getProperties(id);
		if (tileProps) {
			for (let propName in tileProps) {
				this[propName] = tileProps[propName];
			}
		}
	}
}

export default GameTile;