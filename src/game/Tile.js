class Tile {
	/**
	 *
	 * @param {Tilemap} tilemap the Tilemap instance this Tile instance belongs to
	 * @param {number} x the x coordinate of this Tile instance inside its Tilemap
	 * @param {number} y the x coordinate of this Tile instance inside its Tilemap
	 */
	constructor(tilemap, x, y) {
		this.tilemap
		this.x = x;
		this.y = y;
	}

	/**
	 * Sets the tile ID for this instance.
	 * @param {number} tileID the tile ID which should be set. If none given the tile is cleared (tileID = -1)
	 */
	set(tileID=-1) {
		this.tilemap.set(this.y, this.y, tileID);
	}
}

export default Tile;