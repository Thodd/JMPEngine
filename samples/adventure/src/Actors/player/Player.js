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
				this.grabItemsFromFloor();
			} else if (Keyboard.down(Keys.U)) {
				this.useItemsFromFloor();
			} else if (Keyboard.down(Keys.A)) {
				this.quickSlotUsed(Constants.EquipmentSlots.QUICK_A);
			} else if (Keyboard.down(Keys.S)) {
				this.quickSlotUsed(Constants.EquipmentSlots.QUICK_S);
			} else {
				this.inputCheck_Movement();
			}
		}

		this.playAnimation({name: `${this._lastDir}`});
	}

	/**
	 * Uses the item in the given Quickslot (if possible).
	 * @param {string} slot the slot from which an item should be used
	 */
	quickSlotUsed(slot) {
		let backpack = this.getBackpack();
		let item = backpack.getItemFromSlot(slot);

		// consome the equipped item
		if (item && item.hasCategory(ItemTypes.Categories.CONSUMABLE)) {
			backpack.removeItem(item, slot);
			this.useItem(item);

			PlayerState.endTurn();
		}
	}

	/**
	 * Check if an item can be picked up.
	 */
	grabItemsFromFloor() {
		// Picking items off the tile releases the BaseItem render entities ot the Pool
		let items = this.gameTile.pickupItems();

		if (items.length > 0) {
			let backpack = this.getBackpack();

			// process items
			for (let item of items) {
				// store everything else in the backpack
				backpack.addItem(item);
				UISystem.log(`${this} places ${item} in their backpack.`);
			}

			// end turn after picking up all items
			PlayerState.endTurn();
		}
	}

	/**
	 * Use an item directly from the floor without picking it up first.
	 */
	useItemsFromFloor() {
		let topmostConsumable = this.gameTile.pickupTopmostConsumable();

		// use item and remove it from the tile
		if (topmostConsumable) {
			this.useItem(topmostConsumable);
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
		// newSlot
		let evtData = evt.data;

		// only do stuff when it's our turn
		if (PlayerState.yourTurn) {

			let backpack = this.getBackpack();

			if (evtData.changeType === "consume") {
				backpack.removeItem(evtData.changedItem, evtData.currentSlot);
				this.useItem(evtData.changedItem); // ends the turn!
			} else if (evtData.changeType === "equip") {
				// check if the item is already equipped in another slot  -->  unequip first
				if (evtData.currentSlot) {
					backpack.unequip(evtData.currentSlot);
				}
				backpack.equipItem(evtData.changedItem, evtData.newSlot);
			}

			// end turn after action was performed
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