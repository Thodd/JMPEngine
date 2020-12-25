// engine imports
import Keyboard from "../../../../../../src/input/Keyboard.js";
import Keys from "../../../../../../src/input/Keys.js";
import Constants from "../../Constants.js";

// animations
import AnimationSystem from "../../animations/system/AnimationSystem.js";
import AnimationPool from "../../animations/system/AnimationPool.js";
import BumpAnimation from "../../animations/BumpAnimation.js";

// Item Handling
import ItemTypes from "../../items/ItemTypes.js";

// actors
import BaseActor from "../BaseActor.js";
import Enemy from "../enemies/Enemy.js";

// own stuff
import PlayerState from "./PlayerState.js";
import UISystem from "../../ui/UISystem.js";

/**
 * Entity representation of the Player.
 * Standard Actor.
 * Manages input handling in the update loop.
 * Persistent Player information is stored in the PlayerState class.
 */
class Player extends BaseActor {
	constructor({gameTile}) {
		super({gameTile});

		this.name = "Thor";
		this.nameColor = "#a4ce26";

		this.isPlayer = true;

		this.isBlocking = true;

		this.layer = this.layer = Constants.Layers.PLAYER;

		// the player Actor is the only one which updates each frame: Input Handling
		this.active = true;

		this._lastDir = "down";

		this.configSprite({
			sheet: "player",

			offset: {
				x: -3,
				y: -7
			},

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

	added() {
		// initial camera positioning
		this.centerCamera();
	}

	/**
	 * The Player's stats are stored in a separate class.
	 * The Player class is stateless and reused for all controllable Actors.
	 */
	getStats() {
		return PlayerState.stats;
	}

	/**
	 * The Player's backpack is stored in a separate class.
	 * The Player class is stateless and reused for all controllable Actors.
	 */
	getBackpack() {
		return PlayerState.backpack;
	}

	update() {
		if (PlayerState.yourTurn) {
			// wait one turn
			if (Keyboard.down(Keys.PERIOD)) {
				PlayerState.endTurn();
			} else if (Keyboard.down(Keys.G)) {
				// player tries to grab an item
				this.grabItems();
			} else {
				this.inputCheck_Movement();
			}
		}

		this.playAnimation({name: `${this._lastDir}`});
	}

	/**
	 * Check if an item can be picked up.
	 */
	grabItems() {
		// Picking items off the tile releases the BaseItem render entities ot the Pool
		let items = this.gameTile.pickupItems();

		if (items.length > 0) {
			let backpack = this.getBackpack();

			// process items
			for (let item of items) {
				// consume instant use items
				if (item.is(ItemTypes.Categories.CONSUMABLE, ItemTypes.SubCategories.INSTANT_USE)) {
					this.useItem(item);
				} else {
					// store everything else in the backpack
					backpack.addItem(item);
					UISystem.log(`${this} places ${item} in their backpack.`);
				}
			}
			PlayerState.endTurn();
		}
	}

	/**
	 * Routine to check for player movement input.
	 */
	inputCheck_Movement() {
		let xDif = 0;
		let yDif = 0;

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
				PlayerState.endTurn();
			}
		}
	}

	/**
	 * Punch the given Tile.
	 * If the tile is destroyable it will be replaced with its destroyed state.
	 * @param {GameTile} goalTile the tile to punch
	 */
	punchTile(goalTile) {
		// bump the tile
		let bump = AnimationPool.get(BumpAnimation, this);
		bump.bumpTowards(goalTile);
		this.scheduleAnimation(bump, AnimationSystem.Phases.GENERAL);

		// destroy tile if possible
		if (goalTile.type.destroyable) {
			goalTile.destroy();
		}
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
			let actorsOnGoalTile = goalTile.getActors();
			// movement
			if (goalTile.isFree()) {
				// move Actor to tile (incl. animation)
				this.moveToTile(goalTile);
				didSomeInteraction = true;

			} else if (goalTile.type.destroyable) {
				// destroyable tiles can be pushed over
				this.punchTile(goalTile);
				didSomeInteraction = true;

			} else if (actorsOnGoalTile.length > 0) {
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