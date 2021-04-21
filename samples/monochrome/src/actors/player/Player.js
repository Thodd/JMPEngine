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
import TileHighlight from "../../animations/effects/TileHighlight.js";

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

		this._lastDir = "left";

		// control scheme handling
		this._controlScheme = "basic";

		this.configSprite({
			sheet: "characters",

			offset: {
				x: -1,
				y: -1
			},

			animations: {
				default: this._lastDir,

				"left": {
					frames: [0, 1],
					dt: 40
				},

				"right": {
					frames: [2, 3],
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
	 * Subscribes to the events (e.g. UI input -> Backpack/Equipment changes).
	 */
	connectEventHandlers() {
		EventBus.subscribe(Constants.Events.UI_UPDATE_BACKPACK, this.inputCheck_fromUI.bind(this));
		EventBus.subscribe(Constants.Events.LOGIC_PLAYER_TURN_STARTED, this.turnStart.bind(this));
	}

	/**
	 * Unsubscribes from events.
	 * This is necessary since each screen has a separate Player class instance,
	 * and only the currently active one should react to UI interactions.
	 */
	disconnectEventHandlers() {
		EventBus.unsubscribeAll(Constants.Events.UI_UPDATE_BACKPACK);
		EventBus.unsubscribeAll(Constants.Events.LOGIC_PLAYER_TURN_STARTED);
	}

	/**
	 * Update Loop.
	 * Handles the different control schemes.
	 */
	update() {

		if (PlayerState.yourTurn) {

			if (this.hasControlScheme(Constants.ControlSchemes.BASIC)) { // BASIC
				if (Keyboard.pressed(Keys.PERIOD)) {
					PlayerState.endTurn();
				} else if (Keyboard.pressed(Keys.G)) {
					this.grabItemsFromFloor();
				} else if (Keyboard.pressed(Keys.U)) {
					this.useItemsFromFloor();
				} else if (Keyboard.pressed(Keys.A)) {
					this.quickSlotUsed(Constants.EquipmentSlots.QUICK_A);
				} else if (Keyboard.pressed(Keys.S)) {
					this.quickSlotUsed(Constants.EquipmentSlots.QUICK_S);
				} else if (Keyboard.pressed(Keys.F)) {
					this.switchControlScheme(Constants.ControlSchemes.SHOOTING);
				} else if (Keyboard.pressed(Keys.L)) {
					this.switchControlScheme(Constants.ControlSchemes.LOOKING);
				} else {
					this.inputCheck_Movement();
				}

			} else if (this.hasControlScheme(Constants.ControlSchemes.SHOOTING)) { // SHOOTING
				if (Keyboard.pressed(Keys.ESC)) {
					this.switchControlScheme(Constants.ControlSchemes.BASIC);
				} else if (Keyboard.pressed(Keys.F)) {
					this.fireRangedWeapon();
				} else if (Keyboard.pressed(Keys.R)) {
					// TODO: reload
				}

			} else if (this.hasControlScheme(Constants.ControlSchemes.LOOKING)) { // LOOKING
				if (Keyboard.pressed(Keys.ESC)) {
					this.switchControlScheme(Constants.ControlSchemes.BASIC);
				}
			}
		}

		this.playAnimation({name: `${this._lastDir}`});
	}

	/**
	 * Returns wheter the given control scheme is active.
	 * @param {string} cs the cntrol scheme to check
	 */
	hasControlScheme(cs) {
		return this._controlScheme === cs;
	}

	/**
	 * Switches the control scheme.
	 * Also does a sanity check if the control scheme can be applied, e.g.:
	 * Switching to "shooting" without an equipped ranged weapon does nothing.
	 *
	 * @param {string} cs the new control scheme
	 */
	switchControlScheme(cs) {
		let logMsg;

		if (cs === Constants.ControlSchemes.BASIC) {
			this._controlScheme = cs;
			logMsg = `${this} is idly standing around.`;
			this.getCursor().deactivate();

		} else if (cs === Constants.ControlSchemes.LOOKING) {
			this._controlScheme = cs;
			logMsg = `${this} is looking around.`;
			this.getCursor().activate(this.getTile(), this.lookAround.bind(this));

		} else if (cs === Constants.ControlSchemes.SHOOTING) {
			let bp = this.getBackpack();
			let rangedWeapon = bp.getItemFromSlot(Constants.EquipmentSlots.RANGED);

			// we can only switch the control scheme when a ranged weapon is equipped
			if (rangedWeapon) {
				this._controlScheme = cs;
				logMsg = `${this} readies their ${rangedWeapon.text.innerName}.`;
				this.getCursor().activate(this.getTile(), this.aimRangedWeapon.bind(this), true);
			} else {
				logMsg = `${this} does not have a ranged weapon equipped.`;
			}
		}

		UISystem.log(logMsg);
	}

	/**
	 * Called when a new Player turn starts.
	 */
	turnStart() {
		// SHOOTING:
		// When a turn starts and we are in the shooting control-scheme we display the cursor again
		if (!this.isDead && this.hasControlScheme(Constants.ControlSchemes.SHOOTING)) {
			this.getCursor().show();
			// redraw the line-of-sight after showing the cursor again
			// after an enemy has moved/died/etc. the line-of-sight has probably changed -> some tiles might be (un)blocked now
			this.aimRangedWeapon(undefined, undefined, this.getCursor().getBresenhamLine());
		}
	}

	/**
	 * LOOKING:
	 * Callback function for cursor movement when control scheme is set to LOOKING.
	 */
	lookAround(oldTile, newTile) {
		// only log a "looking" message if the old and new tile differ... stops the History from being spammed ;)
		if (oldTile.getType() != newTile.getType()) {
			let newTileType = newTile.getType();
			let innerName = newTileType.text && newTileType.text.innerName || "nothing";
			let flavor = newTileType.text && newTileType.text.flavor || "Wow!";
			UISystem.log(`${this} sees ${innerName}. ${flavor}`);
		}
	}

	/**
	 * SHOOTING:
	 * Callback function for cursor movement when control scheme is set to SHOOTING.
	 * Draws the line-of-sight for aiming.
	 * Not actual gameplay logic, just changing the rendering!
	 * Adapts the line tiles based on a "hit-check".
	 *
	 * @param {GameTile} oldTile the previous tile of the cursor
	 * @param {GameTile} newTile the new tile of the cursor
	 */
	aimRangedWeapon(oldTile, newTile, bresenhamLine) {
		// if the sight is blocked, all subsequent tiles will be drawn in red
		let sightIsBlocked = false;

		for (let p of bresenhamLine) {
			// we ignore the first and last tile of a line:
			// the first tile is the player's tile and the last one is the cursor
			if (p.tile == this.gameTile || p.tile == this.getCursor().getTargetTile()) {
				p.tileHighlight.visible = false;
			} else {
				if (p.tile.isFree() && !sightIsBlocked) {
					p.tileHighlight.set(Constants.Colors.BLUE_LIGHT);
				} else {
					sightIsBlocked = true;
					p.tileHighlight.set(Constants.Colors.RED_LIGHT);
				}
			}
		}
	}

	/**
	 * SHOOTING:
	 * Fires the currently equipped ranged weapon.
	 */
	fireRangedWeapon() {
		let lineOfSight = this.getCursor().getBresenhamLine();

		// zero or one entry means we shoot at ourselves... (initial placement of the cursor)
		if (lineOfSight.length == 0 || lineOfSight.length == 1) {
			UISystem.log(`That's a bit dark isn't it?`);
		} else {
			// we now move the projectile along the line-of-sight and find the first hit
			let tilesPassed = [];
			for (let p of lineOfSight) {
				// we ignore the first tile: always the player tile
				if (p.tile != this.gameTile) {
					tilesPassed.push(p.tile);
					// we stop at the first tile we cannot pass with our projectile
					if (!p.tile.isFree()) {
						break;
					}
				}
			}

			// Last entry of all the passed tiles is the one we hit
			let firstHitTile = tilesPassed[tilesPassed.length-1];
			let topmostEnemy;
			if (firstHitTile) {
				topmostEnemy = firstHitTile.getTopmostActorByClass(Enemy);
			}

			// get the projectile type from the ranged weapon definition
			let rangedWeapon = this.getBackpack().getItemFromSlot(Constants.EquipmentSlots.RANGED);

			this.fireShotAlongLine({
				tilesPassed: tilesPassed,
				tileHit: firstHitTile,
				actorHit: topmostEnemy,
				projectileType: rangedWeapon.values.projectileType
			});

			this.getCursor().hide();

			PlayerState.endTurn();
		}
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
		} else if (Keyboard.down(Keys.DOWN)) {
			yDif = +1;
		}

		// we have some direction input, so we start a movement animation
		if (xDif != 0 || yDif != 0) {

			// determine the start- and goal-tile
			let startTile = this.gameTile;
			let goalTile = this.getTilemap().get(startTile.x + xDif, startTile.y + yDif);

			// if something happend during this turn, end the turn.
			let didSomeInteraction = this.processMovementTileInteraction(startTile, goalTile);
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
	processMovementTileInteraction(startTile, goalTile) {
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