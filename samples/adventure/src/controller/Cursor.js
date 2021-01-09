// jmp engine imports
import { error } from "../../../../src/utils/Log.js";
import Keyboard from "../../../../src/input/Keyboard.js";
import Keys from "../../../../src/input/Keys.js";
import Entity from "../../../../src/game/Entity.js";

// game imports
import Constants from "../Constants.js";
import Algos from "../utils/Algos.js";

// effects
import EffectPool from "../animations/effects/EffectPool.js";
import TileHighlight from "../animations/effects/TileHighlight.js";

/**
 * Visual Class to move a Cursor around the gamefield.
 * Contains no game logic except input handling.
 */
class Cursor extends Entity {
	constructor() {
		super();

		// we keep the start tile for rendering a bresenham line
		this.startTile = null;

		// target tile is used for intercations
		this.targetTile = null;

		// optional callback which is called on each cursor movement
		this.changeCallback = null;

		// optional flag to calculate a bresenham line on each cursor movement
		this.calculateBresenhamLine = false;

		// a list of TileHighlight effect instances, which are reused when drawing a bresenham line
		this._tileHighlights = [];

		// special layer for rendering, used only by the Cursor
		this.layer = Constants.Layers.CURSOR;

		this.configSprite({
			sheet: "tile_highlights",
			animations: {
				default: "idle",
				idle: {
					frames: [13, 14],
					dt: 60
				}
			}
		});

		this.hide();
	}

	/**
	 * Convenience function.
	 * Returns the Tilemap on which the cursor is rendered.
	 * <b>Note</b>: Only usable inside a BaseMap instance.
	 */
	getTilemap() {
		return this.getScreen().getTilemap();
	}

	/**
	 * Displays the cursor at the given tile.
	 * An additional callback can be defined, which is invoked everytime the cursor is moved.
	 *
	 *
	 * @param {GameTile} startTile the start position of the cursor
	 * @param {function} [changeCallback] an optional callback function which is invoked everytime the cursor is moved to a new tile
	 * @param {boolean} [calculateBresenhamLine] if set to true the cursor automatically calculates a bresenham based line from 'startTile' to the target tile
	 */
	show(startTile, changeCallback=null, calculateBresenhamLine=false) {
		this.startTile = startTile;
		this.targetTile = startTile;

		this.changeCallback = changeCallback;

		this.calculateBresenhamLine = calculateBresenhamLine;

		this.active = true;
		this.visible = true;

		this.updateVisualPosition();
	}

	/**
	 * Hides the cursor and deactivates movement input handling.
	 */
	hide() {
		this.startTile = null;
		this.targetTile = null;

		this.changeCallback = null;

		this.calculateBresenhamLine = false;

		this.active = false;
		this.visible = false;

		this.hideTileHighlights();
	}

	/**
	 * Updates the visual position of the Cursor based on the configured tile sizes.
	 */
	updateVisualPosition() {
		// the current target tile
		this.x = this.targetTile.x * Constants.TILE_WIDTH;
		this.y = this.targetTile.y * Constants.TILE_HEIGHT;
	}

	/**
	 * Hides all existing tile-highlights.
	 */
	hideTileHighlights() {
		this._tileHighlights.forEach(function(th) {
			th.visible = false;
		})
	}

	/**
	 * Moves the Cursor relative to its current position on the game grid.
	 *
	 * @param {int} dx x delta
	 * @param {int} dy y delta
	 */
	moveRelative(dx, dy) {
		// only move if not out of bounds
		let tile = this.targetTile.getRelative(dx, dy);
		let viewport = this.getTilemap().getViewportRectInTiles();

		// we might not have a tile if the potential cursor position is outside the map
		if (tile) {
			// make sure the cursor does not leave the Viewport of the tilemap
			if (tile.x < viewport.x1 || tile.x > viewport.x2 - 1 ||
				tile.y < viewport.y1 || tile.y > viewport.y2 - 1) {
					// cursor cannot be moved
					return;
			}

			// argument for the callback
			let bresenhamLine;

			let oldTile = this.targetTile;
			this.targetTile = tile;
			this.updateVisualPosition();

			// [optional]
			if (this.calculateBresenhamLine) {
				// make sure we first hide all tile-highlights
				this.hideTileHighlights();

				bresenhamLine = [];
				let line = Algos.bresenham(this.startTile.x, this.startTile.y, this.targetTile.x, this.targetTile.y);

				for (let i = 0; i < line.length; i++) {
					// for each point we determine the corresponding tile instance and a tile effect instance
					let p = line[i];
					p.tile = this.getTilemap().get(p.x, p.y);
					p.tileHighlight = this._tileHighlights[i];

					// create a new TileHighlight if we need another one
					// since they will be use the TileHighlights anyway, we keep them the screen instead of releasing them constantly
					if (!p.tileHighlight) {
						p.tileHighlight = EffectPool.get(TileHighlight, tile);
						this._tileHighlights.push(p.tileHighlight);
						this.getScreen().add(p.tileHighlight);
					}

					// the TileHighlight effect is automatically moved to the correct tile too
					p.tileHighlight.setTile(p.tile);
					p.tileHighlight.visible = true;

					bresenhamLine.push(p);
				}
			}

			// [optional]
			if (this.changeCallback) {
				this.changeCallback(oldTile, this.targetTile, bresenhamLine);
			}
		}
	}

	/**
	 * Returns the tile over which the Cursor currently hovers.
	 */
	getTargetTile() {
		if (!this.targetTile) {
			error("This cursor instance is no positioned on a target tile or is not shown yet.", "Cursor");
		}
		return this.targetTile;
	}

	/**
	 * Changes the styling of the Cursor.
	 * Can be used for context sensitive highlighting.
	 */
	setStyle() {
		// TODO: implement
	}

	/**
	 * Performs input handling for moving the Cursor.
	 */
	update() {
		let dx = 0;
		let dy = 0;

		if (Keyboard.pressed(Keys.RIGHT)) {
			dx = 1;
		} else if (Keyboard.pressed(Keys.LEFT)) {
			dx = -1;
		}

		if (Keyboard.pressed(Keys.DOWN)) {
			dy = 1;
		} else if (Keyboard.pressed(Keys.UP)) {
			dy = -1;
		}

		if (dx != 0 || dy != 0) {
			this.moveRelative(dx, dy);
		}
	}
}

export default Cursor;