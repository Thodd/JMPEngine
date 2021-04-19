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

		// @PIXI: Destroy the initial pixi sprite created by the super Entity constructor, shouldn'tile be much of an issue
		this._pixiSprite.destroy();

		// create a continer for all single tile sprites
		this._pixiSprite = new PIXI.Container();

		// sheet from which we will render the tiles
		this._sheet = Spritesheets.getSheet(sheet);

		// get a unique name for the tilemap (see Map module calls later)
		this._name = `tilemap_${TILEMAP_COUNT}`;
		TILEMAP_COUNT++;

		// flag to quickly check if the Entity is a Tilemap, no need for instanceof
		this._isTilemap = true;

		// mark hitbox as collidable by default
		this._hitbox._collidable = true;

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

		// global animation timer
		this._globalAnimationTimer = 0;
	}

	/**
	 * Not supported for Tilemaps.
	 */
	configSprite() {
		warn("configSprite is not supported for Tilemaps. Please use 'Tilemap.setTilesheet()'.", "Tilemap");
	}

	/**
	 * Not yet implemented.
	 */
	setTilesheet() {
		// TODO: Implement tilesheet change at runtime
		warn("'setTilesheet()' is not yet implemented.", "Tilemap");
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
	 * Iteration order is from top-left to bottom-right (row by row, column by column).
	 * The callback is called with the following arguments (in this order):
	 * - the Tile class instance
	 */
	each(fn) {
		for (let y = 0; y < this._mapHeight; y++) {
			for (let x = 0; x < this._mapWidth; x++) {
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
	 * Retrieves the Viewport of the Tilemap counted in tiles.
	 * Result is a rectangle described by 2 points: top-left to bottom-right
	 * @return {object} an object containing two points: x1/y1 (top-left) and x2/y2 (bottom-right)
	 */
	getViewportRectInTiles() {
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
			colMax = Math.min(colStart + this._screenWidthInTiles, this._mapWidth);
		} else {
			colStart = 0;
			colMax = Math.min(diffX + this._screenWidthInTiles, this._mapWidth);
		}
		let rowStart;
		let rowMax;
		if (diffY > 0) {
			rowStart = diffY;
			rowMax = Math.min(rowStart + this._screenHeightInTiles, this._mapHeight);
		} else {
			rowStart = 0;
			rowMax = Math.min(diffY + this._screenHeightInTiles, this._mapHeight);
		}

		return {
			x1: colStart,
			y1: rowStart,
			x2: colMax,
			y2: rowMax
		};
	}

	/**
	 * Updates the render information of the Tilemap.
	 * Calculates which tiles are visible on screen based on the camera position.
	 *
	 * The rendering is pretty fast since the calculation for the visible tiles is quick and
	 * we only need to update the textures and positions of a fixed set of sprites.
	 *
	 * Additionally we have a very limited memory consumption and startup performance since we don'tile
	 * need to prerender a big map. So the Tilemap rendering is independet from the actual map size.
	 * Cool.
	 */
	_updateRenderInfos() {
		// increase the global timer on each tilemap rendering
		this._globalAnimationTimer++;

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
		if (window.jmp && window.jmp._debugMode && Keyboard.wasPressedOrIsDown(Keys.CONTROL) && Keyboard.pressed(Keys.ENTER)) {
			log(`origin: (${colStart},${rowStart})`, "Tilemap/debug");
			log(`end:    (${colMax},${rowMax})`, "Tilemap/debug");
		}

		// @PIXI: if the col/row origin are outside the map's boundaries, there is nothing to draw
		// and we can set the whole Tilemap to invisible
		if (colStart >= this._mapWidth || colMax < 0 || rowStart >= this._mapHeight || rowMax < 0) {
			this._pixiSprite.visible = false;
			return;
		}

		// @PIXI: make Tilemap visible in case it was previously made invisible!
		this._pixiSprite.visible = true;

		// set the texture of all tiles inside the camera viewport (and inside the map range)
		let i = 0;
		for (let col = colStart; col < colMax; col++) {
			for (let row = rowStart; row < rowMax; row++) {
				let tile = this._field[col][row];

				// we only need to update the tiles which have a value other than -1
				// -1 is considered invisible
				if (tile && tile.id >= 0) {
					let spr = this._sprites[i];

					// calculate drawing coordinates for the tile
					let drawX = baseX + (col * this._tileWidth) - camX;
					let drawY = baseY + (row * this._tileHeight) - camY;

					// set the correct texture and position the sprite
					spr.texture = this._sheet.textures[tile.id];
					spr.visible = true;
					spr.x = drawX;
					spr.y = drawY;

					// optional pixiSprite values e.g. tinting
					spr.tint = 0xFFFFFF; // white 0xFFFFFF resets the tint
					if (tile._color != 0xFFFFFF) {
						spr.tint = tile._color;
					}

					// -- Tile-Animations --
					// Opposed to Entity sprites we can update the tile animation
					// at the end of the frame, a tile only supports 1 animation
					// and has a fixed timing.
					// We do this here inplace to save some function calls.
					if (tile._animInfo.isAnimated) {
						// if the tile is globally synchronized, the animation for all synchronized tiles advance simultaneously
						if (tile._animInfo.synchronize) {
							let cycles = (this._globalAnimationTimer/tile._animInfo.dt) | 0;
							tile._animInfo.index = cycles % tile._animInfo.frames.length;
						} else {
							// advance animation per tile
							if (tile._animInfo.frameCount == tile._animInfo.dt) {
								tile._animInfo.frameCount = 0;
								tile._animInfo.index++;
							} else {
								tile._animInfo.frameCount++;
							}
						}

						if (tile._animInfo.index >= tile._animInfo.frames.length) {
							tile._animInfo.index = 0;
						}
						// update the sprite ID
						tile.id = tile._animInfo.frames[tile._animInfo.index];
					}

					// go to next sprite in the pool
					i++;
				}
			}
		}

		// Cull all left over sprites in the pool, otherwise we get glitched out sprites.
		// If you are at the border of the Tilemap we don'tile need all sprites.
		let len = this._sprites.length;
		for (; i < len; i++) {
			let spr = this._sprites[i];
			spr.visible = false;
		}

	}
}

export default Tilemap;