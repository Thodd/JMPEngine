// jmp engine imports
import { error } from "../../../../src/utils/Log.js";
import Keyboard from "../../../../src/input/Keyboard.js";
import Keys from "../../../../src/input/Keys.js";
import Entity from "../../../../src/game/Entity.js";

// game imports
import Constants from "../Constants.js";

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
	 * Displays the cursor at the given tile.
	 * An additional callback can be defined, which is invoked everytime the cursor is moved.
	 *
	 *
	 * @param {GameTile} startTile the start position of the cursor
	 * @param {function} [changeCallback] an optional callback function which is invoked everytime the cursor is moved to a new tile
	 */
	show(startTile, changeCallback=null) {
		this.startTile = startTile;
		this.targetTile = startTile;

		this.changeCallback = changeCallback;

		this.visible = true;
		this.active = true;

		this.updateVisualPosition();
	}

	/**
	 * Hides the cursor and deactivates movement input handling.
	 */
	hide() {
		this.startTile = null;
		this.targetTile = null;

		this.changeCallback = null;

		this.visible = false;
		this.active = false;
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
	 * Moves the Cursor relative to its current position on the game grid.
	 *
	 * @param {int} dx x delta
	 * @param {int} dy y delta
	 */
	moveRelative(dx, dy) {
		// only move if not out of bounds
		let tile = this.targetTile.getRelative(dx, dy);
		if (tile) {
			let oldTile = this.targetTile;
			this.targetTile = tile;
			this.updateVisualPosition();

			if (this.changeCallback) {
				this.changeCallback(oldTile, this.targetTile);
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