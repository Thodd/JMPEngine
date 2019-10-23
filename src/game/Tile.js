class Tile {
	/**
	 *
	 * @param {Tilemap} tilemap the Tilemap instance this Tile instance belongs to
	 * @param {number} x the x coordinate of this Tile instance inside its Tilemap
	 * @param {number} y the x coordinate of this Tile instance inside its Tilemap
	 */
	constructor(tilemap, x, y) {
		this.tilemap = tilemap;
		this.x = x;
		this.y = y;
		this.id = -1;

		// by default the tile is not colored
		this.color = undefined;
	}

	/**
	 * Sets the tile ID for this instance.
	 * @param {number} id the tile ID which should be set. If none given the tile is cleared (tileID = -1)
	 * @param {string} color the color in which this Tile instance will be tinted. Hex-String value, e.g. "#FF0085".
	 * If no color string is given, the previous colorization is reset to the default of the spritesheet.
	 */
	set(id=-1, color=undefined) {
		this.id = id;
		this.color = color;

		this.tilemap._rerenderTile(this);
	}
}

export default Tile;