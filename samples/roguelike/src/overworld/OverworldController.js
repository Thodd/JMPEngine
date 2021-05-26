// JMP imports
import EventBus from "../../../../../../src/utils/EventBus.js";
import Keyboard from "../../../../../../src/input/Keyboard.js";
import Keys from "../../../../../../src/input/Keys.js";
import { log } from "../../../../../../src/utils/Log.js";

// core imports
import RLMapController from "../core/controller/RLMapController.js";
import AnimationPool from "../core/animations/AnimationPool.js";

// engine imports
import Events from "../engine/Events.js";
import EquipmentSlots from "../engine/inventory/EquipmentSlots.js";
import ControlSchemes from "../engine/input/ControlSchemes.js";
import EnemyBase from "../engine/actors/EnemyBase.js";
import RoomScrolling from "../gamecontent/animations/RoomScrolling.js";

// gamecontent imports
import { exposeOnWindow } from "../../../../src/utils/Helper.js";

class OverworldController extends RLMapController {
	/**
	 * @override
	 */
	init() {
		this._player = this.getMap().getPlayerActor();
		exposeOnWindow("player", this._player);

		// initially we start with the room the player was placed in
		this._currentRoom = this._player.getRoom();

		// initial FOV calculation
		this.updateFOV();

		// control scheme handle
		this._controlScheme = ControlSchemes.BASIC;
	}

	/**
	 * @override
	 */
	setupAnimationPhases() {
		return ["SCROLLING", "PLAYER_ATTACKS", "ENEMY_ATTACKS"];
	}

	/**
	 * Updates the FOV around the player.
	 * Min/Max values are clamped based on the current Room.
	 * This way the light does not "spill over" into the next Room.
	 */
	updateFOV() {
		let dim = this._currentRoom.dimensions;
		this.getFOVSystem().update(this._player.getCell(), 10, {
			x_min: dim.x_min,
			x_max: dim.x_max+1,
			y_min: dim.y_min,
			y_max: dim.y_max+1,
		});
	}

	/**
	 * Shorthand for ending the player's turn.
	 */
	endPlayerTurn() {
		EventBus.publish(Events.END_OF_PLAYER_TURN);
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

		if (cs === ControlSchemes.BASIC) {
			this._controlScheme = cs;
			logMsg = "Back to exploring I guess...";
			//this.getCursor().deactivate();

		} else if (cs === ControlSchemes.LOOKING) {
			this._controlScheme = cs;
			logMsg = "Alright, let's see...";
			//this.getCursor().activate(this.getTile(), this.lookAround.bind(this));

		} else if (cs === ControlSchemes.SHOOTING) {
			let bp = this._player.getBackpack();
			let rangedWeapon = bp.getItemFromSlot(EquipmentSlots.RANGED);

			// we can only switch the control scheme when a ranged weapon is equipped
			if (rangedWeapon) {
				this._controlScheme = cs;
				logMsg = `I take aim with my ${rangedWeapon.text.innerName}.`;
				//this.getCursor().activate(this.getTile(), this.aimRangedWeapon.bind(this), true);
			} else {
				logMsg = "I do not have a ranged weapon equipped.";
			}
		}

		EventBus.publish(Events.HISTORY, logMsg);
	}

	/**
	 * @override
	 */
	handleInput() {
		if (this.hasControlScheme(ControlSchemes.BASIC)) { // BASIC
			if (Keyboard.wasPressedOrIsDown(Keys.PERIOD)) { // Resting
				// rest for a moment :)
				EventBus.publish(Events.HISTORY, "I need a rest...");
				this._player.updateHP(0.5);
				this.endPlayerTurn();
			} else if (Keyboard.wasPressedOrIsDown(Keys.G)) { // Grab items from floor
				// pickup items
				if (this._player.pickupItemFromFloor()) {
					this.endPlayerTurn();
				}
			} else if (Keyboard.wasPressedOrIsDown(Keys.U)) { // use items from floor
				// TODO: use item from floor directly
			} else if (Keyboard.wasPressedOrIsDown(Keys.A)) { // quick A
				// TODO: use item in quickslot A ???
			} else if (Keyboard.wasPressedOrIsDown(Keys.S)) { // quick S
				// TODO: use item in quickslot A ???
			} else if (Keyboard.wasPressedOrIsDown(Keys.F)) { // enter shooting mode
				this.switchControlScheme(ControlSchemes.SHOOTING);
			} else if (Keyboard.wasPressedOrIsDown(Keys.L)) { // enter looking mode
				this.switchControlScheme(ControlSchemes.LOOKING);
			} else if (Keyboard.wasPressedOrIsDown(Keys.M)) { // toggle minimap
				// TODO: Toggle minimap display
			} else if (Keyboard.wasPressedOrIsDown(Keys.I)) { // open inventory
				// TODO: go to inventory
				//       separate ControlScheme ???
				//       -> No? maybe new Entity which changes scheme on "ESC"
			} else { // movement and melee code
				this.inputChecks_PlayerMovement();
			}

		} else if (this.hasControlScheme(ControlSchemes.SHOOTING)) { // SHOOTING
			if (Keyboard.wasPressedOrIsDown(Keys.ESC)) {
				this.switchControlScheme(ControlSchemes.BASIC);
			} else if (Keyboard.wasPressedOrIsDown(Keys.F)) { // fire weapon
				// TODO: shoot
				log("*pew* *pew*", "OverworldController");
				this.endPlayerTurn();
			} else if (Keyboard.wasPressedOrIsDown(Keys.R)) { // reload
				// TODO: reload
				log("*tschk* *tschk*", "OverworldController");
				this.endPlayerTurn();
			}

		} else if (this.hasControlScheme(ControlSchemes.LOOKING)) { // LOOKING
			if (Keyboard.wasPressedOrIsDown(Keys.ESC)) { // return to movement
				this.switchControlScheme(ControlSchemes.BASIC);
			}
		}
	}

	/**
	 * Movement of Player Actor.
	 *   [+] walking
	 *   [+] Cell interaction
	 *       [+] melee attack other actors
	 *       [+] friendly interaction
	 *   [+] Room scrolling
	 */
	inputChecks_PlayerMovement() {
		let playerCell = this._player.getCell();
		let playerMoved = false;
		let targetX;
		let targetY;

		// movement input handling
		let dx = 0;
		let dy = 0;
		if (Keyboard.wasPressedOrIsDown(Keys.LEFT)) {
			dx = -1;
		} else if (Keyboard.wasPressedOrIsDown(Keys.RIGHT)) {
			dx = +1;
		}
		if (Keyboard.wasPressedOrIsDown(Keys.UP)) {
			dy = -1;
		} else if (Keyboard.wasPressedOrIsDown(Keys.DOWN)) {
			dy = +1;
		}

		targetX = playerCell.x + dx;
		targetY = playerCell.y + dy;
		let targetCell = this.getMap().get(targetX, targetY);

		// Check goal cell for interaction
		if (targetCell && targetCell != playerCell) {
			if (targetCell.isFree()) {
				playerMoved = this._player.moveTo(targetX, targetY);
			} else {
				// handle "bump"
				let actors = targetCell.getActors();
				actors.forEach((a) => {
					if (a instanceof EnemyBase) {
						this._player.meleeAttackActor(a);
						playerMoved = true;
					} else {
						log("talking to a friendly NPC or bump into wall :)", "Player");
						playerMoved = true;
					}
				})
			}
		}

		// TODO: - deactivate NPCs in the "oldRoom"
		//       - activate NPCs in the "newRoom"
		if (playerMoved) {
			let dim = this._currentRoom.dimensions;

			// detect the cardinal direction in which the player leaves the Room
			// we make else-if checks to prevent diagonal movement, horizontal movement wins in this case
			let cardinalDirection = null;
			if (targetX < dim.x_min) {
				log("WEST", "Scrolling");
				cardinalDirection = "W";
			} else if (targetX > dim.x_max) {
				log("EAST", "Scrolling");
				cardinalDirection = "E";
			} else if (targetY < dim.y_min) {
				log("NORTH", "Scrolling");
				cardinalDirection = "N";
			} else if (targetY > dim.y_max) {
				log("SOUTH", "Scrolling");
				cardinalDirection = "S";
			}

			if (cardinalDirection != null) {
				// get a RoomScrolling Animation from the Pool ...
				let scrollAnimation = AnimationPool.get(RoomScrolling, {
					from: this._currentRoom,
					to: this._currentRoom[cardinalDirection],
					//instant: true
				});
				// ... and schedule it
				this.getAnimationSystem().schedule("SCROLLING", scrollAnimation);

				this._currentRoom = this._currentRoom[cardinalDirection];
			}

			// only after moving we update the FOV
			this.updateFOV();

			// end turn if the player could make a valid move
			this.endPlayerTurn();
		}
	}
}

export default OverworldController;