import Manifest from "../Manifest.js";
import Entity from "./Entity.js";
import Grid from "../gfx/Grid.js";
import { log, fail } from "../utils/Log.js";
import Tile from "./Tile.js";
import GFX from "../gfx/GFX.js";
import Spritesheets from "../gfx/Spritesheets.js";

import Keyboard from "../input/Keyboard.js";
import Keys from "../input/Keys.js";

let TILEMAP_COUNT = 0;

class Tilemap extends Entity {
	constructor(sheet, w=20, h=20, tileClass=Tile, version="A") {

		if (!sheet) {
			fail(`The spritesheet ${sheet} does not exist! A Tilemap cannot be created without a spritesheet`, "Tilemap");
		}

		super();

		// tilemap version
		this.version = version;

		// sheet from which we will render the tiles
		this._sheet = Spritesheets.getSheet(sheet);

		// get a unique name for the tilemap (see Map module calls later)
		this._name = `tilemap_${TILEMAP_COUNT}`;
		TILEMAP_COUNT++;

		this._isTilemap = true;

		// dimensions
		this._mapWidth = w;
		this._mapHeight = h;
		this._tileWidth = this._sheet.w;
		this._tileHeight = this._sheet.h;
		this._screenWidth = Manifest.get("/w");
		this._screenHeight = Manifest.get("/h");
		this._screenWidthInTiles = Math.floor(Manifest.get("/w") / this._tileWidth);
		this._screenHeightInTiles = Math.floor(Manifest.get("/h") / this._tileHeight);

		// register map on low-level API
		Grid.create({
			id: this._name,
			sheet: sheet,
			w: this._mapWidth,
			h: this._mapHeight
		});

		// create tile instances
		this._field = [];
		for (let x = 0; x < this._mapWidth; x++) {
			this._field[x] = [];
			for (let y = 0; y < this._mapHeight; y++) {
				this._field[x][y] = new tileClass(this, x, y);
			}
		}
	}

	/**
	 * Iterates all cells in the Tilemap.
	 * The corresponding Tile class instance will be given in the callback.
	 */
	each(fn) {
		for (let x = 0; x < this._mapWidth; x++) {
			for (let y = 0; y < this._mapHeight; y++) {
				fn(this._field[x][y]);
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
		if (this.version == "A") {
			fail(`_renderTile(${t && t.id}) is not supported!`, "Tilemap.vA");
		}
		Grid.set(this._name, t.x, t.y, t.id, t.color);
	}

	render() {
		if (this.version == "A") {
			this._renderA();
		} else {
			// Version B
			GFX.grid(this._name, this.x, this.y, this.layer);
		}
	}

	/**
	 * Renders the Tilemap.
	 * Only tiles which fits the screen and is inside the camera viewport will be rendered.
	 * Enables animated tiles.
	 */
	_renderA() {
		// calculate minimum X/Y offsets based on camera position
		let baseX = this.x;
		let baseY = this.y;
		let camX = this._screen.cam.x;
		let camY = this._screen.cam.y;

		// Calculate the first and last visible column/row.
		let colStart;
		let colMax;
		if (camX > baseX) {
			colStart = Math.floor((camX - baseX) / this._tileWidth);
			colMax = Math.min(colStart + this._screenWidthInTiles + 1, this._mapWidth);
		} else {
			colStart = 0;
			colMax = Math.min(Math.floor((camX + Manifest.get("/w") - baseX) / this._tileWidth) + 1, this._mapWidth);
		}
		let rowStart;
		let rowMax;
		if (camY > baseY) {
			rowStart = Math.floor((camY - baseY) / this._tileHeight);
			rowMax = Math.min(rowStart + this._screenHeightInTiles + 1, this._mapHeight);
		} else {
			rowStart = 0;
			rowMax = Math.min(Math.floor((camY + Manifest.get("/h") - baseY) / this._tileHeight) + 1, this._mapHeight);
		}

		// This log is only for debugging, since it's quite hard to judge which parts of a tilemap are currently rendered
		// Press (CTRL + ENTER) for logging.
		//if (Keyboard.wasPressedOrIsDown(Keys.CONTROL) && Keyboard.pressed(Keys.ENTER)) {
		//	log(`origin: (${colStart},${rowStart})`, "Tilemap.vA");
		//	log(`end:    (${colMax},${rowMax})`, "Tilemap.vA");
		//}

		// if the col/row origin are outside the map's boundaries, there is nothing to draw
		if (colStart >= this._mapWidth || colMax < 0 || rowStart >= this._mapHeight || rowMax < 0) {
			return;
		}

		// Only draw the tiles which are inside the camera (and inside the map range)
		for (let col = colStart; col < colMax; col++) {
			for (let row = rowStart; row < rowMax; row++) {
				let t = this._field[col][row];

				// we only need to render the tiles which have a value other than -1
				// Oppesd to Tilemap.v1, invisible tiles do not have to be tracked on a the backbuffer canvas
				if (t && t.id >= 0) {
					let drawX = col * this._tileWidth;
					let drawY = row * this._tileHeight;
					GFX.spr(this._sheet.name, t.id, baseX + drawX, baseY + drawY, this.layer, t.color);
				}
			}
		}
	}
}

export default Tilemap;