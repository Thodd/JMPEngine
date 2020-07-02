import { fail } from "../utils/Log.js";

class Tile {
	/**
	 *
	 * @param {Tilemap} tilemap the Tilemap instance this Tile instance belongs to
	 * @param {number} x the x coordinate of this Tile instance inside its Tilemap
	 * @param {number} y the x coordinate of this Tile instance inside its Tilemap
	 */
	constructor({tilemap=null, x=0, y=0}={}) {
		if (tilemap == null) {
			fail("Tile cannot be created without a tilemap.", "Tile");
		}

		this.tilemap = tilemap;
		this.x = x;
		this.y = y;
		this.id = -1;

		/**
		 * Whether the tile takes part in a collision detection on the tilemap.
		 * Default is false.
		 */
		this.isBlocking = false;
	}

	/**
	 * Sets the tile ID for this instance.
	 * @param {number} id the tile ID which should be set. If none given the tile is cleared (tileID = -1)
	 */
	set(id=-1) {
		this.id = id;
	}
}

export default Tile;