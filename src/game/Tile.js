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
		/**
		 * Whether the tile takes part in a collision detection on the tilemap.
		 * Default is false.
		 */
		this.isBlocking = false;

		/**
		 * The tint-color of the tile.
		 * Value is a CSS string e.g. "#FF0085"
		 * By default the tile is not colored.
		 */
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

		// Version 1: renders everything to a big canvas on tile change
		// Version 2: renders every frame only the visible part of the map, based on the camera offset
		if (this.tilemap.version == 1) {
			this.tilemap._rerenderTile(this);
		}
	}
}

export default Tile;