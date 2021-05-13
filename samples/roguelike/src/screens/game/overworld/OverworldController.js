import EventBus from "../../../../../../src/utils/EventBus.js";
import Keyboard from "../../../../../../src/input/Keyboard.js";
import Keys from "../../../../../../src/input/Keys.js";

import RLMapController from "../../../core/controller/RLMapController.js";
import Events from "../../../Events.js";
import TileTypes from "../tiling/TileTypes.js";
import { log } from "../../../../../../src/utils/Log.js";
import AnimationPool from "../../../core/animations/AnimationPool.js";
import RoomScrolling from "../animations/RoomScrolling.js";

class GameLogicController extends RLMapController {
	/**
	 * @override
	 */
	init() {
		this._player = this.getMap().getPlayerActor();

		// initially we start with the room the player was placed in
		this._currentRoom = this._player.getRoom();
	}

	/**
	 * @override
	 */
	setupAnimationPhases() {
		return ["SCROLLING", "GENERAL", "MELEE_ATTACKS"];
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

		if (Keyboard.wasPressedOrIsDown(Keys.ENTER)) {
			c.setType(TileTypes.TREE);
		}

		let playerMoved = false;
		let targetX = c.x + dx;
		let targetY = c.y + dy;
		let targetCell = this.getMap().get(targetX, targetY);

		if (targetCell && targetCell.isFree()) {
			playerMoved = this._player.moveTo(targetX, targetY);
		}

		// TODO: after move check if we need to perform a scroll animation
		//       - deactivate NPCs in the "oldRoom"
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
				let scrollAnimation = AnimationPool.get(RoomScrolling, {
					from: this._currentRoom,
					to: this._currentRoom[cardinalDirection],
					//instant: true
				});
				let animSystem = this.getAnimationSystem();
				animSystem.schedule(scrollAnimation, "SCROLLING");
				this._currentRoom = this._currentRoom[cardinalDirection];
			}
		}

		EventBus.publish(Events.END_OF_PLAYER_TURN);
	}
}

export default GameLogicController;