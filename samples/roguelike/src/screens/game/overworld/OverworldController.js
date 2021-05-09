import Keyboard from "../../../../../../src/input/Keyboard.js";
import Keys from "../../../../../../src/input/Keys.js";

import RLMapController from "../../../core/controller/RLMapController.js";

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
		return ["GENERAL", "MELEE_ATTACKS"];
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

		this._player.moveTo(this._map.get(c.x + dx, c.y + dy));

		// TODO: after move check if we need to perform a scroll animation
		//       - deactivate NPCs in the "oldRoom"
		//       - activate NPCs in the "newRoom"
		// let dim = this._currentRoom.dimensions;

		this.endPlayerTurn();
	}
}

export default GameLogicController;