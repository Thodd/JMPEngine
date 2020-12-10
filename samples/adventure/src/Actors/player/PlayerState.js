import { exposeOnWindow } from "../../../../../src/utils/Helper.js";

/**
 * A singleton to store all player information.
 * e.g. stats like health or the inventory.
 */
const PlayerState = {
	inventory: null,

	stats: {
		hp_max: 100,
		hp: 100,
		atk: 2,
		def: 2
	},

	/**
	 * Sets a value on the player state.
	 * @param {string} key the stat to change
	 * @param {any} value the value to set
	 */
	set(key, value) {
		this.stats[key] = value;
		this._isDirty = true;
	}
};

export default PlayerState;

exposeOnWindow("playerState", PlayerState);