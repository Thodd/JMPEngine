import { exposeOnWindow } from "../../../../../src/utils/Helper.js";
import { log } from "../../../../../../src/utils/Log.js";

import Backpack from "../../items/Backpack.js";

import UISystem from "../../ui/UISystem.js";

import Stats from "../Stats.js";

// Callback for chaning the player's stats
const _stats = new Stats(function() {
	UISystem.updatePlayerStats(_stats);
});

// default stats of the player are different from the BaseActor's stats
_stats.hp_max = 10;
_stats.hp = 10;
_stats.atk = 3;
_stats.def = 2;
_stats.speed = 100;

// the current GameController reference
let _gc = null;

/**
 * A singleton to store all player information.
 * e.g. stats like health or the inventory.
 */
const PlayerState = {
	backpack: new Backpack(),

	stats: _stats,

	/**
	 * Changes the game controller.
	 * Each Map has its own GameController instance, tracking Actors etc.
	 * The GameController will automatically be changed on Map switch.
	 * @param {GameController} gc the currently used game controller
	 */
	setCurrentGameController(gc) {
		_gc = gc;
	},

	/**
	 * Turn Handling
	 */
	yourTurn: true,

	takeTurn() {
		// GC has passed us priority so we activate input check during the game loop
		PlayerState.yourTurn = true;
		log("taking turn - waiting for input", "Player");
	},

	endTurn() {
		// once the player turn ends we stop checking for input
		// and wait until the GC gives us priority again
		PlayerState.yourTurn = false;

		// notify the GC that the player has made their turn
		_gc.endPlayerTurn();
	}
};

export default PlayerState;

exposeOnWindow("playerState", PlayerState);