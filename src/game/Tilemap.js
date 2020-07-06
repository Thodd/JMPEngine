import { fail, warn, log } from "../utils/Log.js";
import Manifest from "../assets/Manifest.js";
import Spritesheets from "../assets/Spritesheets.js";
import Entity from "./Entity.js";
import Tile from "./Tile.js";

import PIXI from "../core/PIXIWrapper.js";
import Keyboard from "../input/Keyboard.js";
import Keys from "../input/Keys.js";

let TILEMAP_COUNT = 0;

class Tilemap extends Entity {
	constructor({sheet, x=0, y=0, w=20, h=20, tileClass=Tile}) {

		if (!sheet) {
			fail(`The spritesheet ${sheet} does not exist! A Tilemap Entity cannot be created without a spritesheet!`, "Tilemap");
		}

		super(x, y);

		// @PIXI: Destroy the initial pixi sprite created by the super Entity constructor, shouldn't be much of an issue
		this._pixiSprite.destroy();

		// create a continer for all single tile sprites
		this._pixiSprite = new PIXI.Container();

		// sheet from which we will render the tiles
		this._sheet = Spritesheets.getSheet(sheet);

		// get a unique name for the tilemap (see Map module calls later)
		this._name = `tilemap_${TILEMAP_COUNT}`;
		TILEMAP_COUNT++;

		// flag to quickly check if the Entity is a Tilemap, no need for instanceof
		this.isTilemap = true;

		// dimensions
		this._mapWidth = w;
		this._mapHeight = h;
		this._tileWidth = this._sheet.w;
		this._tileHeight = this._sheet.h;
		this._screenWidthInTiles = Math.floor(Manifest.get("/w") / this._tileWidth);
		this._screenHeightInTiles = Math.floor(Manifest.get("/h") / this._tileHeight);

		// create tile instances (can be quite a lot depending on the width and height of the map!)
		this._field = [];
		for (let x = 0; x < this._mapWidth; x++) {
			this._field[x] = [];
			for (let y = 0; y < this._mapHeight; y++) {
				this._field[x][y] = new tileClass({tilemap: this, x: x, y: y});
			}
		}

		// Create a pool of enough PIXI.Sprite instances to cover the whole screen.
		// We cull the unused sprites during the render info update once we calculate which tile need to be rendered.
		// So the performance impact should be negligible.
		this._sprites = [];
		// We add +2 to both the width and height so we can render partial sprites on the edges,
		// since the camera is seldom placed on coordinates divisible by the tile width/height.
		let maxNumberOfSprites = (this._screenHeightInTiles + 2) * (this._screenWidthInTiles + 2);
		for (let i = 0; i < maxNumberOfSprites; i++) {
			let spr = new PIXI.Sprite();
			spr.visible = false; // might be changed during render info update
			this._sprites.push(spr);
			this._pixiSprite.addChild(spr);
		}
	}

	/**
	 * You cannot define a hitbox for a Tilemap.
	 * Collision is detected on a per tile basis.
	 */
	updateHitbox() {
		warn("A Tilemap does not have a hitbox. Collision detection is handled per tile!", "Tilemap");
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
	set(x, y, id=-1) {
		let tile = this.get(x, y);
		tile.set(id);
	}

	/**
	 * Updates the render information of the Tilemap.
	 * Calculates which tiles are visible on screen based on the camera position.
	 *
	 * The rendering is pretty fast since the calculation for the visible tiles is quick and
	 * we only need to update the textures and positions of a fixed set of sprites.
	 *
	 * Additionally we have a very limited memory consumption and startup performance since we don't
	 * need to prerender a big map. So the Tilemap rendering is independet from the actual map size.
	 * Cool.
	 */
	_updateRenderInfos() {
		// calculate minimum X/Y offsets based on camera position
		let baseX = this.x;
		let baseY = this.y;
		let camX = this._screen.cam.x;
		let camY = this._screen.cam.y;

		let diffX = Math.floor((camX - baseX) / this._tileWidth);
		let diffY = Math.floor((camY - baseY) / this._tileHeight);

		// Calculate the first and last visible column/row.
		let colStart;
		let colMax;
		if (diffX > 0) {
			colStart = diffX;
			colMax = Math.min(colStart + this._screenWidthInTiles + 1, this._mapWidth);
		} else {
			colStart = 0;
			colMax = Math.min(diffX + this._screenWidthInTiles + 1, this._mapWidth);
		}
		let rowStart;
		let rowMax;
		if (diffY > 0) {
			rowStart = diffY;
			rowMax = Math.min(rowStart + this._screenHeightInTiles + 1, this._mapHeight);
		} else {
			rowStart = 0;
			rowMax = Math.min(diffY + this._screenHeightInTiles + 1, this._mapHeight);
		}

		// This log is only for debugging, since it's quite hard to judge which parts of a tilemap are currently rendered
		// Press (CTRL + ENTER) for logging.
		if (Keyboard.wasPressedOrIsDown(Keys.CONTROL) && Keyboard.pressed(Keys.ENTER)) {
			log(`origin: (${colStart},${rowStart})`, "Tilemap");
			log(`end:    (${colMax},${rowMax})`, "Tilemap");
		}

		// @PIXI: if the col/row origin are outside the map's boundaries, there is nothing to draw
		// and we can set the whole Tilemap to invisible
		if (colStart >= this._mapWidth || colMax < 0 || rowStart >= this._mapHeight || rowMax < 0) {
			this._pixiSprite.visible = false;
			return;
		}

		// @PIXI: make Tilemap visible in case it was previously made invisible!
		this._pixiSprite.visible = true;

		// Only draw the tiles which are inside the camera (and inside the map range)
		let i = 0;
		for (let col = colStart; col < colMax; col++) {
			for (let row = rowStart; row < rowMax; row++) {
				let t = this._field[col][row];

				// we only need to update the tiles which have a value other than -1
				// -1 is considered invisible
				if (t && t.id >= 0) {
					let spr = this._sprites[i];

					// calculate drawing coordinates for the tile
					let drawX = baseX + (col * this._tileWidth) - camX;
					let drawY = baseY + (row * this._tileHeight) - camY;

					// set the correct texture and position the sprite
					spr.texture = this._sheet.textures[t.id];
					spr.visible = true;
					spr.x = drawX;
					spr.y = drawY;

					// next sprite in the pool
					i++;
				}
			}
		}

		// Cull all left over sprites in the pool, otherwise we get glitched out sprites.
		// If you are at the border of the Tilemap we don't need all sprites.
		let len = this._sprites.length;
		for (; i < len; i++) {
			let spr = this._sprites[i];
			spr.visible = false;
		}

	}
}

export default Tilemap;