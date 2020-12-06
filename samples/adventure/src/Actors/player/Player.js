import Keyboard from "../../../../../../src/input/Keyboard.js";
import Keys from "../../../../../../src/input/Keys.js";
import { log } from "../../../../../../src/utils/Log.js";
import Constants from "../../Constants.js";

import BaseActor from "../BaseActor.js";

import PlayerState from "./PlayerState.js";

import Enemy from "../enemies/Enemy.js";

class Player extends BaseActor {
	constructor({gameTile}) {
		super({gameTile});

		this.isBlocking = true;

		this.layer = this.layer = Constants.Layers.PLAYER;

		// the player Actor is the only one which updates each frame: Input Handling
		this.active = true;

		this._lastDir = "down";

		this.checkForInput = true;

		this._scheduledAnimations = [];

		this.configSprite({
			sheet: "player",

			offset: {
				x: -3,
				y: -7
			},

			//color: Constants.Colors.YELLOW_LIGHT,

			animations: {
				default: "down",

				"left": {
					frames: [0, 1],
					dt: 40
				},

				"right": {
					frames: [2, 3],
					dt: 40
				},

				"down": {
					frames: [4, 5],
					dt: 40
				},

				"up": {
					frames: [6, 7],
					dt: 40
				}
			}
		});
	}

	toString() {
		return `Player#${this._id}`;
	}

	/**
	 * The Player's stats are stored in a separate class.
	 * The Player class is stateless and reused for all controllable Actors.
	 */
	getStats() {
		return PlayerState.stats;
	}

	takeTurn() {
		// GC has passed us priority so we activate input check during the game loop
		this.checkForInput = true;
		log("taking turn - waiting for input", "Player");
	}

	endTurn() {
		// once the player turn ends we stop checking for input
		// and wait until the GC gives us priority again
		this.checkForInput = false;

		// notify the GC that the player has made their turn
		this.getGameController().endPlayerTurn();
	}

	update() {
		if (this.checkForInput) {
			let xDif = 0;
			let yDif = 0;

			// wait one turn
			if (Keyboard.down(Keys.PERIOD)) {
				this.endTurn();
			} else {
				if (Keyboard.down(Keys.LEFT)) {
					xDif = -1;
					this._lastDir = "left";
				} else if (Keyboard.down(Keys.RIGHT)) {
					xDif = +1;
					this._lastDir = "right";
				}

				if (Keyboard.down(Keys.UP)) {
					yDif = -1;
					this._lastDir = "up";
				} else if (Keyboard.down(Keys.DOWN)) {
					yDif = +1;
					this._lastDir = "down";
				}

				// we have some direction input, so we start a movement animation
				if (xDif != 0 || yDif != 0) {

					// determine the start- and goal-tile
					let startTile = this.gameTile;
					let goalTile = this.getTilemap().get(startTile.x + xDif, startTile.y + yDif);

					// if something happend during this turn, end the turn.
					let didSomeInteraction = this.processTileInteraction(startTile, goalTile);
					if (didSomeInteraction) {
						this.endTurn();
					}
				}
			}
		}

		this.playAnimation({name: `${this._lastDir}`});

		this.centerCamera();
	}

	/**
	 * Checks the goal-tile if it's free or occupied by something.
	 * Also handles melee fighting.
	 *
	 * @param {GameTile} startTile the current tile of the player
	 * @param {GameTile} goalTile the goal-tile to which the player wants to move
	 */
	processTileInteraction(startTile, goalTile) {
		// this flag indicates if something has happend this turn
		let didSomeInteraction = false;

		if (goalTile) {
			// movement
			if (goalTile.isFree()) {
				// move Actor to tile (incl. animation)
				this.moveToTile(goalTile);

				didSomeInteraction = true;
			} else {
				let actorsOnGoalTile = goalTile.getActors();
				for (let actor of actorsOnGoalTile) {

					// ATTACKING
					if (actor instanceof Enemy) {
						this.meleeAttackActor(actor);

						didSomeInteraction = true;

						break;
					}
				}
			}
		}

		return didSomeInteraction;
	}

	/**
	 * Position the camera around the player character
	 */
	centerCamera() {
		let s = this.getScreen();
		s.cam.x = this.x - Constants.SCREEN_WIDTH_IN_TILES_HALF * Constants.TILE_WIDTH;
		s.cam.y = this.y - Constants.SCREEN_HEIGHT_IN_TILES_HALF * Constants.TILE_HEIGHT;
	}
}

export default Player;