import Helper from "../../../../src/utils/Helper.js";
import Entity from "../../../../src/game/Entity.js";
import Constants from "../Constants.js";
import { error } from "../../../../src/utils/Log.js";

let _ID = 0;

class BaseActor extends Entity {
	constructor({gameTile}) {
		super({});

		this.layer = Constants.Layers.NPC;

		// global ID to distinguish default actors during debugging.
		this._id = _ID++;

		this.moveToTile(gameTile);

		this.updateVisualPosition();

		// debugging for sprite positioning
		//this.RENDER_HITBOX = 0xFF0085;
		this.updateHitbox({
			x: 0, y:0, w:Constants.TILE_WIDTH, h:Constants.TILE_HEIGHT
		});
	}

	toString() {
		return `BaseActor#${this._id}`;
	}

	/**
	 * Updates the visual position of the actor.
	 */
	updateVisualPosition() {
		this.x = this.gameTile.x * Constants.TILE_WIDTH;
		this.y = this.gameTile.y * Constants.TILE_HEIGHT;
	}

	takeTurn() {
		// no animations
		return [];
	}

	endTurn() {

	}

	/**
	 * Retrieves the Tile this Actor is on.
	 */
	getTile() {
		return this.gameTile;
	}

	/**
	 * Convenience function to retrieve the currently active GameController instance.
	 */
	getGameController() {
		let screen = this.getScreen();
		if (screen) {
			return screen.getGameController();
		} else {
			error(`Cannot get GameController instance for actor ${this}. Actor is not added to a screen yet.`, "BaseActor");
		}
	}

	/**
	 * Convenience function to retrieve the currently active Tilemap instance.
	 */
	getTilemap() {
		let screen = this.getScreen();
		if (screen) {
			return screen.getTilemap();
		} else {
			error(`Cannot get Tilemap instance for Actor ${this}. Actor is not added to a screen yet.`, "BaseActor");
		}
	}

	/**
	 * Moves the Actor to the GameTile at the given coordinates in the Tilemap.
	 * @param {int} x
	 * @param {int} y
	 */
	moveTo(x, y) {
		let tilemap = this.getTilemap();

		if (tilemap) {
			let newTile = tilemap.get(x, y);

			if (newTile) {
				// first remove from old tile
				this.gameTile.removeActor(this);

				// then add to new tile
				newTile.addActor(this);
				this.gameTile = newTile;
			} else {
				error(`${this} cannot be moved to tile: (${x}, ${y}). Tile does not exist.`, "BaseActor");
			}
		} else {
			error(`${this} cannot be moved to tile: (${x}, ${y}). Actor is not added to a Screen with a Tilemap.`, "BaseActor");
		}
	}

	/**
	 * Moves the Actor to the given Tile.
	 * @param {*} newTile
	 */
	moveToTile(newTile) {
		if (newTile) {
			if (this.gameTile) {
				this.gameTile.removeActor(this);
			}
			newTile.addActor(this);
			this.gameTile = newTile;
		} else {
			error(`${this} cannot be moved to new Tile. Tile does not exist.`, "BaseActor");
		}
	}

	/**
	 * Returns a random adjacent tile.
	 * Moor-Neighborhood.
	 */
	getRandomAdjacentTile() {
		let xx = Helper.choose([-1,0,1]);
		let yy = Helper.choose([-1,0,1]);

		return this.getTilemap().get(this.gameTile.x + xx, this.gameTile.y + yy);
	}
}

export default BaseActor;