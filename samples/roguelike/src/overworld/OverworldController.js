// JMP imports
import EventBus from "../../../../../../src/utils/EventBus.js";
import Keyboard from "../../../../../../src/input/Keyboard.js";
import Keys from "../../../../../../src/input/Keys.js";
import { log } from "../../../../../../src/utils/Log.js";

// core imports
import FOV from "../core/controller/FOV.js";
import RLMapController from "../core/controller/RLMapController.js";
import AnimationPool from "../core/animations/AnimationPool.js";
import AnimationChain from "../core/animations/AnimationChain.js";

// engine imports
import Events from "../engine/Events.js";
import { char2id } from "../engine/utils/RLTools.js";
import EnemyBase from "../engine/actors/EnemyBase.js";
import RoomScrolling from "../gamecontent/animations/RoomScrolling.js";
import ScreenShake from "../gamecontent/animations/ScreenShake.js";

// gamecontent imports
import Colors from "../gamecontent/Colors.js";
import { exposeOnWindow } from "../../../../src/utils/Helper.js";
class GameLogicController extends RLMapController {
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
	 * @override
	 */
	handleInput() {
		let playerCell = this._player.getCell();
		let playerMoved = false;
		let targetX;
		let targetY;

		if (Keyboard.wasPressedOrIsDown(Keys.ENTER)) {
			// testing screen shake
			let chain = AnimationPool.get(AnimationChain, {});
			chain.add(AnimationPool.get(ScreenShake, {map: this.getMap()}));
			this.getAnimationSystem().schedule("PLAYER_ATTACKS", chain);
		} else if (Keyboard.wasPressedOrIsDown(Keys.SPACE)) {
			// BG test
			playerCell.id = char2id("/");
			playerCell.color = Colors[0]
			playerCell.background = Colors[7];
		} else if (Keyboard.wasPressedOrIsDown(Keys.L)) {
			//lighting test
			playerCell.lightLevel = FOV.LightLevels.ALWAYS;
			if (Keyboard.wasPressedOrIsDown(Keys.SHIFT)) {
				playerCell.color = Colors[5];
				playerCell.id = char2id("f");
			}
		} else if (Keyboard.wasPressedOrIsDown(Keys.G)) {
			// pickup items
		} else if (Keyboard.wasPressedOrIsDown(Keys.PERIOD)) {
			// wait
			this._player.updateHP(1);
		} else {
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

			if (targetCell && targetCell != playerCell) {
				if (targetCell.isFree()) {
					playerMoved = this._player.moveTo(targetX, targetY);
				} else {
					// handle "bump"
					let actors = targetCell.getActors();
					actors.forEach((a) => {
						if (a instanceof EnemyBase) {
							this._player.meleeAttackActor(a);
						} else {
							log("talking to a friendly NPC :)", "Player");
						}
					})
				}
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

			this.updateFOV();
		}

		EventBus.publish(Events.END_OF_PLAYER_TURN);
	}
}

export default GameLogicController;