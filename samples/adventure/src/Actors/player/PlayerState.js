import { exposeOnWindow } from "../../../../../src/utils/Helper.js";
import EventBus from "../../../../../src/utils/EventBus.js";

import Backpack from "../../items/Backpack.js";
import Stats from "../Stats.js";
import ItemTypes from "../../items/ItemTypes.js";
import Constants from "../../Constants.js";

// Callback for changing the player's stats  -->  updates UI
const _stats = new Stats(true);

// Callback for changing Backpack Content --> updates UI
const _backpack = new Backpack(true);

// the current GameController reference
let _gc = null;

/**
 * A singleton to store all player information.
 * e.g. stats like health or the inventory.
 */
const PlayerState = {
	_initialized: false,

	backpack: _backpack,
	stats: _stats,

	/**
	 * Init PlayerState.
	 * Called everytime a new Level is created.
	 * Yet initialization only happens the first time --> Singleton.
	 */
	init() {
		if (!this._initialized) {
			this._initialized = true;

			// Define starting stats of the Player.
			_stats.hp_max = 10;
			_stats.hp = 10;
			_stats.atk = 3;
			_stats.def = 2;
			_stats.speed = 100;

			// Equip first basic melee weapon
			// let weapon = ItemTypes.KNIFE_POCKET;
			// this.backpack.addItem(weapon);
			// this.backpack.equipItem(weapon, Constants.EquipmentSlots.MELEE);

			// place a health potion in the backpack as a starting item
			this.backpack.addItem(ItemTypes.APPLE);
		}
	},

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

		EventBus.publish(Constants.Events.LOGIC_PLAYER_TURN_STARTED, {});
	},

	endTurn() {
		// once the player turn ends we stop checking for input
		// and wait until the GC gives us priority again
		PlayerState.yourTurn = false;

		// publish an event so the UI might react on it
		EventBus.publish(Constants.Events.LOGIC_PLAYER_TURN_ENDED, {});

		// notify the GC that the player has made their turn
		_gc.endPlayerTurn();
	}
};

exposeOnWindow("playerState", PlayerState);

export default PlayerState;
