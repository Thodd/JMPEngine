// engine imports
import Keyboard from "../../../../../../src/input/Keyboard.js";
import Keys from "../../../../../../src/input/Keys.js";
import EventBus from "../../../../../src/utils/EventBus.js";

// animations
import AnimationSystem from "../../animations/system/AnimationSystem.js";
import AnimationPool from "../../animations/system/AnimationPool.js";
import BumpAnimation from "../../animations/BumpAnimation.js";

// Item Handling
import Constants from "../../Constants.js";
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
		this.nameColor = "#0253b7";

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

	/**
	 * Subscribes to the UI input events (e.g. Backpack/Equipment changes).
	 */
	connectInputEventHandlers() {
		EventBus.subscribe(Constants.Events.UI_UPDATE_BACKPACK, this.inputCheck_fromUI.bind(this));
	}

	/**
	 * Unsubscribes from the UI input events.
	 * This is necessary since each screen has a separate Player class instance,
	 * and only the currently active one should react to UI interactions.
	 */
	disconnectInputEventHandlers() {
		EventBus.unsubscribeAll(Constants.Events.UI_UPDATE_BACKPACK);
	}

	/**
	 * Update Loop
	 */
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
				// consume ALL instant use items
				if (item.category === ItemTypes.Categories.CONSUMABLE_INSTANT) {
					// we skip the ending of the turn, so we can schedule multiple instant use items
					this.useItem(item);
				} else {
					// store everything else in the backpack
					backpack.addItem(item);
					UISystem.log(`${this} places ${item} in their backpack.`);
				}
			}

			// we end the turn after ALL items are grabbed
			PlayerState.endTurn();
		}
	}

	/**
	 * Overwritten from BaseActor class.
	 * @param {ItemType} item the item to use
	 */
	useItem(item) {
		super.useItem(item);

		// normally using an item ends the turn,
		// but we sometimes need to call this in a loop and want to schedule multiple animations
		// this is the case for instant consumables like heart pickups etc.
		if (item.category !== ItemTypes.Categories.CONSUMABLE_INSTANT) {
			PlayerState.endTurn();
		}
	}

	/**
	 * Handles UI Input events, e.g. euqipping or using items from the backpack.
	 *
	 * @param {object} evt event object fired from UI
	 * @param {string} evt.name the event name
	 * @param {object} evt.data the event data attached to the UI event
	 */
	inputCheck_fromUI(evt) {
		// event data is:
		// changeType
		// changedItem
		// changedSlot
		let evtData = evt.data;

		// only do stuff when it's our turn
		if (PlayerState.yourTurn) {

			let backpack = this.getBackpack();

			if (evtData.changeType === "consume") {
				backpack.removeItem(evtData.changedItem);
				this.useItem(evtData.changedItem);
			} else if (evtData.changeType === "equip") {
				backpack.equipItem(evtData.changedItem, evtData.changedSlot);
				PlayerState.endTurn();
			}
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