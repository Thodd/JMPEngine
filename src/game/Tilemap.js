import Entity from "./Entity.js";
import Grid from "../gfx/Grid.js";
import { fail } from "../utils/Log.js";
import Tile from "./Tile.js";
import GFX from "../gfx/GFX.js";

let TILEMAP_COUNT = 0;

class Tilemap extends Entity {
	constructor({w=20, h=20, sheet, tileClass=Tile}) {

		if (!sheet) {
			fail(`The spritesheet ${sheet} does not exist! A Tilemap cannot be created without a spritesheet`, "Tilemap");
		}

		super();

		// get a unique name for the tilemap (see Map module calls later)
		this._name = `tilemap_${TILEMAP_COUNT}`;
		TILEMAP_COUNT++;

		// dimensions
		this.w = w;
		this.h = h;

		// register map on low-level API
		Grid.create({
			id: this._name,
			sheet: sheet,
			w: this.w,
			h: this.h
		});

		// create tile instances
		this._field = [];
		for (let x = 0; x < this.w; x++) {
			this._field[x] = [];
			for (let y = 0; y < this.h; y++) {
				this._field[x][y] = new tileClass(this, x, y);
			}
		}
	}

	/**
	 * Gets the tile instance given at position (x,y).
	 * @param {number} x the x coordinate of the tile to get
	 * @param {number} y the y coordinate of the tile to get
	 */
	get(x, y) {
		return this._field[x][y];
	}

	/**
	 * Sets the tile at (x,y) to the given tileID.
	 * @param {number} x The y coordinate which should be set
	 * @param {number} y The y coordinate which should be set
	 * @param {number} [tileID] The tile ID which should be set to (x,y); If none is given, the tile is cleared (tileID = -1).
	 */
	set(x, y, tileID=-1) {
		Grid.set(this._name, x, y, tileID);
	}

	render() {
		GFX.grid(this._name, this.x, this.y, this.layer);
	}
}

export default Tilemap;