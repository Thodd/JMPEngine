import Backpack from "../../../engine/inventory/Backpack.js";
import Stats from "../../../engine/combat/Stats.js";

/**
 * Singleton Player state.
 * The player's state object is persistent across all maps/screens.
 * This state object is independet from a specific Player actor instance.
 */
const PlayerState = {
	init() {
		// the player backpack & stats are persistent and fire events for the UI
		this._backpack = new Backpack(true);
		this._stats = new Stats(true);
	},

	getBackpack() {
		return this._backpack;
	},

	getStats() {
		return this._stats;
	}
};

PlayerState.init();

export default PlayerState;