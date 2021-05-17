import EventBus from "../../../../../../src/utils/EventBus.js";
import Keyboard from "../../../../../../src/input/Keyboard.js";
import Keys from "../../../../../../src/input/Keys.js";
import { log } from "../../../../../../src/utils/Log.js";

import RLMapController from "../../core/controller/RLMapController.js";
import Events from "../Events.js";
import AnimationPool from "../../core/animations/AnimationPool.js";
import AnimationChain from "../../core/animations/AnimationChain.js";

import Colors from "../Colors.js";

import RoomScrolling from "../animations/RoomScrolling.js";
import ScreenShake from "../animations/ScreenShake.js";
import FOV from "../../core/controller/FOV.js";
import { char2id } from "../utils/RLTools.js";

class GameLogicController extends RLMapController {
	/**
	 * @override
	 */
	init() {
		this._player = this.getMap().getPlayerActor();

		// initial FOV calculation
		this.getFOVSystem().update(this._player.getCell(), 10);

		// initially we start with the room the player was placed in
		this._currentRoom = this._player.getRoom();
	}

	/**
	 * @override
	 */
	setupAnimationPhases() {
		return ["SCROLLING", "PLAYER_ATTACKS", "ENEMY_ATTACKS"];
	}

	/**
	 * @override
	 */
	handleInput() {
		let c = this._player.getCell();

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

		// testing screen shake
		if (Keyboard.wasPressedOrIsDown(Keys.ENTER)) {
			let chain = AnimationPool.get(AnimationChain, {});
			chain.add(AnimationPool.get(ScreenShake, {map: this.getMap()}));
			this.getAnimationSystem().schedule("PLAYER_ATTACKS", chain);
		}

		// BG test
		if (Keyboard.wasPressedOrIsDown(Keys.SPACE)) {
			c.background = Colors[10];
		}
		//lighting test
		if (Keyboard.wasPressedOrIsDown(Keys.L)) {
			c.lightLevel = FOV.LightLevels.ALWAYS;
			if (Keyboard.wasPressedOrIsDown(Keys.SHIFT)) {
				c.color = Colors[5];
				c.id = char2id("i");
			}
		}

		let playerMoved = false;
		let targetX = c.x + dx;
		let targetY = c.y + dy;
		let targetCell = this.getMap().get(targetX, targetY);

		if (targetCell && targetCell.isFree()) {
			playerMoved = this._player.moveTo(targetX, targetY);
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

			this.getFOVSystem().update(targetCell, 10);
		}

		EventBus.publish(Events.END_OF_PLAYER_TURN);
	}
}

export default GameLogicController;