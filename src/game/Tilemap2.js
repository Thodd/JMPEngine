import Manifest from "../Manifest.js";
import GFX from "../gfx/GFX.js";
import Spritesheets from "../gfx/Spritesheets.js";
import { log, fail } from "../utils/Log.js";
import Entity from "./Entity.js";
import Tile from "./Tile.js";
import Keyboard from "../input/Keyboard.js";
import Keys from "../input/Keys.js";

let TILEMAP_COUNT = 0;

class Tilemap2 extends Entity {
	constructor(sheet, w=20, h=20, tileClass=Tile) {

		if (!sheet) {
			fail(`The spritesheet ${sheet} does not exist! A Tilemap cannot be created without a spritesheet`, "Tilemap.v2");
		}

		super();

		this.version = 2;

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
	 * Not supported in Tilemap Version 2
	 */
	_rerenderTile(t) {
		fail(`_renderTile(${t && t.id}) is not supported!`, "Tilemap.v2");
	}

	/**
	 * Renders the Tilemap.
	 * Only tiles which fits the screen and is inside the camera viewport will be rendered.
	 * Enables animated tiles.
	 */
	render() {
		// calculate minimum X/Y offsets based on camera position
		let baseX = this.x;
		let baseY = this.y;

		// calculate first visible column and row depending on the camera position
		let colStart = 0;
		if (this._screen.cam.x > baseX) {
			colStart = Math.floor((this._screen.cam.x - baseX) / this._tileWidth);
		}
		let rowStart = 0;
		if (this._screen.cam.y > baseY) {
			rowStart = Math.floor((this._screen.cam.y - baseY) / this._tileHeight);
		}

		// Calculate the last visible column and row.
		// We assume that the whole screen is be filled.
		// However, the maximum col/row is of course the mapWidth/mapHeight.
		let colMax = Math.min((colStart + this._screenWidth / this._tileWidth) + 1, this._mapWidth);
		let rowMax = Math.min((rowStart + this._screenHeight / this._tileHeight) + 1, this._mapHeight);

		// This log is only for debugging, since it's quite hard to judge which parts of a tilemap are currently rendered
		// Press (CTRL + ENTER) for logging.
		if (Keyboard.wasPressedOrIsDown(Keys.CONTROL) && Keyboard.pressed(Keys.ENTER)) {
			log(`origin: (${colStart},${rowStart})`, "Tilemap.v2");
			log(`end:    (${colMax},${rowMax})`, "Tilemap.v2");
		}

		// if the col/row origin are outside the map's width/height, there is nothing to draw
		if (colStart >= this._mapWidth || rowStart >= this._mapHeight) {
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

export default Tilemap2;