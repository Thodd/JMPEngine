import Entity from "./Entity.js";
import Grid from "../gfx/Grid.js";
import { fail } from "../utils/Log.js";
import Tile from "./Tile.js";
import GFX from "../gfx/GFX.js";
import Spritesheets from "../gfx/Spritesheets.js";

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

		this._isTilemap = true;

		// dimensions
		this._w = w;
		this._h = h;
		this._tileWidth = Spritesheets.getSheet(sheet).w;
		this._tileHeight = Spritesheets.getSheet(sheet).h;

		// register map on low-level API
		Grid.create({
			id: this._name,
			sheet: sheet,
			w: this._w,
			h: this._h
		});

		// create tile instances
		this._field = [];
		for (let x = 0; x < this._w; x++) {
			this._field[x] = [];
			for (let y = 0; y < this._h; y++) {
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
		let col = this._field[x];
		if (col) {
			return col[y];
		}
		// no tile available at (x, y)
		return undefined;
	}

	/**
	 * Sets the tile at (x,y) to the given id.
	 * @param {number} x The y coordinate which should be set
	 * @param {number} y The y coordinate which should be set
	 * @param {number} [id] The tile ID which should be set to (x,y); If none is given, the tile is cleared (tileID = -1).
	 */
	set(x, y, id=-1, color) {
		let tile = this.get(x, y);
		tile.set(id, color);
	}

	/**
	 * Rerenders the given tile.
	 */
	_rerenderTile(t) {
		Grid.set(this._name, t.x, t.y, t.id, t.color);
	}

	render() {
		GFX.grid(this._name, this.x, this.y, this.layer);
	}
}

export default Tilemap;